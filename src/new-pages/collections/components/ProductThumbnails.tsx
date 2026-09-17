import { Package } from "lucide-react";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { cn } from "@/lib/utils";
import { getCollectionProducts, productCount } from "../utils";

/**
 * A collection's members, as a short stack of overlapping thumbnails.
 *
 * This is the collection's identity in a list. A category has a cover image a
 * merchant uploaded; a collection has whatever it holds, which is the more
 * honest signal — "صيفي" with three shirts in it looks like three shirts, and
 * stops looking like them the moment they are removed.
 */
const ProductThumbnails = ({
  collection,
  imageBaseUrl = "",
  max = 3,
  className,
}: {
  collection: any;
  imageBaseUrl?: string;
  max?: number;
  className?: string;
}) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);
  const products = getCollectionProducts(collection).slice(0, max);
  const total = productCount(collection);
  const overflow = total - products.length;

  if (!products.length) {
    return (
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-[#12183b]",
          className,
        )}
      >
        <Package className="size-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center", className)} dir="ltr">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="size-10 shrink-0 overflow-hidden rounded-lg border-2 border-white bg-slate-100 dark:border-[#0a0e27] dark:bg-[#12183b]"
          style={{ marginInlineStart: index === 0 ? 0 : -12 }}
        >
          <AssetImage
            image={product.image}
            baseUrl={resolvedBaseUrl}
            alt={product.title}
            className="block size-full object-cover"
            fallback={<Package className="size-4 text-slate-400" />}
          />
        </div>
      ))}
      {overflow > 0 ? (
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-xs font-semibold tabular-nums text-slate-500 dark:border-[#0a0e27] dark:bg-[#12183b] dark:text-[#a4b1fa]"
          style={{ marginInlineStart: -12 }}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
};

export default ProductThumbnails;
