import { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { ImagePlus, Loader2, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TicketAttachment, TicketMessage } from "@/api/types/ticket";
import { TICKET_FILE_ACCEPT, TICKET_MAX_FILES } from "@/api/utils/ticket-files";
import { SettingsLabel } from "@/new-pages/settings/components/SettingsField";
import TicketAttachmentGallery from "../components/TicketAttachmentGallery";
import { formatMessageTime } from "./utils";

type TicketChatPanelProps = {
  messages: TicketMessage[];
  reply: string;
  replyFiles: File[];
  onReplyChange: (value: string) => void;
  onReplyFilesChange: (files: File[]) => void;
  onSend: () => void;
  isSending: boolean;
  canReply: boolean;
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  pageCount: number;
};

const TicketChatPanel = ({
  messages,
  reply,
  replyFiles,
  onReplyChange,
  onReplyFilesChange,
  onSend,
  isSending,
  canReply,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  pageCount,
}: TicketChatPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const scrollStateRef = useRef({
    scrollHeight: 0,
    scrollTop: 0,
    pageCount: 0,
  });
  const shouldScrollToBottomRef = useRef(true);

  const canSubmit = reply.trim().length > 0 || replyFiles.length > 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      const container = messagesContainerRef.current;
      if (container) {
        scrollStateRef.current = {
          scrollHeight: container.scrollHeight,
          scrollTop: container.scrollTop,
          pageCount,
        };
      }
      onLoadMore();
    }
  }, [hasNextPage, isFetchingNextPage, onLoadMore, pageCount]);

  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || messages.length === 0) return;

    const prevState = scrollStateRef.current;
    const didPrepend = pageCount > prevState.pageCount && prevState.pageCount > 0;

    if (didPrepend) {
      const addedHeight = container.scrollHeight - prevState.scrollHeight;
      container.scrollTop = prevState.scrollTop + addedHeight;
    } else if (shouldScrollToBottomRef.current) {
      container.scrollTop = container.scrollHeight;
      shouldScrollToBottomRef.current = false;
    }

    scrollStateRef.current = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
      pageCount,
    };
  }, [messages.length, pageCount]);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const el = messagesTopRef.current;
    const container = messagesContainerRef.current;
    if (!el || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { root: container, rootMargin: "80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMore, hasNextPage, isFetchingNextPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    shouldScrollToBottomRef.current = true;
    onSend();
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col rounded-3xl border border-slate-100 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <SettingsLabel className="text-base font-semibold text-blue-950">
          المحادثة
        </SettingsLabel>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4"
      >
        <div ref={messagesTopRef} className="min-h-px shrink-0" />
        {hasNextPage && (
          <div className="flex justify-center py-1">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetchingNextPage}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              {isFetchingNextPage ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "تحميل الرسائل الأقدم"
              )}
            </button>
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            لا توجد رسائل بعد. ابدأ المحادثة مع فريق الدعم.
          </p>
        ) : (
          messages.map((msg) => {
            const isFromStore = msg.senderType === "STORE_USER";
            const attachments = msg.attachments ?? [];

            return (
              <div
                key={msg.id}
                className={cn("flex", isFromStore ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isFromStore
                      ? "rounded-br-md bg-sky-600 text-white"
                      : "rounded-bl-md bg-slate-100 text-slate-800",
                  )}
                >
                  {msg.message?.trim() && (
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  )}
                  {attachments.length > 0 && (
                    <TicketAttachmentGallery
                      attachments={attachments as TicketAttachment[]}
                      compact
                    />
                  )}
                  <div
                    className={cn(
                      "mt-1 flex items-center gap-1 text-[11px]",
                      isFromStore ? "justify-end text-sky-100" : "text-slate-500",
                    )}
                  >
                    <span>{formatMessageTime(msg.createdAt)}</span>
                    {isFromStore && <span aria-hidden>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canReply ? (
        <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4">
          {replyFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {replyFiles.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                >
                  {file.name}
                  <button
                    type="button"
                    onClick={() =>
                      onReplyFilesChange(replyFiles.filter((_, i) => i !== index))
                    }
                    className="text-slate-400 hover:text-red-500"
                    aria-label="إزالة"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSending || !canSubmit}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600 disabled:opacity-50"
              aria-label="إرسال"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
            <div className="relative flex min-w-0 flex-1 items-center">
              <input
                type="text"
                value={reply}
                onChange={(e) => onReplyChange(e.target.value)}
                placeholder="اكتب رسالتك..."
                disabled={isSending}
                dir="rtl"
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 px-4 pl-12 text-right text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
              <button
                type="button"
                disabled={isSending || replyFiles.length >= TICKET_MAX_FILES}
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                aria-label="إرفاق ملف"
              >
                <ImagePlus className="size-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={TICKET_FILE_ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? []);
                  onReplyFilesChange(
                    [...replyFiles, ...picked].slice(0, TICKET_MAX_FILES),
                  );
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </form>
      ) : (
        <p className="border-t border-slate-100 p-4 text-center text-sm text-slate-500">
          لا يمكن إرسال رسائل على تذكرة مغلقة أو ملغاة.
        </p>
      )}
    </div>
  );
};

export default TicketChatPanel;
