import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass =
  "h-[52px] px-3.5 text-right text-[15px] font-semibold text-slate-600 dark:text-[#5c7be3]";
const categoryThClass = cn(thClass, "dark:bg-[#12183b]");

export const CategoryTableHeader = () => (
  <TableHeader>
    <TableRow className="border-b-0 bg-slate-50 hover:bg-transparent dark:bg-transparent">
      <TableHead className={cn(categoryThClass, "w-16 dark:rounded-e-xl")}>
        الصورة
      </TableHead>
      <TableHead className={cn(categoryThClass, "w-24")}>المعرف</TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[220px]")}>
        معلومات الفئة
      </TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[120px]")}>نوع الفئة</TableHead>
      <TableHead className={categoryThClass}>عدد منتجات</TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[120px]")}>رأس المال</TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[140px]")}>
        تاريخ آخر تحديث
      </TableHead>
      <TableHead className={cn(categoryThClass, "w-36")}>الحالة</TableHead>
      <TableHead className={cn(categoryThClass, "w-28 dark:rounded-s-xl")}>
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);

export const GroupTableHeader = () => (
  <TableHeader>
    <TableRow className="border-b-0 bg-slate-50 hover:bg-transparent dark:bg-transparent">
      <TableHead className={cn(categoryThClass, "w-16 dark:rounded-e-xl")}>
        الصورة
      </TableHead>
      <TableHead className={cn(categoryThClass, "w-24")}>المعرف</TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[220px]")}>
        معلومات المجموعة
      </TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[160px]")}>الفئات</TableHead>
      <TableHead className={categoryThClass}>عدد الفئات</TableHead>
      <TableHead className={cn(categoryThClass, "min-w-[140px]")}>
        تاريخ آخر تحديث
      </TableHead>
      <TableHead className={cn(categoryThClass, "w-36")}>الحالة</TableHead>
      <TableHead className={cn(categoryThClass, "w-28 dark:rounded-s-xl")}>
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);
