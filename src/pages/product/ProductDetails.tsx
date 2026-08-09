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
  ImageIcon,
  CloudUpload,
  Star,
  ChevronsUpDown,
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
import { cn } from "@/lib/utils";
import {
  DashedTag,
  ProductSectionCard,
  PurpleAddButton,
} from "@/components/product/tags";

const formatPrice = (value?: number | null) =>
  typeof value === "number" ? `${value.toLocaleString("en-US")} د.ع` : "—";

function FieldLabel({
  children,
  hint,
  hintTone = "muted",
}: {
  children: React.ReactNode;
  hint?: React.ReactNode;
  hintTone?: "muted" | "optional" | "special";
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <p className="text-[13px] font-medium text-slate-500 dark:text-slate-300">
        {children}
      </p>
      {hint ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            hintTone === "optional" && "text-emerald-500",
            hintTone === "special" && "text-amber-500",
            hintTone === "muted" && "text-muted-foreground",
          )}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function SortHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">
      <span className="inline-flex items-center justify-center gap-1">
        {children}
        <ChevronsUpDown className="size-3.5 text-slate-300" strokeWidth={2} />
      </span>
    </th>
  );
}

const purpleIconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300";

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

  const optionLabel = (variant: any, matcher: RegExp) => {
    const values = variant.optionValues ?? [];
    const hit = values.find((ov: any) =>
      matcher.test(String(ov.optionName ?? ov.name ?? ov.label ?? "")),
    );
    if (hit) return hit.label || hit.value || "—";
    // fallback: if only 1–2 values, pick by position for color/size when names missing
    return "—";
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-right">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="رجوع"
          >
            <ArrowRight className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-950 sm:text-2xl dark:text-blue-100">
              عرض المنتج
            </h1>
            <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-300">
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
            className="gap-2 rounded-full bg-violet-100 px-5 text-violet-700 shadow-sm hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-violet-500/15">
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
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

      <div
        dir="rtl"
        className="flex flex-col gap-4 md:flex-row md:items-start"
      >
        <div className="min-w-0 flex-1 space-y-4">
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:gap-10">
              <div className="min-w-0 space-y-4 text-right">
                <h2 className="text-xl font-bold tracking-tight text-[#1a2b5a] dark:text-blue-100">
                  معلومات المنتج الأساسية
                </h2>

                <div>
                  <FieldLabel>اسم المنتج</FieldLabel>
                  <div className="rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    {data.title || "—"}
                  </div>
                </div>

                <div>
                  <FieldLabel>وصف المنتج</FieldLabel>
                  <div className="min-h-[7.5rem] rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                    <p className="max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {data.description?.trim() || "—"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <FieldLabel hint="ماذا يعني؟" hintTone="special">
                      السعر الافتراضي
                    </FieldLabel>
                    <div className="relative rounded-2xl border border-slate-200/90 ps-11 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
                      <span className="text-slate-800 dark:text-slate-100">
                        {typeof data.price === "number"
                          ? data.price.toLocaleString("en-US")
                          : "—"}
                      </span>
                      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        د.ع
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel hint="اختياري" hintTone="optional">
                      تكلفة المنتج
                    </FieldLabel>
                    <div className="relative rounded-2xl border border-slate-200/90 ps-11 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
                      <span className="text-slate-800 dark:text-slate-100">
                        {typeof data.cost_to_produce === "number"
                          ? data.cost_to_produce.toLocaleString("en-US")
                          : "—"}
                      </span>
                      <span className="absolute start-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        د.ع
                      </span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel hint="اختياري" hintTone="optional">
                      تقييم المنتج
                    </FieldLabel>
                    <div className="relative rounded-2xl border border-slate-200/90 ps-10 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
                      <span className="text-slate-800 dark:text-slate-100">
                        {typeof data.rate === "number" ? data.rate : "—"}
                      </span>
                      <Star className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 fill-amber-400 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="min-w-0 space-y-3 text-right">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#1a2b5a] dark:text-blue-100">
                    صور المنتج
                    <ImageIcon
                      className="size-5 text-slate-400"
                      strokeWidth={1.75}
                    />
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsImageDialogOpen(true)}
                    className="text-xs font-semibold text-sky-500 hover:text-sky-600"
                  >
                    يمكنك سحب وافلات الصورة
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsImageDialogOpen(true)}
                  className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#eef1f5] dark:bg-slate-900 sm:h-60"
                >
                  <AssetImage
                    image={activeImageUrl}
                    baseUrl={imageBaseUrl}
                    alt={data.title}
                    className="h-full w-full object-contain p-5"
                    fallback={
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <ShoppingCart className="size-10" />
                        <span className="text-xs">لا توجد صورة</span>
                      </div>
                    }
                  />
                </button>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsImageDialogOpen(true)}
                    className="flex h-[4.5rem] w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-sky-300 bg-sky-50 text-sky-500 dark:border-sky-700 dark:bg-sky-500/10"
                  >
                    <CloudUpload className="size-5" />
                    <span className="px-1 text-center text-[10px] font-semibold leading-tight">
                      رفع صورة جديدة
                    </span>
                  </button>
                  {gallery.map((img: any) => {
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
                          "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 bg-[#eef1f5] dark:bg-slate-900",
                          isActive ? "border-sky-400" : "border-transparent",
                        )}
                      >
                        <AssetImage
                          image={img.url}
                          baseUrl={imageBaseUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <ProductSectionCard
            title="المنتجات الفعلية"
            description="يمكنك تخصيص المنتج الاساسي الى منتجات فعلية تختلف بالخيارات والخصائص"
            action={
              <Button
                type="button"
                size="sm"
                className="h-10 gap-2 rounded-xl bg-violet-100 px-4 text-sm font-semibold text-violet-700 shadow-none hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200"
                onClick={() => setIsAddVariantDialogOpen(true)}
              >
                <Plus className="size-4" strokeWidth={2.5} />
                اضافة منتج جديد
              </Button>
            }
          >
            {variants.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                لا توجد منتجات فعلية — اضغط اضافة منتج جديد
              </p>
            ) : (
              <>
                <div
                  className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block dark:border-slate-800"
                  dir="rtl"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[920px] text-sm">
                      <thead>
                        <tr className="bg-[#eef2f7] dark:bg-slate-900">
                          <SortHeader>KUS</SortHeader>
                          <SortHeader>QR</SortHeader>
                          <SortHeader>الكمية</SortHeader>
                          <SortHeader>السعر</SortHeader>
                          <SortHeader>اللون</SortHeader>
                          <SortHeader>الحجم</SortHeader>
                          <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600">
                            الصورة مخصصة
                          </th>
                          <th className="whitespace-nowrap px-3 py-3.5 text-center text-xs font-semibold text-slate-600">
                            العمليات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant: any) => {
                          const ovs = variant.optionValues ?? [];
                          const color =
                            optionLabel(variant, /لون|color/i) !== "—"
                              ? optionLabel(variant, /لون|color/i)
                              : ovs[0]?.label || ovs[0]?.value || "—";
                          const size =
                            optionLabel(variant, /حجم|مقاس|size/i) !== "—"
                              ? optionLabel(variant, /حجم|مقاس|size/i)
                              : ovs[1]?.label || ovs[1]?.value || "—";
                          return (
                            <tr
                              key={variant.id}
                              className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950"
                            >
                              <td
                                className="px-3 py-3.5 text-center font-medium"
                                dir="ltr"
                              >
                                {variant.sku || "—"}
                              </td>
                              <td className="px-3 py-3.5 text-center" dir="ltr">
                                {variant.qr_code || "—"}
                              </td>
                              <td className="px-3 py-3.5 text-center tabular-nums">
                                {variant.stock ?? 0}
                              </td>
                              <td className="px-3 py-3.5 text-center">
                                {formatPrice(variant.price)}
                              </td>
                              <td className="px-3 py-3.5 text-center">{color}</td>
                              <td className="px-3 py-3.5 text-center">{size}</td>
                              <td className="px-3 py-3.5">
                                <div className="flex items-center justify-center">
                                  {variant.image ? (
                                    <AssetImage
                                      image={variant.image}
                                      baseUrl={imageBaseUrl}
                                      alt=""
                                      className="size-10 rounded-xl object-cover"
                                    />
                                  ) : (
                                    <span className={purpleIconBtn}>
                                      <Plus
                                        className="size-3.5"
                                        strokeWidth={2.5}
                                      />
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3.5">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setIsAddVariantDialogOpen(true)
                                    }
                                    className={purpleIconBtn}
                                    aria-label="إضافة"
                                  >
                                    <Plus
                                      className="size-3.5"
                                      strokeWidth={2.5}
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingVariantId(variant.id)
                                    }
                                    className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    aria-label="تعديل"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingVariantId(variant.id)
                                    }
                                    className="flex size-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                                    aria-label="حذف"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-3 md:hidden" dir="rtl">
                  {variants.map((variant: any) => (
                    <div
                      key={variant.id}
                      className="space-y-3 rounded-3xl border border-slate-100 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="text-slate-400">KUS</span>
                        <span className="font-medium" dir="ltr">
                          {variant.sku || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="text-slate-400">السعر</span>
                        <span className="font-semibold">
                          {formatPrice(variant.price)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-2 text-sm">
                        <span className="text-slate-400">الكمية</span>
                        <span className="font-semibold">
                          {variant.stock ?? 0}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(variant.optionValues ?? []).map((ov: any) => (
                          <DashedTag key={ov.id}>
                            {ov.label || ov.value}
                          </DashedTag>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingVariantId(variant.id)}
                          className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingVariantId(variant.id)}
                          className="flex size-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ProductSectionCard>
        </div>

        <aside className="w-full shrink-0 space-y-4 md:sticky md:top-4 md:w-[300px] lg:w-[320px]">
          <ProductSectionCard
            title="أصناف المنتج الأساسي"
            label="أختيار الاصناف"
            action={
              <PurpleAddButton
                onClick={() => setIsAddCategoryDialogOpen(true)}
                label="إضافة صنف"
              />
            }
          >
            {categories.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2" dir="rtl">
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
              <p className="py-4 text-center text-sm text-muted-foreground">
                لا توجد أصناف مرتبطة
              </p>
            )}
          </ProductSectionCard>

          <ProductSectionCard
            title="خيارات المنتج الأساسي"
            description="أضف خيارات المنتج (كاللون، المقاس، أو المادة)"
            action={
              <PurpleAddButton
                onClick={() => setIsAddOptionDialogOpen(true)}
                label="إضافة خيار"
              />
            }
          >
            {options.length > 0 ? (
              <div className="space-y-3.5" dir="rtl">
                {options.map((option: any) => (
                  <div
                    key={option.id}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => setEditingOptionId(option.id)}
                      className="text-sm font-semibold text-sky-500 hover:underline"
                    >
                      {option.name}
                    </button>
                    {(option.values ?? []).map((value: any) => (
                      <DashedTag key={value.id}>
                        {value.label || value.value}
                      </DashedTag>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                لا توجد خيارات — اضغط +
              </p>
            )}
          </ProductSectionCard>

          <ProductSectionCard
            title="خصائص المنتج"
            description="مواصفات المنتج: كالماركة، الخامة، والجنس"
            action={
              <PurpleAddButton
                onClick={() => setIsAddPropertyDialogOpen(true)}
                label="إضافة خاصية"
              />
            }
          >
            {properties.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2" dir="rtl">
                {properties.map((property: any) => (
                  <DashedTag
                    key={property.id || property.name}
                    lead={property.name}
                    onRemove={
                      property.id
                        ? () => setEditingPropertyId(property.id)
                        : undefined
                    }
                  >
                    {property.value as string}
                  </DashedTag>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                لا توجد خصائص — اضغط +
              </p>
            )}
          </ProductSectionCard>
        </aside>
      </div>

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
                  <Loader2 className="size-4 mr-2 animate-spin" />
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
                  <Loader2 className="size-4 mr-2 animate-spin" />
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
