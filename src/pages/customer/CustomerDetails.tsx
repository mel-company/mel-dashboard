import { useParams, useNavigate, Link } from "react-router-dom";
import { dmy_users, dmy_orders } from "@/data/dummy";
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
  ArrowRight,
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Package,
  Calendar,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customer = dmy_users.find((c) => c.id === Number(id));
  const customerOrders = dmy_orders.filter((o) => o.user_id === Number(id));

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">العميل غير موجود</h2>
        <p className="text-muted-foreground mb-4">
          العميل الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
        <Button onClick={() => navigate("/customers")} variant="outline">
          العودة إلى العملاء
        </Button>
      </div>
    );
  }

  // Calculate total spent
  const calculateTotalSpent = () => {
    return customerOrders.reduce((sum, order) => {
      return sum + order.products.reduce((orderSum, product) => orderSum + product.price, 0);
    }, 0);
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
    const statusMap: Record<string, { className: string; text: string }> = {
      pending: {
        className: "bg-yellow-600 text-white",
        text: "قيد الانتظار",
      },
      processing: {
        className: "bg-blue-600 text-white",
        text: "قيد المعالجة",
      },
      shipped: {
        className: "bg-purple-600 text-white",
        text: "تم الشحن",
      },
      delivered: {
        className: "bg-green-600 text-white",
        text: "تم التسليم",
      },
      cancelled: {
        className: "bg-red-600 text-white",
        text: "ملغي",
      },
    };
    return (
      statusMap[status] || {
        className: "bg-gray-600 text-white",
        text: status,
      }
    );
  };

  const totalSpent = calculateTotalSpent();

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/customers")}
          className="gap-2"
        >
          <ArrowRight className="size-4" />
          العودة إلى العملاء
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Edit className="size-4" />
            تعديل
          </Button>
          <Button variant="destructive" className="gap-2">
            <Trash2 className="size-4" />
            حذف
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-right">
                {customer.name}
              </CardTitle>
              <CardDescription className="text-right">
                عميل رقم #{customer.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-64 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                <User className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Phone className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="text-lg font-bold">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <MapPin className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="text-lg font-bold">{customer.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <ShoppingBag className="size-5" />
                طلبات العميل ({customerOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد طلبات لهذا العميل</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order, index) => {
                    const orderTotal = order.products.reduce(
                      (sum, product) => sum + product.price,
                      0
                    );
                    const statusBadge = getStatusBadge(order.status);
                    return (
                      <div key={order.id}>
                        <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
                          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0">
                            <Package className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="flex items-center justify-between mb-2">
                              <Link
                                to={`/orders/${order.id}`}
                                className="font-semibold hover:text-primary transition-colors"
                              >
                                طلب رقم #{order.id}
                              </Link>
                              <Badge
                                variant="default"
                                className={`${statusBadge.className} gap-1 text-sm`}
                              >
                                {statusBadge.text}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {order.products.length} منتج
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="size-4" />
                                <span>{formatDate(order.created_at)}</span>
                              </div>
                              <span className="font-bold text-primary">
                                {orderTotal.toFixed(2)} د.ع
                              </span>
                            </div>
                          </div>
                        </div>
                        {index < customerOrders.length - 1 && (
                          <Separator className="my-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  #{customer.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم العميل
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {customerOrders.length}
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد الطلبات
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {totalSpent.toFixed(2)} د.ع
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  إجمالي المشتريات
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
              <Button className="w-full gap-2" variant="default">
                <Edit className="size-4" />
                تعديل العميل
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <ShoppingBag className="size-4" />
                عرض جميع الطلبات
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف العميل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
