import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  useFilterProductsCursor,
  useFindVariantByOptions,
} from "@/api/wrappers/product.wrappers";
import { useFetchCategories } from "@/api/wrappers/category.wrappers";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useFindDomainDetails } from "@/api/wrappers/domain.wrappers";
import {
  useCheckoutOrder,
  useAddProductsToOrder,
} from "@/api/wrappers/order.wrappers";
import { useValidateCoupon } from "@/api/wrappers/coupon.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import {
  useFetchStorePaymentMethods,
} from "@/api/wrappers/settings.wrappers";
import { useFetchPaymentProviders } from "@/api/wrappers/payment.wrappers";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TitleBar from "@/components/table/title-bar";
import { usePhysicalStoreEnabled } from "@/hooks/use-physical-store";
import POSFiltersBar from "@/new-pages/pos/components/POSFiltersBar";
import POSProductGrid from "@/new-pages/pos/components/POSProductGrid";
import POSInvoicePanel from "@/new-pages/pos/components/POSInvoicePanel";
import POSDisabledView from "@/new-pages/pos/components/POSDisabledView";
import POSCheckoutDialog, {
  type POSCheckoutForm,
} from "@/new-pages/pos/components/POSCheckoutDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { resolveAssetBaseUrl } from "@/utils/image-url";
import { formatPosPrice } from "@/new-pages/pos/utils";
import { formatCurrency } from "@/utils/format-currency";

// Product types matching API structure
type Product = {
  id: string;
  title: string;
  price: number | null;
  image?: string;
  description?: string;
  categories?: Array<{
    id: string;
    name: any;
    category: { id: string; name: any };
  }>;
  options?: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      label: string | null;
      value: string | null;
    }>;
  }>;
  variants?: Array<{
    id: string;
    sku: string;
    qr_code: string;
    price: number | null;
    stock: number;
    image?: string | null;
    optionValues: Array<{
      id: string;
      label: string | null;
      value: string | null;
    }>;
  }>;
};

type ProductVariant = {
  id: string;
  sku: string;
  qr_code: string;
  price: number | null;
  stock: number;
  image?: string | null;
  optionValues: Array<{
    id: string;
    label: string | null;
    value: string | null;
  }>;
};

type CartItem = {
  product: Product;
  variant?: ProductVariant;
  selectedOptions: Record<string, string>; // option name -> selected value
  quantity: number;
};

type Category = {
  id: string;
  name: any;
  image?: string | null;
};

type Props = {};

