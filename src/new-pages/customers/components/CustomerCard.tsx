import { Pencil, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CustomerCardProps = {
  customer: any;
  onClick: () => void;
  onDelete: () => void;
  className?: string;
};

const CustomerCard = ({ customer, onClick, onDelete, className }: CustomerCardProps) => {
  const user = customer.user;
  const orderCount = customer._count?.orders ?? 0;
  const rawRating = customer.rating ?? customer.rate ?? user?.rating;
  const rating =
    typeof rawRating === "number"
      ? rawRating
      : rawRating != null
        ? Number.parseFloat(String(rawRating))
        : NaN;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-3 rounded-[20px] bg-white p-4 text-right dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3" dir="ltr">
        <div className="inline-flex items-center gap-1.5 text-amber-500 dark:text-[#ffb547]">
          <Star className="size-4 fill-current" />
          <span className="text-sm font-semibold text-slate-700 dark:text-[#e4e7fc]">
            {Number.isFinite(rating) ? rating.toFixed(1) : "—"}
          </span>
        </div>
        <span className="text-xs font-medium tracking-wide text-slate-400 dark:text-[#a4b1fa]">
          {`CUS-${String(customer.id).slice(0, 4).toUpperCase()}`}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
          {user?.name ?? "—"}
        </h3>
        <p className="text-sm font-medium text-violet-600 dark:text-[#8e9dff]">
          {user?.phone ?? "—"}
        </p>
      </div>

      <p className="line-clamp-2 text-[13px] leading-[19.5px] text-slate-400 dark:text-[#a4b1fa]">
        {user?.location ?? "—"}
      </p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="حذف العميل"
            className="text-red-500 transition hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label="تعديل العميل"
            className="text-slate-400 transition hover:text-slate-500 dark:text-[#8f9de8] dark:hover:text-[#b6c2ff]"
            onClick={onClick}
          >
            <Pencil className="size-[18px]" />
          </button>
        </div>

        <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">
          <span className="font-semibold text-slate-700 dark:text-[#e4e7fc]">{orderCount}</span>{" "}
          إجمالي الطلبات
        </p>
      </div>
    </button>
  );
};

export default CustomerCard;
