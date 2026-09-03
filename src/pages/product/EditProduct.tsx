/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  ArrowRight,
  ChevronsUpDown,
  CloudUpload,
  Edit,
  HelpCircle,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  useFetchProduct,
  useUpdateProduct,
} from "@/api/wrappers/product.wrappers";
import {
  useFetchVariants,
  useDeleteVariant,
} from "@/api/wrappers/variant.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import { toast } from "sonner";
import type { ProductListItem } from "@/api/types/product";
import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import { getImageUrl } from "@/utils/image-url";
import { useImageBaseUrl } from "@/hooks/use-image-base-url";
import {
  mergeProductImageFiles,
  revokeObjectUrls,
} from "@/utils/product-images";
import { cn } from "@/lib/utils";
import { AssetImage } from "@/components/AssetImage";
import {
  DashedTag,
  ProductSectionCard,
  PurpleAddButton,
} from "@/components/product/tags";
import AddProductOptionDialog from "./AddProductOptionDialog";
import EditProductOptionDialog from "./EditProductOptionDialog";
import AddProductPropertyDialog from "./AddProductPropertyDialog";
import EditProductPropertyDialog from "./EditProductPropertyDialog";
import AddVariantDialog from "./AddVariantDialog";
import EditVariantDialog from "./EditVariantDialog";
import RemoveCategoryFromProductDialog from "./RemoveCategoryFromProductDialog";
import AddCategoryToProductDialog from "./AddCategoryToProductDialog";
import ProductImageDialog from "./ProductImageDialog";
import { formatCurrency, sanitizeDecimalInput } from "@/utils/format-currency";

type Props = {};

const PRODUCT_DESCRIPTION_MAX = 300;

const fieldClass =
  "w-full rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-right text-sm text-slate-800 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/30";

const numberFieldClass = cn(
  fieldClass,
  "ps-11 text-start tabular-nums [font-variant-numeric:lining-nums]",
);

const purpleIconBtn =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300";

const formatPrice = (value?: number | null) =>
  typeof value === "number" ? formatCurrency(value) : "—";

