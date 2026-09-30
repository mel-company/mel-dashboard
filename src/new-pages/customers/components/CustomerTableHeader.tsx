import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const CustomerTableHeader = ({ sort }: { sort?: SortState }) => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <TableHead className={cn(thClass, "w-14")}>  </TableHead>
        <SortableHead className={cn(thClass, "w-24")} sortKey="id" sort={sort}>المعرف</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[180px]")} sortKey="name" sort={sort}>اسم العميل</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[140px]")} sortKey="phone" sort={sort}>رقم الهاتف</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[220px]")} sortKey="location" sort={sort}>الموقع</SortableHead>
        <SortableHead className={cn(thClass, "w-28")} sortKey="orders" sort={sort}>عدد الطلبات</SortableHead>
        <SortableHead className={cn(thClass, "w-24 text-center")} sortKey="rating" sort={sort}>التقييم</SortableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default CustomerTableHeader;
