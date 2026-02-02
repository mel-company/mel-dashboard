import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  Send,
  Loader2,
  User,
  HeadphonesIcon,
} from "lucide-react";
import {
  useFetchTicketStore,
  useFetchMessagesStoreCursor,
  useSendMessageStore,
  useCancelTicketStore,
  useCloseTicketStore,
  useDeleteTicketStore,
} from "@/api/wrappers/ticket.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import { Skeleton } from "@/components/ui/skeleton";
import CancelTicketDialog from "./CancelTicketDialog";
import CloseTicketDialog from "./CloseTicketDialog";
import DeleteTicketDialog from "./DeleteTicketDialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TICKET_TYPES = [
  { value: "BUG", label: "خطأ" },
  { value: "FEATURE_REQUEST", label: "طلب ميزة" },
  { value: "QUESTION", label: "سؤال" },
  { value: "SUPPORT", label: "دعم" },
  { value: "FEEDBACK", label: "ملاحظة" },
  { value: "REPORT", label: "بلاغ" },
  { value: "OTHER", label: "أخرى" },
] as const;

const DEPARTMENTS = [
  { value: "CUSTOMER_SERVICE", label: "خدمة العملاء" },
  { value: "FINANCE", label: "مالية" },
  { value: "MARKETING", label: "تسويق" },
  { value: "SALES", label: "مبيعات" },
  { value: "IT", label: "تقنية المعلومات" },
] as const;

const STATUS = [
  { value: "OPEN", label: "مفتوح" },
  { value: "CLOSED", label: "مغلق" },
  { value: "IN_PROGRESS", label: "قيد التنفيذ" },
  { value: "ON_HOLD", label: "معلق" },
  { value: "RESOLVED", label: "محلول" },
  { value: "CANCELLED", label: "ملغي" },
] as const;

const getLabel = (
  list: readonly { value: string; label: string }[],
  value: string
) => list.find((x) => x.value === value)?.label ?? value;

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reply, setReply] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollStateRef = useRef<{ scrollHeight: number; scrollTop: number; pageCount: number }>({ scrollHeight: 0, scrollTop: 0, pageCount: 0 });
  const shouldScrollToBottomRef = useRef(true);

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
  } = useFetchMessagesStoreCursor(
    id ?? "",
    { limit: 5 },
    !!id
  );

  const messages: any[] =
    messagesData?.pages
      ?.slice()
      .reverse()
      .flatMap((p) => p.data) ?? [];

  const { mutate: sendMessage, isPending: isSending } = useSendMessageStore();
  const { mutate: cancelTicket, isPending: isCancelling } =
    useCancelTicketStore();
  const { mutate: closeTicket, isPending: isClosing } = useCloseTicketStore();
  const { mutate: deleteTicket, isPending: isDeleting } = useDeleteTicketStore();
  const canReply =
    ticket &&
    ticket.status !== "CANCELLED" &&
    ticket.status !== "CLOSED" &&
    ticket.status !== "RESOLVED";
  const canCancelOrClose =
    ticket &&
    ["OPEN", "IN_PROGRESS", "ON_HOLD"].includes(ticket.status);

  const handleLoadMoreMessages = useCallback(() => {
    if (hasNextMessages && !isFetchingNextMessages) {
      const container = messagesContainerRef.current;
      if (container) {
        scrollStateRef.current = {
          scrollHeight: container.scrollHeight,
          scrollTop: container.scrollTop,
          pageCount: messagesData?.pages?.length ?? 0,
        };
      }
      fetchNextMessages();
    }
  }, [hasNextMessages, isFetchingNextMessages, fetchNextMessages, messagesData?.pages?.length]);

  const pageCount = messagesData?.pages?.length ?? 0;

  // Reset scroll-to-bottom when switching tickets
  useEffect(() => {
    if (id) shouldScrollToBottomRef.current = true;
  }, [id]);

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
    if (!hasNextMessages || isFetchingNextMessages) return;
    const el = messagesTopRef.current;
    const container = messagesContainerRef.current;
    if (!el || !container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMoreMessages();
      },
      { root: container, rootMargin: "80px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleLoadMoreMessages, hasNextMessages, isFetchingNextMessages]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const doSendReply = () => {
    const text = reply.trim();
    if (!id || !text) {
      toast.error("يرجى إدخال رسالة");
      return;
    }
    sendMessage(
      { ticketId: id, message: text },
      {
        onSuccess: () => {
          setReply("");
          shouldScrollToBottomRef.current = true;
          toast.success("تم إرسال الرد");
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "فشل في إرسال الرد.";
          toast.error(msg);
        },
      }
    );
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    doSendReply();
  };

  const handleCancelClick = () => setCancelDialogOpen(true);
  const handleDeleteClick = () => setDeleteDialogOpen(true);
