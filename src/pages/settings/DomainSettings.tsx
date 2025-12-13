import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Lock,
  ExternalLink,
  RefreshCw,
  Save,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type Props = {};

const DomainSettings = ({}: Props) => {
  const [domainSettings, setDomainSettings] = useState({
    customDomain: "",
    subdomain: "",
    wwwRedirect: "www",
    sslEnabled: true,
    sslStatus: "active", // active, pending, expired
    urlSlugRules: "lowercase",
    maintenanceMode: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDomainSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDomainSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: keyof typeof domainSettings) => {
    setDomainSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleVerifySSL = () => {
    // TODO: Verify SSL certificate
    toast.info("جارٍ التحقق من شهادة SSL...");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ إعدادات النطاق بنجاح");
  };

  const getSSLStatusBadge = () => {
    switch (domainSettings.sslStatus) {
      case "active":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="size-3" />
            نشط
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="size-3" />
            قيد الانتظار
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3" />
            منتهي الصلاحية
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 min-h-full pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات النطاق</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين النطاق وعناوين URL للمتجر
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Custom Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              النطاق المخصص
            </CardTitle>
            <CardDescription>
              ربط نطاق مخصص بمتجرك (مثل: store.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customDomain">النطاق المخصص</Label>
              <Input
                id="customDomain"
                name="customDomain"
                value={domainSettings.customDomain}
                onChange={handleInputChange}
                placeholder="store.com"
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                أدخل النطاق بدون http:// أو https://
              </p>
            </div>

            {domainSettings.customDomain && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">تعليمات الإعداد:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>أضف سجل A في DNS الخاص بك يشير إلى: 192.0.2.1</li>
                  <li>أو أضف سجل CNAME يشير إلى: yourstore.platform.com</li>
                  <li>انتظر حتى يتم التحقق من النطاق (قد يستغرق 24-48 ساعة)</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subdomain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              النطاق الفرعي
            </CardTitle>
            <CardDescription>النطاق الفرعي الافتراضي للمتجر</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">النطاق الفرعي</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  name="subdomain"
                  value={domainSettings.subdomain}
                  onChange={handleInputChange}
                  placeholder="mystore"
                  className="text-right"
                />
                <span className="text-muted-foreground whitespace-nowrap">
                  .yoursaas.com
                </span>
              </div>
              {domainSettings.subdomain && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="size-4" />
                  <a
                    href={`https://${domainSettings.subdomain}.yoursaas.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    https://{domainSettings.subdomain}.yoursaas.com
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* WWW Redirect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              إعادة توجيه WWW
            </CardTitle>
            <CardDescription>اختيار إعادة توجيه www أو غير www</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="wwwRedirect">خيار إعادة التوجيه</Label>
              <select
                id="wwwRedirect"
                name="wwwRedirect"
                value={domainSettings.wwwRedirect}
                onChange={handleSelectChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
              >
                <option value="www">إعادة توجيه إلى www (www.store.com)</option>
                <option value="non-www">
                  إعادة توجيه إلى غير www (store.com)
                </option>
                <option value="none">لا يوجد إعادة توجيه</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* SSL Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-5" />
              شهادة SSL
            </CardTitle>
            <CardDescription>تشفير الاتصال بين المتجر والعملاء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل SSL</Label>
                <p className="text-sm text-muted-foreground">
                  تشفير الاتصال باستخدام HTTPS
                </p>
              </div>
              <Switch
                checked={domainSettings.sslEnabled}
                onCheckedChange={() => handleToggle("sslEnabled")}
              />
            </div>

            {domainSettings.sslEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">حالة SSL</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      آخر تحديث: منذ ساعتين
                    </p>
                  </div>
                  {getSSLStatusBadge()}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerifySSL}
                  className="gap-2"
                >
                  <RefreshCw className="size-4" />
                  التحقق من SSL
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* URL Slug Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5" />
              قواعد عناوين URL
            </CardTitle>
            <CardDescription>
              تنسيق الروابط الداخلية للمنتجات والصفحات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="urlSlugRules">تنسيق الروابط</Label>
              <select
                id="urlSlugRules"
                name="urlSlugRules"
                value={domainSettings.urlSlugRules}
                onChange={handleSelectChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
              >
                <option value="lowercase">أحرف صغيرة (product-name)</option>
                <option value="uppercase">أحرف كبيرة (PRODUCT-NAME)</option>
                <option value="preserve">الحفاظ على الحالة الأصلية</option>
              </select>
              <p className="text-xs text-muted-foreground">
                سيتم تطبيق هذا التنسيق على جميع الروابط الجديدة
              </p>
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

export default DomainSettings;
