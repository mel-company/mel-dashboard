import { useNavigate, useParams } from "react-router-dom";
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
  Star,
  ShoppingCart,
  Package,
  Tag,
  Edit,
  Trash2,
  Loader2,
  List,
  DollarSign,
  Plus,
} from "lucide-react";
import {
  useFetchProduct,
  useDeleteProduct,
} from "@/api/wrappers/product.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";
import AddProductOptionDialog from "./AddProductOptionDialog";
import EditProductOptionDialog from "./EditProductOptionDialog";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddOptionDialogOpen, setIsAddOptionDialogOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? ""
  );

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const handleDelete = () => {
    if (!id) return;

    deleteProduct(id, {
      onSuccess: () => {
        toast.success("تم حذف المنتج بنجاح");
        navigate("/products", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف المنتج. حاول مرة أخرى."
        );
      },
    });
  };

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

  if (!data) {
    return (
      <NotFoundPage
        title="المنتج غير موجود"
        description="المنتج الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/products"
        backLabel="العودة إلى المنتجات"
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
              <div className="flex flex-col itemscenter justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign />
                  <p className="text-white ">السعر</p>
                </div>
                <div className="flex items-center justify-between gap-2 text-right">
                  <p className="text-sm px4 py-2 text-muted-foreground">
                    سعر البيع
                  </p>
                  {/* <DollarSign className="size-5 text-primary" /> */}
                  <span className="text-2xl font-bold text-primary">
                    {data.price.toLocaleString()} د.ع
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-right">
                  <p className="text-sm px4 py-2 text-muted-foreground">
                    تكلفة المنتج
                  </p>
                  {/* <DollarSign className="size-5 text-primary" /> */}
                  <span className="text-2xl font-bold text-primary">
                    {data.cost_to_produce.toLocaleString()} د.ع
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-right flex items-center gap-2">
                <List className="size-5" />
                خيارات المنتج
              </CardTitle>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setIsAddOptionDialogOpen(true)}
              >
                <Plus className="size-3" />
                إضافة خيار
              </Button>
            </CardHeader>
            <CardContent>
              {data.options && data.options.length > 0 ? (
                <div className="space-y-4">
                  {data.options.map((option: any) => (
                    <div
                      key={option.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-semibold text-right">
                          {option.name}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-2"
                          onClick={() => setEditingOptionId(option.id)}
                        >
                          <Edit className="size-3" />
                          تعديل
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value: any) => (
                          <Badge
                            key={value.id}
                            variant="secondary"
                            className="text-sm"
                          >
                            {value.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">لا توجد خيارات للمنتج</p>
                  <p className="text-xs mt-1">
                    اضغط على "إضافة خيار" لإضافة خيار جديد
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Properties */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-right flex items-center gap-2">
                <Tag className="size-5" />
                خصائص المنتج
              </CardTitle>
              <Button variant="secondary" className="gap-2">
                <Edit className="size-4" />
                تعديل
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.properties.map((property: any) => (
                  <div
                    key={property.name}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <span className="text-sm font-medium text-muted-foreground text-right">
                      {property.name}
                    </span>
                    <Badge variant="outline" className="text-sm">
                      {property.value as string}
                    </Badge>
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
              <div className="flex flex-col items-start  justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم المنتج
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{data.id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  متوفر في المخزون
                </span>
                <Package className="size-5 text-muted-foreground" />
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
                    حذف المنتج
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف المنتج</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف المنتج "{data.title}"؟ لا يمكنك التراجع عن هذا
              الإجراء بعد التأكيد.
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

      {/* Add Product Option Dialog */}
      {id && (
        <AddProductOptionDialog
          open={isAddOptionDialogOpen}
          onOpenChange={setIsAddOptionDialogOpen}
          productId={id}
        />
      )}

      {/* Edit Product Option Dialog */}
      {editingOptionId && (
        <EditProductOptionDialog
          open={!!editingOptionId}
          onOpenChange={(open) => !open && setEditingOptionId(null)}
          optionId={editingOptionId}
        />
      )}
    </div>
  );
};

export default ProductDetails;
