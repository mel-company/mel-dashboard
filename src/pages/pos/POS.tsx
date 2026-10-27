import { useEffect, useMemo, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useFilterProductsCursor } from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useAddProductsToOrder,
  useCreatePosOrder,
} from "@/api/wrappers/order.wrappers";
import { useValidateCoupon } from "@/api/wrappers/coupon.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import { usePosPlanAccess } from "@/api/wrappers/plan.wrappers";
import TitleBar from "@/components/table/title-bar";
import PagePanel from "@/components/PagePanel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePhysicalStoreEnabled } from "@/hooks/use-physical-store";
import { resolveAssetBaseUrl } from "@/utils/image-url";
import POSFiltersBar from "@/new-pages/pos/components/POSFiltersBar";
import POSProductGrid from "@/new-pages/pos/components/POSProductGrid";
import POSInvoicePanel, {
  type POSCouponState,
  type POSInvoiceForm,
} from "@/new-pages/pos/components/POSInvoicePanel";
import POSDisabledView from "@/new-pages/pos/components/POSDisabledView";
import POSAddItemDialog, {
  type POSAddItemResult,
} from "@/new-pages/pos/components/POSAddItemDialog";
import {
  type CartItem,
  type Category,
  type Product,
  formatPosPrice,
  isIraqiMobile,
  posErrorMessage,
  posCouponMessage,
} from "@/new-pages/pos/utils";

const emptyForm = (fulfilment: POSInvoiceForm["fulfilment"]): POSInvoiceForm => ({
  fulfilment,
  name: "",
  phone: "",
  stateId: "",
  regionId: "",
  nearest_point: "",
  note: "",
  couponCode: "",
});

const sameLine = (item: CartItem, productId: string, variantId?: string) =>
  item.product.id === productId && item.variant?.id === variantId;

