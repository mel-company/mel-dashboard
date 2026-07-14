import { useState, useRef, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Trash2,
  Loader2,
  Package,
  Star,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAddProductImages,
  useDeleteProductGalleryImage,
  useDeleteProductImage,
  useFetchProduct,
  useSetPrimaryProductImage,
} from "@/api/wrappers/product.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { getImageUrl } from "@/utils/image-url";
import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import {
  mergeProductImageFiles,
  revokeObjectUrls,
} from "@/utils/product-images";
import { cn } from "@/lib/utils";

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
  const { data: storeDetails } = useFetchStoreDetails();
  const { mutate: addImages, isPending: isAdding } = useAddProductImages();
  const { mutate: setPrimary, isPending: isSettingPrimary } =
    useSetPrimaryProductImage();
  const { mutate: deleteOne, isPending: isDeletingOne } =
    useDeleteProductGalleryImage();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteProductImage();

  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
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

  const busy = isAdding || isSettingPrimary || isDeletingOne || isDeletingAll;
  const slotsLeft = Math.max(0, MAX_PRODUCT_IMAGES - gallery.length);

  const clearPending = () => {
    revokeObjectUrls(pendingPreviews);
    setPendingFiles([]);
    setPendingPreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = mergeProductImageFiles(
      pendingFiles,
      e.target.files,
      slotsLeft,
    );
    if (result.error) toast.error(result.error);
    if (result.files === pendingFiles) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    revokeObjectUrls(pendingPreviews);
    setPendingFiles(result.files);
    setPendingPreviews(result.files.map((f) => URL.createObjectURL(f)));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = () => {
    if (pendingFiles.length === 0) {
      toast.error("الرجاء اختيار صور أولاً");
      return;
    }
    addImages(
      { productId, images: pendingFiles },
      {
        onSuccess: () => {
          toast.success("تم إضافة الصور بنجاح");
          clearPending();
          refetchProduct();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "حدث خطأ أثناء رفع الصور",
          );
        },
      },
    );
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
    clearPending();
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) clearPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">إدارة صور المنتج</DialogTitle>
          <DialogDescription className="text-right">
            يمكنك رفع حتى {MAX_PRODUCT_IMAGES} صور، وتعيين الغلاف الرئيسي أو
            حذف صورة واحدة.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Existing gallery */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              المعرض ({gallery.length}/{MAX_PRODUCT_IMAGES})
            </p>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {gallery.map((img: any) => {
                  const url = getImageUrl(img.url, storeDetails?.baseUrl);
                  const canManage = Boolean(img.id);
                  return (
                    <div
                      key={img.id ?? img.url}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border bg-muted",
                        img.isPrimary && "border-sky-400 ring-1 ring-sky-400",
                      )}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="size-8 text-muted-foreground" />
                        </div>
                      )}
                      {img.isPrimary && (
                        <span className="absolute bottom-1 right-1 rounded bg-sky-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          رئيسية
                        </span>
                      )}
                      {canManage && (
                        <div className="absolute inset-x-0 top-0 flex justify-between gap-1 bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              disabled={busy}
                              title="تعيين كرئيسية"
                              onClick={() => handleSetPrimary(img.id)}
                              className="rounded bg-white/90 p-1 text-amber-500"
                            >
                              <Star className="size-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy}
                            title="حذف"
                            onClick={() => handleDeleteOne(img.id)}
                            className="mr-auto rounded bg-white/90 p-1 text-rose-600"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
                <Package className="size-10" />
                <span className="text-sm">لا توجد صور بعد</span>
              </div>
            )}
          </div>

          {/* Add more */}
          <div className="space-y-2">
            <p className="text-sm font-medium">إضافة صور</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={busy || slotsLeft <= 0}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy || slotsLeft <= 0}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Plus className="size-4" />
                اختر صور ({slotsLeft} متبقية)
              </Button>
              {pendingFiles.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={clearPending}
                >
                  إلغاء الاختيار
                </Button>
              )}
            </div>
            {pendingPreviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pendingPreviews.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              PNG, JPG حتى 2MB لكل صورة
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              className="flex-1"
              disabled={busy}
            >
              إغلاق
            </Button>
            {pendingFiles.length > 0 && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={busy}
                className="flex-1 gap-2"
              >
                {isAdding ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                رفع {pendingFiles.length} صورة
              </Button>
            )}
            {gallery.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={busy}
                className="gap-2"
              >
                {isDeletingAll ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                حذف الكل
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductImageDialog;
