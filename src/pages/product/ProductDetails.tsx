import { useNavigate, useParams } from "react-router-dom";
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
  Star,
  ShoppingCart,
  DollarSign,
  Package,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import { useFetchProduct } from "@/api/wrappers/product.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? ""
  );

  if (isLoading) return <ProductDetailsSkeleton />;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image and Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-right">
                {data.title}
              </CardTitle>
              <CardDescription className="text-right">
                {data.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                {/* <img
                  src={product.image}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = `https://via.placeholder.com/600x400/cccccc/666666?text=${encodeURIComponent(
                      product.title
                    )}`;
                    target.onerror = null;
                  }}
                /> */}
                <ShoppingCart className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* Rating */}
              <div className="flex items-center gap-2 text-right">
                <div className="flex items-center gap-1">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{data.rate}</span>
                </div>
                <span className="text-muted-foreground">تقييم المنتج</span>
              </div>

              <Separator />

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-right">
                  <DollarSign className="size-5 text-primary" />
                  <span className="text-3xl font-bold text-primary">
                    {data.price.toFixed(2)} د.ع
                  </span>
                </div>
                <Badge variant="default" className="text-lg px-4 py-2">
                  السعر
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right flex items-center gap-2">
                <Tag className="size-5" />
                خصائص المنتج
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(data.properties).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <Badge variant="outline" className="text-sm">
                      {value as string}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground text-right">
                      {key === "brand"
                        ? "العلامة التجارية"
                        : key === "color"
                        ? "اللون"
                        : key === "warranty"
                        ? "الضمان"
                        : key}
                    </span>
                  </div>
                ))}
              </div>
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
                  #{data.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم المنتج
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Package className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground text-right">
                  متوفر في المخزون
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
              <Button
                onClick={() => navigate(`/products/${id}/edit`)}
                className="w-full gap-2"
                variant="default"
              >
                <Edit className="size-4" />
                تعديل المنتج
              </Button>
              <Button className="w-full gap-2" variant="secondary">
                <Package className="size-4" />
                إدارة المخزون
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف المنتج
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
