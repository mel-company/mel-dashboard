/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShoppingCart,
  Edit,
  Trash2,
  Loader2,
  Plus,
  ArrowRight,
  Pencil,
} from "lucide-react";
import {
  useFetchProduct,
  useDeleteProduct,
} from "@/api/wrappers/product.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";
import AddProductOptionDialog from "./AddProductOptionDialog";
import EditProductOptionDialog from "./EditProductOptionDialog";
import AddProductPropertyDialog from "./AddProductPropertyDialog";
import EditProductPropertyDialog from "./EditProductPropertyDialog";
import AddVariantDialog from "./AddVariantDialog";
import EditVariantDialog from "./EditVariantDialog";
import RemoveCategoryFromProductDialog from "./RemoveCategoryFromProductDialog";
import AddCategoryToProductDialog from "./AddCategoryToProductDialog";
import ProductImageDialog from "./ProductImageDialog";
import { AssetImage } from "@/components/AssetImage";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import {
  useFetchVariants,
  useDeleteVariant,
} from "@/api/wrappers/variant.wrappers";
import { toast } from "sonner";
import Rating from "@/components/table/rating";
import { cn } from "@/lib/utils";
import {
  AddedLabel,
  DashedTag,
  ProductSectionCard,
} from "@/components/product/tags";

