import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useToggleCollectionEnabled } from "@/api/wrappers/collection.wrappers";
import ProductThumbnails from "./ProductThumbnails";
import { formatDate, productCount } from "../utils";

type CollectionCardsProps = {
  collections: any[];
  imageBaseUrl?: string;
  onDelete?: (collection: any) => void;
  refetch?: () => void;
};

const CollectionCards = ({
  collections,
  imageBaseUrl = "",
  onDelete,
  refetch,
}: CollectionCardsProps) => (
  <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-3">
    {collections.map((collection) => (
      <CollectionCard
        key={collection.id}
        collection={collection}
        imageBaseUrl={imageBaseUrl}
        onDelete={onDelete}
        refetch={refetch}
      />
    ))}
  </div>
);

const CollectionCard = ({
  collection,
  imageBaseUrl,
  onDelete,
  refetch,
}: {
  collection: any;
  imageBaseUrl?: string;
  onDelete?: (collection: any) => void;
  refetch?: () => void;
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState(collection);
  const { mutate: toggleEnabled } = useToggleCollectionEnabled();

  useEffect(() => {
    setData(collection);
  }, [collection]);

  const handleToggle = (checked: boolean) => {
    setData({ ...data, enabled: checked });
    toggleEnabled(collection.id, {
      onSuccess: () => refetch?.(),
      onError: () => {
        setData(collection);
        toast.error("فشل تحديث حالة المجموعة");
      },
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/collections/${collection.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(`/collections/${collection.id}`);
        }
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-[#12183b] dark:bg-[#0a0e27] dark:hover:border-[#1d2757]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-1 font-semibold text-slate-900 dark:text-[#f0f2ff]">
            {data.name}
          </p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
            {productCount(data)} منتج · {formatDate(data.createdAt)}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            onToggle={() => handleToggle(!data.enabled)}
            checked={data.enabled}
            activeLabel="ظاهرة"
            disabledLabel="مخفية"
          />
        </div>
      </div>

      <ProductThumbnails collection={data} imageBaseUrl={imageBaseUrl} max={4} />

      {onDelete ? (
        <div
          className="flex justify-end border-t border-slate-100 pt-3 dark:border-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onDelete(collection)}
            aria-label="حذف المجموعة"
            className="flex size-9 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default CollectionCards;
