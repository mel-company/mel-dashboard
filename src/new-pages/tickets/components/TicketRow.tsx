import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Badge from "@/components/table/badge";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  EyeIcon,
  PencilEdit02Icon,
} from "@hugeicons-pro/core-twotone-rounded";
import type { SupportTicketListItem } from "@/api/types/ticket";
import {
  TICKET_DEPARTMENTS,
  TICKET_STATUSES,
  TICKET_TYPES,
} from "@/pages/support/TicketFilterDialog";
import { AR_LATN_LOCALE } from "@/utils/format-currency";

type TicketRowProps = {
  ticket: SupportTicketListItem;
  rowIndex: number;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString(AR_LATN_LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTicketTypeLabel = (type?: string) =>
  TICKET_TYPES.find((t) => t.value === type)?.label ?? type ?? "—";

const getDepartmentLabel = (department?: string) =>
  TICKET_DEPARTMENTS.find((d) => d.value === department)?.label ??
  department ??
  "—";

const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  const upper = status.toUpperCase();
  return (
    TICKET_STATUSES.find((s) => s.value === upper)?.label ?? status
  );
};

const statusColor = (status?: string): "success" | "danger" | "purple" | "default" => {
  const s = status?.toUpperCase();
  if (s === "OPEN" || s === "IN_PROGRESS") return "purple";
  if (s === "RESOLVED" || s === "CLOSED") return "success";
  if (s === "CANCELLED") return "danger";
  return "default";
};

const TicketRow = ({ ticket, rowIndex }: TicketRowProps) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const ticketCode = `TK${String(ticket.id).slice(0, 4).toUpperCase()}`;

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <span className="font-mono text-sm font-medium text-slate-600 dark:text-[#a4b1fa]" dir="ltr">
          #{ticketCode}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">{ticket.title ?? "—"}</p>
        {ticket.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-[#a4b1fa]">
            {ticket.description}
          </p>
        )}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color="purple">{getTicketTypeLabel(ticket.type)}</Badge>
      </TableCell>
      <TableCell className={tdClass}>
        <span className="text-sm text-slate-600 dark:text-[#e4e7fc]">
          {getDepartmentLabel(ticket.department)}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm text-slate-500 dark:text-[#a4b1fa]")}>
        {formatDate(ticket.createdAt)}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color={statusColor(ticket.status)}>
          <span className="inline-flex items-center gap-1">
            {ticket.status?.toUpperCase() === "OPEN" ? <AlertTriangle className="size-3.5" /> : null}
            {ticket.status?.toUpperCase() === "IN_PROGRESS" || ticket.status?.toUpperCase() === "ON_HOLD" ? <Clock3 className="size-3.5" /> : null}
            {ticket.status?.toUpperCase() === "RESOLVED" || ticket.status?.toUpperCase() === "CLOSED" ? <CheckCircle2 className="size-3.5" /> : null}
          {getStatusLabel(ticket.status)}
          </span>
        </Badge>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="حذف التذكرة"
            className="text-[#ff6b7a] transition-opacity hover:opacity-80 dark:text-[#ff5a67]"
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} />
          </button>
          <button
            type="button"
            aria-label="تعديل التذكرة"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="text-[#a89bc8] transition-opacity hover:opacity-80 dark:text-[#b8a9e0]"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} size={18} />
          </button>
          <button
            type="button"
            aria-label="عرض التذكرة"
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            className="text-[#a89bc8] transition-opacity hover:opacity-80 dark:text-[#b8a9e0]"
          >
            <HugeiconsIcon icon={EyeIcon} size={18} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TicketRow;
