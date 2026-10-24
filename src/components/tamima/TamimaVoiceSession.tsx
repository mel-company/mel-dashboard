import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, Mic, MicOff, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ActionApproval } from "@/components/tamima/ActionApproval";
import type { TamimaProposedAction } from "@/api/endpoints/tamima.endpoints";
import {
  useCreateTamimaConversation,
  usePostTamimaMessage,
  useTamimaEntitlements,
} from "@/api/wrappers/tamima.wrappers";
import { useTamimaCloudVoice } from "@/hooks/use-tamima-cloud-voice";
import { useTamimaPageContext } from "@/hooks/use-tamima-page-context";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import {
  appendTamimaLocalTurn,
  clearTamimaLocalSession,
  loadTamimaLocalSession,
  patchTamimaLocalActions,
  saveTamimaLocalSession,
  type TamimaLocalTurn,
} from "@/components/tamima/tamima-local-history";
import {
  TAMIMA_DOCK_ASIDE_ID,
  TAMIMA_DOCK_SLOT_ID,
} from "@/components/FloatingRail";
import { cn } from "@/lib/utils";

const TAMIMA_HERO = "/images/bird-code.gif";
const TAMIMA_MARK = "/images/bird-design.gif";
const REF_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const REF_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function validateRefImage(file: File): string | null {
  if (!REF_IMAGE_MIMES.has(file.type)) {
    return "صيغة الصورة غير مدعومة. استخدم JPEG أو PNG أو WebP.";
  }
  if (file.size > REF_IMAGE_MAX_BYTES) {
    return "حجم الصورة أكبر من 5MB.";
  }
  return null;
}

type Phase =
  | "booting"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "idle"
  | "blocked";

export type TamimaVoiceMode = "closed" | "expanded" | "docked";

type TamimaVoiceSessionProps = {
  mode: TamimaVoiceMode;
  onModeChange: (mode: TamimaVoiceMode) => void;
};

/**
 * Voice Tamima: expanded card, or docked on the left while work continues.
 * Conversation id + turns persist locally so context survives minimize.
 */
