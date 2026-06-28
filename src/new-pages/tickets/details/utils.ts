import {
  TICKET_DEPARTMENTS,
  TICKET_STATUSES,
  TICKET_TYPES,
} from "@/pages/support/TicketFilterDialog";

export const getTicketTypeLabel = (type?: string) =>
  TICKET_TYPES.find((t) => t.value === type)?.label ?? type ?? "—";

export const getDepartmentLabel = (department?: string) =>
  TICKET_DEPARTMENTS.find((d) => d.value === department)?.label ??
  department ??
  "—";

export const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  const upper = status.toUpperCase();
  return TICKET_STATUSES.find((s) => s.value === upper)?.label ?? status;
};

export const getStatusBannerText = (status?: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case "OPEN":
      return "تم استلام الطلب وبانتظار المراجعة";
    case "IN_PROGRESS":
      return "تمت الاحالة الى الجهة المختصة";
    case "ON_HOLD":
      return "الطلب معلق مؤقتاً";
    case "RESOLVED":
      return "تم حل الطلب";
    case "CLOSED":
      return "تم إغلاق التذكرة";
    case "CANCELLED":
      return "تم إلغاء التذكرة";
    default:
      return "جاري متابعة الطلب";
  }
};

export const formatMessageTime = (dateString?: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatTicketShortId = (id: string) => `#${id.slice(0, 8)}`;
