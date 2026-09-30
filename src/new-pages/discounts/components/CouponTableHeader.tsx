import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const thClass =
  "h-[52px] px-3.5 text-right text-[15px] font-semibold text-slate-600 dark:text-[#5c7be3]";
const darkTh = cn(thClass, "dark:bg-[#12183b]");

const CouponTableHeader = ({ sort }: { sort?: SortState }) => (
  <TableHeader>
    <TableRow className="border-b-0 bg-slate-50 hover:bg-transparent dark:bg-transparent">
      <TableHead className={cn(darkTh, "min-w-[220px] dark:rounded-e-xl")}>
        تفاصيل الكوبون
      </TableHead>
      <SortableHead className={cn(darkTh, "w-28")} sortKey="value" sort={sort}>قيمة الخصم</SortableHead>
      <SortableHead className={cn(darkTh, "min-w-[130px]")} sortKey="startDate" sort={sort}>تاريخ البدء</SortableHead>
      <SortableHead className={cn(darkTh, "min-w-[130px]")} sortKey="endDate" sort={sort}>تاريخ النفاذ</SortableHead>
      <SortableHead className={cn(darkTh, "w-28")} sortKey="usage" sort={sort}>مرات الاستخدام</SortableHead>
      <SortableHead className={cn(darkTh, "w-36")} sortKey="status" sort={sort}>الحالة</SortableHead>
      <TableHead className={cn(darkTh, "w-28 dark:rounded-s-xl")}>
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);

export default CouponTableHeader;
