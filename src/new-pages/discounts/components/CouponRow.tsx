import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import ActionBtnList from "@/components/table/action-btn-list";
import type { CouponListItem } from "@/api/types/coupon";
import {
  formatCouponDateTime,
  formatCouponUsage,
  formatCouponValue,
  getCouponStatusMeta,
  isCouponExpired,
} from "../coupon-utils";

type CouponRowProps = {
  coupon: CouponListItem;
  rowIndex: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (coupon: CouponListItem) => void;
};

const CouponRow = ({
  coupon,
  rowIndex,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: CouponRowProps) => {
  const tdClass = "whitespace-normal px-4 py-3.5 text-right align-middle";
  const status = getCouponStatusMeta(coupon);
  const expired = isCouponExpired(coupon);

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 hover:bg-slate-50/80"
      onClick={onView}
    >
      <TableCell className={cn(tdClass, "w-14 text-muted-foreground")}>
        <span className="text-sm font-semibold tabular-nums text-slate-700">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="font-semibold text-slate-900" dir="ltr">
          {coupon.code}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
          {coupon.description || "—"}
        </p>
      </TableCell>
      <TableCell className={cn(tdClass, "font-bold text-amber-600")}>
        {formatCouponValue(coupon)}
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm tabular-nums text-slate-600")}>
        {formatCouponDateTime(coupon.startsAt)}
      </TableCell>
      <TableCell className={cn(tdClass, "text-sm tabular-nums text-slate-600")}>
        {formatCouponDateTime(coupon.expiresAt)}
      </TableCell>
      <TableCell className={cn(tdClass, "font-semibold tabular-nums")}>
        {formatCouponUsage(coupon)}
      </TableCell>
      <TableCell
        className={cn(tdClass, "text-center")}
        onClick={(e) => e.stopPropagation()}
      >
        {expired ? (
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
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
