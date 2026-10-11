import { useState } from "react";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  logo?: string | null;
  /** Tailwind sizing for the tile. */
  className?: string;
  /** Tailwind sizing for the fallback glyph. */
  iconClassName?: string;
};

/**
 * شعار شركة التوصيل، أو أيقونة الطرد.
 *
 * Shared because the fallback is the interesting half and both places need
 * the same one. Three of the four couriers carry a logo on the CDN and Prime
 * carries none — its `DeliveryCompany` row predates the courier catalogue and
 * nothing backfills it — so a missing logo is the ordinary case, not an edge
 * one. A broken-image glyph beside a courier's name reads as a broken
 * dashboard, which is why a load failure falls back here rather than being
 * left to the browser.
 */
const CourierLogo = ({ logo, className, iconClassName }: Props) => {
  const [failed, setFailed] = useState(false);

  if (!logo || failed) {
    return (
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10",
          className,
        )}
      >
        <Truck className={cn("size-5 text-sky-500", iconClassName)} />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-slate-200 dark:ring-white/10",
        className,
      )}
    >
      <img
        src={logo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-full object-contain"
      />
    </span>
  );
};

export default CourierLogo;
