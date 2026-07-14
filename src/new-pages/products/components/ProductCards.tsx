import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductCoverImage } from "@/utils/product-images";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import type { ProductListItem } from "@/api/types/product";

const CATEGORY_STYLES = [
  "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
];

function formatPrice(value: number) {
  return `${value.toLocaleString("ar-IQ")} د.ع`;
}

function shortDescription(text: string | null | undefined, max = 45) {
  if (!text?.trim()) return "—";
  const clean = text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}…`;
}

function getCategoryName(c: any): string {
  return c?.category?.name ?? c?.name ?? "";
}

function getCategoryId(c: any, idx: number): string {
  return c?.category?.id ?? c?.id ?? String(idx);
}

function getProductCategories(product: ProductListItem) {
  const cats = product.categories ?? [];
  return cats
    .map((c: any, idx: number) => ({
      id: getCategoryId(c, idx),
      name: getCategoryName(c),
    }))
    .filter((c) => c.name);
}

function categoryStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_STYLES[Math.abs(hash) % CATEGORY_STYLES.length];
}

function renderStatus(enabled: boolean) {
  if (enabled) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        متاح
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      مخفي
    </span>
  );
}

function renderCategories(product: ProductListItem) {
  const cats = getProductCategories(product);
  if (cats.length === 0) {
    return <span className="text-xs text-muted-foreground">بدون فئة</span>;
  }
  return (
    <div className="flex max-w-[180px] flex-wrap gap-1.5">
      {cats.slice(0, 3).map((c) => (
        <span
          key={c.id}
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            categoryStyle(c.name),
          )}
        >
          {c.name}
        </span>
      ))}
      {cats.length > 3 && (
        <span className="text-xs text-muted-foreground">+{cats.length - 3}</span>
      )}
    </div>
  );
}

interface ProductCardsProps {
  products: ProductListItem[];
  imageBaseUrl?: string;
}

const ProductCards = ({ products, imageBaseUrl = "" }: ProductCardsProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);

  const renderProductCard = (product: ProductListItem) => {
    const cover = getProductCoverImage(product);
    return (
      <Link key={product.id} to={`/products/${product.id}`}>
        <Card className="group h-full cursor-pointer gap-y-0 transition-all hover:border-primary/25 hover:shadow-lg">
          <CardHeader className="pb-4">
            <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/40">
              <AssetImage
                image={cover}
                baseUrl={resolvedBaseUrl}
                alt={product.title}
                className="h-full w-full object-contain"
                fallback={
                  <ShoppingCart className="size-12 rounded-full bg-cyan/20 p-3 text-cyan" />
                }
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardTitle className="line-clamp-2 text-right leading-8">
              {product.title}
            </CardTitle>
            <p className="line-clamp-1 text-right text-sm text-muted-foreground">
              {shortDescription(product.description, 60)}
            </p>
            {typeof product.rate === "number" ? (
              <div className="flex items-center gap-1">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {product.rate.toFixed(1)}
                </span>
              </div>
            ) : null}
            <div className="mb-2 flex flex-wrap gap-2">
              {renderCategories(product)}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-2">
            <span className="text-lg font-bold text-primary">
              {typeof product.price === "number"
                ? formatPrice(product.price)
                : "—"}
            </span>
            {renderStatus(product.enabled)}
          </CardFooter>
        </Card>
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(renderProductCard)}
    </div>
  );
};

export default ProductCards;
