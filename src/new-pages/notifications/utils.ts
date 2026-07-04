import type { NotificationListItem } from "@/api/types/notification";

export function isNotificationRead(notification: NotificationListItem) {
  return notification.isRead ?? notification.recipients?.[0]?.read ?? false;
}

export function getNotificationTypeMeta(notification: NotificationListItem) {
  const type = (notification.type ?? "").toUpperCase();
  const title = (notification.title ?? "").toLowerCase();

  if (
    type.includes("WARNING") ||
    type.includes("INVENTORY") ||
    type.includes("STOCK") ||
    title.includes("تحذير") ||
    title.includes("كمية")
  ) {
    return { label: "تحذير", color: "danger" as const };
  }

  if (type.includes("ORDER") || title.includes("طلب")) {
    return { label: "طلب جديد", color: "purple" as const };
  }

  if (
    type.includes("NEW") ||
    type.includes("PRODUCT") ||
    type.includes("ADD") ||
    title.includes("إضافة") ||
    title.includes("أضافة") ||
    title.includes("جديد")
  ) {
    return { label: "أضافة جديدة", color: "success" as const };
  }

  return { label: "تنبيهات", color: "warning" as const };
}

export function formatNotificationDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function matchesNotificationFilters(
  notification: NotificationListItem,
  filters: { type?: string; readStatus?: string },
) {
  if (filters.type) {
    const meta = getNotificationTypeMeta(notification);
    const typeMap = {
      warning: "تحذير",
      alert: "تنبيهات",
      new: "أضافة جديدة",
      order: "طلب جديد",
    } as const;
    if (meta.label !== typeMap[filters.type as keyof typeof typeMap]) {
      return false;
    }
  }

  if (filters.readStatus === "read" && !isNotificationRead(notification)) {
    return false;
  }

  if (filters.readStatus === "unread" && isNotificationRead(notification)) {
    return false;
  }

  return true;
}
