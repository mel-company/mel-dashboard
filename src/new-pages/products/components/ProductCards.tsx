import { Link, useNavigate } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Package } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  PencilEdit01Icon,
  StarIcon,
} from "@hugeicons-pro/core-bulk-rounded";
import { cn } from "@/lib/utils";
import { getProductCoverImage } from "@/utils/product-images";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import type { ProductListItem } from "@/api/types/product";
import {
  costMargin,
  formatAmount,
  getProductCategories,
  shortDescription,
} from "../utils";

type ProductCardsProps = {
  products: ProductListItem[];
  imageBaseUrl?: string;
  onDelete?: (id: string) => void;
};

/**
 * Figma: Customer Dashboard v2 → 606:15745.
 *
 * The card is right-aligned throughout and the page is RTL (`PagePanel` sets
 * `dir`), so inline-start is the RIGHT edge: the action buttons sit at
 * `start-*` and the rating at `end-*`, and the price column is the FIRST
 * child of the footer row so it lands on the right.
 */
const ProductCards = ({
  products,
  imageBaseUrl = "",
  onDelete,
}: ProductCardsProps) => {
  const navigate = useNavigate();
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => {
        const cover = getProductCoverImage(product);
        const cats = getProductCategories(product);
        const margin = costMargin(product.price, product.cost_to_produce);
        const showsCost =
          typeof product.cost_to_produce === "number" &&
          product.cost_to_produce > 0 &&
          product.cost_to_produce !== product.price;
        const MarginArrow = (margin ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

        return (
          <article
            key={product.id}
            className="overflow-hidden rounded-[17.05px] border border-[#f5f6fa] bg-white p-[11.37px] dark:border-[#12183b] dark:bg-[#0a0e27]"
          >
            <div className="relative h-[174.05px] w-full overflow-hidden rounded-[11.11px] bg-[#f5f6fa] dark:bg-[#12183b]">
              <Link
                to={`/products/${product.id}`}
                className="flex h-full w-full items-center justify-center p-[9.26px]"
              >
                <AssetImage
                  image={cover}
                  baseUrl={resolvedBaseUrl}
                  alt={product.title}
                  className="h-full w-full object-contain"
                  fallback={
                    <Package className="size-12 text-muted-foreground" />
                  }
                />
              </Link>

              {/* Star to the LEFT of the score. RTL lays the first child out
                  rightmost, so the score is written first. */}
              <div className="pointer-events-none absolute end-[11.58px] top-[11.58px] flex items-center gap-[3.79px] text-[15.16px] text-[#3b4656] dark:text-[#e4e7fc]">
                {typeof product.rate === "number"
                  ? product.rate.toFixed(1)
                  : "—"}
                <HugeiconsIcon
                  icon={StarIcon}
                  size={17.05}
                  className="shrink-0 text-[#ff9b3d]"
                />
              </div>

              <div className="absolute start-[11.58px] top-[11.58px] flex flex-col gap-[7.58px]">
                <button
                  type="button"
                  onClick={() => navigate(`/products/${product.id}/edit`)}
                  className="rounded-[14px] p-[7.58px] text-[#6c809d] transition-colors hover:text-[#04111c] dark:text-[#a4b1fa] dark:hover:text-[#f0f2ff]"
                  aria-label="تعديل"
                >
                  <HugeiconsIcon icon={PencilEdit01Icon} size={22.74} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(product.id)}
                  className="rounded-[14px] p-[7.58px] text-[#ff0808] transition-opacity hover:opacity-80 dark:text-[#ff5252]"
                  aria-label="حذف"
                >
                  <HugeiconsIcon icon={Delete02Icon} size={22.74} />
                </button>
              </div>
            </div>

            <div className="mt-[9.26px] flex flex-col gap-[7.41px] pb-[7.58px]">
              <Link
                to={`/products/${product.id}`}
                className="flex flex-col items-start gap-[3.7px]"
              >
                {cats.length > 0 ? (
                  <div className="flex flex-wrap justify-start gap-[3.79px]">
                    {cats.slice(0, 3).map((c) => (
                      <span
                        key={c.id}
                        className="rounded-[15.16px] bg-[rgba(125,38,247,0.1)] px-[8.53px] py-[3.79px] text-[12.32px] font-medium text-[#7d26f7] dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Figma fixes this block at 68.21px so the footers line up
                    across the grid. A floor rather than a height: the design's
                    Setar is not the font that ships here, so exact metrics
                    would clip. */}
                <div className="flex min-h-[68.21px] w-full flex-col gap-[7.58px] px-[1.85px] py-[3.7px]">
                  <h3 className="w-full truncate text-right text-[15.16px] font-medium text-[#04111c] dark:text-[#f0f2ff]">
                    {product.title}
                  </h3>
                  <p className="line-clamp-2 w-full text-right text-[11.37px] text-[#556b8b]">
                    {shortDescription(product.description, 90)}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between gap-2 px-[7.58px]">
                <div className="flex min-w-[78.55px] shrink-0 flex-col items-start">
                  <span className="text-[13.26px] font-medium leading-[13.26px] text-[#bac2cf] dark:text-[#31396e]">
                    السعر
                  </span>
                  <div className="flex items-center gap-[3.7px]">
                    <span className="text-[16.66px] font-extrabold text-[#04111c] dark:text-[#f0f2ff]">
                      {typeof product.price === "number"
                        ? formatAmount(product.price)
                        : "—"}
                    </span>
                    <span className="text-[12.96px] font-medium text-[#6c809d] dark:text-[#a4b1fa]">
                      د.ع
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start">
                  {margin != null ? (
                    <div
                      className={cn(
                        "flex items-center gap-[1.9px]",
                        margin >= 0
                          ? "text-[#00b88a] dark:text-[#00dfa8]"
                          : "text-[#ff0808] dark:text-[#ff5252]",
                      )}
                    >
                      <MarginArrow
                        className="size-[9.47px] shrink-0"
                        strokeWidth={2.5}
                      />
                      <span className="text-[13.26px] font-medium leading-[13.26px]">
                        {Math.abs(margin).toFixed(1)}%
                      </span>
                    </div>
                  ) : null}
                  {showsCost ? (
                    <div className="flex items-center gap-[3.79px] leading-[1.5] text-[#3b4656] dark:text-[#e4e7fc]">
                      <span className="text-[13.26px] font-bold">
                        {formatAmount(product.cost_to_produce)}
                      </span>
                      <span className="text-[11.37px]">د.ع</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default ProductCards;
