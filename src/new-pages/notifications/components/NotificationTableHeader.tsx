import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass =
  "h-12 rounded-none bg-muted px-4 text-right text-sm font-semibold text-foreground first:rounded-s-xl last:rounded-e-xl";

const NotificationTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <TableHead className={cn(thClass, "w-28")}>المعرف</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>العنوان</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>الوصف</TableHead>
        <TableHead className={cn(thClass, "w-32")}>النوع</TableHead>
        <TableHead className={cn(thClass, "w-36")}>تاريخ</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default NotificationTableHeader;
