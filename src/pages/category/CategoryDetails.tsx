import { useParams, useNavigate } from "react-router-dom";
import { dmy_categories, dmy_products } from "@/data/dummy";
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
  Folder,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";

const CategoryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const category = dmy_categories.find((c) => c.id === Number(id));

  // Get products in this category (for demo, we'll show all products)
  // In a real app, you'd filter products by category
  const categoryProducts = dmy_products.slice(
    0,
    category?.number_of_products || 0
  );

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Folder className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">الفئة غير موجودة</h2>
        <p className="text-muted-foreground mb-4">
          الفئة التي تبحث عنها غير موجودة أو تم حذفها.
        </p>
        <Button onClick={() => navigate("/categories")} variant="outline">
          العودة إلى الفئات
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/categories")}
          className="gap-2"
        >
          <ArrowRight className="size-4" />
          العودة إلى الفئات
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
        {/* Main Category Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Image and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-right">
                  {category.name}
                </CardTitle>
                {category.enabled ? (
                  <Badge
                    variant="default"
                    className="bg-green-600 gap-1 text-sm"
                  >
                    <CheckCircle2 className="size-3" />
                    مفعّل
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-sm bg-red-600 text-white"
                  >
                    <XCircle className="size-3" />
                    معطّل
                  </Badge>
                )}
              </div>
              <CardDescription className="text-right mt-2">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                {/* <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = `https://via.placeholder.com/600x400/cccccc/666666?text=${encodeURIComponent(
                      category.name
                    )}`;
                    target.onerror = null;
                  }}
                /> */}
                <Folder className="size-24 text-white bg-cyan/40 rounded-full p-6" />
              </div>

              <Separator />

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Package className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {category.number_of_products}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      عدد المنتجات
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Folder className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">#{category.id}</p>
                    <p className="text-sm text-muted-foreground">رقم الفئة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products in Category */}
          {categoryProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <ShoppingCart className="size-5" />
                  المنتجات في هذه الفئة
                </CardTitle>
                <CardDescription className="text-right">
                  عرض {categoryProducts.length} من {category.number_of_products}{" "}
                  منتج
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer">
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0">
                          <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.price.toFixed(2)} د.ع
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {category.number_of_products > categoryProducts.length && (
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="w-full">
                      عرض جميع المنتجات ({category.number_of_products})
                    </Button>
                  </div>
                )}
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
                  #{category.id}
                </Badge>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الفئة
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                {category.enabled ? (
                  <Badge
                    variant="default"
                    className="bg-green-600 gap-1 text-sm"
                  >
                    <CheckCircle2 className="size-3" />
                    مفعّل
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-sm bg-red-600 text-white"
                  >
                    <XCircle className="size-3" />
                    معطّل
                  </Badge>
                )}
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {category.number_of_products}
                </span>
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
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
                تعديل الفئة
              </Button>
              <Button
                className="w-full gap-2"
                variant={category.enabled ? "destructive" : "default"}
              >
                {category.enabled ? (
                  <>
                    <XCircle className="size-4" />
                    تعطيل الفئة
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    تفعيل الفئة
                  </>
                )}
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Package className="size-4" />
                عرض المنتجات
              </Button>
              <Button className="w-full gap-2" variant="destructive">
                <Trash2 className="size-4" />
                حذف الفئة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
