import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const TicketTableHeader = ({ sort }: { sort?: SortState }) => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <TableHead className={cn(thClass, "w-14")}>  </TableHead>
        <SortableHead className={cn(thClass, "w-28")} sortKey="id" sort={sort}>المعرف</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[230px]")} sortKey="title" sort={sort}>عنوان طلب الدعم</SortableHead>
        <SortableHead className={cn(thClass, "w-28")} sortKey="type" sort={sort}>نوع التذكرة</SortableHead>
        <SortableHead className={cn(thClass, "w-36")} sortKey="department" sort={sort}>القسم</SortableHead>
        <SortableHead className={cn(thClass, "w-36")} sortKey="date" sort={sort}>تاريخ</SortableHead>
        <SortableHead className={cn(thClass, "w-32")} sortKey="status" sort={sort}>الحالة</SortableHead>
        <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TicketTableHeader;
