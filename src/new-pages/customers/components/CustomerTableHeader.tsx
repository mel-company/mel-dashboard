import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";

const CustomerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-slate-950">
        <TableHead className={cn(thClass, "w-14")}>  </TableHead>
        <TableHead className={cn(thClass, "w-24")}>المعرف</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>اسم العميل</TableHead>
        <TableHead className={cn(thClass, "min-w-[140px]")}>رقم الهاتف</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>الموقع</TableHead>
        <TableHead className={cn(thClass, "w-28")}>عدد الطلبات</TableHead>
        <TableHead className={cn(thClass, "w-24 text-center")}>التقييم</TableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerTableHeader;
