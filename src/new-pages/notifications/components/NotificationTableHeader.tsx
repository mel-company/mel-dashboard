import { TableHeader, TableRow } from "@/components/ui/table";
import SortableHead, { type SortState } from "@/components/table/sortable-head";
import { cn } from "@/lib/utils";

const thClass =
  "h-12 rounded-none bg-[#f5f6fa] px-4 text-right text-sm font-semibold text-[#3b4656] first:rounded-s-xl last:rounded-e-xl dark:bg-muted dark:text-[#a4b1fa]";

const NotificationTableHeader = ({ sort }: { sort?: SortState }) => {
  return (
    <TableHeader>
      <TableRow className="border-0 hover:bg-transparent">
        <SortableHead className={cn(thClass, "w-28")} sortKey="id" sort={sort}>المعرف</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[180px]")} sortKey="title" sort={sort}>العنوان</SortableHead>
        <SortableHead className={cn(thClass, "min-w-[220px]")} sortKey="description" sort={sort}>الوصف</SortableHead>
        <SortableHead className={cn(thClass, "w-32")} sortKey="type" sort={sort}>النوع</SortableHead>
        <SortableHead className={cn(thClass, "w-36")} sortKey="date" sort={sort}>تاريخ</SortableHead>
      </TableRow>
    </TableHeader>
  );
};

export default NotificationTableHeader;
