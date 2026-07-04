import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass = "h-11 px-4 text-right font-semibold text-muted-foreground";

const NotificationTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 dark:bg-slate-950">
        <TableHead className={cn(thClass, "w-14")} />
        <TableHead className={cn(thClass, "w-28")}>المعرف</TableHead>
        <TableHead className={cn(thClass, "min-w-[180px]")}>العنوان</TableHead>
        <TableHead className={cn(thClass, "min-w-[220px]")}>الوصف</TableHead>
        <TableHead className={cn(thClass, "w-32")}>النوع</TableHead>
        <TableHead className={cn(thClass, "w-40")}>تاريخ</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default NotificationTableHeader;
