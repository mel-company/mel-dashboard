import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Save, Loader2, Folder, ArrowRight } from "lucide-react";
import { useFetchGroup, useUpdateGroup } from "@/api/wrappers/group.wrappers";
import ErrorPage from "../../miscellaneous/ErrorPage";
import { toast } from "sonner";
import CategoryGroupsSkeleton from "./CategoryGroupsSkeleton";

const EditCategoryGroup = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error, refetch, isFetching } = useFetchGroup(
    id ?? "",
    !!id,
  );

  const { mutate: updateGroup, isPending: isUpdating } = useUpdateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [enabled, setEnabled] = useState(true);

  const baseUrl =
    import.meta.env.VITE_PUBLIC_URL ||
    import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") ||
    "";

  useEffect(() => {
    if (data) {
      setName(data.name ?? "");
      setDescription(data.description ?? "");
      setImage(data.image ?? "");
      setEnabled(data.enabled ?? true);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("معرف المجموعة غير موجود");
      return;
    }

    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }

    updateGroup(
      {
        id,
        data: {
          name: name.trim(),
          description: description.trim() || undefined,
          image: image.trim() || undefined,
          enabled,
        },
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث المجموعة بنجاح");
          navigate(`/category-group/${id}`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "فشل تحديث المجموعة");
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

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">المجموعة غير موجودة</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/category-group">العودة إلى المجموعات</Link>
        </Button>
      </div>
    );
  }

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${baseUrl}/${image}`
    : null;

  return (
    <div className="mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/category-group/${id}`}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">تعديل المجموعة</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Image URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                رابط الصورة
              </label>
              <div className="flex gap-4">
                <div className="w-32 h-32 flex items-center justify-center bg-muted rounded-lg overflow-hidden shrink-0">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Folder className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <Input
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-right"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                اسم المجموعة *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم المجموعة"
                required
                className="text-right"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">
                الوصف
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المجموعة"
                className="text-right"
              />
            </div>

            {/* Enabled Switch */}
            <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-secondary/50">
              <label className="text-sm font-medium text-right cursor-pointer flex-1">
                تفعيل المجموعة
              </label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            asChild
            disabled={isUpdating}
          >
            <Link to={`/category-group/${id}`}>إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isUpdating} className="gap-2">
            {isUpdating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <Save className="size-4" />
                تحديث المجموعة
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryGroup;
