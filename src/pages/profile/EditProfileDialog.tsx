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
import { sanitizePhoneNumber } from "@/utils/helpers";

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

  // Helper function to remove country code from phone number
  const removeCountryCode = (phone: string): string => {
    if (!phone) return "";
    // Remove +964 prefix if present
    if (phone.startsWith("+964")) {
      return phone.replace("+964", "");
    }
    if (phone.startsWith("964")) {
      return phone.replace("964", "");
    }
    return phone;
  };

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.fullName || "",
        email: user.email || "",
        alternative_phone: removeCountryCode(user.alternative_phone || ""),
        location: user.location || "",
      };
      setFormData(initialData);
      setOriginalData(initialData);
    }
  }, [user, open]);

  const handleInputChange = (field: string, value: string) => {
    // Special handling for alternative_phone to only allow digits and validate format
    if (field === "alternative_phone") {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      // Only allow if it starts with 7 and is max 10 digits
      if (digitsOnly.length === 0) {
        setFormData((prev) => ({
          ...prev,
          [field]: "",
        }));
        return;
      }

      // Must start with 7
      if (digitsOnly.length > 0 && !digitsOnly.startsWith("7")) {
        return; // Don't update if it doesn't start with 7
      }

      // Limit to 10 digits
      if (digitsOnly.length > 10) {
        return; // Don't update if more than 10 digits
      }

      setFormData((prev) => ({
        ...prev,
        [field]: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
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
        alternative_phone: removeCountryCode(user.alternative_phone || ""),
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

    // Validate alternative_phone if provided
    let alternativePhoneToSend = formData.alternative_phone;
    if (formData.alternative_phone) {
      try {
        // Validate and sanitize the phone number
        alternativePhoneToSend = sanitizePhoneNumber(
          formData.alternative_phone,
          "+964"
        );
      } catch (error: any) {
        toast.error(error.message || "رقم الهاتف البديل غير صحيح");
        return;
      }
    }

    updateProfile(
      {
        name: formData.name,
        email: formData.email,
        alternative_phone: alternativePhoneToSend,
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
            <div className="relative flex items-center">
              <span className="absolute left-3 text-sm text-muted-foreground pointer-events-none">
                +964
              </span>
              <Input
                id="alternative_phone"
                type="tel"
                value={formData.alternative_phone}
                onChange={(e) =>
                  handleInputChange("alternative_phone", e.target.value)
                }
                placeholder="7XXXXXXXXX"
                className="text-left pl-15"
                maxLength={10}
              />
            </div>
            {formData.alternative_phone && (
              <p className="text-xs text-muted-foreground text-right">
                {formData.alternative_phone.length}/10 أرقام
                {!formData.alternative_phone.startsWith("7") && (
                  <span className="text-destructive block mt-1">
                    يجب أن يبدأ الرقم بـ 7
                  </span>
                )}
              </p>
            )}
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
