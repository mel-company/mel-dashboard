import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Package,
  Loader2,
  MapPin,
  Ticket,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  useFetchProductsByStoreDomain,
  useFindVariantByOptions,
} from "@/api/wrappers/product.wrappers";
import { useFetchCategoriesByStoreDomain } from "@/api/wrappers/category.wrappers";
import {
  useCheckoutOrder,
  useAddProductsToOrder,
} from "@/api/wrappers/order.wrappers";
import { useValidateCoupon } from "@/api/wrappers/coupon.wrappers";
import { useFetchStates } from "@/api/wrappers/state.wrappers";
import { useFetchRegionsByState } from "@/api/wrappers/region.wrappers";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

// Product types matching API structure
type Product = {
  id: string;
  title: string;
  price: number | null;
  image?: string;
  description?: string;
  categories?: Array<{ id: string; name: any }>;
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
  name: any; // JSON field, could be string or object
};

type Props = {};

const POS = ({}: Props) => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [foundVariant, setFoundVariant] = useState<ProductVariant | null>(null);
  const [isFindingVariant, setIsFindingVariant] = useState(false);

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
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

  const storeDomain = "fashion";
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useFetchCategoriesByStoreDomain(storeDomain);
  const { data: productsData, isLoading: isLoadingProducts } =
    useFetchProductsByStoreDomain(
      storeDomain,
      selectedCategoryId ? { categoryId: selectedCategoryId } : undefined
    );

  // Checkout related hooks
  const { mutate: checkoutOrder, isPending: isCheckingOut } =
    useCheckoutOrder();
  const { mutate: addProductsToOrder, isPending: isAddingProducts } =
    useAddProductsToOrder();
  const { data: states, isLoading: isLoadingStates } = useFetchStates(
    undefined,
    isCheckoutDialogOpen
  );
  const { data: regions, isLoading: isLoadingRegions } = useFetchRegionsByState(
    checkoutForm.stateId,
    isCheckoutDialogOpen && !!checkoutForm.stateId
  );

  // Variant finding hook
  const { mutateAsync: findVariantByOptions } = useFindVariantByOptions();

  // Extract categories from API response
  const categories: Category[] = categoriesData?.data || categoriesData || [];

  // Extract products from API response
  const products: Product[] = productsData?.data || productsData || [];

  // Helper function to get category name (handles JSON field)
  const getCategoryName = (category: Category): string => {
    if (typeof category.name === "string") return category.name;
    if (typeof category.name === "object" && category.name !== null) {
      return (
        (category.name as any).ar || (category.name as any).name || "غير محدد"
      );
    }
    return "غير محدد";
  };

  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Find matching variant based on selected options using API
  const findMatchingVariant = useCallback(
    async (
      product: Product,
      options: Record<string, string>
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
            "فشل في العثور على المتغير. حاول مرة أخرى."
        );
        setFoundVariant(null);
        return null;
      } finally {
        setIsFindingVariant(false);
      }
    },
    [findVariantByOptions]
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
        (option) => selectedOptions[option.name]
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
    options: Record<string, string>
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
            : item
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
          selectedOptions
        );
        if (!variant) {
          toast.error(
            "لم يتم العثور على متغير مطابق. يرجى التحقق من الخيارات المحددة."
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
      (option) => selectedOptions[option.name]
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
        index === itemIndex ? { ...cartItem, quantity: newQuantity } : cartItem
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
  useEffect(() => {
    if (!isCheckoutDialogOpen) return;
    const trimmed = (checkoutForm.couponCode || "").trim();
    const timer = setTimeout(() => setDebouncedCouponCode(trimmed), 500);
    return () => clearTimeout(timer);
  }, [checkoutForm.couponCode, isCheckoutDialogOpen]);

  const validateCouponParams =
    debouncedCouponCode.length >= 2
      ? { code: debouncedCouponCode, orderTotal: total }
      : null;
  const {
    data: couponValidation,
    isFetching: isValidatingCoupon,
    error: couponValidateError,
  } = useValidateCoupon(validateCouponParams, isCheckoutDialogOpen);

  const couponValid = couponValidation?.valid === true;
  const couponValidationMessage =
    couponValidation?.message ??
    (couponValidateError as any)?.response?.data?.message ??
    (couponValidateError as Error)?.message;
  const showCouponValidation =
    isCheckoutDialogOpen &&
    debouncedCouponCode.length >= 2 &&
    (isValidatingCoupon || couponValidation || couponValidateError);

  // Helper function to get display name from JSON field
  const getDisplayName = (name: any): string => {
    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) {
      return (name as any).ar || (name as any).name || "";
    }
    return "";
  };

  // Reset region when state changes
  useEffect(() => {
    if (isCheckoutDialogOpen && checkoutForm.stateId) {
      setCheckoutForm((prev) => ({ ...prev, regionId: "" }));
    }
  }, [checkoutForm.stateId, isCheckoutDialogOpen]);

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
            // Navigate to order details
            navigate(`/orders/${orderId}`);
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message ||
                "فشل في إضافة المنتجات إلى الطلب. حاول مرة أخرى."
            );
          },
        }
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
          error?.response?.data?.message || "فشل في إنشاء الطلب. حاول مرة أخرى."
        );
      },
    });
  };

  // Loading state
  if (isLoadingCategories || isLoadingProducts) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Package className="size-16 text-muted-foreground mb-4 mx-auto animate-pulse" />
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex gap-4 p-4">
      {/* Left Side - Products */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search and Categories */}
        <Card>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategoryId === null ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setSelectedCategoryId(null)}
              >
                الكل
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategoryId === category.id ? "default" : "secondary"
                  }
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {getCategoryName(category)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <Package className="size-5" />
              المنتجات ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Package className="size-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد منتجات متاحة</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <CardContent className="p-4">
                      {/* Product Image Placeholder */}
                      <div className="w-full h-32 bg-muted rounded-lg mb-3 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="size-12 text-muted-foreground" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-right line-clamp-1">
                          {product.title}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground text-right line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          {product.categories &&
                            product.categories.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryName(product.categories[0])}
                              </Badge>
                            )}
                          <span className="font-bold text-primary">
                            {(product.price ?? 0).toLocaleString()} د.ع
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full mt-3 gap-2"
                        onClick={() => handleProductClick(product)}
                        variant="secondary"
                      >
                        <Plus className="size-4" />
                        إضافة للسلة
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 flex flex-col gap-4 overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-right flex items-center gap-2">
              <ShoppingCart className="size-5" />
              السلة ({cart.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingCart className="size-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">السلة فارغة</p>
                <p className="text-sm text-muted-foreground mt-2">
                  أضف منتجات من القائمة
                </p>
              </div>
            ) : (
              <>
                {cart.map((item, index) => {
                  const price = item.variant?.price ?? item.product.price;
                  const image = item.variant?.image ?? item.product.image;
                  return (
                    <div
                      key={`${item.product.id}-${
                        item.variant?.id ?? "default"
                      }-${index}`}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={item.product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="size-8 text-muted-foreground" />
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 text-right">
                          <h4 className="font-semibold">
                            {item.product.title}
                          </h4>
                          {Object.keys(item.selectedOptions).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(item.selectedOptions).map(
                                ([optionName, value]) => (
                                  <Badge
                                    key={optionName}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {optionName}: {value}
                                  </Badge>
                                )
                              )}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {(price ?? 0).toLocaleString()} د.ع
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => removeFromCart(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => updateQuantity(index, -1)}
                            className="h-8 w-8"
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => updateQuantity(index, 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">
                          {((price ?? 0) * item.quantity).toLocaleString()} د.ع
                        </span>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الملخص</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">عدد العناصر:</span>
                <span className="font-semibold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">المجموع:</span>
                <span className="text-2xl font-bold text-primary">
                  {total.toLocaleString()} د.ع
                </span>
              </div>

              <Button className="w-full" size="lg">
                <Ticket className="size-4" />
                استخدام كوبون خصم
              </Button>

              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  if (orderId) {
                    // If orderId exists, directly add products without showing dialog
                    handleCheckout({
                      preventDefault: () => {},
                    } as React.FormEvent);
                  } else {
                    // Otherwise, show checkout dialog for new order
                    setIsCheckoutDialogOpen(true);
                  }
                }}
                disabled={isAddingProducts}
              >
                {isAddingProducts ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    جاري الإضافة...
                  </>
                ) : orderId ? (
                  "إضافة إلى الطلب"
                ) : (
                  "إتمام الطلب"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Option Selection Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent className="max-w-md text-right">
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

              {/* Show selected variant price */}
              {canAddToCart() && (
                <div className="pt-4 border-t">
                  {isFindingVariant ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground mr-2">
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
                          {(
                            foundVariant?.price ??
                            selectedProduct.price ??
                            0
                          ).toLocaleString()}{" "}
                          د.ع
                        </span>
                      </div>
                      {foundVariant?.stock !== undefined && (
                        <div className="flex items-center justify-between mt-2">
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
              //  disabled={!canAddToCart()}
            >
              إضافة للسلة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">إتمام الطلب</DialogTitle>
            <DialogDescription className="text-right">
              يرجى إدخال معلومات العميل وعنوان التوصيل لإتمام الطلب
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">معلومات العميل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    الاسم <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={checkoutForm.name}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="اسم العميل"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    البريد الإلكتروني{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={checkoutForm.email}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="example@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    الهاتف <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={checkoutForm.phone}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="9641234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethodId">
                    طريقة الدفع <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="paymentMethodId"
                    value={checkoutForm.paymentMethodId}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        paymentMethodId: e.target.value,
                      }))
                    }
                    placeholder="معرف طريقة الدفع"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="size-5" />
                عنوان التوصيل
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="state">
                    المحافظة <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={checkoutForm.stateId}
                    onValueChange={(value) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        stateId: value,
                        regionId: "",
                      }))
                    }
                    disabled={isLoadingStates}
                    required
                  >
                    <SelectTrigger id="state" className="w-full text-right">
                      <div className="flex items-center gap-2 flex-1">
                        <SelectValue placeholder="اختر المحافظة">
                          {checkoutForm.stateId &&
                            getDisplayName(
                              states?.find(
                                (s: any) => s.id === checkoutForm.stateId
                              )?.name.arabic
                            )}
                        </SelectValue>
                        {isLoadingStates && (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingStates ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : states && states.length > 0 ? (
                        states.map((state: any) => (
                          <SelectItem key={state.id} value={state.id}>
                            {getDisplayName(state.name.arabic)}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          لا توجد ولايات متاحة
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">
                    المنطقة <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={checkoutForm.regionId}
                    onValueChange={(value) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        regionId: value,
                      }))
                    }
                    disabled={isLoadingRegions || !checkoutForm.stateId}
                    required
                  >
                    <SelectTrigger id="region" className="w-full text-right">
                      <div className="flex items-center gap-2 flex-1">
                        <SelectValue placeholder="اختر المنطقة">
                          {checkoutForm.regionId &&
                            getDisplayName(
                              regions?.find(
                                (r: any) => r.id === checkoutForm.regionId
                              )?.name.arabic
                            )}
                        </SelectValue>
                        {isLoadingRegions && (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRegions ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="size-4 animate-spin" />
                        </div>
                      ) : !checkoutForm.stateId ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          يرجى اختيار المحافظة أولاً
                        </div>
                      ) : regions && regions.length > 0 ? (
                        regions.map((region: any) => (
                          <SelectItem key={region.id} value={region.id}>
                            {getDisplayName(region.name.arabic)}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          لا توجد مناطق متاحة
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nearest_point">
                    أقرب نقطة <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nearest_point"
                    value={checkoutForm.nearest_point}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        nearest_point: e.target.value,
                      }))
                    }
                    placeholder="عنوان مفصل أو أقرب نقطة معروفة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">ملاحظات (اختياري)</Label>
                  <Input
                    id="note"
                    value={checkoutForm.note}
                    onChange={(e) =>
                      setCheckoutForm((prev) => ({
                        ...prev,
                        note: e.target.value,
                      }))
                    }
                    placeholder="ملاحظات إضافية للطلب"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-right block">
                رمز الكوبون
              </Label>
              <Input
                id="coupon-code"
                value={checkoutForm.couponCode}
                onChange={(e) =>
                  setCheckoutForm((prev) => ({
                    ...prev,
                    couponCode: e.target.value,
                  }))
                }
                placeholder="مثال: RAMADAN20"
                className="text-right placeholder:text-right"
                disabled={isCheckingOut}
              />
              {showCouponValidation && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    couponValid
                      ? "text-green-600"
                      : couponValidateError || couponValidation?.valid === false
                        ? "text-destructive"
                        : "text-muted-foreground"
                  }`}
                >
                  {isValidatingCoupon ? (
                    <>
                      <Loader2 className="size-4 animate-spin shrink-0" />
                      <span>جاري التحقق...</span>
                    </>
                  ) : couponValid ? (
                    <>
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span className="text-right">
                        {couponValidation?.message}
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4 shrink-0" />
                      <span className="text-right">
                        {couponValidationMessage}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">ملخص الطلب</h3>
              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد العناصر:</span>
                  <span className="font-semibold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع:</span>
                  <span className="text-lg font-bold text-primary">
                    {total.toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCheckoutDialogOpen(false)}
                disabled={isCheckingOut}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isCheckingOut}>
                {isCheckingOut ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  "تأكيد الطلب"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
