import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const OrderTableHeader = ({ sort }: { sort?: SortState }) => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <SortableHead className={cn(thClass, "min-w-[110px]")} sortKey="number" sort={sort}>رقم الطلب</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[160px]")} sortKey="customer" sort={sort}>معلومات العميل</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[180px]")} sortKey="address" sort={sort}>عنوان الطلب</SortableHead>
        <TableHead className={cn(thClass, "min-w-[140px]")}>المنتجات</TableHead>
        <SortableHead className={cn(thClass, "min-w-[120px] text-center")} sortKey="total" sort={sort}>المبلغ الإجمالي</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[110px]")} sortKey="date" sort={sort}>تاريخ الطلب</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[110px]")} sortKey="status" sort={sort}>الحالة</SortableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
