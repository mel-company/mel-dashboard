import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ProductTableHeader = () => {
  const thClass =
    "h-12 px-4 text-right text-sm font-semibold text-[#3b4656] dark:text-[#a4b1fa]";

  return (
    <TableHeader>
      <TableRow className="border-b border-[#e7edf6] bg-[#f5f6fa] hover:bg-transparent dark:border-white/[0.06] dark:bg-transparent">
        <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>
          معلومات المنتج
        </TableHead>
        <TableHead className={cn(thClass, "min-w-[140px]")}>الفئات</TableHead>
        <TableHead className={cn(thClass, "w-24")}>الكمية</TableHead>
        <TableHead className={thClass}>السعر</TableHead>
        <TableHead className={thClass}>تكلفة المنتج</TableHead>
        <TableHead className={cn(thClass, "w-20")}>التقييم</TableHead>
        <TableHead className={cn(thClass, "w-28")}>الحالة</TableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
