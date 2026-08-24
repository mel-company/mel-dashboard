import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-3.5 text-right font-semibold text-muted-foreground";

const OrderTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-[#12183b]">
        <TableHead className={cn(thClass, "min-w-[110px]")}>رقم الطلب</TableHead>
        <TableHead className={cn(thClass, "min-w-[160px]")}>معلومات العميل</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>عنوان الطلب</TableHead>
        <TableHead className={cn(thClass, "min-w-[140px]")}>المنتجات</TableHead>
        <TableHead className={cn(thClass, "min-w-[120px] text-center")}>المبلغ الإجمالي</TableHead>
        <TableHead className={cn(thClass, "min-w-[110px]")}>تاريخ الطلب</TableHead>
        <TableHead className={cn(thClass, "min-w-[110px]")}>الحالة</TableHead>
        <TableHead className={cn(thClass, "w-32")}>العمليات</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default OrderTableHeader;
