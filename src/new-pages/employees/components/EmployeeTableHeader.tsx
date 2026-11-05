import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const EmployeeTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <TableHead className={cn(thClass, "w-14")}> </TableHead>
        <TableHead className={cn(thClass, "w-24")}>المعرف</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>اسم الموظف</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>الإيميل</TableHead>
        <TableHead className={cn(thClass, "min-w-[160px]")}>الدور</TableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EmployeeTableHeader;
