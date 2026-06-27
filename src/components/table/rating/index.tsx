import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons-pro/core-bulk-rounded";

const Rating = ({ count }: { count: number }) => {
  return (
    <div className="flex items-center gap-1.5 text-base font-extrabold text-amber-500">
      <HugeiconsIcon icon={StarIcon} size={18} />
      <span className="tabular-nums">{count.toFixed(1)}</span>
    </div>
  );
};

export default Rating;
