import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass =
  "h-[52px] px-3.5 text-right text-[15px] font-semibold text-slate-600 dark:text-[#5c7be3]";
const darkTh = cn(thClass, "dark:bg-[#12183b]");

const CouponTableHeader = () => (
  <TableHeader>
    <TableRow className="border-b-0 bg-slate-50 hover:bg-transparent dark:bg-transparent">
      <TableHead className={cn(darkTh, "min-w-[220px] dark:rounded-e-xl")}>
        تفاصيل الكوبون
      </TableHead>
      <TableHead className={cn(darkTh, "w-28")}>قيمة الخصم</TableHead>
      <TableHead className={cn(darkTh, "min-w-[130px]")}>تاريخ البدء</TableHead>
      <TableHead className={cn(darkTh, "min-w-[130px]")}>تاريخ النفاذ</TableHead>
      <TableHead className={cn(darkTh, "w-28")}>مرات الاستخدام</TableHead>
      <TableHead className={cn(darkTh, "w-36")}>الحالة</TableHead>
      <TableHead className={cn(darkTh, "w-28 dark:rounded-s-xl")}>
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);

export default CouponTableHeader;
