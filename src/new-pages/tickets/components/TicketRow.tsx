import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ActionBtnList from "@/components/table/action-btn-list";
import Badge from "@/components/table/badge";
import type { SupportTicketListItem } from "@/api/types/ticket";
import {
  TICKET_DEPARTMENTS,
  TICKET_STATUSES,
  TICKET_TYPES,
} from "@/pages/support/TicketFilterDialog";

type TicketRowProps = {
  ticket: SupportTicketListItem;
  rowIndex: number;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("ar-IQ", {
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
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/80"
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900">{ticket.title ?? "—"}</p>
        {ticket.description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
            {ticket.description}
          </p>
        )}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color="default">{getTicketTypeLabel(ticket.type)}</Badge>
      </TableCell>
      <TableCell className={tdClass}>
        <span className="text-sm text-slate-600">
          {getDepartmentLabel(ticket.department)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <Badge color={statusColor(ticket.status)}>
          {getStatusLabel(ticket.status)}
        </Badge>
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm text-slate-500")}>
        {formatDate(ticket.createdAt)}
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onView={() => navigate(`/tickets/${ticket.id}`)}
        />
      </TableCell>
    </TableRow>
  );
};

export default TicketRow;
