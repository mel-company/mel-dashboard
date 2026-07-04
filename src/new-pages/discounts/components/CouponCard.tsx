import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CouponListItem } from "@/api/types/coupon";
import {
  formatCouponDate,
  formatCouponUsage,
  formatCouponValue,
  getCouponStatusMeta,
} from "../coupon-utils";

type CouponCardProps = {
  coupon: CouponListItem;
  onClick: () => void;
};

const CouponCard = ({ coupon, onClick }: CouponCardProps) => {
  const status = getCouponStatusMeta(coupon);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col rounded-3xl border border-slate-100 bg-white p-4 text-right shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge
          className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs", status.badgeClass)}
        >
          {status.label}
        </Badge>
        <div className="relative flex size-16 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-50" />
          <span className="relative text-xl font-black text-amber-600">
            {formatCouponValue(coupon)}
          </span>
        </div>
      </div>

      <h3 className="mb-1 line-clamp-1 text-base font-bold text-blue-950" dir="ltr">
        {coupon.code}
      </h3>
      <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">
        {coupon.description || "—"}
      </p>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>استُخدم {formatCouponUsage(coupon)}</p>
        <p>
          من {formatCouponDate(coupon.startsAt)} إلى{" "}
          {formatCouponDate(coupon.expiresAt)}
        </p>
      </div>
    </button>
  );
};

export default CouponCard;
