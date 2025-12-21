import { useParams, Link } from "react-router-dom";
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
  User,
  Phone,
  MapPin,
  ShoppingBag,
  Package,
  Calendar,
  Edit,
  Trash2,
} from "lucide-react";
import { useFetchCustomer } from "@/api/wrappers/customer.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import CustomerDetailsSkeleton from "./CustomerDetailsSkeleton";

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();

  const {
    data: customer,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchCustomer(id ?? "");

  if (isLoading) {
    return <CustomerDetailsSkeleton />;
  }

  if (error) {
    return (
      <ErrorPage
        title="خطأ في تحميل بيانات العميل"
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!customer) {
    return (
      <NotFoundPage
        title="العميل غير موجود"
        description="العميل الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/customers"
        backLabel="العودة لقائمة العملاء"
      />
    );
  }

  const user = customer.user;
  const customerOrders = customer.orders ?? [];
  const orderCount = customer._count?.orders ?? customerOrders.length;

  // Calculate total spent
  const calculateTotalSpent = () => {
    // Note: Order total calculation would need order.products with prices or a total field
    // For now, return 0 as orders don't include product details in the customer response
    return 0;
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
      PENDING: {
        className: "bg-yellow-600 text-white",
        text: "قيد الانتظار",
      },
      PROCESSING: {
        className: "bg-blue-600 text-white",
        text: "قيد المعالجة",
      },
      SHIPPED: {
        className: "bg-purple-600 text-white",
        text: "تم الشحن",
      },
      DELIVERED: {
        className: "bg-green-600 text-white",
        text: "تم التسليم",
      },
      CANCELLED: {
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Customer Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Header Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-right">
                {user?.name ?? "—"}
              </CardTitle>
              <CardDescription className="text-right">
                عميل رقم #{customer.id.slice(0, 8)}
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
                    <p className="text-lg font-bold">{user?.phone ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <MapPin className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">الموقع</p>
                    <p className="text-lg font-bold">{user?.location ?? "—"}</p>
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
                طلبات العميل ({orderCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    لا توجد طلبات لهذا العميل
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerOrders.map((order: any, index: number) => {
                    const productCount = order._count?.products ?? 0;
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
                                طلب رقم #{order.id.slice(0, 8)}
                              </Link>
                              <Badge
                                variant="default"
                                className={`${statusBadge.className} gap-1 text-sm`}
                              >
                                {statusBadge.text}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {productCount} منتج
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="size-4" />
                                <span>
                                  {order.createdAt
                                    ? formatDate(order.createdAt)
                                    : "—"}
                                </span>
                              </div>
                              {order.address && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="size-4" />
                                  <span className="line-clamp-1 max-w-xs">
                                    {order.address}
                                  </span>
                                </div>
                              )}
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
                  #{customer.id.slice(0, 8)}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم العميل
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{orderCount}</span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد الطلبات
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {totalSpent > 0 ? `${totalSpent.toFixed(2)} د.ع` : "—"}
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
              {/* <Button className="w-full gap-2" variant="default">
                <Edit className="size-4" />
                تعديل العميل
              </Button> */}
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
