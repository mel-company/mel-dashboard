import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Store, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import { useUpdateStoreDetails } from "@/api/wrappers/settings.wrappers";
import { CURRENCY, LANGUAGE, TIMEZONE } from "@/utils/constants";
import { sanitizePhoneNumber } from "@/utils/helpers";
import DetailsSettingsSkeleton from "./DetailsSettingsSkeleton";
import LogoDialog from "./LogoDialog";
import PhoneNumberDialog from "./PhoneNumberDialog";

type Props = {};

const DetailsSettings = ({}: Props) => {
  const { data: storeDetails, isLoading } = useFetchStoreDetails();
  const { mutate: updateStoreDetails, isPending: isUpdating } =
    useUpdateStoreDetails();

  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    businessEmail: "",
    businessPhone: "",
    physicalAddress: "",
    timezone: TIMEZONE.BAGHDAD,
    currency: CURRENCY.IQD,
    language: LANGUAGE.AR,
  });

  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  // @ts-ignore
  const [favicon, setFavicon] = useState<File | null>(null);
  const [phoneNumberDialogOpen, setPhoneNumberDialogOpen] = useState(false);

  // Populate form when store details are loaded
  useEffect(() => {
    if (storeDetails) {
      // Map timezone value to enum
      const timezoneValue =
        storeDetails.timezone === TIMEZONE.BAGHDAD ||
        storeDetails.timezone === TIMEZONE.DUBAI ||
        storeDetails.timezone === TIMEZONE.RIYADH
          ? (storeDetails.timezone as TIMEZONE)
          : TIMEZONE.BAGHDAD;

      // Map currency value to enum
      const currencyValue =
        storeDetails.currency === CURRENCY.IQD ||
        storeDetails.currency === CURRENCY.USD ||
        storeDetails.currency === CURRENCY.EUR
          ? (storeDetails.currency as CURRENCY)
          : CURRENCY.IQD;

      // Map language value to enum
      const languageValue =
        storeDetails.language === LANGUAGE.AR ||
        storeDetails.language === LANGUAGE.EN ||
        storeDetails.language === LANGUAGE.KU
          ? (storeDetails.language as LANGUAGE)
          : LANGUAGE.AR;

      setFormData({
        storeName: storeDetails.name || "",
        storeDescription: storeDetails.description || "",
        businessEmail: storeDetails.email || "",
        businessPhone: storeDetails.phone,
        physicalAddress: storeDetails.location || "",
        timezone: timezoneValue,
        currency: currencyValue,
        language: languageValue,
      });
    }
  }, [storeDetails]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the update data
    const updateData: any = {
      name: formData.storeName,
      description: formData.storeDescription,
      email: formData.businessEmail,
      location: formData.physicalAddress,
    };

    // Sanitize and add phone number if provided
    if (formData.businessPhone) {
      try {
        const sanitizedPhone = sanitizePhoneNumber(
          formData.businessPhone,
          "+964"
        );
        updateData.phone = sanitizedPhone;
      } catch (error: any) {
        toast.error(
          error?.message ||
            "رقم الهاتف غير صحيح. يجب أن يبدأ بـ 7 ويتكون من 10 أرقام"
        );
        return;
      }
    }

    // Add logo if a new one was uploaded (this would need file upload handling)
    // For now, we'll skip logo update as it requires multipart/form-data

    // Call the update mutation
    updateStoreDetails(updateData, {
      onSuccess: () => {
        toast.success("تم حفظ الإعدادات بنجاح");
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message ||
            "حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى"
        );
      },
    });
  };

  // Show skeleton while loading
  if (isLoading) {
    return <DetailsSettingsSkeleton />;
  }

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات المتجر</h1>
        <p className="text-muted-foreground mt-1">
          قم بتحديث معلومات المتجر الأساسية والهوية التجارية
        </p>
      </div>


      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>شعار المتجر</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLogoDialogOpen(true)}
                className="relative group cursor-pointer"
              >
                {storeDetails?.logo ? (
                  <img
                    src={storeDetails.logo}
                    alt="Store Logo"
                    className="w-20 h-20 object-cover rounded-lg border transition-opacity group-hover:opacity-80"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-80">
                    <Store className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    تعديل
                  </span>
                </div>
              </button>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  اضغط على الشعار لإدارته
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG حتى 2MB
                </p>
              </div>
            </div>
          </div>

          {/* <div className="space-y-2">
                <Label>أيقونة الموقع (Favicon)</Label>
                <div className="flex items-center gap-4">
                  {favicon ? (
                    <img
                      src={URL.createObjectURL(favicon)}
                      alt="Favicon"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : storeDetails?.fav_icon ? (
                    <img
                      src={storeDetails.fav_icon}
                      alt="Favicon"
                      className="w-16 h-16 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Globe className="size-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="favicon"
                      className="cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <Upload className="size-4" />
                      اختر أيقونة
                    </Label>
                    <Input
                      id="favicon"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "favicon")}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      ICO, PNG حتى 512KB
                    </p>
                  </div>
                </div>
              </div> */}
        </div>

        {/* Store Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-5" />
              هوية المتجر
            </CardTitle>
            <CardDescription>
              المعلومات الأساسية التي تظهر للعملاء
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">اسم المتجر *</Label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                placeholder={storeDetails?.name || "أدخل اسم المتجر"}
                required
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storeDescription">وصف المتجر</Label>
              <Textarea
                id="storeDescription"
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                placeholder={
                  storeDetails?.description || "أدخل وصفاً مختصراً عن المتجر"
                }
                rows={4}
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              معلومات الاتصال
            </CardTitle>
            <CardDescription>
              معلومات التواصل مع العملاء والدعم الفني
            </CardDescription>
              </div>
            <PhoneNumberDialog open={phoneNumberDialogOpen} onOpenChange={setPhoneNumberDialogOpen} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessEmail">البريد الإلكتروني *</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="businessEmail"
                    name="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    placeholder="info@store.com"
                    required
                    className="text-right pr-10"
                  />
                </div>
              </div>

              {/* <div>
                <PhoneNumberInput
                  value={formData.businessPhone}
                  onChange={(phone) => {
                    const digitsOnly = phone.replace(/\D/g, "");
                    const phoneDigits =
                      digitsOnly.length > 10
                        ? digitsOnly.slice(-10)
                        : digitsOnly;
                    setFormData((prev) => ({
                      ...prev,
                      businessPhone: phoneDigits,
                    }));
                  }}
                  placeholder="750 123 4567"
                  required
                  className="text-right pr-10"
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="businessPhone">رقم الهاتف *</Label>
                <div className="relative">
                  <Input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    placeholder="7xx xxx xxxx"
                    required
                    className="text-left pl-20"
                  />
                  <div className="flex items-center justify-center gap-x-2 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    964+
                    <Phone className="size-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicalAddress">العنوان الفعلي</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 text-muted-foreground size-4" />
                <Textarea
                  id="physicalAddress"
                  name="physicalAddress"
                  value={formData.physicalAddress}
                  onChange={handleInputChange}
                  placeholder="أدخل العنوان الكامل للمتجر"
                  rows={3}
                  className="text-right pr-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regional Settings
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              الإعدادات الإقليمية
            </CardTitle>
            <CardDescription>إعدادات المنطقة واللغة والعملة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">المنطقة الزمنية</Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      timezone: e.target.value as TIMEZONE,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
                >
                  <option value={TIMEZONE.BAGHDAD}>بغداد (UTC+3)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">العملة</Label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency: e.target.value as CURRENCY,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-right"
                  >
                    <option value={CURRENCY.IQD}>دينار عراقي (IQD)</option>
                    <option value={CURRENCY.USD}>دولار أمريكي (USD)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">اللغة</Label>
                <div className="relative">
                  <Languages className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        language: e.target.value as LANGUAGE,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-right"
                  >
                    <option value={LANGUAGE.AR}>العربية</option>
                    <option value={LANGUAGE.EN}>English</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}


        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" disabled={isUpdating}>
            إلغاء
          </Button>
          <Button type="submit" className="gap-2" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="size-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>
      </form>


      {/* Logo Dialog */}
      <LogoDialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen} />

      {/* Temporary Code */}
      <PhoneNumberDialog open={phoneNumberDialogOpen} onOpenChange={setPhoneNumberDialogOpen} />
      {/* Temporary Code */}

    </div>
  );
};

export default DetailsSettings;
