import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ActionBtnList from "@/components/table/action-btn-list";
import { Badge } from "@/components/ui/badge";

type EmployeeRowProps = {
  employee: any;
  rowIndex: number;
  onDelete: (id: string) => void;
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

const EmployeeRow = ({ employee, rowIndex, onDelete }: EmployeeRowProps) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const user = employee.user;
  const roleName = employee.role?.name ?? "موظف";
  const code = `EMP-${String(employee.id).slice(0, 4).toUpperCase()}`;

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={() => navigate(`/employees/${employee.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "w-24")}>
        <span
          className="font-mono text-sm font-medium text-slate-600 dark:text-[#a4b1fa]"
          dir="ltr"
        >
          {code}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">
          {user?.name ?? "—"}
        </p>
      </TableCell>
      <TableCell
        className={cn(tdClass, "text-slate-800 dark:text-[#e4e7fc]")}
        dir="ltr"
      >
        {user?.email && !String(user.email).endsWith("@employees.mel.local")
          ? user.email
          : user?.phone ?? "—"}
      </TableCell>
      <TableCell className={tdClass}>
        <Badge
          variant="outline"
          className={cn("rounded-full px-3 py-1 font-medium", roleTone(roleName))}
        >
          {roleName}
        </Badge>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onEdit={() => navigate(`/employees/${employee.id}`)}
          onDelete={() => onDelete(employee.id)}
        />
      </TableCell>
    </TableRow>
  );
};

export default EmployeeRow;
