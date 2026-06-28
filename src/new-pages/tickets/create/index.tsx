import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Package01Icon } from "@hugeicons-pro/core-stroke-standard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateTicketStore } from "@/api/wrappers/ticket.wrappers";
import {
  SettingsField,
  SettingsInput,
  SettingsTextarea,
} from "@/new-pages/settings/components/SettingsField";
import { TICKET_TYPES } from "@/pages/support/TicketFilterDialog";
import TicketAttachmentUpload from "../components/TicketAttachmentUpload";

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("SUPPORT");
  const [attachments, setAttachments] = useState<File[]>([]);

  const { mutate: createTicket, isPending: isCreating } = useCreateTicketStore();

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
    <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => navigate("/tickets")}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100"
          aria-label="إغلاق"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-blue-950">أضافة تذكرة جديد</h1>
          <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100">
            <HugeiconsIcon icon={Package01Icon} size={24} className="text-violet-600" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <SettingsField label="نوع التذكرة" htmlFor="ticketType">
              <Select value={type} onValueChange={setType} disabled={isCreating}>
                <SelectTrigger
                  id="ticketType"
                  className="h-12 w-full rounded-2xl border-0 bg-slate-100 text-right shadow-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <SelectValue />
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
                placeholder="مثال: مشكلة في الدفع أو تأخر توصيل الطلب"
                maxLength={200}
                disabled={isCreating}
              />
            </SettingsField>

            <SettingsField label="وصف التذكرة" htmlFor="ticketDescription">
              <SettingsTextarea
                id="ticketDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اشرح مشكلتك لمساعدتك: ماذا حدث؟ متى؟ رقم الطلب إن وجد؟"
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
          />
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            disabled={isCreating}
            className="h-12 flex-1 rounded-2xl bg-slate-100 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
          >
            الغاء
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#00b7ff] text-sm font-semibold text-white transition-colors hover:bg-[#00a3e6] disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicketPage;
