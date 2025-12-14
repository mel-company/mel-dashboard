import { useState } from "react";
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
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Languages,
  FileText,
  Upload,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type Props = {};

const DetailsSettings = ({}: Props) => {
  const [formData, setFormData] = useState({
    storeName: "",
    storeDescription: "",
    businessEmail: "",
    businessPhone: "",
    physicalAddress: "",
    timezone: "Asia/Baghdad",
    currency: "IQD",
    language: "ar",
    taxId: "",
    vatNumber: "",
    invoiceFooter: "",
  });

  const [storeLogo, setStoreLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "logo") {
        setStoreLogo(file);
      } else {
        setFavicon(file);
      }
      toast.success(`تم رفع ${type === "logo" ? "الشعار" : "الأيقونة"} بنجاح`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات المتجر</h1>
        <p className="text-muted-foreground mt-1">
          قم بتحديث معلومات المتجر الأساسية والهوية التجارية
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="أدخل اسم المتجر"
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
                placeholder="أدخل وصفاً مختصراً عن المتجر"
                rows={4}
                className="text-right"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>شعار المتجر</Label>
                <div className="flex items-center gap-4">
                  {storeLogo ? (
                    <img
                      src={URL.createObjectURL(storeLogo)}
                      alt="Store Logo"
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                      <Store className="size-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label
                      htmlFor="storeLogo"
                      className="cursor-pointer flex items-center gap-2 text-sm"
                    >
                      <Upload className="size-4" />
                      اختر صورة
                    </Label>
                    <Input
                      id="storeLogo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "logo")}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG حتى 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>أيقونة الموقع (Favicon)</Label>
                <div className="flex items-center gap-4">
                  {favicon ? (
                    <img
                      src={URL.createObjectURL(favicon)}
                      alt="Favicon"
                      className="w-16 h-16 object-cover rounded-lg border"
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              معلومات الاتصال
            </CardTitle>
            <CardDescription>
              معلومات التواصل مع العملاء والدعم الفني
            </CardDescription>
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

              <div className="space-y-2">
                <Label htmlFor="businessPhone">رقم الهاتف *</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
                  <Input
                    id="businessPhone"
                    name="businessPhone"
                    type="tel"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    placeholder="+964 750 123 4567"
                    required
                    className="text-right pr-10"
                  />
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

        {/* Regional Settings */}
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
                      timezone: e.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
                >
                  <option value="Asia/Baghdad">بغداد (GMT+3)</option>
                  <option value="Asia/Dubai">دبي (GMT+4)</option>
                  <option value="Asia/Riyadh">الرياض (GMT+3)</option>
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
                        currency: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-right"
                  >
                    <option value="IQD">دينار عراقي (IQD)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="EUR">يورو (EUR)</option>
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
                        language: e.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-right"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                    <option value="ku">کوردی</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Legal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              الضرائب والمعلومات القانونية
            </CardTitle>
            <CardDescription>معلومات الضرائب والهوية الضريبية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">الرقم الضريبي</Label>
                <Input
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم الضريبي"
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatNumber">
                  رقم ضريبة القيمة المضافة (VAT)
                </Label>
                <Input
                  id="vatNumber"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم VAT"
                  className="text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceFooter">معلومات تذييل الفاتورة</Label>
              <Textarea
                id="invoiceFooter"
                name="invoiceFooter"
                value={formData.invoiceFooter}
                onChange={handleInputChange}
                placeholder="معلومات إضافية تظهر في أسفل الفواتير (مثل: شكراً لشرائك منا)"
                rows={3}
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            إلغاء
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="size-4" />
            حفظ الإعدادات
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DetailsSettings;
