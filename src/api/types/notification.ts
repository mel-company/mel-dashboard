export type NotificationListItem = {
  id: string;
  title?: string;
  message?: string;
  type?: string;
  createdAt: string;
  isRead?: boolean;
  recipients?: Array<{ read?: boolean }>;
};

export type NotificationFilterValues = {
  type?: "warning" | "alert" | "new" | "order";
  readStatus?: "read" | "unread";
};
