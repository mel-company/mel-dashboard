import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const TicketTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <TableHead className={cn(thClass, "w-14")}>  </TableHead>
        <TableHead className={cn(thClass, "w-28")}>المعرف</TableHead>
        <TableHead className={cn(thClass, "min-w-[230px]")}>عنوان طلب الدعم</TableHead>
        <TableHead className={cn(thClass, "w-28")}>نوع التذكرة</TableHead>
        <TableHead className={cn(thClass, "w-36")}>القسم</TableHead>
        <TableHead className={cn(thClass, "w-36")}>تاريخ</TableHead>
        <TableHead className={cn(thClass, "w-32")}>الحالة</TableHead>
        <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TicketTableHeader;
