import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import ActionBtnList from "@/components/table/action-btn-list";
import { DISCOUNT_STATUS } from "@/utils/constants";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatTableDate,
  formatTableTime,
  getDiscountScope,
  getDiscountStatusMeta,
  getDiscountUsageCount,
  getDiscountUsageProgress,
  shortText,
} from "../utils";

type DiscountRowProps = {
  discount: DiscountListItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (discount: DiscountListItem) => void;
};

const DiscountRow = ({
  discount,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: DiscountRowProps) => {
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const status = getDiscountStatusMeta(discount.discount_status);
  const isExpired = discount.discount_status === DISCOUNT_STATUS.EXPIRED;
  const usage = getDiscountUsageCount(discount);
  const progress = getDiscountUsageProgress(usage);

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={onView}
    >
      <TableCell className={tdClass}>
        <p className="line-clamp-1 font-semibold text-slate-900 dark:text-[#f0f2ff]">
          {discount.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {shortText(discount.description)}
        </p>
      </TableCell>
      <TableCell
        className={cn(tdClass, "font-bold tabular-nums text-violet-600 dark:text-[#b282ff]")}
      >
        {discount.discount_percentage}%
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm text-sky-700 dark:text-[#33c5ff]")}>
        {getDiscountScope(discount)}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatTableDate(discount.discount_start_date)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTableTime(discount.discount_start_date)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatTableDate(discount.discount_end_date)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTableTime(discount.discount_end_date)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <div className="flex flex-col items-end gap-1.5">
          <span className="font-semibold tabular-nums text-slate-900 dark:text-[#00dfa8]">
            {usage}
          </span>
          <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-[#12183b]">
            <div
              className="h-full rounded-full bg-emerald-500 dark:bg-[#00dfa8]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        {isExpired ? (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-[#ff5252]/15 dark:text-[#ff5252]">
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
