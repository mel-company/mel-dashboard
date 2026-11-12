import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

/** Chrome ASR is most reliable with ar-SA; Iraqi dialect comes from the model. */
const LISTEN_LANG = "ar-SA";
const SPEAK_LANG = "ar-IQ";

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return !!getSpeechRecognitionCtor();
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function listVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices() || [];
}

function pickArabicVoice(): SpeechSynthesisVoice | null {
  const voices = listVoices();
  if (!voices.length) return null;

  const score = (v: SpeechSynthesisVoice) => {
    const lang = (v.lang || "").toLowerCase();
    const name = (v.name || "").toLowerCase();
    if (
      !lang.startsWith("ar") &&
      !/arabic|عربي|iraqi|iraq|naayf|hoda|houda/.test(name)
    ) {
      return -1;
    }
    let s = 10;
    if (lang.startsWith("ar-iq") || /iraqi|iraq/.test(name)) s += 12;
    if (lang.startsWith("ar-sa")) s += 5;
    if (lang.startsWith("ar-ae") || lang.startsWith("ar-kw")) s += 4;
    if (lang.startsWith("ar-eg")) s += 2;
    if (v.localService) s += 1;
    return s;
  };

  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = score(v);
    if (s > bestScore) {
      best = v;
      bestScore = s;
    }
  }
  return bestScore >= 0 ? best : null;
}

export function prepareSpeechText(text: string): string {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[*_~#>|[\](){}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasArabicLetters(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

export type ListenEndInfo = {
  transcript: string;
  error?: string;
};

export function useTamimaVoice(opts?: {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
  onListenEnd?: (info: ListenEndInfo) => void;
}) {
  const lang = opts?.lang || LISTEN_LANG;

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [supported] = useState(() => ({
    listen: isSpeechRecognitionSupported(),
    speak: isSpeechSynthesisSupported(),
  }));
  const [hasArabicTts, setHasArabicTts] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(opts?.onFinalTranscript);
  const onListenEndRef = useRef(opts?.onListenEnd);
  const speakingRef = useRef(false);
  const deliveredRef = useRef(false);
  const finalsRef = useRef("");
  const interimRef = useRef("");
  const lastErrorRef = useRef<string | undefined>(undefined);

  onFinalRef.current = opts?.onFinalTranscript;
  onListenEndRef.current = opts?.onListenEnd;

  const refreshVoices = useCallback(() => {
    const arabic = !!pickArabicVoice();
    setHasArabicTts(arabic);
    return arabic;
  }, []);

  const deliver = useCallback((text: string) => {
    const cleaned = text.trim();
    if (!cleaned || deliveredRef.current) return "";
    deliveredRef.current = true;
    onFinalRef.current?.(cleaned);
    return cleaned;
  }, []);

  const stopListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      setListening(false);
      return;
    }
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return false;

    try {
      recognitionRef.current?.abort();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;

    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    }

    deliveredRef.current = false;
    finalsRef.current = "";
    interimRef.current = "";
    lastErrorRef.current = undefined;
    setInterim("");

    const recognition = new Ctor();
    recognition.lang = lang.startsWith("ar") ? lang : LISTEN_LANG;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript || "";
        if (event.results[i].isFinal) {
          finalsRef.current = `${finalsRef.current} ${piece}`.trim();
        } else {
          interimText += piece;
        }
      }
      interimRef.current = interimText.trim();
      const preview = [finalsRef.current, interimRef.current]
        .filter(Boolean)
        .join(" ")
        .trim();
      setInterim(preview);
    };

    recognition.onerror = (event) => {
      lastErrorRef.current = event.error;
      if (event.error === "not-allowed") {
        toast.error("السماح بالميكروفون مطلوب لتميمة.");
      } else if (event.error === "network") {
        toast.error("التعرف على الصوت يحتاج إنترنت (خدمة Chrome).");
      }
    };

    recognition.onend = () => {
      // Prefer finals; if Chrome never marked final, use last interim.
      const text = deliver(finalsRef.current || interimRef.current);
      setListening(false);
      setInterim("");
      recognitionRef.current = null;
      onListenEndRef.current?.({
        transcript: text,
        error: lastErrorRef.current,
      });
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      return true;
    } catch {
      setListening(false);
      return false;
    }
  }, [lang, deliver]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  }, [listening, startListening, stopListening]);

  const stopSpeaking = useCallback(() => {
    if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  const speak = useCallback(
    (text: string) =>
      new Promise<void>((resolve) => {
        if (!voiceReplies || !isSpeechSynthesisSupported()) {
          resolve();
          return;
        }
        const cleaned = prepareSpeechText(text);
        if (!cleaned) {
          resolve();
          return;
        }

        refreshVoices();
        window.speechSynthesis.cancel();
        speakingRef.current = false;

        window.setTimeout(() => {
          const utter = new SpeechSynthesisUtterance(cleaned);
          utter.lang = SPEAK_LANG;
          utter.rate = 0.95;
          utter.pitch = 1;

          const arabicVoice = pickArabicVoice();
          if (arabicVoice) {
            utter.voice = arabicVoice;
            utter.lang = arabicVoice.lang?.startsWith("ar")
              ? arabicVoice.lang
              : SPEAK_LANG;
          } else if (hasArabicLetters(cleaned)) {
            toast.message(
              "ماكو صوت عراقي/عربي مثبت. من إعدادات ويندوز → Speech أضف Arabic.",
            );
          }

          const done = () => {
            speakingRef.current = false;
            resolve();
          };
          utter.onend = done;
          utter.onerror = done;

          speakingRef.current = true;
          window.speechSynthesis.speak(utter);

          window.setTimeout(
            () => {
              if (speakingRef.current) done();
            },
            Math.min(20000, Math.max(4000, cleaned.length * 80)),
          );
        }, 40);
      }),
    [voiceReplies, refreshVoices],
  );

  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;
    refreshVoices();
    const onVoices = () => refreshVoices();
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    window.speechSynthesis.getVoices();
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
    };
  }, [refreshVoices]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
      stopSpeaking();
    };
  }, [stopSpeaking]);

  return {
    supported,
    listening,
    interim,
    voiceReplies,
    setVoiceReplies,
    hasArabicTts,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
  };
}
