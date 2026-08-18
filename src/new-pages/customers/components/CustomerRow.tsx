import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons-pro/core-stroke-rounded";
import { HugeiconsIcon } from "@hugeicons/react";
import Rating from "@/components/table/rating";

type CustomerRowProps = {
  customer: any;
  rowIndex: number;
  onDelete: (id: string) => void;
};

const CustomerRow = ({ customer, rowIndex, onDelete }: CustomerRowProps) => {
  const navigate = useNavigate();
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const user = customer.user;
  const orderCount = customer._count?.orders ?? 0;
  const customerCode = `CUS-${String(customer.id).slice(0, 4).toUpperCase()}`;
  const rawRating = customer.rating ?? customer.rate ?? user?.rating;
  const rating =
    typeof rawRating === "number"
      ? rawRating
      : rawRating != null
        ? Number.parseFloat(String(rawRating))
        : NaN;

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={() => navigate(`/customers/${customer.id}`)}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={cn(tdClass, "w-24")}>
        <span className="font-mono text-sm font-medium text-slate-600 dark:text-[#a4b1fa]" dir="ltr">
          {customerCode}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">{user?.name ?? "—"}</p>
      </TableCell>
      <TableCell className={cn(tdClass, "tabular-nums text-slate-800 dark:text-[#e4e7fc]")} dir="ltr">
        {user?.phone ?? "—"}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-2 text-sm text-slate-600 dark:text-[#a4b1fa]">
          {user?.location ?? "—"}
        </p>
      </TableCell>
      <TableCell className={cn(tdClass, "font-semibold tabular-nums text-slate-900 dark:text-[#f0f2ff]")}>
        {orderCount}
      </TableCell>
      <TableCell className={cn(tdClass, "text-center")}>
        {Number.isFinite(rating) ? (
          <div className="flex justify-center">
            <Rating count={rating} />
          </div>
        ) : (
          "—"
        )}
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="حذف العميل"
            onClick={() => onDelete(customer.id)}
            className="text-red-500 transition-colors hover:text-red-400 dark:text-[#ff5a67] dark:hover:text-[#ff7f88]"
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} />
          </button>
          <button
            type="button"
            aria-label="تعديل العميل"
            onClick={() => navigate(`/customers/${customer.id}`)}
            className="text-slate-400 transition-colors hover:text-slate-500 dark:text-[#8f9de8] dark:hover:text-[#b6c2ff]"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} size={16} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default CustomerRow;
