import { useState, useEffect } from "react";
import { useUpdateProfile, useMe } from "@/api/wrappers/auth.wrappers";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { User, Mail, Phone, MapPin } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const EditProfileDialog = ({ open, onOpenChange }: Props) => {
  const { data: user } = useMe();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    alternative_phone: "",
    location: "",
  });

  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    alternative_phone: "",
    location: "",
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.fullName || "",
        email: user.email || "",
        alternative_phone: user.alternative_phone || "",
        location: user.location || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.email !== originalData.email ||
      formData.alternative_phone !== originalData.alternative_phone ||
      formData.location !== originalData.location
    );
  };

  const handleDiscard = () => {
    if (user) {
      const resetData = {
        name: user.fullName || "",
        email: user.email || "",
        alternative_phone: user.alternative_phone || "",
        location: user.location || "",
      };
      setFormData(resetData);
      setOriginalData(resetData);
    }
    onOpenChange(false);
  };

  const handleSave = () => {
    if (!hasChanges()) {
      toast.info("لم يتم إجراء أي تغييرات");
      return;
    }

    updateProfile(
      {
        name: formData.name,
        email: formData.email,
        alternative_phone: formData.alternative_phone,
        location: formData.location,
      },
      {
        onSuccess: () => {
          toast.success("تم تحديث الملف الشخصي بنجاح");
          queryClient.invalidateQueries({ queryKey: ["auth"] });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "حدث خطأ أثناء تحديث الملف الشخصي"
          );
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] text-right">
        <DialogHeader>
          <DialogTitle className="text-right">تعديل الملف الشخصي</DialogTitle>
          <DialogDescription className="text-right">
            قم بتحديث معلوماتك الشخصية. يمكنك حفظ التغييرات أو إلغاؤها.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-right flex items-center gap-2"
            >
              <User className="size-4 text-muted-foreground" />
              الاسم
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="أدخل اسمك"
              className="text-right"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-right flex items-center gap-2"
            >
              <Mail className="size-4 text-muted-foreground" />
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="أدخل بريدك الإلكتروني"
              className="text-right"
            />
          </div>

          {/* Main Phone Field (Read-only) */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-right flex items-center gap-2"
            >
              <Phone className="size-4 text-muted-foreground" />
              الهاتف الرئيسي
            </Label>
            <Input
              id="phone"
              type="tel"
              value={user?.phone || ""}
              disabled
              readOnly
              className="text-right bg-muted cursor-not-allowed opacity-70"
            />
          </div>

          {/* Alternative Phone Field */}
          <div className="space-y-2">
            <Label
              htmlFor="alternative_phone"
              className="text-right flex items-center gap-2"
            >
              <Phone className="size-4 text-muted-foreground" />
              الهاتف البديل
            </Label>
            <Input
              id="alternative_phone"
              type="tel"
              value={formData.alternative_phone}
              onChange={(e) =>
                handleInputChange("alternative_phone", e.target.value)
              }
              placeholder="أدخل رقم الهاتف البديل"
              className="text-right"
            />
          </div>

          {/* Location Field */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-right flex items-center gap-2"
            >
              <MapPin className="size-4 text-muted-foreground" />
              الموقع
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="أدخل موقعك"
              className="text-right"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleDiscard}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || !hasChanges()}
          >
            {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
