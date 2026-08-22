import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import ActionBtnList from "@/components/table/action-btn-list";
import type { CouponListItem } from "@/api/types/coupon";
import {
  formatCouponValue,
  getCouponStatusMeta,
  getCouponUsageCount,
  getCouponUsageProgress,
  isCouponExpired,
} from "../coupon-utils";
import { formatTableDate, formatTableTime, shortText } from "../utils";

type CouponRowProps = {
  coupon: CouponListItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (coupon: CouponListItem) => void;
};

const CouponRow = ({
  coupon,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CouponRowProps) => {
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const status = getCouponStatusMeta(coupon);
  const expired = isCouponExpired(coupon);
  const usage = getCouponUsageCount(coupon);
  const progress = getCouponUsageProgress(usage);

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/3"
      onClick={onView}
    >
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]" dir="ltr">
          {coupon.code}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {shortText(coupon.description)}
        </p>
      </TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-bold tabular-nums text-violet-600 dark:text-[#b282ff]",
        )}
      >
        {formatCouponValue(coupon)}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatTableDate(coupon.startsAt)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTableTime(coupon.startsAt)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatTableDate(coupon.expiresAt)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTableTime(coupon.expiresAt)}
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
        {expired ? (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 dark:bg-[#ff5252]/15 dark:text-[#ff5252]">
            منتهي
          </span>
        ) : (
          <Switch
            checked={status.switchChecked}
            activeLabel="مفعل"
            disabledLabel="معطل"
            onToggle={() => onToggleStatus(coupon)}
          />
        )}
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList onView={onView} onEdit={onEdit} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
};

export default CouponRow;
