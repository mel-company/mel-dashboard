import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Ticket,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  Users,
  DollarSign,
  Tag,
  Package,
  ShoppingCart,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import {
  useFetchCoupon,
  useDeleteCoupon,
} from "@/api/wrappers/coupon.wrappers";
import ErrorPage from "../miscellaneous/ErrorPage";
import NotFoundPage from "../miscellaneous/NotFoundPage";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CouponDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { data, isLoading, error, refetch, isFetching } = useFetchCoupon(
    id ?? "",
    !!id
  );

  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopyCode = async () => {
    if (!data?.code) return;

    try {
      await navigator.clipboard.writeText(data.code);
      setIsCopied(true);
      toast.success("تم نسخ رمز الكوبون بنجاح");
    } catch (err) {
      toast.error("فشل في نسخ رمز الكوبون");
    }
  };

  const handleDelete = () => {
    if (!id) return;

    deleteCoupon(id, {
      onSuccess: () => {
        toast.success("تم حذف الكوبون بنجاح");
        navigate("/coupons", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "فشل في حذف الكوبون. حاول مرة أخرى."
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
        title="الكوبون غير موجود"
        description="الكوبون الذي تبحث عنه غير موجود أو تم حذفه."
        backTo="/coupons"
        backLabel="العودة إلى الكوبونات"
      />
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  const formatCouponValue = () => {
    if (data.type === "PERCENTAGE") {
      return `${data.value}%`;
    } else if (data.type === "FIXED") {
      return `${data.value} د.ع`;
    }
    return data.value;
  };

  const formatAppliesTo = () => {
    const map: Record<string, string> = {
      ALL: "الكل",
      PRODUCT: "منتج",
      CATEGORY: "فئة",
    };
    return map[data.appliesTo] || data.appliesTo;
  };

  const isExpired = () => {
    if (!data.expiresAt) return false;
    return new Date(data.expiresAt) < new Date();
  };

  const isNotStarted = () => {
    if (!data.startsAt) return false;
    return new Date(data.startsAt) > new Date();
  };

  const getStatusBadge = () => {
    if (!data.isActive) {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="size-3" />
          غير مفعل
        </Badge>
      );
    }
    if (isExpired()) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="size-3" />
          منتهي
        </Badge>
      );
    }
    if (isNotStarted()) {
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="size-3" />
          لم يبدأ
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="gap-1">
        <CheckCircle2 className="size-3" />
        نشط
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Main Coupon Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Coupon Header */}
          <Card>
            <CardHeader>
              <div className="flex gap-x-2 items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex text-2xl text-right items-center gap-2">
                      <Ticket className="size-6 text-primary" />
                      {data.code}
                    </div>
                    <Button
                      variant={isCopied ? "default" : "secondary"}
                      size="sm"
                      className="gap-2 cursor-pointer"
                      onClick={handleCopyCode}
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-4" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          <span>نسخ الرمز</span>
                        </>
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription className="flex flex-col text-right mt-2">
                    <span>{getStatusBadge()}</span>
                    <p>
                    {data.description || "لا يوجد وصف"}
                    </p>
                  </CardDescription>
                </div>
                <div className="flex gap-x-2 items-center">
                  {/* {getStatusBadge()} */}
                  {
                    data.isActive && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <XCircle className="size-4" />
                      تعطيل
                    </Button>
                    )
                  }
                  {
                  !data.isActive && (
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-2 bg-green-600 text-white"
                    >
                      <CheckCircle2 className="size-4" />
                      تفعيل
                    </Button>
                    )
                  }

                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(`/coupons/${id}/edit`)}
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
              {/* Coupon Visual */}
              <div className="relative h-48 flex items-center justify-center w-full overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="text-center space-y-2">
                  <Ticket className="size-20 text-primary mx-auto" />
                  <div className="text-3xl font-bold text-primary">
                    {formatCouponValue()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatAppliesTo()}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Discount Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      نوع الخصم
                    </span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {data.type === "PERCENTAGE" ? "نسبة مئوية" : "مبلغ ثابت"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      قيمة الخصم
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatCouponValue()}
                  </span>
                </div>

                {data.maxDiscount && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        الحد الأقصى للخصم
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {data.maxDiscount} د.ع
                    </span>
                  </div>
                )}

                {data.minOrderTotal && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        الحد الأدنى للطلب
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {data.minOrderTotal} د.ع
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Usage Statistics */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      عدد الاستخدامات
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      {data.usedCount || 0}
                    </span>
                    {data.usageLimit && (
                      <span className="text-sm text-muted-foreground">
                        / {data.usageLimit}
                      </span>
                    )}
                  </div>
                </div>

                {data.perUserLimit && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        الحد الأقصى لكل مستخدم
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {data.perUserLimit} استخدام
                    </span>
                  </div>
                )}

                {data._count?.redemptions !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        إجمالي الاستخدامات
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {data._count.redemptions} استخدام
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Dates */}
              <div className="space-y-4">
                {data.startsAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        تاريخ البدء
                      </span>
                    </div>
                    <span className="text-sm">{formatDate(data.startsAt)}</span>
                  </div>
                )}

                {data.expiresAt && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        تاريخ الانتهاء
                      </span>
                    </div>
                    <span className="text-sm">{formatDate(data.expiresAt)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      تاريخ الإنشاء
                    </span>
                  </div>
                  <span className="text-sm">{formatDate(data.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      آخر تحديث
                    </span>
                  </div>
                  <span className="text-sm">{formatDate(data.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          {data.appliesTo === "PRODUCT" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Package className="size-5" />
                  المنتجات المطبقة عليها
                  {data._count?.products !== undefined && (
                    <Badge variant="secondary" className="text-sm">
                      {data._count.products}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-right">
                  المنتجات التي يمكن تطبيق هذا الكوبون عليها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.products && data.products.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.products.map((item: any) => (
                      <Link
                        key={item.product.id}
                        to={`/products/${item.product.id}`}
                        className="inline-block"
                      >
                        <Badge
                          variant="default"
                          className="group text-sm gap-x-2 flex cursor-pointer hover:bg-primary/95 transition-colors"
                        >
                          <p className="group-hover:underline">
                            {item.product.title}
                          </p>
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">لا توجد منتجات مرتبطة بهذا الكوبون</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Categories */}
          {data.appliesTo === "CATEGORY" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <Tag className="size-5" />
                  الفئات المطبقة عليها
                  {data._count?.categories !== undefined && (
                    <Badge variant="secondary" className="text-sm">
                      {data._count.categories}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-right">
                  الفئات التي يمكن تطبيق هذا الكوبون عليها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.categories && data.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.categories.map((item: any) => (
                      <Link
                        key={item.category.id}
                        to={`/categories/${item.category.id}`}
                        className="inline-block"
                      >
                        <Badge
                          variant="default"
                          className="group text-sm gap-x-2 flex cursor-pointer hover:bg-primary/95 transition-colors"
                        >
                          <p className="group-hover:underline">
                            {item.category.name}
                          </p>
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">لا توجد فئات مرتبطة بهذا الكوبون</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Redemptions */}
          {data.redemptions && data.redemptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right flex items-center gap-2">
                  <CheckCircle2 className="size-5" />
                  الاستخدامات الأخيرة
                </CardTitle>
                <CardDescription className="text-right">
                  آخر 10 استخدامات للكوبون
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.redemptions.map((redemption: any) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            خصم: {redemption.discount} د.ع
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(redemption.createdAt)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        طلب #{redemption.orderId.slice(0, 8)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">تأكيد حذف الكوبون</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف الكوبون "{data.code}"؟ لا يمكنك التراجع عن هذا
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
    </div>
  );
};

export default CouponDetails;
