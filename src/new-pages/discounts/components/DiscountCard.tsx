import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatDiscountDate,
  getDiscountScope,
  getDiscountStatusMeta,
} from "../utils";

type DiscountCardProps = {
  discount: DiscountListItem;
  onClick: () => void;
};

const DiscountCard = ({ discount, onClick }: DiscountCardProps) => {
  const status = getDiscountStatusMeta(discount.discount_status);
  const pct = discount.discount_percentage ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col rounded-3xl border border-slate-100 bg-white p-4 text-right shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <Badge className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs", status.badgeClass)}>
          {status.label}
        </Badge>
        <div className="relative flex size-16 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-100 to-sky-50" />
          <span className="relative text-2xl font-black text-violet-600">{pct}%</span>
        </div>
      </div>

      <h3 className="mb-1 line-clamp-1 text-base font-bold text-blue-950">
        {discount.name}
      </h3>
      <p className="mb-4 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-slate-500">
        {discount.description || "—"}
      </p>

      <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <p>{getDiscountScope(discount)}</p>
        <p>
          من {formatDiscountDate(discount.discount_start_date)} إلى{" "}
          {formatDiscountDate(discount.discount_end_date)}
        </p>
      </div>
    </button>
  );
};

export default DiscountCard;