const POS = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);
  const [form, setForm] = useState<POSInvoiceForm>(() => emptyForm("PICKUP"));

  const { isPhysicalStore, isLoading: isLoadingStore } =
    usePhysicalStoreEnabled();
  /**
   * POS is Grow (PLUS) only. `posPlanAllowed` is `undefined` while the request
   * is in flight and only `false` refuses, so a Grow store never sees the
   * upgrade screen flash on the way in. Adding to an existing order
   * (`?orderId=`) is order editing, not a sale, and stays open.
   */
  const { allowed: posPlanAllowed, isLoading: isLoadingPosPlan } =
    usePosPlanAccess();
  const canAccessPos =
    (isPhysicalStore && posPlanAllowed !== false) || !!orderId;

  const { data: storeDetails } = useFetchStoreDetails();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useFetchCategories();

  const {
    data: productsCursorData,
    isLoading: isLoadingProducts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFilterProductsCursor(
    {
      query: debouncedSearch || undefined,
      categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
      // Hidden products used to be listed and then refused at checkout.
      enabled: true,
      limit: 24,
    },
    canAccessPos && !isLoadingStore,
  );

  const isDelivery = form.fulfilment === "DELIVERY" && !orderId;
  const { data: states, isLoading: isLoadingStates } = useFetchStates(
    undefined,
    isDelivery,
  );
  const { data: regions, isLoading: isLoadingRegions } = useFetchRegionsByState(
    form.stateId,
    isDelivery && !!form.stateId,
  );

  const { mutate: createPosOrder, isPending: isCreating } = useCreatePosOrder();
  const { mutate: addProductsToOrder, isPending: isAddingProducts } =
    useAddProductsToOrder();

  const productBaseUrl = productsCursorData?.pages?.[0]?.baseUrl ?? "";
  const baseUrl = resolveAssetBaseUrl(
    productBaseUrl || categoriesData?.baseUrl || storeDetails?.baseUrl,
  );

  const products: Product[] =
    productsCursorData?.pages?.flatMap((p) => p.data ?? []) ?? [];

  const categories: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
      ? categoriesData
      : [];

  const inCart = (productId: string, variantId?: string) =>
    cart.find((item) => sameLine(item, productId, variantId))?.quantity ?? 0;

  const addToCart = ({ product, variant, quantity, stock }: POSAddItemResult) => {
    setCart((prev) => {
      const existing = prev.find((item) => sameLine(item, product.id, variant?.id));
      if (existing) {
        return prev.map((item) =>
          item === existing
            ? {
                ...item,
                stock,
                quantity:
                  stock === null
                    ? item.quantity + quantity
                    : Math.min(stock, item.quantity + quantity),
              }
            : item,
        );
      }
      return [...prev, { product, variant, quantity, stock }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const next = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: item.stock === null ? next : Math.min(item.stock, next),
        };
      }),
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    const previous = cart;
    setCart([]);
    toast("تم إفراغ الفاتورة", {
      action: { label: "تراجع", onClick: () => setCart(previous) },
    });
  };

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + (item.variant?.price ?? item.product.price ?? 0) * item.quantity,
        0,
      ),
    [cart],
  );

  // Coupon: checked as it is typed, and its discount shown in the total.
  const [debouncedCoupon, setDebouncedCoupon] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedCoupon(form.couponCode.trim()), 500);
    return () => clearTimeout(t);
  }, [form.couponCode]);

  const couponTyped = form.couponCode.trim();
  const {
    data: couponValidation,
    isFetching: isValidatingCoupon,
    error: couponError,
  } = useValidateCoupon(
    debouncedCoupon && !orderId && cart.length > 0
      ? { code: debouncedCoupon, orderTotal: subtotal }
      : null,
  );

  const coupon: POSCouponState = useMemo(() => {
    if (!couponTyped || orderId || cart.length === 0) return { status: "idle" };
    if (couponTyped !== debouncedCoupon || isValidatingCoupon) {
      return { status: "checking" };
    }
    if (couponValidation?.valid) {
      return {
        status: "valid",
        discount: Math.min(subtotal, couponValidation.discountAmount ?? 0),
      };
    }
    if (couponValidation || couponError) {
      return {
        status: "invalid",
        message: posCouponMessage(
          couponValidation?.message ??
            (couponError as any)?.response?.data?.message,
        ),
      };
    }
    return { status: "idle" };
  }, [
    couponTyped,
    debouncedCoupon,
    isValidatingCoupon,
    couponValidation,
    couponError,
    subtotal,
    orderId,
    cart.length,
  ]);

  const discount = coupon.status === "valid" ? coupon.discount : 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const phone = form.phone.trim();
  const blockedReason: string | null =
    cart.length === 0
      ? "أضف منتجاً إلى الفاتورة"
      : orderId
        ? null
        : coupon.status === "checking"
          ? "جاري التحقق من رمز الخصم"
          : coupon.status === "invalid"
            ? "رمز الخصم غير صالح، صحّحه أو امسحه"
            : phone && !isIraqiMobile(phone)
              ? "رقم الهاتف غير صحيح"
              : isDelivery &&
                  (!phone ||
                    !form.stateId ||
                    !form.regionId ||
                    !form.nearest_point.trim())
                ? "أكمل رقم الهاتف والمحافظة والمنطقة وأقرب نقطة للتوصيل"
                : null;

  const lines = cart.map((item) => ({
    productId: item.product.id,
    ...(item.variant ? { variantId: item.variant.id } : {}),
    quantity: item.quantity,
  }));

  const handleSubmit = () => {
    if (blockedReason) return;

    if (orderId) {
      addProductsToOrder(
        { orderId, products: { products: lines } },
        {
          onSuccess: () => {
            toast.success("تمت إضافة المنتجات إلى الطلب");
            setCart([]);
            setIsInvoiceSheetOpen(false);
            navigate(`/orders/${orderId}`);
          },
          onError: (error: any) => toast.error(posErrorMessage(error)),
        },
      );
      return;
    }

    createPosOrder(
      {
        fulfilment: isDelivery ? "DELIVERY" : "PICKUP",
        ...(form.name.trim() && { name: form.name.trim() }),
        ...(phone && { phone }),
        ...(isDelivery && {
          stateId: form.stateId,
          regionId: form.regionId,
          nearest_point: form.nearest_point.trim(),
        }),
        ...(form.note.trim() && { note: form.note.trim() }),
        ...(couponTyped && { couponCode: couponTyped }),
        products: lines,
      },
      {
        onSuccess: (response) => {
          const newOrderId = response?.order?.id;
          // The till stays open for the next customer.
          toast.success(
            isDelivery
              ? "تم إنشاء طلب التوصيل"
              : `تمت عملية البيع · ${formatPosPrice(total)}`,
            newOrderId
              ? {
                  action: {
                    label: "عرض الطلب",
                    onClick: () => navigate(`/orders/${newOrderId}`),
                  },
                }
              : undefined,
          );
          setCart([]);
          setForm(emptyForm(form.fulfilment));
          setIsInvoiceSheetOpen(false);
        },
        onError: (error: any) => toast.error(posErrorMessage(error)),
      },
    );
  };

  if (!isLoadingStore && !isPhysicalStore && !orderId) {
    return <POSDisabledView reason="setting" />;
  }

  if (posPlanAllowed === false && !orderId) {
    return <POSDisabledView reason="plan" />;
  }

  if ((isLoadingStore || isLoadingPosPlan) && !orderId) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-slate-400" />
      </div>
    );
  }

  const invoicePanelProps = {
    cart,
    baseUrl,
    addingToOrder: !!orderId,
    form,
    onFormChange: (patch: Partial<POSInvoiceForm>) =>
      setForm((prev) => ({ ...prev, ...patch })),
    states: states as any[] | undefined,
    regions: regions as any[] | undefined,
    isLoadingStates,
    isLoadingRegions,
    coupon,
    subtotal,
    discount,
    total,
    blockedReason,
    isSubmitting: isCreating || isAddingProducts,
    onSubmit: handleSubmit,
    onClear: clearCart,
    onUpdateQuantity: updateQuantity,
    onRemove: removeFromCart,
  };

  return (
    <PagePanel className="flex flex-col gap-4 pb-24 lg:pb-0">
      <TitleBar
        description={
          orderId
            ? "أضف منتجات إلى الطلب الحالي"
            : "اختر المنتجات وأتمم البيع مباشرة من نقطة البيع"
        }
      />

      {/* RTL: products sit beside the sidebar, the invoice on the far side. */}
      <div className="grid grid-cols-1 gap-4 lg:h-[calc(100vh-10rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-h-0 flex-col gap-3">
          <POSFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            isLoadingCategories={isLoadingCategories}
          />
          <POSProductGrid
            products={products}
            baseUrl={baseUrl}
            isLoading={isLoadingProducts}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            onProductAdd={setPendingProduct}
          />
        </div>

        <aside className="hidden min-h-0 lg:flex">
          <POSInvoicePanel {...invoicePanelProps} className="w-full" />
        </aside>
      </div>

      {/* Phone: the invoice lives in a sheet behind this bar. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs text-slate-500 dark:text-slate-300 tabular-nums">
              {itemCount} قطعة
            </p>
            <p className="truncate text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
              {formatPosPrice(total)}
            </p>
          </div>
          <Button
            type="button"
            className="h-12 shrink-0 gap-2 rounded-xl bg-sky-500 px-5 font-bold text-white hover:bg-sky-600"
            onClick={() => setIsInvoiceSheetOpen(true)}
          >
            <Receipt className="size-4" />
            الفاتورة
          </Button>
        </div>
      </div>

      <Sheet open={isInvoiceSheetOpen} onOpenChange={setIsInvoiceSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[92dvh] max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-t-3xl p-3 pt-11 sm:max-w-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>الفاتورة</SheetTitle>
          </SheetHeader>
          <POSInvoicePanel
            {...invoicePanelProps}
            className="h-full border-0"
          />
        </SheetContent>
      </Sheet>

      <POSAddItemDialog
        product={pendingProduct}
        baseUrl={baseUrl}
        inCart={inCart}
        onOpenChange={(open) => !open && setPendingProduct(null)}
        onConfirm={(result) => {
          addToCart(result);
          setPendingProduct(null);
        }}
      />
    </PagePanel>
  );
};

export default POS;
