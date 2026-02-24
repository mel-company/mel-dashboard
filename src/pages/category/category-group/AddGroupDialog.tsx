import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Save, X, Loader2 } from "lucide-react";
import { useCreateGroup } from "@/api/wrappers/group.wrappers";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const AddGroupDialog = ({ open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [enabled, setEnabled] = useState(true);

  const { mutate: createGroup, isPending } = useCreateGroup();

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
          toast.success("تم إضافة المجموعة بنجاح");
          setName("");
          setDescription("");
          setImage("");
          setEnabled(true);
          onOpenChange(false);
          navigate(`/category-group/${data.id}`);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "فشل في إضافة المجموعة. حاول مرة أخرى."
          );
        },
      }
    );
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setImage("");
    setEnabled(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">إضافة مجموعة جديدة</DialogTitle>
          <DialogDescription className="text-right">
            املأ المعلومات التالية لإضافة مجموعة جديدة
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="group-name"
              className="text-sm font-medium text-right block"
            >
              اسم المجموعة *
            </label>
            <Input
              id="group-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم المجموعة"
              required
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="group-description"
              className="text-sm font-medium text-right block"
            >
              الوصف
            </label>
            <Input
              id="group-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف المجموعة"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="group-image"
              className="text-sm font-medium text-right block"
            >
              رابط الصورة (اختياري)
            </label>
            <Input
              id="group-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="text-right"
            />
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-secondary/50">
            <label className="text-sm font-medium text-right cursor-pointer flex-1">
              تفعيل المجموعة
            </label>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="gap-2"
              disabled={isPending}
            >
              <X className="size-4" />
              إلغاء
            </Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "جاري الحفظ..." : "حفظ المجموعة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupDialog;
