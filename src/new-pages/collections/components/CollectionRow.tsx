import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import ActionBtnList from "@/components/table/action-btn-list";
import { useToggleCollectionEnabled } from "@/api/wrappers/collection.wrappers";
import ProductThumbnails from "./ProductThumbnails";
import { formatDate, formatTime, productCount, shortId } from "../utils";

type CollectionRowProps = {
  collection: any;
  refetch: () => void;
  onDelete: (collection: any) => void;
  imageBaseUrl?: string;
};

const CollectionRow = ({
  collection,
  refetch,
  onDelete,
  imageBaseUrl = "",
}: CollectionRowProps) => {
  const [data, setData] = useState(collection);
  const navigate = useNavigate();
  const { mutate: toggleEnabled } = useToggleCollectionEnabled();
  const tdClass = "whitespace-normal px-3.5 py-3.5 text-right align-middle";

  useEffect(() => {
    setData(collection);
  }, [collection]);

  const handleToggle = () => {
    const nextEnabled = !data.enabled;
    // Optimistic, then rolled back on failure — a switch that waits for the
    // network looks broken, and one that never rolls back lies.
    setData({ ...data, enabled: nextEnabled });
    toggleEnabled(collection.id, {
      onSuccess: () => refetch(),
      onError: () => {
        setData(collection);
        toast.error("فشل تحديث حالة المجموعة");
      },
    });
  };

  return (
    <TableRow
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-[#12183b] dark:hover:bg-white/[0.03]"
      onClick={() => navigate(`/collections/${collection.id}`)}
    >
      <TableCell className={cn(tdClass, "w-28")}>
        <ProductThumbnails collection={data} imageBaseUrl={imageBaseUrl} />
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
      </TableCell>
      <TableCell
        className={cn(
          tdClass,
          "font-semibold tabular-nums text-slate-900 dark:text-[#f0f2ff]",
        )}
      >
        {productCount(data)}
      </TableCell>
      <TableCell className={tdClass}>
        <p className="text-sm text-slate-900 dark:text-[#e4e7fc]">
          {formatDate(data.createdAt)}
        </p>
        <p className="text-xs font-light text-slate-400 dark:text-[#a4b1fa]">
          {formatTime(data.createdAt)}
        </p>
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <Switch
          onToggle={handleToggle}
          checked={data.enabled}
          activeLabel="ظاهرة"
          disabledLabel="مخفية"
        />
      </TableCell>
      <TableCell className={tdClass} onClick={(e) => e.stopPropagation()}>
        <ActionBtnList
          onView={() => navigate(`/collections/${collection.id}`)}
          onDelete={() => onDelete(collection)}
        />
      </TableCell>
    </TableRow>
  );
};

export default CollectionRow;
