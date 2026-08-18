import type { ReactNode } from "react";
import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import type { DiscountListItem } from "@/api/types/discount";
import {
  formatTableDate,
  formatTableTime,
  getDiscountScope,
  shortText,
} from "../utils";

type DiscountCardProps = {
  discount: DiscountListItem;
  onClick: () => void;
  footer?: ReactNode;
  className?: string;
};

const DiscountCard = ({ discount, onClick, footer, className }: DiscountCardProps) => {
  const imageBaseUrl = useImageBaseUrl(discount.baseUrl ?? "");
  const pct = discount.discount_percentage ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full w-full flex-col gap-4 rounded-[20px] bg-white p-4 text-right dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-center gap-3" dir="ltr">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-violet-50 dark:bg-[#9a5cff]/10">
          {discount.image ? (
            <AssetImage
              image={discount.image}
              baseUrl={imageBaseUrl}
              alt={discount.name}
              className="block size-12 rounded-xl object-cover"
              fallback={<Percent className="size-5 text-violet-500 dark:text-[#b282ff]" />}
            />
          ) : (
            <span className="text-sm font-black text-violet-600 dark:text-[#b282ff]">
              {pct}%
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-right" dir="rtl">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
            {discount.name}
          </h3>
          <p className="mt-1 text-xs font-bold text-violet-600 dark:text-[#b282ff]">
            {pct}%
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-right text-[13px] leading-[19.5px] text-slate-400 dark:text-[#a4b1fa]">
        {shortText(discount.description, 120)}
      </p>

      <span className="w-fit rounded-lg bg-violet-100 px-2 py-1 text-[11px] font-medium text-violet-700 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]">
        {getDiscountScope(discount)}
      </span>

      <div className="h-px bg-slate-100 dark:bg-[#1f2448]/40" />

      {footer !== undefined ? footer : (
        <div className="flex items-center justify-between gap-2" dir="ltr">
          <p className="text-xs text-slate-400 dark:text-[#a4b1fa]" dir="rtl">
            {formatTableDate(discount.discount_start_date)} —{" "}
            {formatTableDate(discount.discount_end_date)}
          </p>
          <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
            {formatTableTime(discount.discount_end_date)}
          </p>
        </div>
      )}
    </button>
  );
};

export default DiscountCard;
