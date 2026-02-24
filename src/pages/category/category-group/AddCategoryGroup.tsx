import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import { useCreateGroup } from "@/api/wrappers/group.wrappers";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const AddCategoryGroup = () => {
  const navigate = useNavigate();
  const { mutate: createGroup, isPending: isCreating } = useCreateGroup();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [enabled, setEnabled] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("الاسم مطلوب");
      return;
    }

    createGroup(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
        enabled,
      },
      {
        onSuccess: (data) => {
          toast.success("تم إنشاء المجموعة بنجاح");
          navigate(`/category-group/${data.id}`, { replace: true });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل في إنشاء المجموعة"
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/category-group">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">إضافة مجموعة جديدة</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المجموعة"
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الوصف</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف المجموعة"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">رابط الصورة</label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">مفعّل</label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                حفظ
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/category-group">إلغاء</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCategoryGroup;