function FieldLabel({
  htmlFor,
  children,
  hint,
  hintTone = "muted",
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  hintTone?: "muted" | "optional" | "special";
}) {
  return (
    <div className="mb-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
      <label
        htmlFor={htmlFor}
        className="shrink-0 text-[13px] font-medium text-slate-500 dark:text-slate-300"
      >
        {children}
      </label>
      {hint ? (
        <span
          className={cn(
            "inline-flex max-w-full items-center gap-1 truncate text-[10px] font-medium sm:text-[11px]",
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

function formatMoneyInput(raw: string): string {
  const cleaned = sanitizeDecimalInput(raw);
  if (!cleaned) return "";
  const [intPart, decPart] = cleaned.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart != null ? `${withCommas}.${decPart}` : withCommas;
}

function parseMoneyInput(display: string): string {
  return sanitizeDecimalInput(display.replace(/,/g, ""));
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

const EditProduct = ({}: Props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? "",
    !!id,
  );

  const { data: variantsData, refetch: refetchVariants } = useFetchVariants(
    { productId: id ?? "" },
    !!id,
  );
  const { mutate: deleteVariant, isPending: isDeletingVariant } =
    useDeleteVariant();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const imageBaseUrl = useImageBaseUrl();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [costToProduct, setCostToProduct] = useState("");
  const [existingImages, setExistingImages] = useState<
    Array<{ id?: string; url: string; isPrimary?: boolean }>
  >([]);
  const [rate, setRate] = useState("");
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const slotsLeft = Math.max(
    0,
    MAX_PRODUCT_IMAGES - existingImages.length - selectedImageFiles.length,
  );

  const galleryUrls = [
    ...existingImages.map(
      (img) => getImageUrl(img.url, imageBaseUrl) || img.url,
    ),
    ...previewUrls,
  ].filter(Boolean);
  const activePreviewUrl = galleryUrls[activePreviewIndex] || galleryUrls[0];

  const categories = (data as any)?.categories ?? [];
  const options = (data as any)?.options ?? [];
  const properties = (data as any)?.properties ?? [];
  const variants = useMemo(
    () => (Array.isArray(variantsData) ? variantsData : []),
    [variantsData],
  );

  useEffect(() => {
    if (data) {
      const product = data as ProductListItem;
      setTitle(product.title ?? "");
      setDescription(
        (product.description ?? "").slice(0, PRODUCT_DESCRIPTION_MAX),
      );
      setPrice(product.price?.toString() ?? "");
      setCostToProduct(product.cost_to_produce?.toString() ?? "");
      setRate(product.rate?.toString() ?? "");
      const gallery =
        Array.isArray(product.images) && product.images.length > 0
          ? [...product.images].sort(
              (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
            )
          : product.image
            ? [{ url: product.image, isPrimary: true }]
            : [];
      setExistingImages(gallery);
      revokeObjectUrls(previewUrls);
      setSelectedImageFiles([]);
      setPreviewUrls([]);
      setActivePreviewIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = mergeProductImageFiles(
      selectedImageFiles,
      e.target.files,
      Math.max(0, MAX_PRODUCT_IMAGES - existingImages.length),
    );
    if (result.error) toast.error(result.error);
    if (result.files === selectedImageFiles) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    revokeObjectUrls(previewUrls);
    setSelectedImageFiles(result.files);
    setPreviewUrls(result.files.map((f) => URL.createObjectURL(f)));
    setActivePreviewIndex(existingImages.length);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePendingAt = (index: number) => {
    const removed = previewUrls[index];
    if (removed) URL.revokeObjectURL(removed);
    setSelectedImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف المنتج غير موجود");
      return;
    }

    if (!description.trim()) {
      toast.error("الرجاء إدخال وصف المنتج");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append(
      "description",
      description.trim().slice(0, PRODUCT_DESCRIPTION_MAX),
    );
    formData.append("price", parseFloat(price || "0").toString());
    formData.append(
      "cost_to_produce",
      parseFloat(costToProduct || "0").toString(),
    );
    formData.append("rate", parseFloat(rate || "0").toString());

    selectedImageFiles.forEach((file) => formData.append("images", file));
    if (selectedImageFiles[0]) {
      formData.append("image", selectedImageFiles[0]);
    }

    updateProduct(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("تم تحديث المنتج بنجاح");
          navigate(`/products/${id}`);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "فشل تحديث المنتج");
        },
      },
    );
  };

  const optionLabel = (variant: any, matcher: RegExp) => {
    const values = variant.optionValues ?? [];
    const hit = values.find((ov: any) =>
      matcher.test(String(ov.optionName ?? ov.name ?? ov.label ?? "")),
    );
    return hit?.label || hit?.value || null;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
      <div className="py-8 text-center">
        <p className="text-muted-foreground">المنتج غير موجود</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/products")}
        >
          العودة إلى المنتجات
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-6 pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-right">
          <button
            type="button"
            onClick={() => navigate(`/products/${id}`)}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="رجوع"
          >
            <ArrowRight className="size-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-950 sm:text-2xl dark:text-blue-100">
              تعديل المنتج
            </h1>
            <p className="mt-0.5 text-xs text-violet-600 dark:text-violet-300">
              <Link to="/products" className="hover:underline">
                المنتجات
              </Link>
              <span className="mx-1">›</span>
              <span>تعديل المنتج</span>
            </p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isUpdating}
          className="hidden h-11 gap-2 rounded-full bg-violet-100 px-5 text-violet-700 shadow-sm hover:bg-violet-200 sm:inline-flex dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
        >
          {isUpdating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-full bg-violet-500/15 dark:bg-violet-400/20">
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
          )}
          {isUpdating ? "جاري الحفظ..." : "حفظ بيانات المنتج"}
        </Button>
      </div>

      <div
        dir="rtl"
        className="flex flex-col gap-4 xl:flex-row xl:items-start"
      >
        <div className="min-w-0 flex-1 space-y-4">
          {/* Info + Images */}
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2 2xl:gap-10">
              <div className="min-w-0 space-y-4 text-right">
                <h2 className="text-xl font-bold tracking-tight text-[#1a2b5a] dark:text-blue-100">
                  معلومات المنتج الأساسية
                </h2>

                <div>
                  <FieldLabel htmlFor="title">اسم المنتج</FieldLabel>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="أدخل اسم المنتج"
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <FieldLabel htmlFor="description">وصف المنتج</FieldLabel>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value.slice(0, PRODUCT_DESCRIPTION_MAX),
                      )
                    }
                    placeholder="أدخل وصف قصير للمنتج"
                    required
                    rows={4}
                    maxLength={PRODUCT_DESCRIPTION_MAX}
                    className={cn(fieldClass, "min-h-[7.5rem] resize-none")}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="min-w-0">
                    <FieldLabel
                      htmlFor="price"
                      hintTone="special"
                      hint={
                        <>
                          ماذا يعني؟
                          <HelpCircle className="size-3 opacity-80" />
                        </>
                      }
                    >
                      السعر الافتراضي
                    </FieldLabel>
                    <div className="relative">
                      <input
                        id="price"
                        type="text"
                        inputMode="decimal"
                        lang="en"
                        dir="ltr"
                        value={formatMoneyInput(price)}
                        onChange={(e) =>
                          setPrice(parseMoneyInput(e.target.value))
                        }
                        placeholder="0"
                        required
                        className={numberFieldClass}
                      />
                      <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        د.ع
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <FieldLabel
                      htmlFor="costToProduct"
                      hint="اختياري"
                      hintTone="optional"
                    >
                      تكلفة المنتج
                    </FieldLabel>
                    <div className="relative">
                      <input
                        id="costToProduct"
                        type="text"
                        inputMode="decimal"
                        lang="en"
                        dir="ltr"
                        value={formatMoneyInput(costToProduct)}
                        onChange={(e) =>
                          setCostToProduct(parseMoneyInput(e.target.value))
                        }
                        placeholder="0"
                        className={numberFieldClass}
                      />
                      <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                        د.ع
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 sm:col-span-2 xl:col-span-1">
                    <FieldLabel
                      htmlFor="rate"
                      hint="اختياري"
                      hintTone="optional"
                    >
                      تقييم المنتج
                    </FieldLabel>
                    <div className="relative">
                      <input
                        id="rate"
                        type="text"
                        inputMode="decimal"
                        lang="en"
                        dir="ltr"
                        value={rate}
                        onChange={(e) =>
                          setRate(sanitizeDecimalInput(e.target.value))
                        }
                        placeholder="0.0"
                        className={cn(numberFieldClass, "ps-10")}
                      />
                      <Star className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 fill-amber-400 text-amber-400" />
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

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#eef1f5] dark:bg-slate-900 sm:h-60"
                >
                  {activePreviewUrl ? (
                    <img
                      src={activePreviewUrl}
                      alt="Preview"
                      className="h-full w-full object-contain p-5"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload className="size-8" />
                      <span className="text-xs">اضغط أو اسحب الصورة هنا</span>
                    </div>
                  )}
                </button>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={slotsLeft <= 0}
                    className="flex h-[4.5rem] w-[5.5rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-sky-300 bg-sky-50 text-sky-500 disabled:opacity-40 dark:border-sky-700 dark:bg-sky-500/10"
                  >
                    <CloudUpload className="size-5" />
                    <span className="px-1 text-center text-[10px] font-semibold leading-tight">
                      رفع صورة جديدة
                    </span>
                  </button>
                  {existingImages.map((img, index) => {
                    const url = getImageUrl(img.url, imageBaseUrl) || img.url;
                    return (
                      <button
                        key={img.id ?? `${img.url}-${index}`}
                        type="button"
                        onClick={() => setActivePreviewIndex(index)}
                        className={cn(
                          "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 bg-[#eef1f5]",
                          index === activePreviewIndex
                            ? "border-sky-400"
                            : "border-transparent",
                        )}
                      >
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    );
                  })}
                  {previewUrls.map((url, index) => {
                    const globalIndex = existingImages.length + index;
                    return (
                      <div
                        key={url}
                        className={cn(
                          "relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-2xl border-2 bg-[#eef1f5]",
                          globalIndex === activePreviewIndex
                            ? "border-sky-400"
                            : "border-transparent",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setActivePreviewIndex(globalIndex)}
                          className="h-full w-full"
                        >
                          <img
                            src={url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePendingAt(index)}
                          className="absolute -left-1 -top-1 rounded-full bg-rose-500 p-0.5 text-white"
                          aria-label="حذف الصورة"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <ProductSectionCard
            title="المنتجات الفعلية"
            description="يمكنك تخصيص المنتج الاساسي الى منتجات فعلية تختلف بالخيارات والخصائص"
            action={
              <Button
                type="button"
                size="sm"
                className="h-10 gap-2 rounded-xl bg-violet-100 px-4 text-sm font-semibold text-violet-700 shadow-none hover:bg-violet-200"
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
                          <th className="px-3 py-3.5 text-center text-xs font-semibold text-slate-600">
                            الصورة مخصصة
                          </th>
                          <th className="px-3 py-3.5 text-center text-xs font-semibold text-slate-600">
                            العمليات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant: any) => {
                          const ovs = variant.optionValues ?? [];
                          const color =
                            optionLabel(variant, /لون|color/i) ||
                            ovs[0]?.label ||
                            ovs[0]?.value ||
                            "—";
                          const size =
                            optionLabel(variant, /حجم|مقاس|size/i) ||
                            ovs[1]?.label ||
                            ovs[1]?.value ||
                            "—";
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
                              <td className="px-3 py-3.5 text-center">
                                {variant.stock ?? 0}
                              </td>
                              <td className="px-3 py-3.5 text-center">
                                {formatPrice(variant.price)}
                              </td>
                              <td className="px-3 py-3.5 text-center">
                                {color}
                              </td>
                              <td className="px-3 py-3.5 text-center">
                                {size}
                              </td>
                              <td className="px-3 py-3.5">
                                <div className="flex justify-center">
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
                                    className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
                                  >
                                    <Pencil className="size-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeletingVariantId(variant.id)
                                    }
                                    className="flex size-9 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50"
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
                      className="space-y-2 rounded-3xl border border-slate-100 p-3.5 dark:border-slate-800"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">KUS</span>
                        <span dir="ltr">{variant.sku || "—"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">السعر</span>
                        <span>{formatPrice(variant.price)}</span>
                      </div>
                      <div className="flex gap-1.5">
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

        {/* Side */}
        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-4 xl:w-[300px] 2xl:w-[320px]">
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
              <div className="flex flex-wrap gap-2" dir="rtl">
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
                      {catName}
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
              <div className="flex flex-wrap gap-2" dir="rtl">
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

      <div className="sticky bottom-3 z-20 sm:hidden">
        <Button
          type="submit"
          disabled={isUpdating}
          className="h-12 w-full gap-2 rounded-2xl bg-violet-100 text-base font-semibold text-violet-700 shadow-lg hover:bg-violet-200"
        >
          {isUpdating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" strokeWidth={2.5} />
          )}
          {isUpdating ? "جاري الحفظ..." : "حفظ بيانات المنتج"}
        </Button>
      </div>

      {/* Dialogs */}
      {id && (
        <>
          <AddProductOptionDialog
            open={isAddOptionDialogOpen}
            onOpenChange={setIsAddOptionDialogOpen}
            productId={id}
          />
          <AddProductPropertyDialog
            open={isAddPropertyDialogOpen}
            onOpenChange={setIsAddPropertyDialogOpen}
            productId={id}
          />
          <AddVariantDialog
            open={isAddVariantDialogOpen}
            onOpenChange={setIsAddVariantDialogOpen}
            productId={id}
          />
          <AddCategoryToProductDialog
            open={isAddCategoryDialogOpen}
            onOpenChange={setIsAddCategoryDialogOpen}
            productId={id}
            onSuccess={() => refetch()}
          />
          <ProductImageDialog
            open={isImageDialogOpen}
            onOpenChange={(open) => {
              setIsImageDialogOpen(open);
              if (!open) refetch();
            }}
            productId={id}
          />
        </>
      )}

      {editingOptionId && (
        <EditProductOptionDialog
          open={!!editingOptionId}
          onOpenChange={(open) => !open && setEditingOptionId(null)}
          optionId={editingOptionId}
        />
      )}

      {editingPropertyId && (
        <EditProductPropertyDialog
          open={!!editingPropertyId}
          onOpenChange={(open) => !open && setEditingPropertyId(null)}
          propertyId={editingPropertyId}
        />
      )}

      {editingVariantId && (
        <EditVariantDialog
          open={!!editingVariantId}
          onOpenChange={(open) => {
            if (!open) {
              setEditingVariantId(null);
              refetchVariants();
            }
          }}
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
              هل أنت متأكد من حذف هذا المتغير؟
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
              variant="destructive"
              disabled={isDeletingVariant}
              onClick={() => {
                if (!deletingVariantId) return;
                deleteVariant(deletingVariantId, {
                  onSuccess: () => {
                    toast.success("تم حذف المتغير بنجاح");
                    setDeletingVariantId(null);
                    refetchVariants();
                  },
                  onError: (err: any) => {
                    toast.error(
                      err?.response?.data?.message || "فشل حذف المتغير",
                    );
                  },
                });
              }}
            >
              {isDeletingVariant ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "تأكيد الحذف"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {id && removingCategory && (
        <RemoveCategoryFromProductDialog
          open={!!removingCategory}
          onOpenChange={(open) => !open && setRemovingCategory(null)}
          productId={id}
          categoryId={removingCategory.id}
          categoryName={removingCategory.name}
          onSuccess={() => refetch()}
        />
      )}
    </form>
  );
};

export default EditProduct;
