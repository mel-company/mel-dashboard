import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  ArrowLeft,
  Trash2,
  Loader2,
  Edit,
  Plus,
  TruckIcon,
  Ticket,
} from "lucide-react";
import {
  useFetchOrder,
  useUpdateOrder,
  useDeleteOrder,
  useRemoveOrderProduct,
  useUpdateStatusToPending,
  useUpdateStatusToProcessing,
  useUpdateStatusToShipped,
  useUpdateStatusToDelivered,
  useUpdateStatusToCancelled,
  useFetchOrderLogs,
} from "@/api/wrappers/order.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import OrderDetailsSkeleton from "./OrderDetailsSkeleton";
import EditDeliveryAddressDialog from "./EditDeliveryAddressDialog";
import EditProductVariantDialog from "./EditProductVariantDialog";
import RemoveOrderProduct from "./RemoveOrderProduct";
import UseCouponDialog from "./UseCouponDialog";
import { ORDER_INVOICE_PREVIEW_STORAGE_KEY } from "./OrderInvoicePreview";
import { toast } from "sonner";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);
  const [isEditVariantDialogOpen, setIsEditVariantDialogOpen] = useState(false);
  const [isRemoveProductDialogOpen, setIsRemoveProductDialogOpen] =
    useState(false);
  const [selectedOrderProduct, setSelectedOrderProduct] = useState<any | null>(
    null
  );
  const [productToRemove, setProductToRemove] = useState<any | null>(null);
  const [isUseCouponDialogOpen, setIsUseCouponDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchOrder(id ?? "", !!id);

  const baseUrl = order?.baseUrl ?? "";

  const { data: orderLogs, isLoading: isLoadingLogs } = useFetchOrderLogs(
    id ?? "",
    !!id
  );

  const { mutate: updateOrder } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const { mutate: removeOrderProduct, isPending: isRemovingProduct } =
    useRemoveOrderProduct();
  const { mutate: updateStatusToPending, isPending: isUpdatingToPending } =
    useUpdateStatusToPending();
  const {
    mutate: updateStatusToProcessing,
    isPending: isUpdatingToProcessing,
  } = useUpdateStatusToProcessing();
  const { mutate: updateStatusToShipped, isPending: isUpdatingToShipped } =
    useUpdateStatusToShipped();
  const { mutate: updateStatusToDelivered, isPending: isUpdatingToDelivered } =
    useUpdateStatusToDelivered();
  const { mutate: updateStatusToCancelled, isPending: isUpdatingToCancelled } =
    useUpdateStatusToCancelled();

  // Calculate total price
  const calculateTotal = () => {
    if (!order?.products) return 0;
    return order.products?.reduce(
      (sum: number, product: any) =>
        sum + (product.price ?? 0) * (product.quantity ?? 0),
      0
    );
  };

  // Format coupon type for display
  const formatCouponType = (
    type: string | undefined,
    value: number | undefined
  ) => {
    if (type === "PERCENTAGE" && value != null) return `نسبة مئوية (${value}%)`;
    if (type === "FIXED" && value != null)
      return `مبلغ ثابت (${value?.toLocaleString()} د.ع)`;
    return type ?? "—";
  };

  // Format appliesTo for display
  const formatAppliesTo = (appliesTo: string | undefined) => {
    const map: Record<string, string> = {
      ALL: "الكل",
      PRODUCTS: "منتجات محددة",
      CATEGORIES: "تصنيفات محددة",
    };
    return appliesTo ? map[appliesTo] ?? appliesTo : "—";
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get log icon and color based on action
  const getLogIcon = (action: string) => {
    const actionUpper = action.toUpperCase();
    const actionMap: Record<
      string,
      { icon: typeof Clock; color: string; bgColor: string }
    > = {
      CREATED: {
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      STATUS_CHANGED: {
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      PRODUCT_ADDED: {
        icon: Plus,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      PRODUCT_REMOVED: {
        icon: Trash2,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      PRODUCT_UPDATED: {
        icon: Edit,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      ADDRESS_UPDATED: {
        icon: MapPin,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      NOTE_UPDATED: {
        icon: FileText,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
      CANCELED_BY_CUSTOMER: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      CANCELED_BY_STORE: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
    };
    return (
      actionMap[actionUpper] || {
        icon: Clock,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      }
    );
  };

  // Get status badge - handle uppercase status from API
  const getStatusBadge = (status: string | undefined) => {
    if (!status) {
      return {
        className: "bg-gray-600 text-white",
        text: "غير معروف",
        icon: Clock,
      };
    }

    const statusUpper = status.toUpperCase();
    const statusMap: Record<
      string,
      { className: string; text: string; icon: typeof Clock }
    > = {
      PENDING: {
        className: "bg-yellow-600 text-white",
        text: "قيد الانتظار",
        icon: Clock,
      },
      PROCESSING: {
        className: "bg-blue-600 text-white",
        text: "قيد المعالجة",
        icon: Package,
      },
      SHIPPED: {
        className: "bg-purple-600 text-white",
        text: "تم الشحن",
        icon: Truck,
      },
      DELIVERED: {
        className: "bg-green-600 text-white",
        text: "تم التسليم",
        icon: CheckCircle2,
      },
      CANCELLED: {
        className: "bg-red-600 text-white",
        text: "ملغي",
        icon: XCircle,
      },
    };
    return (
      statusMap[statusUpper] || {
        className: "bg-gray-600 text-white",
        text: status,
        icon: Clock,
      }
    );
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!id || !order) return;

    const statusHandlers: Record<string, () => void> = {
      PENDING: () => {
        updateStatusToPending(id, {
          onSuccess: () => {
            toast.success("تم تحديث حالة الطلب إلى قيد الانتظار");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل تحديث حالة الطلب"
            );
          },
        });
      },
      PROCESSING: () => {
        updateStatusToProcessing(id, {
          onSuccess: () => {
            toast.success("تم تحديث حالة الطلب إلى قيد المعالجة");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل تحديث حالة الطلب"
            );
          },
        });
      },
      SHIPPED: () => {
        updateStatusToShipped(id, {
          onSuccess: () => {
            toast.success("تم تحديث حالة الطلب إلى تم الشحن");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل تحديث حالة الطلب"
            );
          },
        });
      },
      DELIVERED: () => {
        updateStatusToDelivered(id, {
          onSuccess: () => {
            toast.success("تم تحديث حالة الطلب إلى تم التسليم");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل تحديث حالة الطلب"
            );
          },
        });
      },
      CANCELLED: () => {
        updateStatusToCancelled(id, {
          onSuccess: () => {
            toast.success("تم إلغاء الطلب بنجاح");
            refetch();
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || "فشل في إلغاء الطلب");
          },
        });
      },
    };

    const handler = statusHandlers[newStatus];
    if (handler) {
      handler();
    } else {
      // Fallback to generic update if status not found
      updateOrder(
        {
          id,
          data: { status: newStatus },
        },
        {
          onSuccess: () => {
            toast.success("تم تحديث حالة الطلب بنجاح");
            refetch();
          },
          onError: (error: any) => {
            toast.error(
              error?.response?.data?.message || "فشل تحديث حالة الطلب"
            );
          },
        }
      );
    }
  };

  const handleCancelOrder = () => {
    if (!id || !order) return;
    handleStatusUpdate("CANCELLED");
  };

  const handleOpenInvoicePreview = () => {
    if (!order) return;
    sessionStorage.setItem(
      ORDER_INVOICE_PREVIEW_STORAGE_KEY,
      JSON.stringify(order)
    );
    window.open(
      "/order-invoice-preview",
      "orderInvoicePreview",
      "width=900,height=900,scrollbars=yes,resizable=yes"
    );
  };

  // Check if any status update is in progress
  const isUpdatingStatus =
    isUpdatingToPending ||
    isUpdatingToProcessing ||
    isUpdatingToShipped ||
    isUpdatingToDelivered ||
    isUpdatingToCancelled;

  const handleDelete = () => {
    if (!id) return;

    deleteOrder(id, {
      onSuccess: () => {
        toast.success("تم حذف الطلب بنجاح");
        navigate("/orders", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الطلب. حاول مرة أخرى."
        );
      },
    });
  };

  if (isLoading) {
    return <OrderDetailsSkeleton />;
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

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الطلب غير موجود</h2>
        <p className="text-muted-foreground mb-4">
          الطلب الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
        <Button variant="outline" onClick={() => navigate("/orders")}>
          <ArrowLeft className="size-4 mr-2" />
          العودة إلى الطلبات
        </Button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(order.status);
  const StatusIcon = statusBadge.icon;
  const subtotal = calculateTotal();
  const totalDiscount =
    order.appliedRedemptions?.reduce(
      (sum: number, r: any) => sum + (Number(r.discount) ?? 0),
      0
    ) ?? 0;
  const totalAfterDiscount = Math.max(0, subtotal - totalDiscount);
  const customer = order.customer?.user;
  const productCount = order._count?.products ?? order.products?.length ?? 0;

  // Get discount amount for a coupon by couponId from appliedRedemptions
  const getRedemptionDiscount = (couponId: string) =>
    order.appliedRedemptions?.find((r: any) => r.couponId === couponId)
      ?.discount ?? 0;

  // Check if order can be modified (hide buttons for SHIPPED and DELIVERED)
  const canModifyOrder =
    order.status !== "SHIPPED" && order.status !== "DELIVERED";

  const displayPrice = (price: number, discounts: any) => {
    const hasDiscount = discounts[0]?.discount;
    const discountPercentage = discounts[0]?.discount?.discount_percentage;

    if (hasDiscount && discountPercentage) {
      return (
        <div className="flex items-center gap-2">
          <span>
            {(price - (price * discountPercentage) / 100).toLocaleString()} د.ع
          </span>
          <span className="line-through text-sm text-muted-foreground">
            {price.toLocaleString()} د.ع
          </span>
        </div>
      );
    }
    return <span>{price.toLocaleString()} د.ع</span>;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-right">
                    طلب رقم #{String(order.id).slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="text-right mt-1">
                    تم إنشاء الطلب في {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-2 text-sm px-4 py-2`}
                >
                  <StatusIcon className="size-4" />
                  {statusBadge.text}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div
                className={`grid gap-4 ${
                  order.appliedRedemptions?.length
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-3"
                }`}
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <Package className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      عدد المنتجات
                    </p>
                    <p className="text-lg font-bold">{productCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <DollarSign className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      المبلغ الإجمالي
                    </p>
                    <>{console.log("PRICING: ", order.pricing)}</>
                    <p className="text-lg font-bold">
                      {order.pricing?.subtotalAfterProductDiscounts?.toLocaleString()}{" "}
                      د.ع
                    </p>
                  </div>
                </div>
                {order.appliedRedemptions?.length ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <Ticket className="size-5 text-primary" />
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          خصم الكوبونات
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          -{totalDiscount.toLocaleString()} د.ع
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <DollarSign className="size-5 text-primary" />
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          المبلغ النهائي
                        </p>
                        <p className="text-lg font-bold">
                          {/* {totalAfterDiscount.toLocaleString()} د.ع */}
                          {order.pricing?.totalPrice?.toLocaleString()} د.ع
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <TruckIcon className="size-5 text-primary" />
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">التوصيل</p>
                      <p className="text-lg font-bold">
                        {(5000).toLocaleString()} د.ع
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-right flex items-center gap-2">
                  <ShoppingCart className="size-5" />
                  المنتجات في الطلب
                </CardTitle>
                {canModifyOrder && (
                  <Button
                    variant="secondary"
                    className="gap-2"
                    onClick={() => navigate(`/pos?orderId=${order.id}`)}
                  >
                    <Plus className="size-4" />
                    إضافة منتج
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products && order.products.length > 0 ? (
                  order.products.map((product: any, index: number) => (
                    <div key={product.id || index}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0">
                          {product?.variant?.image ||
                          product?.product?.image ? (
                            <img
                              src={`${baseUrl}/${
                                product?.variant?.image ||
                                product?.product?.image
                              }`}
                              alt={product?.product?.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex itemscenter justify-between mb-2">
                            <div>
                              <Link
                                to={`/products/${
                                  product?.product?.id || product.id
                                }`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                {product?.product?.title}
                              </Link>

                              {/* Variant Options */}
                              {product?.variant?.optionValues &&
                                product.variant.optionValues.length > 0 && (
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    {product.variant.optionValues.map(
                                      (optionValue: any) => (
                                        <Badge
                                          key={optionValue.id}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {optionValue.label ||
                                            optionValue.value}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}

                              <div className="flex flex-col  gap-1 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    السعر:
                                  </span>
                                  {displayPrice(
                                    product?.price,
                                    product?.product?.discounts
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    الكمية:
                                  </span>
                                  <span className="text-xs font-medium">
                                    {product.quantity?.toLocaleString() ?? "—"}{" "}
                                  </span>
                                </div>

                                {/* <div className="flex items-center gap-2 flex-wrap">
                                  {product?.variant?.product?.rate !== null &&
                                    product?.variant?.product?.rate !==
                                      undefined && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-muted-foreground">
                                          التقييم:
                                        </span>
                                        <span className="text-xs font-medium">
                                          {product?.variant?.product?.rate}
                                        </span>
                                      </div>
                                    )}
                                </div> */}
                              </div>
                            </div>

                            {canModifyOrder && (
                              <div className="flex items-center flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="default"
                                    className="font-bold"
                                    onClick={() => {
                                      setSelectedOrderProduct(product);
                                      setIsEditVariantDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="size-4" />
                                    <span className="text-xs">تعديل</span>
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="font-bold text-primary"
                                    onClick={() => {
                                      setProductToRemove(product);
                                      setIsRemoveProductDialogOpen(true);
                                    }}
                                    disabled={isRemovingProduct}
                                  >
                                    {isRemovingProduct ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <>
                                        <Trash2 className="size-4" />
                                        <span className="text-xs">حذف</span>
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < order.products.length - 1 && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    لا توجد منتجات في هذا الطلب
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applied Coupons */}
          {order.appliedCoupons && order.appliedCoupons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Ticket className="size-5" />
                  الكوبونات المطبقة
                </CardTitle>
                <CardDescription className="text-right">
                  كوبونات الخصم المطبقة على هذا الطلب
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.appliedCoupons.map((coupon: any, index: number) => {
                    const discountAmount = getRedemptionDiscount(coupon.id);
                    return (
                      <div
                        key={coupon.id || index}
                        className="p-4 rounded-lg border bg-card space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className="text-sm font-mono"
                          >
                            {coupon.code}
                          </Badge>
                          {discountAmount > 0 && (
                            <span className="text-sm font-semibold text-green-600">
                              خصم: {Number(discountAmount).toLocaleString()} د.ع
                            </span>
                          )}
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground text-right flex-1 w-full">
                              {coupon.description}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              نوع الخصم
                            </span>
                            <span>
                              {formatCouponType(coupon.type, coupon.value)}
                            </span>
                          </div>
                          {coupon.minOrderTotal != null && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                الحد الأدنى للطلب
                              </span>
                              <span>
                                {coupon.minOrderTotal?.toLocaleString()} د.ع
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              ينطبق على
                            </span>
                            <span>{formatAppliesTo(coupon.appliesTo)}</span>
                          </div>
                          {coupon.startsAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                يبدأ
                              </span>
                              <span>{formatDate(coupon.startsAt)}</span>
                            </div>
                          )}
                          {coupon.expiresAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                ينتهي
                              </span>
                              <span>{formatDate(coupon.expiresAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-right flex items-center gap-2">
                    <MapPin className="size-5" />
                    عنوان التوصيل
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="wfull gap-2"
                    onClick={() => setIsEditAddressDialogOpen(true)}
                  >
                    <Edit className="" />
                    تعديل
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <MapPin className="size-5 text-primary mt-1 shrink-0" />
                <div className="text-right">
                  <p className="font-medium">{order.nearest_point || "—"}</p>
                  <div className="flex items-center gap-2">
                    {order.country?.name && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.country?.name?.ar}
                        </p>
                      </div>
                    )}
                    {order.state?.name && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground mt-1">-</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.state?.name?.arabic}
                        </p>
                      </div>
                    )}
                    {order.region?.name && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground mt-1">-</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.region?.name?.arabic}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <FileText className="size-5" />
                  ملاحظات الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border bg-card">
                  <p className="text-right">{order.note}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground text-right">
                      الاسم
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {customer.name || "—"}
                      </span>
                    </div>
                  </div>
                  {customer.phone && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground text-right">
                          الهاتف
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {customer.email && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground text-right">
                          البريد الإلكتروني
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      </div>
                    </>
                  )}
                  {customer.location && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground text-right">
                          الموقع
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-clamp-1">
                            {customer.location}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  {order.customer?.id && (
                    <>
                      <Separator />
                      <Link to={`/customers/${order.customer.id}`}>
                        <Button variant="secondary" className="w-full gap-2">
                          <User className="size-4" />
                          عرض ملف العميل
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  معلومات العميل غير متوفرة
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-right">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الطلب
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{String(order.id).slice(0, 8)}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm`}
                >
                  <StatusIcon className="size-3" />
                  {statusBadge.text}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
                </span>
                <span className="text-sm">{productCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  المبلغ الإجمالي
                </span>
                <span className="text-lg font-bold text-primary">
                  {total.toLocaleString()} د.ع
                </span>
              </div>
            </CardContent>
          </Card> */}

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!order.appliedCoupons?.length && (
                <Button
                  className="w-full gap-2 bg-green-400 hover:bg-green-500/90"
                  variant="default"
                  onClick={() => setIsUseCouponDialogOpen(true)}
                >
                  <Ticket className="size-4" />
                  استخدام كوبون خصم
                </Button>
              )}
              {order.status === "PENDING" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => handleStatusUpdate("PROCESSING")}
                  disabled={isUpdatingStatus}
                >
                  <Package className="size-4" />
                  بدء المعالجة
                </Button>
              )}
              {order.status === "PROCESSING" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => handleStatusUpdate("SHIPPED")}
                  disabled={isUpdatingStatus}
                >
                  <Truck className="size-4" />
                  شحن الطلب
                </Button>
              )}
              {order.status === "SHIPPED" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => handleStatusUpdate("DELIVERED")}
                  disabled={isUpdatingStatus}
                >
                  <CheckCircle2 className="size-4" />
                  تأكيد التسليم
                </Button>
              )}
              <Button
                className="w-full gap-2"
                variant="secondary"
                onClick={handleOpenInvoicePreview}
              >
                <FileText className="size-4" />
                معاينة / تحميل الفاتورة
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full gap-2"
                variant="destructive"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4" />
                    حذف الطلب
                  </>
                )}
              </Button>
              {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                <Button
                  className="w-full gap-2"
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={isUpdatingStatus}
                >
                  <XCircle className="size-4" />
                  إلغاء الطلب
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Calendar className="size-5" />
                سجل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : orderLogs && orderLogs.length > 0 ? (
                orderLogs.map((log: any, index: number) => {
                  const logIcon = getLogIcon(log.action);
                  const LogIcon = logIcon.icon;
                  return (
                    <div key={log.id}>
                      {index > 0 && <Separator className="my-3" />}
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-1.5 ${logIcon.bgColor} rounded-full mt-0.5`}
                        >
                          <LogIcon className={`size-3 ${logIcon.color}`} />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-medium">
                            {log.message || log.action}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </p>
                          {log.changes && log.changes.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {log.changes.map((change: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="text-xs text-muted-foreground"
                                >
                                  {change.oldValue && change.newValue ? (
                                    <span>
                                      {change.field}: {change.oldValue} →{" "}
                                      {change.newValue}
                                    </span>
                                  ) : change.newValue ? (
                                    <span>
                                      {change.field}: {change.newValue}
                                    </span>
                                  ) : change.oldValue ? (
                                    <span>
                                      {change.field}: {change.oldValue} (تم
                                      الحذف)
                                    </span>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-muted-foreground">
                    لا توجد سجلات للطلب
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Delivery Address Dialog */}
      {id && (
        <EditDeliveryAddressDialog
          orderId={id ?? ""}
          open={isEditAddressDialogOpen}
          onOpenChange={setIsEditAddressDialogOpen}
          initialData={{
            stateId: order.stateId || undefined,
            regionId: order.regionId || undefined,
            nearest_point: order.nearest_point || undefined,
          }}
        />
      )}

      {/* Use Coupon Dialog */}
      {id && order && (
        <UseCouponDialog
          open={isUseCouponDialogOpen}
          onOpenChange={setIsUseCouponDialogOpen}
          orderId={id}
          orderTotal={subtotal}
        />
      )}

      {/* Edit Product Variant Dialog */}
      {selectedOrderProduct && id && (
        <EditProductVariantDialog
          open={isEditVariantDialogOpen}
          onOpenChange={(open) => {
            setIsEditVariantDialogOpen(open);
            if (!open) {
              setSelectedOrderProduct(null);
            }
          }}
          orderProduct={selectedOrderProduct}
          orderId={id}
          onSuccess={() => {
            // Refetch order data to show updated variant information
            refetch();
          }}
        />
      )}

      {/* Remove Order Product Dialog */}
      {productToRemove && id && (
        <RemoveOrderProduct
          open={isRemoveProductDialogOpen}
          onOpenChange={(open) => {
            setIsRemoveProductDialogOpen(open);
            if (!open) {
              setProductToRemove(null);
            }
          }}
          orderProduct={productToRemove}
          orderId={id}
          isRemoving={isRemovingProduct}
          onConfirm={() => {
            removeOrderProduct(
              {
                orderId: id || "",
                productId: productToRemove.id,
              },
              {
                onSuccess: () => {
                  toast.success("تم حذف المنتج من الطلب بنجاح");
                  setIsRemoveProductDialogOpen(false);
                  setProductToRemove(null);
                  refetch();
                },
                onError: (error: any) => {
                  toast.error(
                    error?.response?.data?.message ||
                      "فشل في حذف المنتج. حاول مرة أخرى."
                  );
                },
              }
            );
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف الطلب</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف الطلب رقم #{String(order.id).slice(0, 8)}؟ لا
              يمكنك التراجع عن هذا الإجراء بعد التأكيد.
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
    </div>
  );
};

export default OrderDetails;
