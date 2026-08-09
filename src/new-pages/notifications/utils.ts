import type {
  NotificationFilterValues,
  NotificationListItem,
} from "@/api/types/notification";

export type NotificationTypeKey = "warning" | "alert" | "new" | "order";

export type NotificationTypeMeta = {
  key: NotificationTypeKey;
  label: string;
  color: "danger" | "warning" | "success" | "purple";
};

export function isNotificationRead(notification: NotificationListItem) {
  return notification.isRead ?? notification.recipients?.[0]?.read ?? false;
}

export function getNotificationTypeMeta(
  notification: NotificationListItem,
): NotificationTypeMeta {
  const type = (notification.type ?? "").toUpperCase();
  const title = (notification.title ?? "").toLowerCase();

  if (title.includes("تحذير") || type.includes("WARNING")) {
    return { key: "warning", label: "تحذير", color: "danger" };
  }

  if (title.includes("تنبيه") || type.includes("ALERT")) {
    return { key: "alert", label: "تنبيه", color: "warning" };
  }

  if (type.includes("ORDER") || title.includes("طلب")) {
    return { key: "order", label: "طلب", color: "purple" };
  }

  if (
    type.includes("NEW") ||
    type.includes("PRODUCT") ||
    type.includes("ADD") ||
    title.includes("إضافة") ||
    title.includes("أضافة")
  ) {
    return { key: "new", label: "أضافة", color: "success" };
  }

  if (
    type.includes("INVENTORY") ||
    type.includes("STOCK") ||
    title.includes("كمية")
  ) {
    return { key: "warning", label: "تحذير", color: "danger" };
  }

  return { key: "alert", label: "تنبيه", color: "warning" };
}

export function formatNotificationDateParts(dateString: string) {
  const date = new Date(dateString);
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return { datePart, timePart };
}

export function formatNotificationDate(dateString: string) {
  const { datePart, timePart } = formatNotificationDateParts(dateString);
  return `${datePart}, ${timePart}`;
}

/** Split message into a highlightable entity + remaining detail (Figma-style). */
export function splitNotificationMessage(message?: string) {
  const text = (message ?? "").trim();
  if (!text) return { entity: null as string | null, detail: "—" };

  const dashSplit = text.split(/\s[-–—]\s/);
  if (dashSplit.length >= 2) {
    return {
      entity: dashSplit[0].trim(),
      detail: dashSplit.slice(1).join(" - ").trim(),
    };
  }

  const colonSplit = text.split(/:\s+/);
  if (colonSplit.length >= 2 && colonSplit[0].length < 60) {
    return {
      entity: colonSplit.slice(1).join(": ").trim(),
      detail: colonSplit[0].trim(),
    };
  }

  const hashMatch = text.match(/#[\w-]+/);
  if (hashMatch) {
    return { entity: hashMatch[0], detail: text };
  }

  return { entity: null, detail: text };
}

function toDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function matchesNotificationFilters(
  notification: NotificationListItem,
  filters: NotificationFilterValues,
) {
  if (filters.type) {
    const meta = getNotificationTypeMeta(notification);
    if (meta.key !== filters.type) return false;
  }

  if (filters.readStatus === "read" && !isNotificationRead(notification)) {
    return false;
  }

  if (filters.readStatus === "unread" && isNotificationRead(notification)) {
    return false;
  }

  const created = new Date(notification.createdAt);
  if (Number.isNaN(created.getTime())) return true;

  const createdDay = toDayKey(created);

  // Range filters (inclusive, by calendar day) — نتيجة من/الى
  if (filters.dateFrom && createdDay < filters.dateFrom) {
    return false;
  }

  if (filters.dateTo && createdDay > filters.dateTo) {
    return false;
  }

  return true;
}

export function countActiveNotificationFilters(
  filters: NotificationFilterValues,
) {
  return [
    filters.type,
    filters.readStatus,
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;
}
