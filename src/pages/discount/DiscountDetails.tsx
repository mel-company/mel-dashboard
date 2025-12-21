import { useParams, Link } from "react-router-dom";
import { DISCOUNT_STATUS } from "@/utils/constants";
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
  Tag,
  Calendar,
  Folder,
  Edit,
  Trash2,
  Percent,
  ShoppingCart,
  Package,
} from "lucide-react";
import { useFetchDiscount } from "@/api/wrappers/discount.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import DiscountDetailsSkeleton from "./DiscountDetailsSkeleton";

const DiscountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const {
    data: discount,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchDiscount(id ?? "");

  if (isLoading) return <DiscountDetailsSkeleton />;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  if (!discount) {
    return (
      <NotFoundPage
        title="الخصم غير موجود"
        description="الخصم الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/discounts"
        backLabel="العودة إلى الخصومات"
      />
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case DISCOUNT_STATUS.ACTIVE:
        return {
          className: "bg-green-600 text-white",
          text: "نشط",
        };
      case DISCOUNT_STATUS.INACTIVE:
        return {
          className: "bg-gray-600 text-white",
          text: "غير نشط",
        };
      case DISCOUNT_STATUS.EXPIRED:
        return {
          className: "bg-red-600 text-white",
          text: "منتهي",
        };
      default:
        return {
          className: "bg-gray-600 text-white",
          text: status,
        };
    }
  };

  const statusBadge = getStatusBadge(discount?.discount_status);
  const isActive = discount?.discount_status === DISCOUNT_STATUS.ACTIVE;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Discount Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Discount Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-right">
                  {discount.name}
                </CardTitle>
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm px-4 py-2`}
                >
                  {statusBadge.text}
                </Badge>
              </div>
              <CardDescription className="text-right mt-2">
                {discount.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
                <div className="flex flex-col items-center gap-4">
                  <Tag className="size-24 text-primary" />
                  <div className="text-6xl font-bold text-primary">
                    {discount.discount_percentage}%
                  </div>
                  <p className="text-lg text-muted-foreground">نسبة الخصم</p>
                </div>
              </div>

              <Separator />

              {/* Discount Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">تاريخ البدء</p>
                    <p className="text-lg font-bold">
                      {formatDate(discount.discount_start_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                  <Calendar className="size-5 text-primary" />
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      تاريخ الانتهاء
                    </p>
                    <p className="text-lg font-bold">
                      {formatDate(discount.discount_end_date)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products in Discount */}
          {discount?.products && discount.products.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Package className="size-5" />
                  المنتجات المشمولة (
                  {discount._count?.products ?? discount.products.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discount.products.map((product: any) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold line-clamp-1">
                            {product.title}
                          </p>
                          {product.price && (
                            <p className="text-sm text-muted-foreground">
                              {product.price.toFixed(2)} د.ع
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories in Discount */}
          {discount?.categories && discount.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Folder className="size-5" />
                  الفئات المشمولة (
                  {discount._count?.categories ?? discount.categories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discount.categories.map((category: any) => (
                    <Link
                      key={category.id}
                      to={`/categories/${category.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Folder className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold line-clamp-1">
                            {category.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                  #{discount.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الخصم
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="size-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {discount.discount_percentage}%
                  </span>
                </div>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  نسبة الخصم
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Badge
                  variant="default"
                  className={`${statusBadge.className} gap-1 text-sm`}
                >
                  {statusBadge.text}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {discount?._count?.products ?? 0}
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {discount?._count?.categories ?? 0}
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد الفئات
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Link to={`/discounts/${id}/edit`} className="">
                <Button className="w-full gap-2" variant="default">
                  <Edit className="size-4" />
                  تعديل الخصم
                </Button>
              </Link>
              {!isActive && (
                <Button className="w-full gap-2" variant="outline">
                  <Tag className="size-4" />
                  تفعيل الخصم
                </Button>
              )}
              {isActive && (
                <Button className="w-full gap-2" variant="secondary">
                  <Tag className="size-4" />
                  تعطيل الخصم
                </Button>
              )}
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف الخصم
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiscountDetails;
