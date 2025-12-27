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
import AddProductPropertyDialog from "./AddProductPropertyDialog";
import EditProductPropertyDialog from "./EditProductPropertyDialog";
import AddVariantDialog from "./AddVariantDialog";
import EditVariantDialog from "./EditVariantDialog";
import {
  useFetchVariants,
  useDeleteVariant,
} from "@/api/wrappers/variant.wrappers";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddOptionDialogOpen, setIsAddOptionDialogOpen] = useState(false);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null
  );
  const [isAddVariantDialogOpen, setIsAddVariantDialogOpen] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );

  const { data, isLoading, error, refetch, isFetching } = useFetchProduct(
    id ?? ""
  );

  const { data: variantsData, refetch: refetchVariants } = useFetchVariants(
    { productId: id ?? "" },
    !!id
  );

  const { mutate: deleteVariant, isPending: isDeletingVariant } =
    useDeleteVariant();

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
      <div className="grd grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Image and Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex gap-x-2 items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-right">
                    {data.title}
                  </CardTitle>
                  <CardDescription className="text-right">
                    {data.description}
                  </CardDescription>
                </div>
                <div className="flex gap-x-2 items-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Package className="size-4" />
                    المخزون
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(`/products/${id}/edit`)}
                  >
                    <Edit className="size-4" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="gap-2"
                    size="sm"
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
                        حذف
                      </>
                    )}
                  </Button>
                </div>
              </div>
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
                    {data?.price?.toLocaleString()} د.ع
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-right">
                  <p className="text-sm px4 py-2 text-muted-foreground">
                    تكلفة المنتج
                  </p>
                  {/* <DollarSign className="size-5 text-primary" /> */}
                  <span className="text-2xl font-bold text-primary">
                    {data?.cost_to_produce?.toLocaleString()} د.ع
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
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setIsAddPropertyDialogOpen(true)}
              >
                <Plus className="size-3" />
                إضافة خاصية
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.properties.map((property: any) => (
                  <div
                    key={property.id || property.name}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-muted-foreground text-right">
                        {property.name}
                      </span>
                      <Badge variant="outline" className="text-sm">
                        {property.value as string}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={() => setEditingPropertyId(property.id)}
                    >
                      <Edit className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-right flex items-center gap-2">
                <Package className="size-5" />
                متغيرات المنتج
              </CardTitle>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => setIsAddVariantDialogOpen(true)}
              >
                <Plus className="size-3" />
                إضافة متغير
              </Button>
            </CardHeader>
            <CardContent>
              {variantsData && variantsData.length > 0 ? (
                <div className="space-y-3">
                  {variantsData.map((variant: any) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              SKU:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {variant.sku}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              QR:
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {variant.qr_code}
                            </Badge>
                          </div>
                          {variant.price !== null &&
                            variant.price !== undefined && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  السعر:
                                </span>
                                <span className="text-sm font-medium">
                                  {variant.price.toLocaleString()} د.ع
                                </span>
                              </div>
                            )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              المخزون:
                            </span>
                            <span className="text-sm font-medium">
                              {variant.stock}
                            </span>
                          </div>
                        </div>
                        {variant.optionValues &&
                          variant.optionValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {variant.optionValues.map((optValue: any) => (
                                <Badge
                                  key={optValue.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {optValue.option?.name}:{" "}
                                  {optValue.label || optValue.value}
                                </Badge>
                              ))}
                            </div>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => setEditingVariantId(variant.id)}
                        >
                          <Edit className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={() => setDeletingVariantId(variant.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">لا توجد متغيرات للمنتج</p>
                  <p className="text-xs mt-1">
                    اضغط على "إضافة متغير" لإضافة متغير جديد
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        {/* <div className="space-y-6">
           Quick Info Card
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

          Actions Card 
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
        </div> */}
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

      {/* Add Product Property Dialog */}
      {id && (
        <AddProductPropertyDialog
          open={isAddPropertyDialogOpen}
          onOpenChange={setIsAddPropertyDialogOpen}
          productId={id}
        />
      )}

      {/* Edit Product Property Dialog */}
      {editingPropertyId && (
        <EditProductPropertyDialog
          open={!!editingPropertyId}
          onOpenChange={(open) => !open && setEditingPropertyId(null)}
          propertyId={editingPropertyId}
        />
      )}

      {/* Add Variant Dialog */}
      {id && (
        <AddVariantDialog
          open={isAddVariantDialogOpen}
          onOpenChange={setIsAddVariantDialogOpen}
          productId={id}
        />
      )}

      {/* Edit Variant Dialog */}
      {editingVariantId && (
        <EditVariantDialog
          open={!!editingVariantId}
          onOpenChange={(open) => !open && setEditingVariantId(null)}
          variantId={editingVariantId}
        />
      )}

      {/* Delete Variant Confirmation Dialog */}
      <Dialog
        open={!!deletingVariantId}
        onOpenChange={(open) => !open && setDeletingVariantId(null)}
      >
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف المتغير</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف هذا المتغير؟ لا يمكنك التراجع عن هذا الإجراء
              بعد التأكيد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingVariantId(null)}
              disabled={isDeletingVariant}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                if (!deletingVariantId) return;
                deleteVariant(deletingVariantId, {
                  onSuccess: () => {
                    toast.success("تم حذف المتغير بنجاح");
                    setDeletingVariantId(null);
                    refetchVariants();
                  },
                  onError: (error: any) => {
                    toast.error(
                      error?.response?.data?.message ||
                        "فشل في حذف المتغير. حاول مرة أخرى."
                    );
                  },
                });
              }}
              variant="destructive"
              disabled={isDeletingVariant}
            >
              {isDeletingVariant ? (
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

export default ProductDetails;
