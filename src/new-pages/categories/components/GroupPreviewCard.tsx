import type { ReactNode } from "react";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { formatDate, formatTime, getGroupCategories, shortId, shortText } from "../utils";

export const GroupCategoryTags = ({
  group,
  limit = 3,
}: {
  group: any;
  limit?: number;
}) => {
  const cats = getGroupCategories(group);
  if (cats.length === 0) {
    return <span className="text-xs text-slate-400">بدون فئات</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {cats.slice(0, limit).map((c) => (
        <span
          key={c.id}
          className="rounded-lg bg-violet-100 px-2 py-1 text-[11px] font-medium text-violet-700 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
        >
          {c.name}
        </span>
      ))}
      {cats.length > limit ? (
        <span className="text-xs text-slate-400">+{cats.length - limit}</span>
      ) : null}
    </div>
  );
};

type GroupPreviewCardProps = {
  group: any;
  imageBaseUrl?: string;
  className?: string;
  footer?: ReactNode;
};

const GroupPreviewCard = ({
  group,
  imageBaseUrl = "",
  className,
  footer,
}: GroupPreviewCardProps) => {
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);
  const updatedAt = group?.updatedAt ?? group?.createdAt;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-[20px] bg-white p-4 dark:bg-[#0a0e27]",
        className,
      )}
    >
      <div className="flex items-center gap-3" dir="ltr">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-[#12183b]">
          <AssetImage
            image={group.image}
            baseUrl={resolvedBaseUrl}
            alt={group.name}
            className="block size-12 rounded-xl object-cover"
            fallback={<Folder className="size-5 text-slate-400" />}
          />
        </div>
        <div className="min-w-0 flex-1 text-right" dir="rtl">
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 dark:text-[#e4e7fc]">
            {group.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-slate-400 dark:text-[#a4b1fa]" dir="ltr">
            {shortId(group.id)}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 text-right text-[13px] leading-[19.5px] text-slate-400 dark:text-[#a4b1fa]">
        {shortText(group.description, 120)}
      </p>

      <GroupCategoryTags group={group} />

      <div className="h-px bg-slate-100 dark:bg-[#1f2448]/40" />

      {footer ?? (
        <div className="flex items-center justify-between gap-2">
          <div className="text-right">
            <p className="text-xs text-slate-900 dark:text-[#e4e7fc]">
              {formatDate(updatedAt)}
            </p>
            <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
              {formatTime(updatedAt)}
            </p>
          </div>
        </div>
      )}
    </article>
  );
};

export default GroupPreviewCard;
