import { useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PlanUpgradeGate from "@/components/PlanUpgradeGate";
import { ActionApproval } from "@/components/tamima/ActionApproval";
import type {
  TamimaChatMessage,
  TamimaProposedAction,
} from "@/api/endpoints/tamima.endpoints";
import {
  tamimaRemainingLabel,
  useCreateTamimaConversation,
  usePostTamimaMessage,
  useTamimaConversation,
  useTamimaEntitlements,
} from "@/api/wrappers/tamima.wrappers";
import { useTamimaVoice } from "@/hooks/use-tamima-voice";
import { useTamimaPageContext } from "@/hooks/use-tamima-page-context";
import { cn } from "@/lib/utils";

const TAMIMA_MARK = "/images/bird-design.gif";
const TAMIMA_HERO = "/images/bird-code.gif";
const REF_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const REF_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

type TamimaAssistantProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type UiMessage = TamimaChatMessage & {
  actions?: TamimaProposedAction[];
  /** Local-only preview of an attached reference image. */
  imagePreviewUrl?: string;
};

function validateRefImage(file: File): string | null {
  if (!REF_IMAGE_MIMES.has(file.type)) {
    return "صيغة الصورة غير مدعومة. استخدم JPEG أو PNG أو WebP.";
  }
  if (file.size > REF_IMAGE_MAX_BYTES) {
    return "حجم الصورة أكبر من 5MB.";
  }
  return null;
}

function normalizeMessages(raw: unknown): UiMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is TamimaChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m as TamimaChatMessage).role != null &&
        typeof (m as TamimaChatMessage).content === "string",
    )
    .map((m) => ({ ...m }));
}

