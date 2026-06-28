import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";

const TicketTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-slate-950">
        <TableHead className={cn(thClass, "w-14")}>#</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>العنوان</TableHead>
        <TableHead className={cn(thClass, "w-28")}>النوع</TableHead>
        <TableHead className={cn(thClass, "w-32")}>القسم</TableHead>
        <TableHead className={cn(thClass, "w-28")}>الحالة</TableHead>
        <TableHead className={cn(thClass, "w-36")}>التاريخ</TableHead>
        <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TicketTableHeader;
