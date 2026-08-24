import { Package } from "lucide-react";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { cn } from "@/lib/utils";
import { getOrderProductCount, getOrderProductImagePaths } from "../utils";

type OrderProductStackProps = {
  order: any;
  imageBaseUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
};

const SIZE = {
  sm: "size-9",
  md: "size-10",
} as const;

const OrderProductStack = ({
  order,
  imageBaseUrl,
  size = "md",
  className,
}: OrderProductStackProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);
  const paths = getOrderProductImagePaths(order);
  const productCount = getOrderProductCount(order);
  const box = SIZE[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center">
        {paths.length > 0 ? (
          paths.map((path, index) => (
            <div
              key={`${order.id}-img-${index}`}
              className={cn(
                "relative shrink-0 overflow-hidden rounded-[10px] border-2 border-white bg-slate-100 dark:border-[#0a0e27] dark:bg-[#12183b]",
                box,
              )}
              style={{ marginInlineStart: index === 0 ? 0 : -12 }}
            >
              <AssetImage
                image={path}
                baseUrl={resolvedBaseUrl}
                alt=""
                className="size-full object-cover"
                fallback={
                  <div className="flex size-full items-center justify-center text-slate-400 dark:text-[#a4b1fa]">
                    <Package className="size-4" />
                  </div>
                }
              />
            </div>
          ))
        ) : (
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-[10px] bg-slate-100 text-slate-400 dark:bg-[#12183b] dark:text-[#a4b1fa]",
              box,
            )}
          >
            <Package className="size-4" />
          </div>
        )}
      </div>
      <span className="text-sm font-medium tabular-nums text-slate-800 dark:text-[#e4e7fc]">
        {productCount}
      </span>
    </div>
  );
};

export default OrderProductStack;