//   const handleCloseClick = () => setCloseDialogOpen(true);

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

  const handleCloseConfirm = () => {
    if (!id) return;
    closeTicket(id, {
      onSuccess: () => {
        toast.success("تم إغلاق التذكرة");
        refetch();
        setCloseDialogOpen(false);
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "فشل في إغلاق التذكرة.";
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

  const getMessageSenderName = (msg: any) => {
    if (msg.senderType === "SYSTEM_USER") {
      return msg.sender?.name ?? "الدعم";
    }
    if (msg.senderType === "STORE_USER") {
      return msg.storeUser?.user?.name ?? "أنت";
    }
    return "—";
  };

  if (isLoading && !ticket) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

  if (!ticket) {
    return (
      <NotFoundPage
        title="التذكرة غير موجودة"
        description="التذكرة التي تبحث عنها غير موجودة أو تم حذفها."
        backTo="/tickets"
        backLabel="العودة إلى التذاكر"
      />
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/tickets")}>
            <ArrowRight className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-right">
              {ticket.title ?? "بدون عنوان"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {getLabel(STATUS, ticket.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {ticket.createdAt && formatDate(ticket.createdAt)}
              </span>
            </div>
          </div>
        </div>
        {(canCancelOrClose || ticket.status !== "OPEN") && (
          <div className="flex gap-2">
            {canCancelOrClose && (
              <Button
                variant="default"
                size="sm"
                onClick={handleCancelClick}
                disabled={isCancelling}
              >
                إلغاء التذكرة
              </Button>
            )}
            {ticket.status !== "OPEN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                حذف التذكرة
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="px-4">
            <CardTitle className="text-right flex items-center gap-2">
              <FileText className="size-5" />
              تفاصيل التذكرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-right px-4">
            <div>
              <span className="text-muted-foreground text-sm">النوع</span>
              <p>{getLabel(TICKET_TYPES, ticket.type)}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">القسم</span>
              <p>{getLabel(DEPARTMENTS, ticket.department)}</p>
            </div>
            {ticket.assignedTo && (
              <div>
                <span className="text-muted-foreground text-sm">المكلف</span>
                <p className="flex items-center gap-1">
                  <HeadphonesIcon className="size-4" />
                  {ticket.assignedTo.name}
                </p>
              </div>
            )}
            {ticket.resolved_at && (
              <div>
                <span className="text-muted-foreground text-sm">تاريخ الحل</span>
                <p>{formatDate(ticket.resolved_at)}</p>
              </div>
            )}
            {ticket.resolved_note && (
              <div>
                <span className="text-muted-foreground text-sm">ملاحظة الحل</span>
                <p className="text-sm">{ticket.resolved_note}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground text-sm">الوصف</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {ticket.description ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 flex flex-col min-h-full">
          <CardHeader className="px-4">
            <CardTitle className="text-right flex items-center gap-2">
              <MessageSquare className="size-5" />
              المحادثات
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 px-4">
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto max-h-[360px] space-y-3 pr-1 flex flex-col"
            >
              <div ref={messagesTopRef} className="min-h-[40px] shrink-0" />
              {hasNextMessages && (
                <div className="flex justify-center py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleLoadMoreMessages}
                    disabled={isFetchingNextMessages}
                  >
                    {isFetchingNextMessages ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "تحميل الرسائل الأقدم"
                    )}
                  </Button>
                </div>
              )}
              {isMessagesLoading && messages.length === 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد ردود بعد.
                </p>
              ) : (
                messages.map((msg: any) => {
                  const isFromStore = msg.senderType === "STORE_USER";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        isFromStore ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 flex flex-col gap-0.5",
                          isFromStore
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted"
                        )}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {isFromStore ? (
                            <User className="size-3" />
                          ) : (
                            <HeadphonesIcon className="size-3" />
                          )}
                          {getMessageSenderName(msg)}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {canReply && (
              <form
                onSubmit={handleSendReply}
                className="mt-4 flex flex-col sm:flex-row gap-2"
              >
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="اكتب ردك..."
                  className="min-h-[80px] flex-1 text-right resize-none"
                  dir="rtl"
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      doSendReply();
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isSending || !reply.trim()}
                  className="gap-2 shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  إرسال
                </Button>
              </form>
            )}

            {!canReply && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                لا يمكن إضافة ردود على تذكرة {ticket.status === "CANCELLED" ? "ملغاة" : "مغلقة"}.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CancelTicketDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        ticketTitle={ticket.title ?? undefined}
        onConfirm={handleCancelConfirm}
        isPending={isCancelling}
      />
      <CloseTicketDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        ticketTitle={ticket.title ?? undefined}
        onConfirm={handleCloseConfirm}
        isPending={isClosing}
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

export default TicketDetails;