export function TamimaAssistant({ open, onOpenChange }: TamimaAssistantProps) {
  const pageContext = useTamimaPageContext();
  const entitlements = useTamimaEntitlements(open);
  const createConversation = useCreateTamimaConversation();
  const postMessage = usePostTamimaMessage();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [attachPreview, setAttachPreview] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<UiMessage[]>([]);
  const [booting, setBooting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendVoiceRef = useRef<(text: string) => Promise<void>>(async () => {});

  const conversationQuery = useTamimaConversation(conversationId, open);

  const pocket = entitlements.data?.tamima;
  const upgradeRequired = Boolean(pocket?.upgradeRequired);
  const remainingLabel = tamimaRemainingLabel(entitlements.data);
  const configured = entitlements.data?.configured !== false;

  const voice = useTamimaVoice({
    lang: "ar-SA",
    onFinalTranscript: (text) => {
      void sendVoiceRef.current(text);
    },
  });

  useEffect(() => {
    if (!open) {
      voice.stopListening();
      voice.stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to sheet open
  }, [open]);

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
    if (!open) return;
    let cancelled = false;

    const boot = async () => {
      if (conversationId) return;
      setBooting(true);
      try {
        const created = await createConversation.mutateAsync("تميمة");
        if (!cancelled) {
          setConversationId(created.id);
          setLocalMessages(normalizeMessages(created.messages));
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "تعذر بدء محادثة تميمة",
          );
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- boot once per open session
  }, [open]);

  useEffect(() => {
    if (!conversationQuery.data) return;
    const serverMessages = normalizeMessages(conversationQuery.data.messages);
    setLocalMessages((prev) => {
      // Keep approval cards: server often has actionIds only; local has full actions.
      const merged = serverMessages.map((s) => {
        const local = prev.find(
          (p) =>
            p.role === s.role &&
            p.content === s.content &&
            (p.at === s.at || (!!p.actions?.length && s.role === "assistant")),
        );
        const actionIds = s.actionIds?.length
          ? s.actionIds
          : local?.actionIds;
        const actions =
          local?.actions?.length &&
          (!actionIds?.length ||
            local.actions.every((a) => actionIds.includes(a.id)))
            ? local.actions
            : undefined;
        return {
          ...s,
          ...(actionIds?.length ? { actionIds } : {}),
          ...(actions?.length ? { actions } : {}),
        };
      });
      const orphanApprovals = prev.filter(
        (m) =>
          m.role === "assistant" &&
          !!m.actions?.length &&
          !merged.some(
            (s) =>
              s.content === m.content ||
              m.actions!.some((a) => s.actionIds?.includes(a.id)),
          ),
      );
      return orphanApprovals.length ? [...merged, ...orphanApprovals] : merged;
    });
  }, [conversationQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, postMessage.isPending, open, voice.interim]);

  const canSend = useMemo(() => {
    if (!conversationId || postMessage.isPending || booting) return false;
    if (upgradeRequired) return false;
    if (!configured) return false;
    return draft.trim().length > 0;
  }, [
    conversationId,
    postMessage.isPending,
    booting,
    upgradeRequired,
    configured,
    draft,
  ]);

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
  };

  const sendText = async (raw: string, image?: File | null) => {
    const message = raw.trim();
    if (!conversationId || !message || postMessage.isPending || upgradeRequired) {
      return;
    }
    if (!configured) return;

    voice.stopListening();
    const at = new Date().toISOString();
    const previewUrl = image ? URL.createObjectURL(image) : undefined;
    setDraft("");
    clearAttach();
    setLocalMessages((prev) => [
      ...prev,
      { role: "user", content: message, at, imagePreviewUrl: previewUrl },
    ]);

    try {
      const turn = await postMessage.mutateAsync({
        conversationId,
        message,
        pageContext,
        image: image || undefined,
        autoApply: false,
      });
      setLocalMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: turn.reply,
          at: new Date().toISOString(),
          actionIds: turn.actions.map((a) => a.id),
          actions: turn.actions,
        },
      ]);
      if (voice.voiceReplies) {
        voice.speak(turn.reply);
      }
    } catch (err) {
      const body = (
        err as { response?: { data?: { message?: string; code?: string } } }
      )?.response?.data;
      toast.error(body?.message || "تعذر إرسال الرسالة");
      setLocalMessages((prev) => prev.slice(0, -1));
      setDraft(message);
      if (image) setAttachFile(image);
      void entitlements.refetch();
    }
  };

  sendVoiceRef.current = async (text: string) => {
    setDraft(text);
    await sendText(text, attachFile);
  };

  const send = async () => {
    if (!canSend) return;
    await sendText(draft, attachFile);
  };

  const handleMicClick = () => {
    if (!voice.supported.listen) {
      toast.error("المتصفح لا يدعم التعرف على الصوت. جرّب Chrome.");
      return;
    }
    if (postMessage.isPending || !conversationId || upgradeRequired) return;
    if (voice.listening) {
      voice.stopListening();
      return;
    }
    voice.stopSpeaking();
    const started = voice.startListening();
    if (!started) {
      toast.error("تعذر تشغيل الميكروفون. اسمح بالوصول للصوت.");
    }
  };

  const patchAction = (next: TamimaProposedAction) => {
    setLocalMessages((prev) =>
      prev.map((m) => ({
        ...m,
        actions: m.actions?.map((a) => (a.id === next.id ? { ...a, ...next } : a)),
      })),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn(
          "w-full max-w-md gap-0 p-0 sm:max-w-md",
          "border-[#e7edf6] bg-background dark:border-white/[0.08]",
        )}
      >
        <SheetHeader className="border-b border-[#e7edf6] px-4 py-3 dark:border-white/[0.08]">
          <div className="flex items-center justify-between gap-3 pl-8">
            <div className="flex items-center gap-2">
              <img
                src={TAMIMA_MARK}
                alt=""
                aria-hidden
                className="size-10 object-contain"
                draggable={false}
              />
              <div>
                <SheetTitle className="text-base">تميمة</SheetTitle>
                <SheetDescription className="text-xs">
                  مساعدة المتجر داخل لوحة MEL
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {voice.supported.speak ? (
                <button
                  type="button"
                  onClick={() => {
                    if (voice.voiceReplies) voice.stopSpeaking();
                    voice.setVoiceReplies((v) => !v);
                  }}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-colors",
                    voice.voiceReplies
                      ? "bg-[#00b7ff]/12 text-[#008fc7] dark:text-[#33c5ff]"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  title={
                    voice.voiceReplies
                      ? "الرد الصوتي مفعّل"
                      : "الرد الصوتي متوقف"
                  }
                  aria-label={
                    voice.voiceReplies
                      ? "إيقاف الرد الصوتي"
                      : "تفعيل الرد الصوتي"
                  }
                >
                  {voice.voiceReplies ? (
                    <Volume2 className="size-4" />
                  ) : (
                    <VolumeX className="size-4" />
                  )}
                </button>
              ) : null}
              {remainingLabel ? (
                <span className="rounded-full bg-[#00b7ff]/10 px-2.5 py-1 text-[11px] font-medium text-[#008fc7] dark:text-[#33c5ff]">
                  {remainingLabel}
                </span>
              ) : null}
            </div>
          </div>
        </SheetHeader>

        {upgradeRequired ? (
          <PlanUpgradeGate
            feature="tamima"
            className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center"
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
              dir="rtl"
            >
              {booting || (entitlements.isLoading && !entitlements.data) ? (
                <div className="flex flex-1 items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : localMessages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-12 text-center">
                  <img
                    src={TAMIMA_HERO}
                    alt="تميمة"
                    className="h-36 w-auto max-w-[220px] object-contain"
                    draggable={false}
                  />
                  <p className="text-sm font-medium text-foreground">
                    مرحباً، أنا تميمة
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                    أسأل عن متجرك ولوحة MEL فقط. تقدر ترفق صورة منتج عشان
                    أحسّنها أو أرتّبها بعد موافقتك.
                  </p>
                </div>
              ) : (
                localMessages.map((m, index) => (
                  <div
                    key={`${m.at || index}-${m.role}-${index}`}
                    className={cn(
                      "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "mr-auto bg-linear-to-l from-[#b282ff] to-[#33c5ff] text-white"
                        : "ml-auto border border-[#e7edf6] bg-white/90 text-foreground dark:border-white/[0.08] dark:bg-[#12183b]/80",
                    )}
                  >
                    {m.imagePreviewUrl ? (
                      <img
                        src={m.imagePreviewUrl}
                        alt=""
                        className="mb-2 max-h-36 w-auto max-w-full rounded-xl object-cover"
                      />
                    ) : null}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.actions?.map((action) => (
                      <ActionApproval
                        key={action.id}
                        action={action}
                        onResolved={patchAction}
                      />
                    ))}
                    {!m.actions?.length &&
                      m.actionIds?.map((id) => (
                        <ActionApproval
                          key={id}
                          actionId={id}
                          onResolved={patchAction}
                        />
                      ))}
                  </div>
                ))
              )}

              {voice.listening || voice.interim ? (
                <div className="mr-auto flex max-w-[92%] items-center gap-2 rounded-2xl border border-[#00b7ff]/30 bg-[#00b7ff]/8 px-3.5 py-2.5 text-xs text-[#008fc7] dark:text-[#33c5ff]">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#33c5ff] opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-[#00b7ff]" />
                  </span>
                  {voice.interim || "أسمَعَك… تكلم الآن"}
                </div>
              ) : null}

              {postMessage.isPending ? (
                <div className="ml-auto flex items-center gap-2 rounded-2xl border border-[#e7edf6] bg-white/90 px-3.5 py-2.5 text-xs text-muted-foreground dark:border-white/[0.08] dark:bg-[#12183b]/80">
                  <Loader2 className="size-3.5 animate-spin" />
                  تميمة تفكر…
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-[#e7edf6] p-3 dark:border-white/[0.08]">
              {!configured ? (
                <p className="mb-2 text-center text-xs text-muted-foreground">
                  المساعد غير مهيأ حالياً. تواصل مع الدعم.
                </p>
              ) : null}
              {attachPreview ? (
                <div className="mb-2 flex items-center gap-2" dir="rtl">
                  <div className="relative">
                    <img
                      src={attachPreview}
                      alt=""
                      className="h-14 w-14 rounded-xl object-cover ring-1 ring-[#e7edf6] dark:ring-white/10"
                    />
                    <button
                      type="button"
                      onClick={clearAttach}
                      disabled={postMessage.isPending}
                      className="absolute -start-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background"
                      aria-label="إزالة الصورة"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {pageContext.productId
                      ? "بعد الموافقة تُطبَّق على غلاف المنتج المفتوح."
                      : "افتح منتجاً أولاً عشان تربط الصورة به بعد الموافقة."}
                  </p>
                </div>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => pickAttach(e.target.files?.[0])}
              />
              <div className="flex items-end gap-2" dir="rtl">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    voice.listening
                      ? "جارٍ الاستماع…"
                      : attachFile
                        ? "اكتب المطلوب على الصورة…"
                        : "اكتب أو ارفق صورة أو الميكروفون…"
                  }
                  rows={2}
                  disabled={
                    !conversationId ||
                    upgradeRequired ||
                    postMessage.isPending ||
                    voice.listening
                  }
                  className="min-h-[44px] resize-none rounded-2xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="brand-soft"
                  size="icon"
                  disabled={
                    !conversationId || upgradeRequired || postMessage.isPending
                  }
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="إرفاق صورة"
                  title="إرفاق صورة للمنتج"
                  className="size-10 shrink-0"
                >
                  <ImagePlus className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={voice.listening ? "destructive-outline" : "brand-soft"}
                  size="icon"
                  disabled={
                    !conversationId || upgradeRequired || postMessage.isPending
                  }
                  onClick={handleMicClick}
                  aria-label={voice.listening ? "إيقاف الاستماع" : "تحدث مع تميمة"}
                  title={voice.listening ? "إيقاف" : "تحدث مع تميمة"}
                  className={cn(
                    "size-10 shrink-0",
                    voice.listening && "animate-pulse",
                  )}
                >
                  {voice.listening ? (
                    <MicOff className="size-4" />
                  ) : (
                    <Mic className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="brand"
                  size="icon"
                  disabled={!canSend}
                  onClick={() => void send()}
                  aria-label="إرسال"
                  className="size-10 shrink-0"
                >
                  {postMessage.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default TamimaAssistant;
