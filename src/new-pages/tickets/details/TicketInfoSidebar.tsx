import type { SupportTicketDetail } from "@/api/types/ticket";
import { SettingsLabel } from "@/new-pages/settings/components/SettingsField";
import TicketAttachmentGallery from "../components/TicketAttachmentGallery";
import { getStatusBannerText, getTicketTypeLabel } from "./utils";

type TicketInfoSidebarProps = {
  ticket: SupportTicketDetail;
};

const fieldClass =
  "w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-right text-sm text-slate-800";

const TicketInfoSidebar = ({ ticket }: TicketInfoSidebarProps) => {
  const ticketAttachments =
    ticket.attachments?.filter((a) => !a.messageId) ?? [];

  return (
    <div className="flex h-full flex-col gap-4">
      {ticketAttachments.length > 0 && (
        <div className="space-y-2">
          <SettingsLabel>مرفقات للدعم</SettingsLabel>
          <TicketAttachmentGallery attachments={ticketAttachments} />
        </div>
      )}

      <div className="space-y-1.5">
        <SettingsLabel>نوع التذكرة</SettingsLabel>
        <div className={fieldClass}>{getTicketTypeLabel(ticket.type)}</div>
      </div>

      <div className="space-y-1.5">
        <SettingsLabel>عنوان التذكرة</SettingsLabel>
        <div className={fieldClass}>{ticket.title ?? "—"}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-1.5">
        <SettingsLabel>وصف التذكرة</SettingsLabel>
        <div className={`${fieldClass} min-h-[100px] whitespace-pre-wrap leading-relaxed`}>
          {ticket.description ?? "—"}
        </div>
      </div>

      <div className="mt-auto rounded-2xl bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
        حالة الطلب الحالية : {getStatusBannerText(ticket.status)}
      </div>
    </div>
  );
};

export default TicketInfoSidebar;
