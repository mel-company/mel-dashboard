import { AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportTicketListItem } from "@/api/types/ticket";
import { TICKET_DEPARTMENTS, TICKET_STATUSES, TICKET_TYPES } from "@/pages/support/TicketFilterDialog";

type TicketCardProps = {
  ticket: SupportTicketListItem;
  onClick: () => void;
  className?: string;
};

const getTicketTypeLabel = (type?: string) =>
  TICKET_TYPES.find((t) => t.value === type)?.label ?? type ?? "—";

const getDepartmentLabel = (department?: string) =>
  TICKET_DEPARTMENTS.find((d) => d.value === department)?.label ?? department ?? "—";

const getStatusLabel = (status?: string) =>
  TICKET_STATUSES.find((s) => s.value === status?.toUpperCase())?.label ?? status ?? "—";

const statusClasses = (status?: string) => {
  const value = status?.toUpperCase();
  if (value === "OPEN") return "border-red-200 bg-red-50 text-red-600 dark:border-[#ff5a67]/40 dark:bg-[#ff5a67]/12 dark:text-[#ff8a93]";
  if (value === "IN_PROGRESS" || value === "ON_HOLD") return "border-amber-200 bg-amber-50 text-amber-700 dark:border-[#ffb547]/40 dark:bg-[#ffb547]/12 dark:text-[#ffc96e]";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-[#1cd49b]/40 dark:bg-[#1cd49b]/12 dark:text-[#6de7c4]";
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const TicketCard = ({ ticket, onClick, className }: TicketCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("w-full rounded-[20px] bg-white p-4 text-right dark:bg-[#0a0e27]", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", statusClasses(ticket.status))}>
          <AlertTriangle className="size-3.5" />
          {getStatusLabel(ticket.status)}
        </span>
        <span className="text-xs text-slate-400 dark:text-[#a4b1fa]">{formatDate(ticket.createdAt)}</span>
      </div>

      <p className="mt-3 text-xs text-slate-400 dark:text-[#8f9de8]">#{ticket.id.slice(0, 6)}</p>
      <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900 dark:text-[#e4e7fc]">{ticket.title ?? "—"}</h3>
      <p className="mt-1 text-xs font-medium text-violet-600 dark:text-[#b282ff]">{getTicketTypeLabel(ticket.type)}</p>
      {ticket.description ? (
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-[#a4b1fa]">{ticket.description}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-slate-400 dark:text-[#8f9de8]">
          <Trash2 className="size-[17px] text-red-500 dark:text-[#ff5a67]" />
          <Pencil className="size-[17px]" />
        </div>
        <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">{getDepartmentLabel(ticket.department)}</p>
      </div>
    </button>
  );
};

export default TicketCard;
