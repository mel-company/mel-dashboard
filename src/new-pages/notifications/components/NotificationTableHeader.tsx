import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const thClass =
  "h-12 px-4 text-right text-sm font-semibold text-slate-500 dark:text-slate-400";

const NotificationTableHeader = () => {
  return (
    <TableHeader>
      <TableRow className="border-b border-slate-100 hover:bg-transparent dark:border-white/5 dark:bg-transparent">
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
