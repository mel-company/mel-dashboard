import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CustomerSupportIcon } from "@hugeicons-pro/core-duotone-rounded";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateTicketStore } from "@/api/wrappers/ticket.wrappers";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
} from "@/new-pages/settings/components/SettingsField";
import { TICKET_TYPES } from "@/pages/support/TicketFilterDialog";
import TicketAttachmentUpload from "./TicketAttachmentUpload";

type CreateTicketSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CreateTicketSheet = ({ open, onOpenChange }: CreateTicketSheetProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("SUPPORT");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const { mutate: createTicket, isPending: isCreating } = useCreateTicketStore();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reset = () => {
    setTitle("");
    setDescription("");
    setType("SUPPORT");
    setAttachments([]);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && isCreating) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      toast.error("يرجى إدخال عنوان التذكرة");
      return;
    }

    if (!trimmedDescription) {
      toast.error("يرجى إدخال وصف التذكرة");
      return;
    }

    createTicket(
      {
        title: trimmedTitle,
        description: trimmedDescription,
        type,
        department: "CUSTOMER_SERVICE",
        files: attachments.length > 0 ? attachments : undefined,
      },
      {
        onSuccess: (data) => {
          if (data.attachmentsFailed) {
            toast.warning(
              "تم إنشاء التذكرة، لكن تعذّر رفع المرفقات. يمكنك إرسالها من المحادثة بعد تفعيل الخدمة على السيرفر.",
            );
          } else {
            toast.success("تم إنشاء التذكرة بنجاح");
          }
          reset();
          onOpenChange(false);
          navigate(`/tickets/${data.id}`);
        },
        onError: (err: unknown) => {
          const raw = (err as { response?: { data?: { message?: string | string[] } } })
            ?.response?.data?.message;
          const msg = Array.isArray(raw)
            ? raw.join(" · ")
            : raw || "فشل في إنشاء التذكرة. حاول مرة أخرى.";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "z-[60] flex flex-col gap-0 border-0 p-0 text-foreground",
          "bg-white dark:bg-[#12183b]",
          isMobile
            ? cn(
                "inset-x-0 bottom-0 top-auto h-auto max-h-[92dvh] w-full max-w-none rounded-t-[32px]",
                "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
              )
            : cn(
                "top-3 bottom-3 left-3 h-auto w-[min(100%,792px)] max-w-[792px] rounded-[32px]",
                "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
              ),
        )}
      >
        {isMobile ? (
          <div className="flex shrink-0 justify-center pt-3">
            <span className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        ) : null}

        <SheetHeader className="relative shrink-0 space-y-1 overflow-hidden border-b border-slate-100 px-5 py-5 text-right sm:px-6 dark:border-[#2a3266]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-20 size-80 rounded-full bg-[#7d26f7]/15 blur-3xl"
          />
          <div className="relative flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100 disabled:opacity-50 dark:bg-transparent dark:text-[#e4e7fc] dark:hover:bg-white/5"
              aria-label="إغلاق"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <SheetTitle className="text-xl font-bold text-blue-950 dark:text-[#e4e7fc]">
                  أضافة تذكرة جديد
                </SheetTitle>
                <SheetDescription className="mt-0.5 text-xs text-slate-500 dark:text-[#8f9de8]">
                  يرجى ادخال جميع الحقول لاتمام عملية الاضافة
                </SheetDescription>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 dark:bg-[#9a5cff]/12">
                <HugeiconsIcon
                  icon={CustomerSupportIcon}
                  size={24}
                  className="text-violet-600 dark:text-[#b282ff]"
                />
              </div>
            </div>
          </div>
        </SheetHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="custom-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <SettingsField label="نوع التذكرة" htmlFor="ticketType">
                  <Select value={type} onValueChange={setType} disabled={isCreating}>
                    <SelectTrigger
                      id="ticketType"
                      className="h-12 w-full rounded-2xl border-0 bg-slate-100 text-right shadow-none focus:ring-2 focus:ring-sky-500/30 dark:bg-[#1a224c] dark:text-[#e4e7fc]"
                    >
                      <SelectValue placeholder="اختيار نوع التذكرة" />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField label="عنوان التذكرة" htmlFor="ticketTitle">
                  <SettingsInput
                    id="ticketTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="أكتب عنوان التذكرة"
                    maxLength={200}
                    disabled={isCreating}
                  />
                </SettingsField>

                <SettingsField label="الوصف العام" htmlFor="ticketDescription">
                  <SettingsTextarea
                    id="ticketDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="اكتب وصف يوضح محتويات التذكرة"
                    rows={5}
                    className="min-h-[140px]"
                    disabled={isCreating}
                  />
                </SettingsField>
              </div>

              <TicketAttachmentUpload
                files={attachments}
                onChange={setAttachments}
                disabled={isCreating}
                label="صورة الفئة"
              />
            </div>
          </div>

          <SheetFooter
            className={cn(
              "relative shrink-0 border-t border-slate-100 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 dark:border-[#2a3266]",
              isMobile
                ? "flex-col gap-3 sm:flex-col"
                : "flex-row items-center justify-between gap-3 sm:flex-row sm:space-x-0",
            )}
          >
            <button
              type="submit"
              disabled={isCreating}
              className={cn(
                "flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-linear-to-l from-[#33c5ff] to-[#b282ff] text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50",
                isMobile ? "w-full" : "min-w-[225px] px-10",
              )}
            >
              {isCreating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "أضافة التذكرة"
              )}
            </button>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
              className={cn(
                "text-lg font-bold text-[#4a5596] transition-colors hover:text-muted-foreground disabled:opacity-50",
                isMobile ? "h-auto w-full py-2 text-center" : "h-[60px] min-w-[166px]",
              )}
            >
              الغاء
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateTicketSheet;
