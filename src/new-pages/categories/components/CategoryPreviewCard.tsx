import type { ReactNode } from "react";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import CategoryTypeLabel from "./CategoryTypeLabel";
import { shortId, shortText } from "../utils";

type CategoryPreviewCardProps = {
  category: any;
  imageBaseUrl?: string;
  className?: string;
  footer?: ReactNode;
};

const CategoryPreviewCard = ({
  category,
  imageBaseUrl = "",
  className,
  footer,
}: CategoryPreviewCardProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);
  const productCount = category?._count?.products ?? 0;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-white p-4 dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-start gap-3" dir="ltr">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#12183b]">
          <AssetImage
            image={category.image}
            baseUrl={resolvedBaseUrl}
            alt={category.name}
            className="block size-12 rounded-lg object-cover"
            fallback={<Folder className="size-5 text-slate-400" />}
          />
        </div>
        <div className="min-w-0 flex-1 text-right" dir="rtl">
          <p
            className="font-mono text-xs text-slate-400 dark:text-[#a4b1fa]"
            dir="ltr"
          >
            {shortId(category.id)}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-[15px] font-bold leading-snug text-slate-900 dark:text-[#e4e7fc]">
            {category.name}
          </h3>
          <CategoryTypeLabel category={category} className="mt-0.5 text-xs" />
        </div>
      </div>

      <p className="line-clamp-2 text-right text-xs leading-[18px] font-light text-slate-400 dark:text-[#a4b1fa]">
        {shortText(category.description, 120)}
      </p>

      {footer ?? (
        <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">
          {productCount} منتج
        </p>
      )}
    </article>
  );
};

export default CategoryPreviewCard;
