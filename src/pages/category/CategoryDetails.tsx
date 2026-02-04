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
  Folder,
  Package,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ShoppingCart,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useFetchCategory,
  useDeleteCategory,
} from "@/api/wrappers/category.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import CategoryDetailsSkeleton from "./CategoryDetailsSkeleton";
import AddProductToCategoryDialog from "./AddProductToCategoryDialog";
import RemoveProductFromCategoryDialog from "./RemoveProductFromCategoryDialog";
import ToggleEnableCategoryDialog from "./ToggleEnableCategoryDialog";
import CategoryImageDialog from "./CategoryImageDialog";
import { toast } from "sonner";

const CategoryDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isToggleEnabledDialogOpen, setIsToggleEnabledDialogOpen] =
    useState(false);
  const [removingProduct, setRemovingProduct] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const {
    data: category,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchCategory(id ?? "");

  const baseUrl = category?.baseUrl ?? "";

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  const handleDelete = () => {
    if (!id) return;

    deleteCategory(id, {
      onSuccess: () => {
        toast.success("تم حذف الفئة بنجاح");
        navigate("/categories", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الفئة. حاول مرة أخرى."
        );
      },
    });
  };

  if (isLoading) return <CategoryDetailsSkeleton />;

  if (error) {
    return (
      <ErrorPage
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  // Get products in this category from the API
  const categoryProducts = category?.products || [];
  const totalProducts = category?._count?.products || 0;

  if (!category) {
    return (
      <NotFoundPage
        title="الفئة غير موجودة"
        description="الفئة التي تبحث عنها غير موجودة أو تم حذفها."
        backTo="/categories"
        backLabel="العودة إلى الفئات"
      />
    );
  }

  return (
    <div className="space-y-6">
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
              <button
                type="button"
                onClick={() => setIsImageDialogOpen(true)}
                className="relative group h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10 transition-opacity hover:opacity-90 cursor-pointer"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Folder className="size-24 text-white bg-cyan/40 rounded-full p-6" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    تعديل الصورة
                  </span>
                </div>
              </button>

              <Separator />

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Package className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalProducts}</p>
                    <p className="text-sm text-muted-foreground">
                      عدد المنتجات
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Folder className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      #{category.id.slice(0, 6)}
                    </p>
                    <p className="text-sm text-muted-foreground">رقم الفئة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products in Category */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-right flex items-center gap-2">
                    <ShoppingCart className="size-5" />
                    المنتجات في هذه الفئة
                  </CardTitle>
                  <CardDescription className="text-right">
                    {categoryProducts.length > 0
                      ? `عرض ${categoryProducts.length} من ${totalProducts} منتج`
                      : `لا توجد منتجات في هذه الفئة`}
                  </CardDescription>
                </div>
                <div>
                  <Button
                    onClick={() => setIsAddProductDialogOpen(true)}
                    variant="default"
                    className="w-full gap-2"
                  >
                    <Plus className="size-4" />
                    إضافة منتج
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categoryProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoryProducts.map((product: any) => (
                      <Link
                        key={product.product.id}
                        to={`/products/${product.product.id}`}
                        className="flex justify-between items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors cursor-pointer"
                      >
                        <div className="flex icenter gap-x-2">
                          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                            {product.product.image ? (
                              <img
                                src={`${baseUrl}/${product.product.image}`}
                                alt={product.product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <p className="font-semibold line-clamp-1">
                              {product.product.title}
                            </p>
                            {product.product.price && (
                              <p className="text-sm text-muted-foreground">
                                {product.product.price.toLocaleString()} د.ع
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="hover:text-destructive hover:bg-destructive/10 group"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setRemovingProduct({
                                id: product.product.id,
                                name: product.product.title,
                              });
                            }}
                          >
                            <X className="hover:text-destructive group-hover:text-destructive" />
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {totalProducts > categoryProducts.length && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/products?categoryId=${id}`)}
                      >
                        عرض جميع المنتجات ({totalProducts})
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد منتجات في هذه الفئة
                  </p>
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
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم الفئة
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{category.id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
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
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
                </span>
                <span className="text-lg font-bold">{totalProducts}</span>
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
                onClick={() => navigate(`/categories/${id}/edit`)}
                className="w-full gap-2"
                variant="default"
              >
                <Edit className="size-4" />
                تعديل الفئة
              </Button>
              <Button
                onClick={() => setIsToggleEnabledDialogOpen(true)}
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
                    حذف الفئة
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
            <DialogTitle className="text-right">تأكيد حذف الفئة</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف الفئة "{category.name}"؟ لا يمكنك التراجع عن
              هذا الإجراء بعد التأكيد.
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

      {/* Add Product Dialog */}
      {id && (
        <AddProductToCategoryDialog
          open={isAddProductDialogOpen}
          onOpenChange={setIsAddProductDialogOpen}
          categoryId={id}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Remove Product Dialog */}
      {id && removingProduct && (
        <RemoveProductFromCategoryDialog
          open={!!removingProduct}
          onOpenChange={(open) => !open && setRemovingProduct(null)}
          categoryId={id}
          productId={removingProduct.id}
          productName={removingProduct.name}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Toggle Enable Dialog */}
      {id && (
        <ToggleEnableCategoryDialog
          open={isToggleEnabledDialogOpen}
          onOpenChange={setIsToggleEnabledDialogOpen}
          categoryId={id}
          categoryName={category.name}
          isEnabled={category.enabled}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Category Image Dialog */}
      {id && (
        <CategoryImageDialog
          open={isImageDialogOpen}
          onOpenChange={(open) => {
            setIsImageDialogOpen(open);
            // Refetch category data when dialog closes to update the image
            if (!open) {
              refetch();
            }
          }}
          categoryId={id}
        />
      )}
    </div>
  );
};

export default CategoryDetails;
