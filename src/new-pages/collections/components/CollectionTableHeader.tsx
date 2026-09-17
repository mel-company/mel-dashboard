import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass =
  "h-[52px] px-3.5 text-right text-[15px] font-semibold text-slate-600 dark:text-[#5c7be3]";
const collectionThClass = cn(thClass, "dark:bg-[#12183b]");

/**
 * No image column, unlike the category table.
 *
 * A collection has no cover of its own — its products are its artwork — so the
 * first column shows a stack of member thumbnails instead, which is both more
 * informative and always current.
 */
export const CollectionTableHeader = () => (
  <TableHeader>
    <TableRow className="border-b-0 bg-slate-50 hover:bg-transparent dark:bg-transparent">
      <TableHead className={cn(collectionThClass, "w-28 dark:rounded-e-xl")}>
        المنتجات
      </TableHead>
      <TableHead className={cn(collectionThClass, "w-24")}>المعرف</TableHead>
      <TableHead className={cn(collectionThClass, "min-w-[220px]")}>
        اسم المجموعة
      </TableHead>
      <TableHead className={collectionThClass}>عدد المنتجات</TableHead>
      <TableHead className={cn(collectionThClass, "min-w-[140px]")}>
        تاريخ الإنشاء
      </TableHead>
      <TableHead className={cn(collectionThClass, "w-36")}>الحالة</TableHead>
      <TableHead className={cn(collectionThClass, "w-28 dark:rounded-s-xl")}>
        العمليات
      </TableHead>
    </TableRow>
  </TableHeader>
);

export default CollectionTableHeader;
