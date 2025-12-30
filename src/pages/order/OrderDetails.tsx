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
  Printer,
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
} from "lucide-react";
import {
  useFetchOrder,
  useUpdateOrder,
  useDeleteOrder,
} from "@/api/wrappers/order.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import OrderDetailsSkeleton from "./OrderDetailsSkeleton";
import EditDeliveryAddressDialog from "./EditDeliveryAddressDialog";
import { toast } from "sonner";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);

  const {
    data: order,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchOrder(id ?? "", !!id);

  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();

  // Calculate total price
  const calculateTotal = () => {
    if (!order?.products) return 0;
    return order.products?.reduce(
      (sum: number, product: any) => sum + (product.price ?? 0),
      0
    );
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
          toast.error(error?.response?.data?.message || "فشل تحديث حالة الطلب");
        },
      }
    );
  };

  const handleCancelOrder = () => {
    if (!id || !order) return;
    handleStatusUpdate("CANCELLED");
  };

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
  const total = calculateTotal();
  const customer = order.customer?.user;
  const productCount = order._count?.products ?? order.products?.length ?? 0;

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
              <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-lg font-bold">{total.toFixed(2)} د.ع</p>
                  </div>
                </div>
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
                <Button variant="secondary" className="gap-2">
                  <Plus className="size-4" />
                  إضافة منتج
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products && order.products.length > 0 ? (
                  order.products.map((product: any, index: number) => (
                    <div key={product.id || index}>
                      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center justify-between mb-2">
                            <Link
                              to={`/products/${product.id}`}
                              className="font-semibold hover:text-primary transition-colors"
                            >
                              {product.title}
                            </Link>
                            <span className="font-bold text-primary">
                              {product.price?.toFixed(2) ?? "—"} د.ع
                            </span>
                          </div>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            {product.rate !== null &&
                              product.rate !== undefined && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    التقييم:
                                  </span>
                                  <span className="text-xs font-medium">
                                    {product.rate}
                                  </span>
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
          <Card>
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
                  {total.toFixed(2)} د.ع
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === "PENDING" && (
                <Button
                  className="w-full gap-2"
                  variant="default"
                  onClick={() => handleStatusUpdate("PROCESSING")}
                  disabled={isUpdating}
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
                  disabled={isUpdating}
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
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="size-4" />
                  تأكيد التسليم
                </Button>
              )}
              <Button className="w-full gap-2" variant="secondary">
                <Printer className="size-4" />
                طباعة الفاتورة
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
                  disabled={isUpdating}
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
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-100 rounded-full mt-0.5">
                  <Clock className="size-3 text-blue-600" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm font-medium">تم إنشاء الطلب</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
              {order.status !== "PENDING" && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full mt-0.5">
                      <Package className="size-3 text-blue-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium">قيد المعالجة</p>
                      <p className="text-xs text-muted-foreground">
                        جاري معالجة الطلب
                      </p>
                    </div>
                  </div>
                </>
              )}
              {(order.status === "SHIPPED" || order.status === "DELIVERED") && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                      <Truck className="size-3 text-purple-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium">تم الشحن</p>
                      <p className="text-xs text-muted-foreground">
                        الطلب في الطريق
                      </p>
                    </div>
                  </div>
                </>
              )}
              {order.status === "DELIVERED" && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                      <CheckCircle2 className="size-3 text-green-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium">تم التسليم</p>
                      <p className="text-xs text-muted-foreground">
                        تم تسليم الطلب بنجاح
                      </p>
                    </div>
                  </div>
                </>
              )}
              {order.status === "CANCELLED" && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-red-100 rounded-full mt-0.5">
                      <XCircle className="size-3 text-red-600" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-medium">تم الإلغاء</p>
                      <p className="text-xs text-muted-foreground">
                        تم إلغاء الطلب
                      </p>
                    </div>
                  </div>
                </>
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
