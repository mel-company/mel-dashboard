import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Phone, Trash2 } from "lucide-react";

type EmployeeCardProps = {
  employee: any;
  onClick: () => void;
  onDelete: () => void;
};

function roleTone(roleName?: string) {
  if (roleName === "مسؤول الداتا") {
    return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300";
  }
  if (roleName === "مسؤول الطلبات") {
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300";
  }
  return "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
}

const EmployeeCard = ({ employee, onClick, onDelete }: EmployeeCardProps) => {
  const user = employee.user;
  const roleName = employee.role?.name ?? "موظف";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-100 bg-white p-4 text-right shadow-none transition hover:border-sky-200 dark:border-white/8 dark:bg-[#0a0e27] dark:hover:border-[#00b7ff]/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold text-slate-900 dark:text-[#f0f2ff]">
            {user?.name ?? "—"}
          </p>
          <p
            className="flex items-center gap-1.5 text-sm tabular-nums text-slate-500 dark:text-[#a4b1fa]"
            dir="ltr"
          >
            <Phone className="size-3.5" />
            {user?.phone ?? "—"}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 rounded-full px-2.5 py-1", roleTone(roleName))}
        >
          {roleName}
        </Badge>
      </div>
      <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onDelete}
          className="flex size-9 items-center justify-center rounded-xl text-[#ff5252] hover:bg-[#ff5252]/10"
          aria-label="حذف الموظف"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </button>
  );
};

export default EmployeeCard;
