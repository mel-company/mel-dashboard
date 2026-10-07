import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const ProductTableHeader = ({ sort }: { sort?: SortState }) => {
  const thClass =
    "h-12 px-4 text-right text-sm font-semibold text-[#3b4656] dark:text-[#a4b1fa]";

  return (
    <TableHeader>
      <TableRow className="border-b border-[#e7edf6] bg-[#f5f6fa] hover:bg-transparent dark:border-white/[0.06] dark:bg-transparent">
        <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
        <SortableHead className={cn(thClass, "min-w-[220px]")} sortKey="name" sort={sort}>معلومات المنتج</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[140px]")} sortKey="category" sort={sort}>الفئات</SortableHead>
        <SortableHead className={cn(thClass, "w-24")} sortKey="quantity" sort={sort}>الكمية</SortableHead>
        <SortableHead className={thClass} sortKey="price" sort={sort}>السعر</SortableHead>
        <SortableHead className={thClass} sortKey="cost" sort={sort}>تكلفة المنتج</SortableHead>
        <SortableHead className={cn(thClass, "w-20")} sortKey="rating" sort={sort}>التقييم</SortableHead>
        <SortableHead className={cn(thClass, "w-28")} sortKey="status" sort={sort}>الحالة</SortableHead>
        <TableHead className={cn(thClass, "w-24")}>الظهور</TableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
