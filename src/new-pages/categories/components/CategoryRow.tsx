import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TableCell, TableRow } from "@/components/ui/table";
import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { Switch } from "@/components/ui/switch";
import ActionBtnList from "@/components/table/action-btn-list";
import { useToggleCategoryEnabled } from "@/api/wrappers/category.wrappers";
import { toast } from "sonner";
import CategoryTypeLabel from "./CategoryTypeLabel";
import {
  formatDate,
  formatIQD,
  formatTime,
  getCategoryCapital,
  shortId,
  shortText,
} from "../utils";

type CategoryRowProps = {
  category: any;
  refetch: () => void;
  onDelete: (category: any) => void;
  imageBaseUrl?: string;
};

const CategoryRow = ({
  category,
  refetch,
  onDelete,
  imageBaseUrl = "",
}: CategoryRowProps) => {
  const [data, setData] = useState(category);
  const navigate = useNavigate();
  const resolvedBaseUrl = useImageBaseUrl(imageBaseUrl);
  const { mutate: toggleEnabled } = useToggleCategoryEnabled();
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";
  const capital = getCategoryCapital(data);
  const updatedAt = data.updatedAt ?? data.createdAt;

  useEffect(() => {
    setData(category);
  }, [category]);

  const handleUpdate = () => {
    const nextEnabled = !data.enabled;
    setData({ ...data, enabled: nextEnabled });
    toggleEnabled(category.id, {
      onSuccess: () => refetch(),
      onError: () => {
        setData(category);
        toast.error("فشل تحديث حالة الفئة");
      },
    });
  };

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/[0.03]"
      onClick={() => navigate(`/categories/${category.id}`)}
    >
      <TableCell className={cn(tdClass, "w-16")}>
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-[#12183b]">
          <AssetImage
            image={data.image}
            baseUrl={resolvedBaseUrl}
            alt={data.name}
            className="block size-12 rounded-lg object-cover"
            fallback={<Folder className="size-6 text-slate-400" />}
          />
        </div>
      </TableCell>
      <TableCell className={tdClass}>
        <span
          className="font-mono text-sm text-slate-600 dark:text-[#a4b1fa]"
          dir="ltr"
        >
          {shortId(data.id)}
        </span>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="line-clamp-1 font-semibold text-slate-900 dark:text-[#f0f2ff]">
          {data.name}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {shortText(data.description)}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <CategoryTypeLabel category={data} />
      </TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-semibold tabular-nums text-slate-900 dark:text-[#f0f2ff]",
        )}
      >
        {data._count?.products ?? 0}
      </TableCell>
      <TableCell className={tdClass}>
        {capital.growth != null ? (
          <p
            className={cn(
              "text-sm font-medium tabular-nums",
              capital.growth >= 0
                ? "text-emerald-600 dark:text-[#00dfa8]"
                : "text-rose-600 dark:text-[#ff5252]",
            )}
          >
            {Math.abs(capital.growth).toFixed(1)}%{" "}
            {capital.growth >= 0 ? "↗" : "↘"}
          </p>
        ) : null}
        <p className="text-sm tabular-nums text-slate-900 dark:text-[#f0f2ff]">
          {capital.value != null ? formatIQD(capital.value) : "—"}
        </p>
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatDate(updatedAt)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTime(updatedAt)}
        </p>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <Switch
          onToggle={handleUpdate}
          checked={data.enabled}
          activeLabel="مفعل"
          disabledLabel="معطل"
        />
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onEdit={() => navigate(`/categories/${category.id}/edit`)}
          onDelete={() => onDelete(category)}
        />
      </TableCell>
    </TableRow>
  );
};

export default CategoryRow;