const POS = ({ }: Props) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [isInvoiceSheetOpen, setIsInvoiceSheetOpen] = useState(false);
  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [foundVariant, setFoundVariant] = useState<ProductVariant | null>(null);
  const [isFindingVariant, setIsFindingVariant] = useState(false);

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState<POSCheckoutForm>({
    name: "",
    email: "",
    phone: "",
    stateId: "",
    regionId: "",
    nearest_point: "",
    note: "",
    paymentMethodId: "",
    couponCode: "",
  });

  const { isPhysicalStore, isLoading: isLoadingStore } = usePhysicalStoreEnabled();
  const canAccessPos = isPhysicalStore || !!orderId;

  const { data: domainDetails } = useFindDomainDetails();
  const { data: storeDetails } = useFetchStoreDetails();
  const storeDomain = domainDetails?.domain ?? "azyaa";

  const productsScrollRef = useRef<HTMLDivElement>(null);
  const productsLoadMoreRef = useRef<HTMLDivElement>(null);

  // Debounced search for server-side search (avoid request on every keystroke)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: categoriesData, isLoading: isLoadingCategories } =
    useFetchCategories();

  const {
    data: productsCursorData,
    isLoading: isLoadingProductsList,
    fetchNextPage: fetchNextProductsPage,
    hasNextPage: hasNextProductsPage,
    isFetchingNextPage: isFetchingNextProducts,
  } = useFilterProductsCursor(
    {
      query: debouncedSearch || undefined,
      categoryIds: selectedCategoryId ? [selectedCategoryId] : undefined,
      limit: 24,
    },
    canAccessPos && !isLoadingStore,
  );

  const { data: paymentProviders } = useFetchPaymentProviders(canAccessPos);
  const { data: storePaymentMethods, isLoading: isLoadingPaymentMethods } =
    useFetchStorePaymentMethods(canAccessPos);
  const { data: states, isLoading: isLoadingStates } = useFetchStates(
    undefined,
    canAccessPos,
  );
  const { data: regions, isLoading: isLoadingRegions } = useFetchRegionsByState(
    checkoutForm.stateId,
    canAccessPos && !!checkoutForm.stateId,
  );

  type PaymentMethodOption = { id: string; name: string };

  const paymentMethods = useMemo(() => {
    if (!paymentProviders) return [] as PaymentMethodOption[];
    const allMethods = paymentProviders.flatMap(
      (provider: { methods?: PaymentMethodOption[] }) =>
        provider.methods ?? [],
    );
    const enabledIds = new Set(
      (storePaymentMethods as { paymentMethodId: string; isEnabled: boolean }[] | undefined)
        ?.filter((item) => item.isEnabled)
        .map((item) => item.paymentMethodId) ?? [],
    );

    if (enabledIds.size === 0) return allMethods;
    return allMethods.filter((method: PaymentMethodOption) =>
      enabledIds.has(method.id),
    );
  }, [paymentProviders, storePaymentMethods]);

  const productBaseUrl = productsCursorData?.pages?.[0]?.baseUrl ?? "";
  const categoriesBaseUrl = categoriesData?.baseUrl ?? "";
  const baseUrl = resolveAssetBaseUrl(
    productBaseUrl || categoriesBaseUrl || storeDetails?.baseUrl,
  );

  // Flatten paginated products
  const productsFromApi: Product[] =
    productsCursorData?.pages?.flatMap((p) => p.data ?? []) ?? [];

  const isLoadingProducts = isLoadingProductsList;
  const hasNextPage = hasNextProductsPage;
  const fetchNextPage = fetchNextProductsPage;
  const isFetchingNextPage = isFetchingNextProducts;

  // Infinite scroll: load more when sentinel enters viewport
  const loadMoreProducts = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const el = productsLoadMoreRef.current;
    const root = productsScrollRef.current;
    if (!el || !root || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMoreProducts();
      },
      { root, rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, loadMoreProducts, productsFromApi.length]);

  // Checkout related hooks
  const { mutate: checkoutOrder, isPending: isCheckingOut } =
    useCheckoutOrder();
  const { mutate: addProductsToOrder, isPending: isAddingProducts } =
    useAddProductsToOrder();

  useEffect(() => {
    if (!canAccessPos) return;

    setCheckoutForm((prev) => ({
      ...prev,
      nearest_point:
        prev.nearest_point ||
        storeDetails?.location ||
        "استلام من المتجر",
      paymentMethodId:
        prev.paymentMethodId || paymentMethods[0]?.id || "",
    }));
  }, [canAccessPos, storeDetails?.location, paymentMethods]);

  // Variant finding hook
  const { mutateAsync: findVariantByOptions } = useFindVariantByOptions();

  // Extract categories from API response (keep image + baseUrl when present)
  const categories: Category[] = Array.isArray(categoriesData?.data)
    ? categoriesData.data
    : Array.isArray(categoriesData)
      ? categoriesData
      : [];

  // Products from cursor API (already flattened above)
  const products: Product[] = productsFromApi;

  const filteredProducts = products;

  // Find matching variant based on selected options using API
  const findMatchingVariant = useCallback(
    async (
      product: Product,
      options: Record<string, string>,
    ): Promise<ProductVariant | null> => {
      // If product has no options, return null (product without variants)
      if (!product.options || product.options.length === 0) {
        setFoundVariant(null);
        return null;
      }

      // If no options are selected, return null
      if (Object.keys(options).length === 0) {
        setFoundVariant(null);
        return null;
      }

      setIsFindingVariant(true);
      try {
        const variant = await findVariantByOptions({
          productId: product.id,
          selectedOptions: options,
        });

        if (!variant) {
          setFoundVariant(null);
          return null;
        }

        // Map the API response to ProductVariant type
        const mappedVariant: ProductVariant = {
          id: variant.id,
          sku: variant.sku,
          qr_code: variant.qr_code,
          price: variant.price,
          stock: variant.stock,
          image: variant.image,
          optionValues:
            variant.optionValues?.map((ov: any) => ({
              id: ov.id,
              label: ov.label,
              value: ov.value,
            })) || [],
        };

        setFoundVariant(mappedVariant);
        return mappedVariant;
      } catch (error: any) {
        console.error("Error finding variant:", error);
        toast.error(
          error?.response?.data?.message ||
          "فشل في العثور على المتغير. حاول مرة أخرى.",
        );
        setFoundVariant(null);
        return null;
      } finally {
        setIsFindingVariant(false);
      }
    },
    [findVariantByOptions],
  );

  // Find variant when options change
  useEffect(() => {
    if (
      selectedProduct &&
      selectedOptions &&
      Object.keys(selectedOptions).length > 0
    ) {
      // Check if all required options are selected before making API call
      const allOptionsSelected = selectedProduct.options?.every(
        (option) => selectedOptions[option.name],
      );

      if (allOptionsSelected) {
        findMatchingVariant(selectedProduct, selectedOptions);
      } else {
        setFoundVariant(null);
      }
    } else {
      setFoundVariant(null);
    }
  }, [selectedProduct, selectedOptions, findMatchingVariant]);

  // Handle product selection - show dialog if has options
  const handleProductClick = (product: Product) => {
    if (product.options && product.options.length > 0) {
      setSelectedProduct(product);
      setSelectedOptions({});
      setIsOptionDialogOpen(true);
    } else {
      // No options, add directly to cart
      addToCart(product, undefined, {});
    }
  };

  // Add product to cart with variant and options
  const addToCart = (
    product: Product,
    variant: ProductVariant | undefined,
    options: Record<string, string>,
  ) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => {
        if (variant) {
          return (
            item.variant?.id === variant.id && item.product.id === product.id
          );
        }
        return item.product.id === product.id && !item.variant;
      });

      if (existingItem) {
        return prevCart.map((item) =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prevCart,
        {
          product,
          variant,
          selectedOptions: options,
          quantity: 1,
        },
      ];
    });
  };

  // Handle option selection in dialog
  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Confirm adding product with selected options
  const handleConfirmAddToCart = async () => {
    if (!selectedProduct) return;

    // If product has options, ensure we have a variant
    if (selectedProduct.options && selectedProduct.options.length > 0) {
      if (!foundVariant) {
        // Try to find variant one more time
        const variant = await findMatchingVariant(
          selectedProduct,
          selectedOptions,
        );
        if (!variant) {
          toast.error(
            "لم يتم العثور على متغير مطابق. يرجى التحقق من الخيارات المحددة.",
          );
          return;
        }
        addToCart(selectedProduct, variant, selectedOptions);
      } else {
        addToCart(selectedProduct, foundVariant, selectedOptions);
      }
    } else {
      // Product without variants
      addToCart(selectedProduct, undefined, selectedOptions);
    }

    setIsOptionDialogOpen(false);
    setSelectedProduct(null);
    setSelectedOptions({});
    setFoundVariant(null);
  };

  // Check if all required options are selected
  // Note: This is a synchronous check for UI state. The actual variant matching happens async in handleConfirmAddToCart
  const canAddToCart = () => {
    if (!selectedProduct) return false;
    if (!selectedProduct.options || selectedProduct.options.length === 0)
      return true;

    // Check if all options have been selected
    const allOptionsSelected = selectedProduct.options.every(
      (option) => selectedOptions[option.name],
    );

    return allOptionsSelected;
  };

  // Update quantity
  const updateQuantity = (itemIndex: number, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart[itemIndex];
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((_, index) => index !== itemIndex);
      }

      return prevCart.map((cartItem, index) =>
        index === itemIndex ? { ...cartItem, quantity: newQuantity } : cartItem,
      );
    });
  };

  // Remove from cart
  const removeFromCart = (itemIndex: number) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== itemIndex));
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.variant?.price ?? item.product.price ?? 0;
      return total + price * item.quantity;
    }, 0);
  };

  const total = calculateTotal();

  // Debounce coupon code for validation when user finishes typing
  const [debouncedCouponCode, setDebouncedCouponCode] = useState("");
  const couponValidationEnabled =
    isCheckoutDialogOpen || showCoupon || isInvoiceSheetOpen;
  useEffect(() => {
    if (!couponValidationEnabled) return;
    const trimmed = (checkoutForm.couponCode || "").trim();
    const timer = setTimeout(() => setDebouncedCouponCode(trimmed), 500);
    return () => clearTimeout(timer);
  }, [checkoutForm.couponCode, couponValidationEnabled]);

  const validateCouponParams =
    debouncedCouponCode.length >= 2
      ? { code: debouncedCouponCode, orderTotal: total }
      : null;
  const {
    data: couponValidation,
    isFetching: isValidatingCoupon,
    error: couponValidateError,
  } = useValidateCoupon(validateCouponParams, couponValidationEnabled);

  const couponValid = couponValidation?.valid === true;
  const couponValidationMessage =
    couponValidation?.message ??
    (couponValidateError as any)?.response?.data?.message ??
    (couponValidateError as Error)?.message;
  const showCouponValidation = Boolean(
    couponValidationEnabled &&
      debouncedCouponCode.length >= 2 &&
      (isValidatingCoupon || couponValidation || couponValidateError),
  );

  // Handle checkout or add products to existing order
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cart is not empty
    if (cart.length === 0) {
      toast.error("السلة فارغة. يرجى إضافة منتجات أولاً");
      return;
    }

    // Transform cart items to products format
    const products = cart.map((item) => {
      // If variant exists, include both productId and variantId
      // If no variant, include only productId
      if (item.variant) {
        return {
          productId: item.product.id,
          variantId: item.variant.id,
          quantity: item.quantity,
        };
      } else {
        return {
          productId: item.product.id,
          quantity: item.quantity,
        };
      }
    });

    // If orderId exists, add products to existing order
    if (orderId) {
      addProductsToOrder(
        {
          orderId: orderId,
          products: { products },
        },
        {
          onSuccess: () => {
            toast.success("تم إضافة المنتجات إلى الطلب بنجاح");
            setCart([]);
            setIsInvoiceSheetOpen(false);
            // Navigate to order details
            navigate(`/orders/${orderId}`);
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message ||
              "فشل في إضافة المنتجات إلى الطلب. حاول مرة أخرى.",
            );
          },
        },
      );
      return;
    }

    // Otherwise, create a new order (requires customer details)
    // Validate required fields
    if (
      !checkoutForm.name ||
      !checkoutForm.email ||
      !checkoutForm.phone ||
      !checkoutForm.stateId ||
      !checkoutForm.regionId ||
      !checkoutForm.nearest_point ||
      !checkoutForm.paymentMethodId
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const checkoutData = {
      domain: storeDomain,
      name: checkoutForm.name,
      email: checkoutForm.email,
      phone: checkoutForm.phone,
      stateId: checkoutForm.stateId,
      regionId: checkoutForm.regionId,
      nearest_point: checkoutForm.nearest_point,
      note: checkoutForm.note || undefined,
      paymentMethodId: checkoutForm.paymentMethodId,
      ...(checkoutForm.couponCode?.trim() && {
        couponCode: checkoutForm.couponCode.trim(),
      }),
      products: products,
    };

    checkoutOrder(checkoutData, {
      onSuccess: (response) => {
        toast.success("تم إنشاء الطلب بنجاح");
        setIsCheckoutDialogOpen(false);
        setIsInvoiceSheetOpen(false);
        setCart([]);
        setCheckoutForm({
          name: "",
          email: "",
          phone: "",
          stateId: "",
          regionId: "",
          nearest_point: "",
          note: "",
          paymentMethodId: "",
          couponCode: "",
        });
        setDebouncedCouponCode("");
        // Navigate to order details if order ID is available
        if (response?.order?.id) {
          navigate(`/orders/${response.order.id}`);
        } else {
          navigate("/orders");
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
          "فشل في إنشاء الطلب. حاول مرة أخرى.",
        );
      },
    });
  };

  const handleInvoicePay = () => {
    handleCheckout({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleInvoiceCancel = () => {
    setCart([]);
    setIsInvoiceSheetOpen(false);
  };

  const invoicePanelProps = {
    cart,
    baseUrl,
    total,
    form: checkoutForm,
    onFormChange: (patch: Partial<POSCheckoutForm>) =>
      setCheckoutForm((prev) => ({ ...prev, ...patch })),
    paymentMethods,
    states: states as any[] | undefined,
    regions: regions as any[] | undefined,
    isLoadingPaymentMethods,
    isLoadingStates,
    isLoadingRegions,
    cashOnDelivery,
    onCashOnDeliveryChange: setCashOnDelivery,
    showCoupon,
    onToggleCoupon: () => setShowCoupon((prev) => !prev),
    isCheckingOut,
    isAddingProducts,
    onPay: handleInvoicePay,
    onCancel: handleInvoiceCancel,
    onUpdateQuantity: updateQuantity,
    onRemove: removeFromCart,
  };

  if (!isLoadingStore && !isPhysicalStore && !orderId) {
    return <POSDisabledView />;
  }

  if (isLoadingStore && !orderId) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 pb-24 lg:gap-6 lg:pb-0">
      <TitleBar
        description={
          orderId
            ? "أضف منتجات إلى الطلب الحالي"
            : "اختر المنتجات وأتمم البيع مباشرة من نقطة البيع"
        }
      />

      {/* Figma: products on the right (next to sidebar), invoice on the left */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex min-h-[60vh] flex-col gap-4 lg:col-span-7 lg:min-h-0">
          <POSFiltersBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            isLoadingCategories={isLoadingCategories}
            imageBaseUrl={baseUrl}
            productCount={filteredProducts.length}
          />

          <POSProductGrid
            products={filteredProducts}
            baseUrl={baseUrl}
            isLoading={isLoadingProducts}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => fetchNextPage()}
            onProductAdd={handleProductClick}
            scrollRef={productsScrollRef}
            loadMoreRef={productsLoadMoreRef}
          />
        </div>

        <aside className="hidden min-h-0 lg:col-span-5 lg:block lg:max-h-[calc(100vh-8rem)] lg:sticky lg:top-6 lg:self-start lg:overflow-hidden">
          <POSInvoicePanel {...invoicePanelProps} className="h-full" />
        </aside>
      </div>

      {/* Mobile sticky invoice bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs text-slate-500">الإجمالي</p>
            <p className="truncate text-lg font-extrabold tabular-nums text-slate-900 dark:text-white">
              {formatPosPrice(total)}
            </p>
          </div>
          <Button
            type="button"
            className="h-12 shrink-0 gap-2 rounded-2xl bg-sky-500 px-5 font-bold text-white hover:bg-sky-600"
            onClick={() => setIsInvoiceSheetOpen(true)}
          >
            <Receipt className="size-4" />
            تفاصيل الفاتورة
          </Button>
        </div>
      </div>

      <Sheet open={isInvoiceSheetOpen} onOpenChange={setIsInvoiceSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[92vh] max-h-[92vh] flex-col gap-0 overflow-hidden rounded-t-3xl p-0 sm:max-w-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>تفاصيل الفاتورة</SheetTitle>
          </SheetHeader>
          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <POSInvoicePanel {...invoicePanelProps} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Option Selection Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl text-right">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 py-4">
              {selectedProduct.options?.map((option) => (
                <div key={option.id} className="space-y-2">
                  <label className="text-sm font-medium">{option.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const valueStr = value.value || value.label || "";
                      const isSelected =
                        selectedOptions[option.name] === valueStr;
                      return (
                        <Button
                          key={value.id}
                          type="button"
                          variant={isSelected ? "default" : "secondary"}
                          size="sm"
                          onClick={() =>
                            handleOptionSelect(option.name, valueStr)
                          }
                          className="min-w-[80px]"
                        >
                          {value.label || value.value || ""}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {canAddToCart() && (
                <div className="border-t pt-4">
                  {isFindingVariant ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="mr-2 text-sm text-muted-foreground">
                        جاري البحث عن المتغير...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          السعر:
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(
                            foundVariant?.price ??
                              selectedProduct.price ??
                              0,
                          )}
                        </span>
                      </div>
                      {foundVariant?.stock !== undefined && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            المخزون:
                          </span>
                          <span className="text-sm font-medium">
                            {foundVariant.stock} قطعة
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setIsOptionDialogOpen(false);
                setSelectedProduct(null);
                setSelectedOptions({});
              }}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmAddToCart}
              className="rounded-full bg-sky-500 hover:bg-sky-600"
            >
              إضافة للسلة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <POSCheckoutDialog
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        form={checkoutForm}
        onFormChange={(patch) =>
          setCheckoutForm((prev) => ({ ...prev, ...patch }))
        }
        onSubmit={handleCheckout}
        isCheckingOut={isCheckingOut}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        total={total}
        showCouponValidation={showCouponValidation}
        isValidatingCoupon={isValidatingCoupon}
        couponValid={couponValid}
        couponValidationMessage={couponValidationMessage}
        paymentMethods={paymentMethods}
        isLoadingPaymentMethods={isLoadingPaymentMethods}
        states={states}
        regions={regions}
        isLoadingStates={isLoadingStates}
        isLoadingRegions={isLoadingRegions}
      />
    </div>
  );
};

export default POS;