const formatPrice = (value?: number | null) =>
  typeof value === "number" ? `${value.toLocaleString("ar-IQ")} د.ع` : "—";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1.5 text-right">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddOptionDialogOpen, setIsAddOptionDialogOpen] = useState(false);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null,
  );
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null,
  );
  const [removingCategory, setRemovingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? "",
  );
  const imageBaseUrl = useImageBaseUrl();

  const { data: variantsData, refetch: refetchVariants } = useFetchVariants(
    { productId: id ?? "" },
    !!id,
  );

  const { mutate: deleteVariant, isPending: isDeletingVariant } =
    useDeleteVariant();

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const gallery = useMemo(() => {
    const images = Array.isArray(data?.images) ? data.images : [];
    if (images.length > 0) {
      return [...images].sort(
        (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
      );
    }
    if (data?.image) {
      return [{ id: "cover", url: data.image, isPrimary: true, sortOrder: 0 }];
    }
    return [];
  }, [data?.images, data?.image]);

  const activeImageUrl = useMemo(() => {
    if (selectedImageId) {
      const found = gallery.find((g: any) => g.id === selectedImageId);
      if (found?.url) return found.url;
    }
    const primary = gallery.find((g: any) => g.isPrimary);
    return primary?.url ?? gallery[0]?.url ?? data?.image ?? null;
  }, [gallery, selectedImageId, data?.image]);

  const handleDelete = () => {
    if (!id) return;

    deleteProduct(id, {
      onSuccess: () => {
        toast.success("تم حذف المنتج بنجاح");
        navigate("/products", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف المنتج. حاول مرة أخرى.",
        );
      },
    });
  };

  if (isLoading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!data) {
    return (
      <NotFoundPage
        title="المنتج غير موجود"
        description="المنتج الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/products"
        backLabel="العودة إلى المنتجات"
      />
    );
  }

  const categories = data.categories ?? [];
  const options = data.options ?? [];
  const properties = data.properties ?? [];
  const variants = Array.isArray(variantsData) ? variantsData : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-right">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200"
            aria-label="رجوع"
          >
            <ArrowRight className="size-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-blue-950 dark:text-blue-100">
              عرض المنتج
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <Link to="/products" className="hover:underline">
                المنتجات
              </Link>
              <span className="mx-1">›</span>
              <span>{data.title}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            className="gap-2 rounded-full bg-[#00b7ff] px-5 hover:bg-[#00a3e6]"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            <Pencil className="size-4" />
            تعديل المنتج
          </Button>
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="gap-2 rounded-full px-5"
            variant="destructive"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            حذف المنتج
          </Button>
        </div>
      </div>

      {/* Top: info + images */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductSectionCard title="معلومات المنتج">
          <div className="space-y-3">
            <InfoRow label="اسم المنتج" value={data.title} />
            <InfoRow
              label="وصف المنتج"
              value={
                <p className="max-h-28 overflow-y-auto whitespace-pre-wrap leading-6">
                  {data.description?.trim() || "—"}
                </p>
              }
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <InfoRow label="السعر" value={formatPrice(data.price)} />
              <InfoRow
                label="تكلفة المنتج"
                value={formatPrice(data.cost_to_produce)}
              />
              <InfoRow
                label="تقييم المنتج"
                value={
                  typeof data.rate === "number" ? (
                    <div className="flex justify-end">
                      <Rating count={data.rate} />
                    </div>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </div>
        </ProductSectionCard>

        <ProductSectionCard
          title="صور المنتج"
          action={
            <Button
              size="sm"
              variant="secondary"
              className="rounded-full"
              onClick={() => setIsImageDialogOpen(true)}
            >
              إدارة الصور
            </Button>
          }
        >
          <button
            type="button"
            onClick={() => setIsImageDialogOpen(true)}
            className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900"
          >
            <AssetImage
              image={activeImageUrl}
              baseUrl={imageBaseUrl}
              alt={data.title}
              className="h-full w-full object-contain"
              fallback={
                <ShoppingCart className="size-16 text-muted-foreground" />
              }
            />
          </button>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {gallery.length > 0 ? (
              gallery.map((img: any) => {
                const isActive =
                  (selectedImageId ??
                    gallery.find((g: any) => g.isPrimary)?.id ??
                    gallery[0]?.id) === img.id;
                return (
                  <button
                    key={img.id ?? img.url}
                    type="button"
                    onClick={() => setSelectedImageId(img.id)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-50 dark:bg-slate-900",
                      isActive ? "border-sky-400" : "border-transparent",
                    )}
                  >
                    <AssetImage
                      image={img.url}
                      baseUrl={imageBaseUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-sky-500 px-1 text-[9px] font-bold text-white">
                        رئيسية
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="flex h-16 w-full items-center justify-center rounded-xl bg-slate-50 text-xs text-muted-foreground dark:bg-slate-900">
                لا توجد صور — اضغط لإضافة صور
              </div>
            )}
          </div>
        </ProductSectionCard>
      </div>

      {/* Middle: categories + options */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductSectionCard
          title="الأصناف"
          action={
            <Button
              size="sm"
              className="gap-1 rounded-full"
              onClick={() => setIsAddCategoryDialogOpen(true)}
            >
              <Plus className="size-3" />
              إضافة
            </Button>
          }
        >
          <div className="mb-3 rounded-2xl bg-slate-100 px-4 py-3 text-right text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            {data.title}
          </div>
          {categories.length > 0 ? (
            <div className="flex flex-row items-center justify-start gap-2">
              <AddedLabel className="text-left" />
         
              {categories.map((category: any) => {
                const catId = category?.category?.id ?? category?.id;
                const catName = category?.category?.name ?? category?.name;
                if (!catId || !catName) return null;
                return (
                  <DashedTag
                    key={catId}
                    onRemove={
                      categories.length > 1
                        ? () =>
                            setRemovingCategory({ id: catId, name: catName })
                        : undefined
                    }
                  >
                    <Link
                      to={`/categories/${catId}`}
                      className="hover:underline"
                    >
                      {catName}
                    </Link>
                  </DashedTag>
                );
              })}
                  
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد أصناف مرتبطة — يجب ربط المنتج بصنف واحد على الأقل
            </p>
          )}
        </ProductSectionCard>

        <ProductSectionCard
          title="خيارات المنتج"
          description="أضف خيارات المنتج (اللون، المقاس، أو المادة)"
          action={
            <Button
              size="sm"
              className="gap-1 rounded-full"
              onClick={() => setIsAddOptionDialogOpen(true)}
            >
              <Plus className="size-3" />
              إضافة خيار
            </Button>
          }
        >
          {options.length > 0 ? (
            <div className="space-y-4 flex flex-col items-start justify-around">
              {options.map((option: any) => (
                <div
                  key={option.id}
                  className="flex flex-row-reverse items-center justify-end w-full"
                >
                  <button
                    type="button"
                    className="shrink-0 mr-20 text-xs font-semibold text-violet-700 underline underline-offset-2"
                    onClick={() => setEditingOptionId(option.id)}
                  >
                    تعديل
                  </button>
                  <div className="flex flex-row flex-wrap items-center justify-end gap-2 text-right">
                    <span className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                      {option.name}:
                    </span>
                    {(option.values ?? []).map((value: any) => (
                      <DashedTag key={value.id}>{value.label}</DashedTag>
                    ))}
                  </div>
                </div>

                
              ))}

              
              <button
                type="button"
                className="text-xs font-semibold text-violet-700 underline underline-offset-2"
                onClick={() => setIsAddVariantDialogOpen(true)}
              >
                اضافة متغير
              </button>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد خيارات — اضغط إضافة خيار
            </p>
          )}
        </ProductSectionCard>
      </div>

      {/* Bottom: properties + variants */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductSectionCard
          title="خصائص المنتج"
          description="مواصفات المنتج: كالماركة، الخامة، والجنس"
          action={
            <Button
              size="sm"
              className="gap-1 rounded-full"
              onClick={() => setIsAddPropertyDialogOpen(true)}
            >
              <Plus className="size-3" />
              إضافة خاصية
            </Button>
          }
        >
          {properties.length > 0 ? (
            <div className="flex flex-row items-center justify-start gap-2">
              <AddedLabel />
              {properties.map((property: any) => (
                <DashedTag
                  key={property.id || property.name}
                  onRemove={
                    property.id
                      ? () => setEditingPropertyId(property.id)
                      : undefined
                  }
                >
                  {property.name} : {property.value as string}
                </DashedTag>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد خصائص للمنتج
            </p>
          )}
        </ProductSectionCard>

        <ProductSectionCard
          title="المتغيرات"
          action={
            <Button
              size="sm"
              className="gap-1 rounded-full"
              onClick={() => setIsAddVariantDialogOpen(true)}
            >
              <Plus className="size-3" />
              إضافة متغير
            </Button>
          }
        >
          {variants.length > 0 ? (
            <div className="space-y-3">
              {variants.map((variant: any) => (
                <div
                  key={variant.id}
                  className="rounded-2xl bg-violet-50 p-3 dark:bg-violet-950/30"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => setEditingVariantId(variant.id)}
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingVariantId(variant.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <span dir="ltr">SKU: {variant.sku || "—"}</span>
                      <span className="mx-2">·</span>
                      <span>
                        {variant.price != null
                          ? formatPrice(variant.price)
                          : "—"}
                      </span>
                      <span className="mx-2">·</span>
                      <span>المخزون: {variant.stock ?? 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {(variant.optionValues ?? []).map((optValue: any) => (
                      <DashedTag key={optValue.id}>
                        {optValue.label || optValue.value}
                      </DashedTag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد متغيرات — اضغط إضافة متغير
            </p>
          )}
        </ProductSectionCard>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف المنتج</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف المنتج "{data.title}"؟ لا يمكنك التراجع عن هذا
              الإجراء بعد التأكيد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                handleDelete();
              }}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  جاري الحذف...
                </>
              ) : (
                "تأكيد الحذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {id && (
        <AddProductOptionDialog
          open={isAddOptionDialogOpen}
          onOpenChange={setIsAddOptionDialogOpen}
          productId={id}
        />
      )}

      {editingOptionId && (
        <EditProductOptionDialog
          open={!!editingOptionId}
          onOpenChange={(open) => !open && setEditingOptionId(null)}
          optionId={editingOptionId}
        />
      )}

      {id && (
        <AddProductPropertyDialog
          open={isAddPropertyDialogOpen}
          onOpenChange={setIsAddPropertyDialogOpen}
          productId={id}
        />
      )}

      {editingPropertyId && (
        <EditProductPropertyDialog
          open={!!editingPropertyId}
          onOpenChange={(open) => !open && setEditingPropertyId(null)}
          propertyId={editingPropertyId}
        />
      )}

      {id && (
        <AddVariantDialog
          open={isAddVariantDialogOpen}
          onOpenChange={setIsAddVariantDialogOpen}
          productId={id}
        />
      )}

      {editingVariantId && (
        <EditVariantDialog
          open={!!editingVariantId}
          onOpenChange={(open) => !open && setEditingVariantId(null)}
          variantId={editingVariantId}
        />
      )}

      <Dialog
        open={!!deletingVariantId}
        onOpenChange={(open) => !open && setDeletingVariantId(null)}
      >
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف المتغير</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف هذا المتغير؟ لا يمكنك التراجع عن هذا الإجراء
              بعد التأكيد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingVariantId(null)}
              disabled={isDeletingVariant}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (!deletingVariantId) return;
                deleteVariant(deletingVariantId, {
                  onSuccess: () => {
                    toast.success("تم حذف المتغير بنجاح");
                    setDeletingVariantId(null);
                    refetchVariants();
                  },
                  onError: (error: any) => {
                    toast.error(
                      error?.response?.data?.message ||
                        "فشل في حذف المتغير. حاول مرة أخرى.",
                    );
                  },
                });
              }}
              variant="destructive"
              disabled={isDeletingVariant}
            >
              {isDeletingVariant ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  جاري الحذف...
                </>
              ) : (
                "تأكيد الحذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {id && (
        <AddCategoryToProductDialog
          open={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
          productId={id}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {id && removingCategory && (
        <RemoveCategoryFromProductDialog
          open={!!removingCategory}
          onOpenChange={(open) => !open && setRemovingCategory(null)}
          productId={id}
          categoryId={removingCategory.id}
          categoryName={removingCategory.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {id && (
        <ProductImageDialog
          open={isImageDialogOpen}
          onOpenChange={setIsImageDialogOpen}
          productId={id}
        />
      )}
    </div>
  );
};

export default ProductDetails;
