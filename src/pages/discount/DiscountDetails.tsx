import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tag,
  Calendar,
  Folder,
  Edit,
  Trash2,
  Percent,
  ShoppingCart,
  Package,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  useFetchDiscount,
  useDeleteDiscount,
} from "@/api/wrappers/discount.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import DiscountDetailsSkeleton from "./DiscountDetailsSkeleton";
import ToggleDiscountDialog from "./ToggleDiscountDialog";
import AddDiscountProductDialog from "./AddDiscountProductDialog";
import AddDiscountCategoryDialog from "./AddDiscountCategoryDialog";
import RemoveProductFromDiscountDialog from "./RemoveProductFromDiscountDialog";
import RemoveCategoryFromDiscountDialog from "./RemoveCategoryFromDiscountDialog";
import DiscountImageDialog from "./DiscountImageDialog";
import { toast } from "sonner";

const DiscountDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [removeProductDialog, setRemoveProductDialog] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: "", productName: "" });
  const [removeCategoryDialog, setRemoveCategoryDialog] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
  }>({ open: false, categoryId: "", categoryName: "" });
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const {
    data: discount,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchDiscount(id ?? "");
  const { mutate: deleteDiscount, isPending: isDeleting } = useDeleteDiscount();

  const baseUrl = discount?.baseUrl ?? "";

  const handleDelete = () => {
    if (!id) return;

    deleteDiscount(id, {
      onSuccess: () => {
        toast.success("تم حذف الخصم بنجاح");
        navigate("/discounts", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الخصم. حاول مرة أخرى."
        );
      },
    });
  };

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
              {/* <button
                type="button"
                onClick={() => setIsImageDialogOpen(true)}
                className="relative group h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-linear-to-br from-primary/20 to-primary/5 transition-opacity hover:opacity-90 cursor-pointer"
              >
                {discount.image ? (
                  <img
                    src={discount.image}
                    alt={discount.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <Tag className="size-24 text-primary" />
                    <div className="text-6xl font-bold text-primary">
                      {discount.discount_percentage}%
                    </div>
                    <p className="text-lg text-muted-foreground">نسبة الخصم</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    تعديل الصورة
                  </span>
                </div>
              </button> */}

              {/* <Separator /> */}

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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-right flex items-center gap-2">
                    <Package className="size-5" />
                    المنتجات المشمولة (
                    {discount._count?.products ??
                      discount.products?.length ??
                      0}
                    )
                  </CardTitle>
                </div>
                <div>
                  <Button
                    variant="default"
                    className="w-full gap-2"
                    onClick={() => setIsAddProductDialogOpen(true)}
                  >
                    <Plus className="size-4" />
                    إضافة منتجات
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {discount?.products && discount.products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discount.products.map((product: any) => (
                    <div
                      key={product.product.id}
                      className="relative group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <Link
                        to={`/products/${product.product.id}`}
                        className="flex items-center gap-4 flex-1"
                      >
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
                              {product.product.price.toFixed(2)} د.ع
                            </p>
                          )}
                        </div>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRemoveProductDialog({
                            open: true,
                            productId: product.product.id,
                            productName: product.product.title,
                          });
                        }}
                        title="إزالة المنتج من الخصم"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    لا توجد منتجات مضافة إلى هذا الخصم بعد
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories in Discount */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-right flex items-center gap-2">
                    <Folder className="size-5" />
                    الفئات المشمولة (
                    {discount._count?.categories ??
                      discount.categories?.length ??
                      0}
                    )
                  </CardTitle>
                </div>
                <div>
                  <Button
                    variant="default"
                    className="w-full gap-2"
                    onClick={() => setIsAddCategoryDialogOpen(true)}
                  >
                    <Plus className="size-4" />
                    إضافة فئات
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {discount?.categories && discount.categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discount.categories.map((category: any) => (
                    <div
                      key={category.category.id}
                      className="relative group flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <Link
                        to={`/categories/${category.category.id}`}
                        className="flex items-center gap-4 flex-1"
                      >
                        <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                          {category.category.image ? (
                            <img
                              src={`${baseUrl}/${category.category.image}`}
                              alt={category.category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Folder className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                          )}
                        </div>
                        <div className="flex-1 text-right">
                          <p className="font-semibold line-clamp-1">
                            {category.category.name}
                          </p>
                        </div>
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setRemoveCategoryDialog({
                            open: true,
                            categoryId: category.category.id,
                            categoryName: category.category.name,
                          });
                        }}
                        title="إزالة الفئة من الخصم"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Folder className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    لا توجد فئات مضافة إلى هذا الخصم بعد
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
                  رقم الخصم
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{discount.id}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  نسبة الخصم
                </span>
                <div className="flex items-center gap-2">
                  <Percent className="size-5 text-primary" />
                  <span className="text-2xl font-bold">
                    {discount.discount_percentage}
                  </span>
                </div>
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
                  {statusBadge.text}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد المنتجات
                </span>
                <span className="text-sm">
                  {discount?.products?.length ?? 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  عدد الفئات
                </span>
                <span className="text-sm">
                  {discount?.categories?.length ?? 0}
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
                <Button
                  className="w-full gap-2"
                  variant="secondary"
                  onClick={() => setIsToggleDialogOpen(true)}
                >
                  <Tag className="size-4" />
                  تفعيل الخصم
                </Button>
              )}
              {isActive && (
                <Button
                  className="w-full gap-2"
                  variant="secondary"
                  onClick={() => setIsToggleDialogOpen(true)}
                >
                  <Tag className="size-4" />
                  تعطيل الخصم
                </Button>
              )}
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
                    حذف الخصم
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
            <DialogTitle className="text-right">تأكيد حذف الخصم</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف الخصم "{discount.name}"؟ لا يمكنك التراجع عن
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

      {/* Toggle Discount Dialog */}
      <ToggleDiscountDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
        discountId={id || ""}
        discountName={discount.name}
        currentStatus={discount.discount_status}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Add Products Dialog */}
      <AddDiscountProductDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        discountId={id || ""}
        existingProductIds={discount.products?.map((p: any) => p.id) || []}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Add Categories Dialog */}
      <AddDiscountCategoryDialog
        open={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        discountId={id || ""}
        existingCategoryIds={discount.categories?.map((c: any) => c.id) || []}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Remove Product Dialog */}
      <RemoveProductFromDiscountDialog
        open={removeProductDialog.open}
        onOpenChange={(open) =>
          setRemoveProductDialog((prev) => ({ ...prev, open }))
        }
        discountId={discount.id || ""}
        productId={removeProductDialog.productId}
        productName={removeProductDialog.productName}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Remove Category Dialog */}
      <RemoveCategoryFromDiscountDialog
        open={removeCategoryDialog.open}
        onOpenChange={(open) =>
          setRemoveCategoryDialog((prev) => ({ ...prev, open }))
        }
        discountId={discount.id || ""}
        categoryId={removeCategoryDialog.categoryId}
        categoryName={removeCategoryDialog.categoryName}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Discount Image Dialog */}
      {id && (
        <DiscountImageDialog
          open={isImageDialogOpen}
          onOpenChange={(open) => {
            setIsImageDialogOpen(open);
            // Refetch discount data when dialog closes to update the image
            if (!open) {
              refetch();
            }
          }}
          discountId={id}
        />
      )}
    </div>
  );
};

export default DiscountDetails;
