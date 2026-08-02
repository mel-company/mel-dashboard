import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import ActionBtnList from "@/components/table/action-btn-list";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatDiscountDateTime,
  getDiscountScope,
  getDiscountStatusMeta,
  getDiscountUsageCount,
} from "../utils";

type DiscountRowProps = {
  discount: DiscountListItem;
  rowIndex: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (discount: DiscountListItem) => void;
};

const DiscountRow = ({
  discount,
  rowIndex,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: DiscountRowProps) => {
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const status = getDiscountStatusMeta(discount.discount_status);
  const isExpired = discount.discount_status === DISCOUNT_STATUS.EXPIRED;

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/80 dark:border-slate-800 dark:hover:bg-slate-900/80"
      onClick={onView}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-slate-100">{discount.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {discount.description || "—"}
        </p>
      </TableCell>
      <TableCell className={cn(tdClass, "font-bold text-violet-600 dark:text-violet-300")}>
        {discount.discount_percentage}%
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm text-sky-700 dark:text-sky-300")}>
        {getDiscountScope(discount)}
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm tabular-nums text-slate-600 dark:text-slate-400")}>
        {formatDiscountDateTime(discount.discount_start_date)}
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm tabular-nums text-slate-600 dark:text-slate-400")}>
        {formatDiscountDateTime(discount.discount_end_date)}
      </TableCell>
      <TableCell className={cn(tdClass, "font-semibold tabular-nums")}>
        {getDiscountUsageCount(discount)}
      </TableCell>
      <TableCell
        className={cn(tdClass, "text-center")}
        onClick={(e) => e.stopPropagation()}
      >
        {isExpired ? (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-rose-500/15 dark:text-rose-300">
            منتهي
          </span>
        ) : (
          <Switch
            checked={status.switchChecked}
            activeLabel="مفعل"
            disabledLabel="معطل"
            onToggle={() => onToggleStatus(discount)}
          />
        )}
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
};

export default DiscountRow;
