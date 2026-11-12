import { useRef, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Loader2,
  Package,
  Star,
  Plus,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAddProductImages,
  useDeleteProductGalleryImage,
  useDeleteProductImage,
  useFetchProduct,
  useSetPrimaryProductImage,
} from "@/api/wrappers/product.wrappers";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import { mergeProductImageFiles } from "@/utils/product-images";
import { buildAssetUrlCandidates } from "@/utils/image-url";
import { cn } from "@/lib/utils";
import { editImage, withImageEditor } from "@/lib/image-edit/queue";

const fetchImageAsFile = async (
  image: unknown,
  baseUrl: string | null | undefined,
  nameHint = "product-image.jpg",
): Promise<File> => {
  const candidates = buildAssetUrlCandidates(image, baseUrl);
  let lastError: unknown;
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      if (!blob.size) throw new Error("empty");
      const type =
        blob.type && blob.type.startsWith("image/")
          ? blob.type
          : "image/jpeg";
      const ext = type.includes("png")
        ? "png"
        : type.includes("webp")
          ? "webp"
          : "jpg";
      return new File([blob], nameHint.replace(/\.\w+$/, `.${ext}`), { type });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("تعذّر تحميل الصورة للتعديل");
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
};

const ProductImageDialog = ({ open, onOpenChange, productId }: Props) => {
  const { data: product, refetch: refetchProduct } = useFetchProduct(
    productId,
    open && !!productId,
  );
  const imageBaseUrl = useImageBaseUrl();
  const { mutateAsync: addImagesAsync, isPending: isAdding } =
    useAddProductImages();
  const {
    mutate: setPrimary,
    mutateAsync: setPrimaryAsync,
    isPending: isSettingPrimary,
  } = useSetPrimaryProductImage();
  const {
    mutate: deleteOne,
    mutateAsync: deleteOneAsync,
    isPending: isDeletingOne,
  } = useDeleteProductGalleryImage();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteProductImage();

  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gallery = useMemo(() => {
    const images = Array.isArray(product?.images) ? product.images : [];
    if (images.length > 0) {
      return [...images].sort(
        (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
    }
    if (product?.image) {
      return [
        { id: null, url: product.image, isPrimary: true, sortOrder: 0 },
      ];
    }
    return [];
  }, [product?.images, product?.image]);

  const busy =
    isAdding ||
    isSettingPrimary ||
    isDeletingOne ||
    isDeletingAll ||
    editingId !== null;
  const slotsLeft = Math.max(0, MAX_PRODUCT_IMAGES - gallery.length);

  /** After the shared studio saves, upload immediately — same path feel as edit. */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = mergeProductImageFiles([], e.target.files, slotsLeft);
    if (result.error) toast.error(result.error);
    if (!result.files.length) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    void addImagesAsync({ productId, images: result.files })
      .then(() => {
        toast.success(
          result.files.length === 1
            ? "تم رفع الصورة"
            : `تم رفع ${result.files.length} صور`,
        );
        return refetchProduct();
      })
      .catch((error: any) => {
        toast.error(
          error?.response?.data?.message || "حدث خطأ أثناء رفع الصور",
        );
      });
  };

  const handleSetPrimary = (imageId: string) => {
    setPrimary(
      { productId, imageId },
      {
        onSuccess: () => {
          toast.success("تم تعيين الصورة الرئيسية");
          refetchProduct();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل تعيين الصورة الرئيسية",
          );
        },
      },
    );
  };

  const handleDeleteOne = (imageId: string) => {
    deleteOne(
      { productId, imageId },
      {
        onSuccess: () => {
          toast.success("تم حذف الصورة");
          refetchProduct();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل حذف الصورة",
          );
        },
      },
    );
  };

  /** Same studio as first upload (`editImage` → ImageEditorHost). */
  const handleEditExisting = async (img: {
    id: string;
    url?: string;
    isPrimary?: boolean;
  }) => {
    if (!img.id || busy) return;
    setEditingId(img.id);
    try {
      const source = await fetchImageAsFile(
        img,
        imageBaseUrl,
        `product-${img.id}.jpg`,
      );
      const edited = await editImage(source);
      if (!edited) return;

      const beforeIds = new Set(
        gallery.map((g: { id?: string | null }) => g.id).filter(Boolean),
      );
      const wasPrimary = Boolean(img.isPrimary);

      if (slotsLeft <= 0) {
        await deleteOneAsync({ productId, imageId: img.id });
        const data = await addImagesAsync({
          productId,
          images: [edited],
        });
        const nextImages = Array.isArray(data?.images) ? data.images : [];
        const added =
          nextImages.find((g: { id?: string }) => g.id && !beforeIds.has(g.id)) ??
          nextImages[nextImages.length - 1];
        if (wasPrimary && added?.id) {
          await setPrimaryAsync({ productId, imageId: added.id });
        }
      } else {
        const data = await addImagesAsync({
          productId,
          images: [edited],
        });
        const nextImages = Array.isArray(data?.images) ? data.images : [];
        const added =
          nextImages.find((g: { id?: string }) => g.id && !beforeIds.has(g.id)) ??
          nextImages[nextImages.length - 1];
        if (wasPrimary && added?.id) {
          await setPrimaryAsync({ productId, imageId: added.id });
        }
        await deleteOneAsync({ productId, imageId: img.id });
      }

      toast.success("تم تحديث الصورة");
      await refetchProduct();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "فشل تعديل الصورة",
      );
    } finally {
      setEditingId(null);
    }
  };

  const handleDeleteAll = () => {
    if (gallery.length === 0) {
      toast.error("لا توجد صور لحذفها");
      return;
    }
    deleteAll(productId, {
      onSuccess: () => {
        toast.success("تم حذف كل صور المنتج");
        refetchProduct();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل حذف صور المنتج",
        );
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="flex max-h-[min(900px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        dir="rtl"
      >
        <DialogHeader className="space-y-1 border-b border-border px-5 py-4 text-right sm:px-6">
          <DialogTitle className="text-right text-base">
            صور المنتج
          </DialogTitle>
          <DialogDescription className="text-right text-xs leading-5">
            الرفع والتعديل يفتحان نفس استوديو الصورة. حتى {MAX_PRODUCT_IMAGES}{" "}
            صور.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4 sm:px-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={withImageEditor(handleFileSelect)}
            className="hidden"
            disabled={busy || slotsLeft <= 0}
          />

          <button
            type="button"
            disabled={busy || slotsLeft <= 0}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-7 text-center transition-colors",
              slotsLeft > 0 && !busy
                ? "cursor-pointer hover:border-primary/40 hover:bg-muted/50"
                : "cursor-not-allowed opacity-60",
            )}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-background shadow-sm">
              {isAdding ? (
                <Loader2 className="size-5 animate-spin text-foreground" />
              ) : (
                <Plus className="size-5 text-foreground" />
              )}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {isAdding
                ? "جارٍ الرفع…"
                : slotsLeft > 0
                  ? `أضف صورة — يفتح الاستوديو`
                  : "وصلت للحد الأقصى"}
            </span>
            <span className="text-xs text-muted-foreground">
              PNG أو JPG حتى 50MB — متبقي {slotsLeft}
            </span>
          </button>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">
                المعرض
                <span className="ms-2 text-xs font-medium text-muted-foreground">
                  {gallery.length}/{MAX_PRODUCT_IMAGES}
                </span>
              </p>
              {gallery.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={busy}
                  className="gap-1.5 text-rose-600 hover:text-rose-600"
                >
                  {isDeletingAll ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  حذف الكل
                </Button>
              ) : null}
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((img: any) => {
                  const canManage = Boolean(img.id);
                  return (
                    <div
                      key={img.id ?? img.url}
                      className={cn(
                        "overflow-hidden rounded-2xl border bg-muted/40",
                        img.isPrimary
                          ? "border-primary/50 ring-1 ring-primary/30"
                          : "border-border",
                      )}
                    >
                      <div className="relative aspect-square bg-muted">
                        <AssetImage
                          image={img}
                          baseUrl={imageBaseUrl}
                          alt=""
                          className="h-full w-full object-cover"
                          fallback={
                            <div className="flex h-full items-center justify-center">
                              <Package className="size-8 text-muted-foreground" />
                            </div>
                          }
                        />
                        {img.isPrimary ? (
                          <span className="absolute bottom-2 right-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                            رئيسية
                          </span>
                        ) : null}
                      </div>
                      {canManage ? (
                        <div className="flex flex-wrap gap-1 border-t border-border bg-card p-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleEditExisting(img)}
                            className="h-8 flex-1 gap-1 px-2 text-[11px]"
                          >
                            {editingId === img.id ? (
                              <Loader2 className="size-3 animate-spin" />
                            ) : (
                              <Pencil className="size-3" />
                            )}
                            تعديل
                          </Button>
                          {!img.isPrimary ? (
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              disabled={busy}
                              onClick={() => handleSetPrimary(img.id)}
                              className="h-8 flex-1 gap-1 px-2 text-[11px]"
                            >
                              <Star className="size-3" />
                              رئيسية
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => handleDeleteOne(img.id)}
                            className="h-8 gap-1 px-2 text-[11px] text-rose-600 hover:text-rose-600"
                          >
                            <Trash2 className="size-3" />
                            حذف
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground">
                <Package className="size-9 opacity-70" />
                <span className="text-sm">لا توجد صور — أضف من الاستوديو أعلاه</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border px-5 py-3 sm:px-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={busy}
            className="min-w-[120px]"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImageDialog;
