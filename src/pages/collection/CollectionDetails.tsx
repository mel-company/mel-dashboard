import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Layers, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import ErrorPage from "@/pages/miscellaneous/ErrorPage";
import EmptyPage from "@/pages/miscellaneous/EmptyPage";
import { formatCurrency } from "@/utils/format-currency";
import { cn } from "@/lib/utils";
import {
  useFetchCollection,
  useRemoveProductFromCollection,
  useToggleCollectionEnabled,
  useUpdateCollection,
} from "@/api/wrappers/collection.wrappers";
import AddProductToCollectionDialog from "./AddProductToCollectionDialog";

/**
 * One collection: rename it, show or hide it, and manage what is in it.
 *
 * The name is edited in place rather than on a separate `/edit` route the way
 * a category is. A collection has exactly one editable field, and a whole page
 * with one input and a save button is a navigation for a rename.
 */
const CollectionDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useFetchCollection(id);
  const { mutate: updateCollection, isPending: isSaving } = useUpdateCollection();
  const { mutate: toggleEnabled } = useToggleCollectionEnabled();
  const { mutate: removeProduct } = useRemoveProductFromCollection();

  const resolvedBaseUrl = useImageBaseUrl(data?.baseUrl);
  const products = (data?.products ?? [])
    .map((row: any) => row?.product)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorPage error={error as Error} onRetry={refetch} isRetrying={false} />;
  }

  const handleRename = () => {
    const trimmed = (draftName ?? "").trim();
    if (!trimmed) {
      toast.error("اسم المجموعة لا يمكن أن يكون فارغاً");
      return;
    }
    if (trimmed === data.name) {
      setDraftName(null);
      return;
    }
    updateCollection(
      { id, data: { name: trimmed } },
      {
        onSuccess: () => {
          toast.success("تم تحديث اسم المجموعة");
          setDraftName(null);
          refetch();
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message || "فشل تحديث الاسم"),
      },
    );
  };

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    removeProduct(
      { id, productId },
      {
        onSuccess: () => {
          // The product itself is untouched — say so, because "remove" beside a
          // product in a store is otherwise an alarming word.
          toast.success("تمت إزالة المنتج من المجموعة");
          refetch();
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message || "فشل إزالة المنتج"),
        onSettled: () => setRemovingId(null),
      },
    );
  };

  return (
    <div className="space-y-5" dir="rtl">
      <button
        type="button"
        onClick={() => navigate("/collections")}
        className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-[#a4b1fa] dark:hover:text-[#e4e7fc]"
      >
        <ArrowRight className="size-4" />
        كل المجموعات
      </button>

      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-5 dark:border-[#12183b] dark:bg-[#0a0e27] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]">
            <Layers className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            {draftName === null ? (
              <button
                type="button"
                onClick={() => setDraftName(data.name)}
                className="block max-w-full truncate text-right text-xl font-bold text-slate-900 hover:underline dark:text-[#f0f2ff]"
                title="اضغط لتعديل الاسم"
              >
                {data.name}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  value={draftName}
                  autoFocus
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") handleRename();
                    if (event.key === "Escape") setDraftName(null);
                  }}
                  className="h-10"
                />
                <Button size="sm" onClick={handleRename} disabled={isSaving}>
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : "حفظ"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDraftName(null)}>
                  إلغاء
                </Button>
              </div>
            )}
            <p className="mt-0.5 text-xs text-slate-400 dark:text-[#a4b1fa]">
              {products.length} منتج
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Switch
            checked={data.enabled}
            onToggle={() =>
              toggleEnabled(id, {
                onSuccess: () => refetch(),
                onError: () => toast.error("فشل تحديث حالة المجموعة"),
              })
            }
            activeLabel="ظاهرة"
            disabledLabel="مخفية"
          />
          <Button
            onClick={() => setIsAddOpen(true)}
            className="h-11 gap-2 rounded-full bg-violet-100 px-4 text-violet-700 hover:bg-violet-200 dark:border dark:border-[#9a5cff]/15 dark:bg-[#9a5cff]/10 dark:text-[#b282ff]"
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-[#b282ff]/20">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
            إضافة منتجات
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyPage
          title="المجموعة فارغة"
          description="أضف منتجات إليها لتظهر للزبون كفلتر في صفحة المنتجات."
          icon={<Package className="size-7 text-muted-foreground" />}
          primaryAction={{
            label: "إضافة منتجات",
            onClick: () => setIsAddOpen(true),
            icon: <Plus className="size-4" />,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-[#12183b] dark:bg-[#0a0e27]"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-[#12183b]">
                <AssetImage
                  image={product.image}
                  baseUrl={resolvedBaseUrl}
                  alt={product.title}
                  className="block size-full object-cover"
                  fallback={<Package className="size-5 text-slate-400" />}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold text-slate-900 dark:text-[#f0f2ff]">
                  {product.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-[#a4b1fa]">
                  {product.price != null ? formatCurrency(product.price) : "—"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                disabled={removingId === product.id}
                aria-label={`إزالة ${product.title} من المجموعة`}
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-rose-500 transition-colors",
                  "hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-500/10",
                )}
              >
                {removingId === product.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <AddProductToCollectionDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        collectionId={id}
        onSuccess={refetch}
      />
    </div>
  );
};

export default CollectionDetails;
