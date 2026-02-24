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
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Loader2,
  X,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useFetchGroup,
  useDeleteGroup,
  useRemoveCategoryFromGroup,
} from "@/api/wrappers/group.wrappers";
import ErrorPage from "../../miscellaneous/ErrorPage";
import NotFoundPage from "../../miscellaneous/NotFoundPage";
import CategoryGroupsSkeleton from "./CategoryGroupsSkeleton";
import AddCategoryToGroupDialog from "./AddCategoryToGroupDialog";
import { toast } from "sonner";

const CategoryGroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [removingCategory, setRemovingCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: group,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useFetchGroup(id ?? "");

  const baseUrl =
    import.meta.env.VITE_PUBLIC_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
    "";

  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteGroup();
  const { mutate: removeCategory, isPending: isRemovingCategory } =
    useRemoveCategoryFromGroup();

  const handleDelete = () => {
    if (!id) return;

    deleteGroup(id, {
      onSuccess: () => {
        toast.success("تم حذف المجموعة بنجاح");
        navigate("/category-group", { replace: true });
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "فشل في حذف المجموعة. حاول مرة أخرى.",
        );
      },
    });
  };

  const handleRemoveCategory = (categoryId: string) => {
    if (!id) return;

    removeCategory(
      { groupId: id, categoryId },
      {
        onSuccess: () => {
          toast.success("تم إزالة الفئة من المجموعة");
          setRemovingCategory(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل في إزالة الفئة");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CategoryGroupsSkeleton count={1} showHeader={false} />
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

  const groupCategories = group?.categories ?? [];
  const totalCategories = groupCategories.length;

  if (!group) {
    return (
      <NotFoundPage
        title="المجموعة غير موجودة"
        description="المجموعة التي تبحث عنها غير موجودة أو تم حذفها."
        backTo="/category-group"
        backLabel="العودة إلى المجموعات"
      />
    );
  }

  const imageUrl = group.image
    ? group.image.startsWith("http")
      ? group.image
      : `${baseUrl}/${group.image}`
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Group Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-right">
                  {group.name}
                </CardTitle>
                {group.enabled ? (
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
                {group.description || "—"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 flex items-center justify-center w-full overflow-hidden rounded-lg bg-dark-blue/10">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={group.name}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Folder className="size-24 text-white bg-cyan/40 rounded-full p-6" />
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Folder className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">{totalCategories}</p>
                    <p className="text-sm text-muted-foreground">عدد الفئات</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <Folder className="size-6 text-primary" />
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      #{group.id.slice(0, 6)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      رقم المجموعة
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories in Group */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-right flex items-center gap-2">
                    <Folder className="size-5" />
                    الفئات في هذه المجموعة
                  </CardTitle>
                  <CardDescription className="text-right">
                    {totalCategories > 0
                      ? `${totalCategories} فئة`
                      : "لا توجد فئات في هذه المجموعة"}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsAddCategoryDialogOpen(true)}
                  variant="default"
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  إضافة فئة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {groupCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {groupCategories.map((gc: any) => {
                    const cat = gc.category;
                    if (!cat) return null;
                    return (
                      <div
                        key={cat.id}
                        className="flex justify-between items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
                      >
                        <Link
                          to={`/categories/${cat.id}`}
                          className="flex items-center gap-3 flex-1 min-w-0"
                        >
                          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-dark-blue/10 shrink-0 overflow-hidden">
                            {cat.image ? (
                              <img
                                src={`${baseUrl}/${cat.image}`}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Folder className="size-8 text-white bg-cyan/40 rounded-full p-2" />
                            )}
                          </div>
                          <div className="flex-1 text-right min-w-0">
                            <p className="font-semibold line-clamp-1">
                              {cat.name}
                            </p>
                            {cat.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </Link>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="hover:text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() =>
                            setRemovingCategory({ id: cat.id, name: cat.name })
                          }
                          disabled={isRemovingCategory}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Folder className="size-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    لا توجد فئات في هذه المجموعة
                  </p>
                  <Button
                    onClick={() => setIsAddCategoryDialogOpen(true)}
                    className="mt-4 gap-2"
                  >
                    <Plus className="size-4" />
                    إضافة فئة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  رقم المجموعة
                </span>
                <Badge variant="secondary" className="text-sm">
                  #{group.id.slice(0, 8)}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground text-right">
                  الحالة
                </span>
                {group.enabled ? (
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
                  عدد الفئات
                </span>
                <span className="text-lg font-bold">{totalCategories}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-right">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full gap-2" variant="default">
                <Link to={`/category-group/${id}/edit`}>
                  <Edit className="size-4" />
                  تعديل المجموعة
                </Link>
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
                    حذف المجموعة
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
            <DialogTitle className="text-right">تأكيد حذف المجموعة</DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من حذف المجموعة "{group.name}"؟ لا يمكنك التراجع عن
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

      {/* Add Category Dialog */}
      {id && (
        <AddCategoryToGroupDialog
          open={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
          groupId={id}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Remove Category Confirmation Dialog */}
      <Dialog
        open={!!removingCategory}
        onOpenChange={(open) => !open && setRemovingCategory(null)}
      >
        <DialogContent className="text-right">
          <DialogHeader className="text-right">
            <DialogTitle className="text-right">
              إزالة الفئة من المجموعة
            </DialogTitle>
            <DialogDescription className="text-right">
              هل أنت متأكد من إزالة "{removingCategory?.name}" من هذه المجموعة؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setRemovingCategory(null)}
              disabled={isRemovingCategory}
            >
              إلغاء
            </Button>
            <Button
              onClick={() =>
                removingCategory && handleRemoveCategory(removingCategory.id)
              }
              variant="destructive"
              disabled={isRemovingCategory}
            >
              {isRemovingCategory ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  جاري الإزالة...
                </>
              ) : (
                "تأكيد الإزالة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryGroupDetails;
