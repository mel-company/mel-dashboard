import { useParams, Link } from "react-router-dom";
import { dmy_orders, dmy_users } from "@/data/dummy";
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
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  Phone,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const order = dmy_orders.find((o) => o.id === Number(id));
  const user = order ? dmy_users.find((u) => u.id === order.user_id) : null;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الطلب غير موجود</h2>
        <p className="text-muted-foreground mb-4">
          الطلب الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
      </div>
    );
  }

  // Calculate total price
  const calculateTotal = () => {
    return order.products.reduce((sum, product) => sum + product.price, 0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { className: string; text: string; icon: typeof Clock }
    > = {
      pending: {
        className: "bg-yellow-600 text-white",
        text: "قيد الانتظار",
        icon: Clock,
      },
      processing: {
        className: "bg-blue-600 text-white",
        text: "قيد المعالجة",
        icon: Package,
      },
      shipped: {
        className: "bg-purple-600 text-white",
        text: "تم الشحن",
        icon: Truck,
      },
      delivered: {
        className: "bg-green-600 text-white",
        text: "تم التسليم",
        icon: CheckCircle2,
      },
      cancelled: {
        className: "bg-red-600 text-white",
        text: "ملغي",
        icon: XCircle,
      },
    };
    return (
      statusMap[status] || {
        className: "bg-gray-600 text-white",
        text: status,
        icon: Clock,
      }
    );
  };

  const statusBadge = getStatusBadge(order.status);
  const StatusIcon = statusBadge.icon;
  const total = calculateTotal();

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
                    طلب رقم #{order.id}
                  </CardTitle>
                  <CardDescription className="text-right mt-1">
                    تم إنشاء الطلب في {formatDate(order.created_at)}
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
                    <p className="text-lg font-bold">{order.products.length}</p>
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
              <CardTitle className="text-right flex items-center gap-2">
                <ShoppingCart className="size-5" />
                المنتجات في الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.products.map((product, index) => (
                  <div key={index}>
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                      <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0">
                        <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
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
                            {product.price.toFixed(2)} د.ع
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {Object.entries(product.properties).map(
                            ([key, value]) => (
                              <Badge
                                key={key}
                                variant="outline"
                                className="text-xs"
                              >
                                {value}
                              </Badge>
                            )
                          )}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              التقييم:
                            </span>
                            <span className="text-xs font-medium">
                              {product.rate}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < order.products.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <MapPin className="size-5" />
                عنوان التوصيل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <MapPin className="size-5 text-primary mt-1 shrink-0" />
                <div className="text-right">
                  <p className="font-medium">{order.address}</p>
                  {user && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.location}
                    </p>
                  )}
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
              {user ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-5 text-primary" />
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground text-right">
                      الاسم
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                    <span className="text-sm text-muted-foreground text-right">
                      الهاتف
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span className="text-sm line-clamp-1">
                        {user.location}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground text-right">
                      الموقع
                    </span>
                  </div>
                  <Separator />
                  <Link to={`/customers/${user.id}`}>
                    <Button variant="outline" className="w-full gap-2">
                      <User className="size-4" />
                      عرض ملف العميل
                    </Button>
                  </Link>
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
                <Badge variant="secondary" className="text-sm">
                  #{order.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الطلب
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm`}
                >
                  <StatusIcon className="size-3" />
                  {statusBadge.text}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">{order.products.length}</span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {total.toFixed(2)} د.ع
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  المبلغ الإجمالي
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
              {order.status === "pending" && (
                <Button className="w-full gap-2" variant="default">
                  <Package className="size-4" />
                  بدء المعالجة
                </Button>
              )}
              {order.status === "processing" && (
                <Button className="w-full gap-2" variant="default">
                  <Truck className="size-4" />
                  شحن الطلب
                </Button>
              )}
              {order.status === "shipped" && (
                <Button className="w-full gap-2" variant="default">
                  <CheckCircle2 className="size-4" />
                  تأكيد التسليم
                </Button>
              )}
              <Button className="w-full gap-2" variant="outline">
                <Edit className="size-4" />
                تعديل الطلب
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Printer className="size-4" />
                طباعة الفاتورة
              </Button>
              {order.status !== "delivered" && order.status !== "cancelled" && (
                <Button className="w-full gap-2" variant="destructive">
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
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
              {order.status !== "pending" && (
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
              {order.status === "shipped" || order.status === "delivered" ? (
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
              ) : null}
              {order.status === "delivered" && (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