export function TamimaVoiceSession({
  mode,
  onModeChange,
}: TamimaVoiceSessionProps) {
  const pageContext = useTamimaPageContext();
  const entitlements = useTamimaEntitlements(mode !== "closed");
  const { goUpgrade } = usePlanEntitlements();
  const createConversation = useCreateTamimaConversation();
  const postMessage = usePostTamimaMessage();
  const voice = useTamimaCloudVoice();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("booting");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [hint, setHint] = useState("");
  const [actions, setActions] = useState<TamimaProposedAction[]>([]);
  const [history, setHistory] = useState<TamimaLocalTurn[]>([]);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachPreview, setAttachPreview] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const beginRef = useRef(() => {});
  const finishRef = useRef(() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachFileRef = useRef<File | null>(null);
  const sendingRef = useRef(false);
  const modeRef = useRef(mode);
  const bootedRef = useRef(false);
  modeRef.current = mode;
  attachFileRef.current = attachFile;

  const active = mode !== "closed";
  const expanded = mode === "expanded";
  const docked = mode === "docked";
  const upgradeRequired = Boolean(entitlements.data?.tamima?.upgradeRequired);
  const configured = entitlements.data?.configured !== false;
  const pendingCount = actions.filter(
    (a) => String(a.status) === "PENDING",
  ).length;
  const working =
    phase === "booting" ||
    phase === "listening" ||
    phase === "transcribing" ||
    phase === "thinking" ||
    phase === "speaking";

  const clearAttach = () => {
    setAttachFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const pickAttach = (file: File | undefined) => {
    if (!file) return;
    const err = validateRefImage(file);
    if (err) {
      toast.error(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setAttachFile(file);
    setHint(
      pageContext.productId
        ? "صورة جاهزة — تكلم المطلوب ثم أسكت للإرسال"
        : "افتح منتج أولاً، أو تكلم وحدد المنتج",
    );
  };

  useEffect(() => {
    if (!attachFile) {
      setAttachPreview(null);
      return;
    }
    const url = URL.createObjectURL(attachFile);
    setAttachPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachFile]);

  useEffect(() => {
    if (phase !== "listening" || voice.listening || sendingRef.current) return;
    setPhase("idle");
    setHint("اضغط المايك وتكلم الأمر");
  }, [phase, voice.listening]);

  const dock = () => {
    // Mute when minimized — keep thinking/approvals in background, no TTS.
    voice.stopSpeaking();
    if (phase === "speaking" || phase === "listening") {
      void voice.stopListening();
      setPhase((p) => (p === "speaking" || p === "listening" ? "idle" : p));
    }
    onModeChange("docked");
  };

  const expand = () => onModeChange("expanded");

  const fullyClose = () => {
    void voice.stopListening();
    voice.stopSpeaking();
    sendingRef.current = false;
    bootedRef.current = false;
    setConversationId(null);
    setPhase("booting");
    setHeard("");
    setReply("");
    setHint("");
    setActions([]);
    setHistory([]);
    setAttachFile(null);
    clearTamimaLocalSession();
    onModeChange("closed");
  };

  // Click outside expanded card → dock left (keep working).
  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      dock();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dock();
    };
    // Defer so the opening click doesn't immediately dock.
    const t = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const beginListen = async () => {
    if (!voice.supported.listen) {
      toast.error("المتصفح لا يدعم تسجيل الصوت. جرّب Chrome.");
      setPhase("idle");
      return;
    }
    if (sendingRef.current) return;
    setHint(
      attachFile
        ? "تكلم المطلوب على الصورة — أسكت لما تخلّص"
        : "تكلم الأمر — أسكت لما تخلّص",
    );
    voice.stopSpeaking();
    const ok = await voice.startListening({
      silenceMs: 1300,
      maxMs: 18_000,
      onAutoStop: () => {
        void finishRef.current();
      },
    });
    if (ok) setPhase("listening");
    else {
      setPhase("idle");
      setHint("اسمح بالميكروفون ثم اضغط المايك.");
    }
  };
  beginRef.current = () => {
    void beginListen();
  };

  const finishAndSend = async () => {
    if (!conversationId || sendingRef.current) return;
    sendingRef.current = true;
    setPhase("transcribing");
    setHint("جاي نحوّل كلامك لنص…");
    const blob = await voice.stopListening();
    if (!blob) {
      sendingRef.current = false;
      setPhase("idle");
      setHint("ما وصل تسجيل. اضغط المايك وحاول مرة ثانية.");
      return;
    }

    let text = "";
    try {
      text = await voice.transcribeBlob(blob);
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ما قدرنا نفهم التسجيل",
      );
      sendingRef.current = false;
      setPhase("idle");
      setHint("أعد التسجيل واضغط المايك للإرسال.");
      return;
    }

    if (!text) {
      sendingRef.current = false;
      setPhase("idle");
      setHint("ما التقطنا كلام واضح. حاول مرة ثانية.");
      return;
    }

    const image = attachFileRef.current;
    setHeard(text);
    setReply("");
    setActions([]);
    setHint("");
    setPhase("thinking");
    clearAttach();

    try {
      const turn = await postMessage.mutateAsync({
        conversationId,
        message: `${text}\n\n(جاوبي باللهجة العراقية، مختصر. فقط عن متجري ولوحة MEL. إذا السؤال خارج الداشبورد ارفضِ وارجعي للمتجر. لا إنجليزي. أي تعديل يبقى بانتظار موافقتي. اعتمدِ على تاريخ المحادثة.)`,
        pageContext: {
          ...pageContext,
          hint: [pageContext.hint, "voice"].filter(Boolean).join(" · "),
        },
        image: image || undefined,
        autoApply: false,
      });
      const spoken = String(turn.reply || "").trim();
      const nextActions = turn.actions || [];
      setReply(spoken);
      setActions(nextActions);
      const saved = appendTamimaLocalTurn(conversationId, {
        heard: text,
        reply: spoken,
        at: new Date().toISOString(),
        actions: nextActions,
      });
      setHistory(saved.turns);

      const needsApprove = nextActions.some(
        (a) => String(a.status) === "PENDING",
      );
      // Only speak while expanded — docked stays silent.
      if (modeRef.current === "expanded") {
        setPhase("speaking");
        setHint(
          needsApprove ? "في إجراء بانتظار موافقتك" : "تميمة ترد…",
        );
        await voice.speak(spoken);
      }
      if (modeRef.current === "closed") return;
      setPhase("idle");
      setHint(
        needsApprove
          ? "وافق أو ارفض الإجراء، أو اضغط المايك"
          : "اضغط المايك لسؤال ثاني — أو اضغط برّه للتصغير يسار",
      );
    } catch (err) {
      toast.error(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تعذر إرسال الرسالة",
      );
      if (image) setAttachFile(image);
      void entitlements.refetch();
      setPhase("idle");
      setHint("صار خطأ. اضغط المايك وحاول مرة ثانية.");
    } finally {
      sendingRef.current = false;
    }
  };
  finishRef.current = () => {
    void finishAndSend();
  };

  // Boot / restore once when opened from closed.
  useEffect(() => {
    if (!active) {
      if (bootedRef.current) {
        // Fully torn down only via fullyClose; dock keeps state.
      }
      return;
    }
    if (bootedRef.current) return;

    let cancelled = false;
    const boot = async () => {
      setPhase("booting");
      try {
        const balance = await entitlements.refetch();
        const data = balance.data ?? entitlements.data;
        if (data?.tamima?.upgradeRequired) {
          if (!cancelled) {
            bootedRef.current = true;
            setPhase("blocked");
          }
          return;
        }
        if (data?.configured === false) {
          toast.error("المساعد غير مهيأ حالياً.");
          if (!cancelled) fullyClose();
          return;
        }

        const cached = loadTamimaLocalSession();
        if (cached?.conversationId) {
          if (cancelled) return;
          setConversationId(cached.conversationId);
          setHistory(cached.turns);
          const last = cached.turns[cached.turns.length - 1];
          if (last) {
            setHeard(last.heard);
            setReply(last.reply);
            setActions(last.actions || []);
          }
          setPhase("idle");
          setHint(
            cached.turns.length
              ? "كمّل من آخر محادثة — اضغط المايك"
              : "اضغط المايك وتكلم",
          );
          bootedRef.current = true;
          return;
        }

        const created = await createConversation.mutateAsync("تميمة — صوت");
        if (cancelled) return;
        setConversationId(created.id);
        setHistory([]);
        saveTamimaLocalSession({
          conversationId: created.id,
          turns: [],
          updatedAt: new Date().toISOString(),
        });
        bootedRef.current = true;
        setPhase("idle");
        window.setTimeout(() => {
          if (!cancelled && modeRef.current === "expanded") {
            beginRef.current();
          }
        }, 300);
      } catch (err) {
        if (!cancelled) {
          toast.error(
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "تعذر بدء جلسة الصوت",
          );
          fullyClose();
        }
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const [dockSlotEl, setDockSlotEl] = useState<HTMLElement | null>(null);
  const [dockAsideEl, setDockAsideEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!docked) {
      setDockSlotEl(null);
      setDockAsideEl(null);
      return;
    }
    const sync = () => {
      setDockSlotEl(document.getElementById(TAMIMA_DOCK_SLOT_ID));
      setDockAsideEl(document.getElementById(TAMIMA_DOCK_ASIDE_ID));
    };
    sync();
    const id = window.requestAnimationFrame(sync);
    return () => window.cancelAnimationFrame(id);
  }, [docked]);

  if (!active) return null;

  const statusLabel =
    phase === "booting"
      ? "تميمة تستعد…"
      : phase === "listening"
        ? hint || "تكلم الآن…"
        : phase === "transcribing"
          ? "جاي نفهم كلامك…"
          : phase === "thinking"
            ? "تميمة تفكر…"
            : phase === "speaking"
              ? "تميمة ترد…"
              : phase === "blocked"
                ? "يلزم ترقية الخطة"
                : hint || "اضغط الميكروفون وتكلم";

  const busy =
    phase === "booting" ||
    phase === "transcribing" ||
    phase === "thinking" ||
    phase === "speaking";

  const dockStatus =
    phase === "thinking" || phase === "transcribing"
      ? "تفكر…"
      : phase === "speaking"
        ? "ترد…"
        : phase === "listening"
          ? "تسمع…"
          : pendingCount > 0
            ? "موافقة"
            : "تميمة";

  const patchAction = (next: TamimaProposedAction) => {
    setActions((prev) => {
      const updated = prev.map((a) =>
        a.id === next.id ? { ...a, ...next } : a,
      );
      if (conversationId) {
        patchTamimaLocalActions(conversationId, updated);
      }
      return updated;
    });
  };

  const dockBird = (
    <button
      type="button"
      onClick={expand}
      className={cn(
        "relative flex size-14 items-center justify-center rounded-full border border-[#e7edf6] bg-white/95 shadow-[0_8px_24px_rgba(17,44,113,0.12)] backdrop-blur",
        "dark:border-white/8 dark:bg-[#12183b]/95",
        "transition-transform hover:scale-105",
        working &&
          "ring-2 ring-[#33c5ff]/50 ring-offset-2 ring-offset-background",
      )}
      aria-label={`تميمة — ${dockStatus}`}
      title={
        pendingCount > 0
          ? `${pendingCount} بانتظار موافقتك`
          : working
            ? "شغّالة بالخلفية — اضغط للفتح"
            : "تميمة — اضغط للفتح"
      }
    >
      <img
        src={TAMIMA_MARK}
        alt=""
        className="size-11 object-contain drop-shadow-sm"
        draggable={false}
      />
      {working ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-[#33c5ff]/20" />
      ) : null}
      {working && pendingCount === 0 ? (
        <span className="absolute -bottom-0.5 end-0 size-2.5 rounded-full bg-[#00b7ff] ring-2 ring-background" />
      ) : null}
    </button>
  );

  const dockApprovals =
    pendingCount > 0 ? (
      <div
        className={cn(
          "max-h-[min(70vh,420px)] w-[min(78vw,300px)] overflow-y-auto",
          "rounded-2xl border border-[#e7edf6] bg-white/95 p-2 shadow-[0_16px_40px_rgba(17,44,113,0.16)] backdrop-blur",
          "dark:border-white/8 dark:bg-[#12183b]/95",
        )}
        dir="rtl"
      >
        <p className="mb-1 px-1 text-[11px] font-medium text-[#008fc7] dark:text-[#33c5ff]">
          بانتظار موافقتك
        </p>
        {actions
          .filter((a) => String(a.status) === "PENDING")
          .map((action) => (
            <ActionApproval
              key={action.id}
              action={action}
              onResolved={patchAction}
            />
          ))}
      </div>
    ) : null;

  return (
    <>
      {docked && dockSlotEl ? createPortal(dockBird, dockSlotEl) : null}
      {docked && dockAsideEl && dockApprovals
        ? createPortal(dockApprovals, dockAsideEl)
        : null}

      {/* Expanded card */}
      <div
        ref={panelRef}
        className={cn(
          "pointer-events-auto fixed bottom-6 left-1/2 z-40 w-[min(92vw,380px)] -translate-x-1/2",
          "rounded-[28px] border border-[#e7edf6] bg-white/95 p-4 shadow-[0_20px_60px_rgba(17,44,113,0.18)] backdrop-blur",
          "dark:border-white/8 dark:bg-[#12183b]/95",
          "transition-all duration-300 ease-out",
          expanded
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
        dir="rtl"
        role="dialog"
        aria-label="جلسة صوت تميمة"
        aria-hidden={!expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">تميمة</p>
            <p className="text-xs text-muted-foreground">{statusLabel}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={dock}
              className="rounded-full px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
              title="تصغير لليسار"
            >
              تصغير
            </button>
            <button
              type="button"
              onClick={fullyClose}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="إغلاق"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="relative mx-auto mt-3 flex h-40 w-full items-center justify-center">
          {(phase === "listening" || phase === "speaking") && (
            <>
              <span
                className="absolute rounded-full bg-[#33c5ff]/20 transition-all duration-100"
                style={{
                  width: phase === "listening" ? 96 + voice.level * 80 : 144,
                  height: phase === "listening" ? 96 + voice.level * 80 : 144,
                }}
              />
              <span className="absolute size-28 animate-pulse rounded-full bg-[#b282ff]/15" />
            </>
          )}
          <img
            src={TAMIMA_HERO}
            alt="تميمة"
            className={cn(
              "relative z-10 h-36 w-auto max-w-[240px] object-contain transition-transform",
              phase === "listening" && "scale-105",
              (phase === "thinking" || phase === "transcribing") && "opacity-80",
            )}
            draggable={false}
          />
        </div>

        {phase === "listening" ? (
          <div className="mx-auto mt-1 flex h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-l from-[#b282ff] to-[#33c5ff] transition-[width] duration-75"
              style={{ width: `${Math.max(8, Math.round(voice.level * 100))}%` }}
            />
          </div>
        ) : null}

        {history.length > 1 ? (
          <div className="custom-scrollbar mt-2 max-h-24 space-y-1.5 overflow-y-auto rounded-2xl bg-muted/40 px-2.5 py-2">
            {history
              .filter((t) => t.heard || t.reply)
              .slice(-4, -1)
              .map((t) => (
                <div key={t.at} className="text-[11px] leading-snug">
                  {t.heard ? (
                    <p className="text-muted-foreground">أنت: {t.heard}</p>
                  ) : null}
                  {t.reply ? (
                    <p className="text-foreground/90">تميمة: {t.reply}</p>
                  ) : null}
                </div>
              ))}
          </div>
        ) : null}

        {heard ? (
          <p className="mt-1 line-clamp-2 text-center text-xs text-muted-foreground">
            أنت: {heard}
          </p>
        ) : null}
        {reply ? (
          <p className="mt-1 line-clamp-3 text-center text-sm text-foreground">
            {reply}
          </p>
        ) : null}

        {actions.map((action) => (
          <ActionApproval
            key={action.id}
            action={action}
            onResolved={patchAction}
          />
        ))}

        {phase === "blocked" ? (
          <Button
            type="button"
            variant="brand"
            className="mt-3 w-full"
            onClick={() => {
              fullyClose();
              goUpgrade("tamima");
            }}
          >
            ترقية الخطة
          </Button>
        ) : (
          <div className="mt-3 flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => pickAttach(e.target.files?.[0])}
            />

            {attachPreview ? (
              <div className="relative mb-1">
                <img
                  src={attachPreview}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[#00b7ff]/35"
                />
                <button
                  type="button"
                  onClick={clearAttach}
                  disabled={busy}
                  className="absolute -start-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
                  aria-label="إزالة الصورة"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="brand-soft"
                size="icon"
                className="size-12"
                disabled={busy || !conversationId || !configured}
                onClick={() => fileInputRef.current?.click()}
                aria-label="رفع صورة"
                title="رفع صورة للمنتج"
              >
                <ImagePlus className="size-5" />
              </Button>
              <Button
                type="button"
                variant={phase === "listening" ? "destructive-outline" : "brand"}
                size="icon"
                className={cn(
                  "size-12",
                  phase === "listening" && "ring-2 ring-[#33c5ff]/50",
                )}
                disabled={busy || !conversationId || !configured}
                onClick={() => {
                  if (phase === "listening") {
                    void finishAndSend();
                    return;
                  }
                  void beginListen();
                }}
                aria-label={phase === "listening" ? "إيقاف وإرسال الآن" : "تحدث"}
              >
                {busy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : phase === "listening" ? (
                  <MicOff className="size-5" />
                ) : (
                  <Mic className="size-5" />
                )}
              </Button>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              {phase === "listening"
                ? "أسكت ثانية ويرسل تلقائي — أو اضغط للإرسال"
                : "اضغط برّه = تصغير لليسار ويكمل بالخلفية"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default TamimaVoiceSession;
