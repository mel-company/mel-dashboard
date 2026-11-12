import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { tamimaAPI } from "@/api/endpoints/tamima.endpoints";

type StartListeningOptions = {
  /** Auto-stop after this much silence following speech (ms). */
  silenceMs?: number;
  /** Hard cap on recording length (ms). */
  maxMs?: number;
  /** Fired when silence/max triggers auto-stop (before stopListening). */
  onAutoStop?: () => void;
};

/**
 * Cloud voice for Tamima — Whisper STT + OpenAI TTS via the backend.
 * Does not need Windows Arabic language packs or browser speechSynthesis voices.
 */
export function useTamimaCloudVoice() {
  const [listening, setListening] = useState(false);
  /** 0–1 live mic level while recording (for UI pulse). */
  const [level, setLevel] = useState(0);
  const [supported] = useState(() => ({
    listen:
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined",
    speak: typeof window !== "undefined" && typeof Audio !== "undefined",
  }));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heardSpeechRef = useRef(false);
  const autoStopRef = useRef<(() => void) | null>(null);
  const stoppingRef = useRef(false);

  const clearListenTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    analyserRef.current = null;
    if (audioCtxRef.current) {
      void audioCtxRef.current.close().catch(() => undefined);
      audioCtxRef.current = null;
    }
    setLevel(0);
    heardSpeechRef.current = false;
    autoStopRef.current = null;
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stopListening = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      clearListenTimers();
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        stoppingRef.current = false;
        setListening(false);
        stopTracks();
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        stoppingRef.current = false;
        setListening(false);
        stopTracks();
        mediaRecorderRef.current = null;
        const mime = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];
        resolve(blob.size > 0 ? blob : null);
      };
      try {
        if (recorder.state === "recording") recorder.requestData();
        recorder.stop();
      } catch {
        stoppingRef.current = false;
        setListening(false);
        stopTracks();
        resolve(null);
      }
    });
  }, [clearListenTimers, stopTracks]);

  const startLevelMonitor = useCallback(
    (stream: MediaStream, silenceMs: number) => {
      try {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const ctx = new Ctx();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        analyserRef.current = analyser;

        const data = new Uint8Array(analyser.fftSize);
        // RMS threshold — ignore fan/room noise, catch speech.
        const SPEECH_THRESHOLD = 0.028;
        const SILENCE_FLOOR = 0.014;

        const tick = () => {
          if (!analyserRef.current) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i]! - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setLevel(Math.min(1, rms * 8));

          if (rms >= SPEECH_THRESHOLD) {
            heardSpeechRef.current = true;
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (
            heardSpeechRef.current &&
            rms < SILENCE_FLOOR &&
            !silenceTimerRef.current &&
            !stoppingRef.current
          ) {
            silenceTimerRef.current = setTimeout(() => {
              if (stoppingRef.current) return;
              stoppingRef.current = true;
              autoStopRef.current?.();
            }, silenceMs);
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        // Analyser optional — recording still works without auto-stop.
      }
    },
    [],
  );

  const startListening = useCallback(
    async (opts: StartListeningOptions = {}) => {
      if (!supported.listen) {
        toast.error("المتصفح لا يدعم تسجيل الصوت.");
        return false;
      }
      const silenceMs = opts.silenceMs ?? 1400;
      const maxMs = opts.maxMs ?? 20_000;

      stopSpeaking();
      await stopListening();
      stoppingRef.current = false;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;
        chunksRef.current = [];
        heardSpeechRef.current = false;
        autoStopRef.current = opts.onAutoStop ?? null;

        const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
            ? "audio/webm"
            : "";
        const recorder = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunksRef.current.push(event.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(200);
        setListening(true);
        startLevelMonitor(stream, silenceMs);

        maxTimerRef.current = setTimeout(() => {
          if (stoppingRef.current) return;
          // Only auto-send if the merchant actually spoke; otherwise just stop.
          if (heardSpeechRef.current) {
            stoppingRef.current = true;
            autoStopRef.current?.();
            return;
          }
          void stopListening();
        }, maxMs);

        return true;
      } catch {
        toast.error("اسمح بالميكروفون من شريط المتصفح.");
        setListening(false);
        clearListenTimers();
        stopTracks();
        return false;
      }
    },
    [
      supported.listen,
      stopListening,
      stopSpeaking,
      stopTracks,
      startLevelMonitor,
      clearListenTimers,
    ],
  );

  const transcribeBlob = useCallback(async (blob: Blob) => {
    const ext = blob.type.includes("ogg")
      ? "ogg"
      : blob.type.includes("mp4")
        ? "m4a"
        : "webm";
    const file = new File([blob], `tamima-voice.${ext}`, {
      type: blob.type || "audio/webm",
    });
    const result = await tamimaAPI.transcribe(file);
    return String(result?.text || "").trim();
  }, []);

  const speak = useCallback(
    async (text: string) => {
      const cleaned = String(text || "").trim();
      if (!cleaned || !supported.speak) return;

      stopSpeaking();
      try {
        const blob = await tamimaAPI.speak(cleaned);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onerror = () => reject(new Error("audio play failed"));
          void audio.play().catch(reject);
        });
      } catch (err) {
        toast.error(
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "تعذر تشغيل الرد الصوتي",
        );
      } finally {
        stopSpeaking();
      }
    },
    [supported.speak, stopSpeaking],
  );

  useEffect(() => {
    return () => {
      void stopListening();
      stopSpeaking();
      stopTracks();
    };
  }, [stopListening, stopSpeaking, stopTracks]);

  return {
    supported,
    listening,
    level,
    startListening,
    stopListening,
    transcribeBlob,
    speak,
    stopSpeaking,
  };
}
