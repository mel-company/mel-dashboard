import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ProductTableHeader = () => {
  const thClass =
    "h-11 px-4 text-right text-sm font-semibold text-slate-600 dark:text-[#a4b1fa]";

  return (
    <TableHeader>
      <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-transparent dark:border-white/[0.06] dark:bg-transparent">
        <TableHead className={cn(thClass, "w-14")}>#</TableHead>
        <TableHead className={cn(thClass, "w-16")}>الصورة</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>
          معلومات المنتج
        </TableHead>
        <TableHead className={cn(thClass, "min-w-[160px]")}>الفئات</TableHead>
        <TableHead className={thClass}>السعر</TableHead>
        <TableHead className={thClass}>تكلفة المنتج</TableHead>
        <TableHead className={cn(thClass, "w-20")}>التقييم</TableHead>
        <TableHead className={cn(thClass, "w-24")}>الحالة</TableHead>
        <TableHead className={cn(thClass, "w-28")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProductTableHeader;
