export const TICKET_TYPES = [
  "BUG",
  "FEATURE_REQUEST",
  "QUESTION",
  "SUPPORT",
  "FEEDBACK",
  "REPORT",
  "OTHER",
] as const;

export const TICKET_DEPARTMENTS = [
  "FINANCE",
  "MARKETING",
  "SALES",
  "CUSTOMER_SERVICE",
  "IT",
  "OTHER",
] as const;

export const TICKET_STATUSES = [
  "open",
  "closed",
  "in_progress",
  "on_hold",
  "resolved",
  "cancelled",
  "all",
  "OPEN",
  "CLOSED",
  "IN_PROGRESS",
  "ON_HOLD",
  "RESOLVED",
  "CANCELLED",
] as const;

export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketDepartment = (typeof TICKET_DEPARTMENTS)[number];
export type TicketStatus = string;

export type SupportTicketListItem = {
  id: string;
  title: string;
  description?: string | null;
  type?: TicketType | string;
  department?: TicketDepartment | string;
  status?: TicketStatus;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TicketAttachment = {
  id: string;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  messageId?: string | null;
  url: string;
  createdAt?: string;
};

export type TicketMessage = {
  id: string;
  message: string;
  ticketId: string;
  createdAt?: string;
  senderId?: string;
  senderType?: "STORE_USER" | "SYSTEM_USER" | string;
  sender?: { name?: string };
  storeUser?: { user?: { name?: string } };
  attachments?: TicketAttachment[];
};

export type SupportTicketDetail = SupportTicketListItem & {
  messages?: TicketMessage[];
  attachments?: TicketAttachment[];
  assignedTo?: { name?: string };
  resolved_at?: string;
  resolved_note?: string;
};

export type CursorPage<T> = {
  data: T[];
  nextCursor?: string | null;
  total?: number;
};

export type CreateStoreSupportTicketInput = {
  title: string;
  description: string;
  type?: TicketType | string;
  department?: TicketDepartment | string;
  files?: File[];
};

/** Returned when create succeeds but a follow-up attachment upload could not complete */
export type CreateStoreSupportTicketResult = SupportTicketDetail & {
  attachmentsFailed?: boolean;
};

export type SendTicketMessageInput = {
  ticketId: string;
  message?: string;
  files?: File[];
};
