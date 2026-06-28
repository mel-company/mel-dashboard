import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFetchTicketStore,
  useFetchMessagesStoreCursor,
  useSendMessageStore,
  useCancelTicketStore,
  useDeleteTicketStore,
} from "@/api/wrappers/ticket.wrappers";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import NotFoundPage from "@/pages/miscellaneous/NotFoundPage";
import CancelTicketDialog from "@/pages/support/CancelTicketDialog";
import DeleteTicketDialog from "@/pages/support/DeleteTicketDialog";
import TicketDetailsHeader from "./TicketDetailsHeader";
import TicketInfoSidebar from "./TicketInfoSidebar";
import TicketChatPanel from "./TicketChatPanel";

const TicketDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const shouldScrollOnSendRef = useRef(true);

  const {
    data: ticket,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchTicketStore(id ?? "", !!id);

  const {
    data: messagesData,
    fetchNextPage: fetchNextMessages,
    hasNextPage: hasNextMessages,
    isFetchingNextPage: isFetchingNextMessages,
    isLoading: isMessagesLoading,
  } = useFetchMessagesStoreCursor(id ?? "", { limit: 20 }, !!id);

  const messages =
    messagesData?.pages
      ?.slice()
      .reverse()
      .flatMap((p) => p.data ?? []) ?? [];

  const pageCount = messagesData?.pages?.length ?? 0;

  const { mutate: sendMessage, isPending: isSending } = useSendMessageStore();
  const { mutate: cancelTicket, isPending: isCancelling } =
    useCancelTicketStore();
  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicketStore();

  const normalizedStatus = ticket?.status?.toUpperCase();
  const canReply =
    !!ticket &&
    normalizedStatus !== "CANCELLED" &&
    normalizedStatus !== "CLOSED" &&
    normalizedStatus !== "RESOLVED";

  useEffect(() => {
    if (id) shouldScrollOnSendRef.current = true;
  }, [id]);

  const doSendReply = useCallback(() => {
    const text = reply.trim();
    if (!id || (!text && replyFiles.length === 0)) {
      toast.error("يرجى إدخال رسالة أو إرفاق ملف");
      return;
    }

    sendMessage(
      {
        ticketId: id,
        message: text || undefined,
        files: replyFiles.length > 0 ? replyFiles : undefined,
      },
      {
        onSuccess: () => {
          setReply("");
          setReplyFiles([]);
          toast.success("تم إرسال الرسالة");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "فشل في إرسال الرسالة.";
          toast.error(msg);
        },
      },
    );
  }, [id, reply, replyFiles, sendMessage]);

  const handleCancelConfirm = () => {
    if (!id) return;
    cancelTicket(id, {
      onSuccess: () => {
        toast.success("تم إلغاء التذكرة");
        refetch();
        setCancelDialogOpen(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "فشل في إلغاء التذكرة.";
        toast.error(msg);
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!id) return;
    deleteTicket(id, {
      onSuccess: () => {
        toast.success("تم حذف التذكرة");
        setDeleteDialogOpen(false);
        navigate("/tickets");
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "فشل في حذف التذكرة.";
        toast.error(msg);
      },
    });
  };

  if (isLoading && !ticket) {
    return (
      <div className="space-y-4 rounded-3xl bg-white p-6">
        <Skeleton className="h-14 w-full" />
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-[520px] lg:col-span-2" />
          <Skeleton className="h-[520px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!ticket || !id) {
    return (
      <NotFoundPage
        title="التذكرة غير موجودة"
        description="التذكرة التي تبحث عنها غير موجودة أو تم حذفها."
        backTo="/tickets"
        backLabel="العودة إلى التذاكر"
      />
    );
  }

  const canCancel = ["OPEN", "IN_PROGRESS", "ON_HOLD"].includes(
    normalizedStatus ?? "",
  );

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <TicketDetailsHeader
        ticketId={id}
        onClose={() => navigate("/tickets")}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-2">
          <TicketInfoSidebar ticket={ticket} />
        </div>
        <div className="lg:col-span-3">
          <TicketChatPanel
            messages={messages}
            reply={reply}
            replyFiles={replyFiles}
            onReplyChange={setReply}
            onReplyFilesChange={setReplyFiles}
            onSend={doSendReply}
            isSending={isSending}
            canReply={canReply}
            isLoading={isMessagesLoading}
            hasNextPage={!!hasNextMessages}
            isFetchingNextPage={isFetchingNextMessages}
            onLoadMore={() => fetchNextMessages()}
            pageCount={pageCount}
          />
        </div>
      </div>

      {(canCancel || normalizedStatus !== "OPEN") && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelDialogOpen(true)}
              disabled={isCancelling}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
            >
              {isCancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "إلغاء التذكرة"
              )}
            </button>
          )}
          {normalizedStatus !== "OPEN" && (
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              حذف التذكرة
            </button>
          )}
        </div>
      )}

      <CancelTicketDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        ticketTitle={ticket.title ?? undefined}
        onConfirm={handleCancelConfirm}
        isPending={isCancelling}
      />
      <DeleteTicketDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ticketTitle={ticket.title ?? undefined}
        onConfirm={handleDeleteConfirm}
        isPending={isDeleting}
      />
    </div>
  );
};

export default TicketDetailsPage;
