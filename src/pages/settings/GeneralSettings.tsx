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
import {
  Settings,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Save,
} from "lucide-react";
import { toast } from "sonner";

type Props = {};

const GeneralSettings = ({}: Props) => {
  const [settings, setSettings] = useState({
    // Products & Inventory
    defaultProductStatus: "draft",
    inventoryTracking: true,
    lowStockThreshold: 10,
    allowBackorders: false,
    variantLimit: 100,
    enableProductReviews: true,

    // Pricing & Tax
    taxInclusive: false,
    discountStacking: true,

    // Orders
    orderNumberFormat: "ORD-{YYYY}-{MM}-{####}",
    autoConfirmOrders: false,
    autoCancelUnpaidHours: 24,
    allowOrderEditing: false,

    // Customers
    guestCheckout: true,
    requireAccount: false,
    emailVerification: false,
    minPasswordLength: 8,

    // Maintenance
    maintenanceMode: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]:
        typeof prev[name as keyof typeof settings] === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ الإعدادات بنجاح");
  };

  return (
    <div className="space-y-6 min-h-screen pb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات العامة</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين الإعدادات العامة للمتجر والمنتجات والطلبات
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Products & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              المنتجات والمخزون
            </CardTitle>
            <CardDescription>إعدادات المنتجات وإدارة المخزون</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultProductStatus">
                حالة المنتج الافتراضية
              </Label>
              <select
                id="defaultProductStatus"
                name="defaultProductStatus"
                value={settings.defaultProductStatus}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
              >
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تتبع المخزون</Label>
                <p className="text-sm text-muted-foreground">
                  تتبع الكميات المتاحة للمنتجات
                </p>
              </div>
              <Switch
                checked={settings.inventoryTracking}
                onCheckedChange={() => handleToggle("inventoryTracking")}
              />
            </div>

            {settings.inventoryTracking && (
              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">
                  حد تنبيه المخزون المنخفض
                </Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={handleInputChange}
                  min={1}
                  className="text-right"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بالطلبات المسبقة</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بالطلب عند نفاد المخزون
                </p>
              </div>
              <Switch
                checked={settings.allowBackorders}
                onCheckedChange={() => handleToggle("allowBackorders")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variantLimit">حد المتغيرات للمنتج</Label>
              <Input
                id="variantLimit"
                name="variantLimit"
                type="number"
                value={settings.variantLimit}
                onChange={handleInputChange}
                min={1}
                className="text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل تقييمات المنتجات</Label>
                <p className="text-sm text-muted-foreground">
                  السماح للعملاء بتقييم المنتجات
                </p>
              </div>
              <Switch
                checked={settings.enableProductReviews}
                onCheckedChange={() => handleToggle("enableProductReviews")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Tax */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="size-5" />
              الأسعار والضرائب
            </CardTitle>
            <CardDescription>
              إعدادات الأسعار والضرائب والخصومات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الأسعار شاملة الضريبة</Label>
                <p className="text-sm text-muted-foreground">
                  تضمين الضريبة في السعر المعروض
                </p>
              </div>
              <Switch
                checked={settings.taxInclusive}
                onCheckedChange={() => handleToggle("taxInclusive")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تراكم الخصومات</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بجمع عدة خصومات على نفس المنتج
                </p>
              </div>
              <Switch
                checked={settings.discountStacking}
                onCheckedChange={() => handleToggle("discountStacking")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              الطلبات
            </CardTitle>
            <CardDescription>إعدادات معالجة الطلبات والفواتير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumberFormat">تنسيق رقم الطلب</Label>
              <Input
                id="orderNumberFormat"
                name="orderNumberFormat"
                value={settings.orderNumberFormat}
                onChange={handleInputChange}
                placeholder="ORD-{YYYY}-{MM}-{####}"
                className="text-right"
              />
              <p className="text-xs text-muted-foreground">
                استخدم {"{YYYY}"} للسنة، {"{MM}"} للشهر، {"{####}"} للرقم
                التسلسلي
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تأكيد الطلبات تلقائياً</Label>
                <p className="text-sm text-muted-foreground">
                  تأكيد الطلبات فور استلامها
                </p>
              </div>
              <Switch
                checked={settings.autoConfirmOrders}
                onCheckedChange={() => handleToggle("autoConfirmOrders")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="autoCancelUnpaidHours">
                إلغاء الطلبات غير المدفوعة بعد (ساعة)
              </Label>
              <Input
                id="autoCancelUnpaidHours"
                name="autoCancelUnpaidHours"
                type="number"
                value={settings.autoCancelUnpaidHours}
                onChange={handleInputChange}
                min={1}
                className="text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بتعديل الطلبات</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بتعديل الطلبات بعد الشراء
                </p>
              </div>
              <Switch
                checked={settings.allowOrderEditing}
                onCheckedChange={() => handleToggle("allowOrderEditing")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              العملاء
            </CardTitle>
            <CardDescription>إعدادات حسابات العملاء والدفع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>الدفع كضيف</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بالشراء دون إنشاء حساب
                </p>
              </div>
              <Switch
                checked={settings.guestCheckout}
                onCheckedChange={() => handleToggle("guestCheckout")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>يتطلب حساب للشراء</Label>
                <p className="text-sm text-muted-foreground">
                  إجبار العملاء على إنشاء حساب
                </p>
              </div>
              <Switch
                checked={settings.requireAccount}
                onCheckedChange={() => handleToggle("requireAccount")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>التحقق من البريد الإلكتروني</Label>
                <p className="text-sm text-muted-foreground">
                  إرسال رابط التحقق عند التسجيل
                </p>
              </div>
              <Switch
                checked={settings.emailVerification}
                onCheckedChange={() => handleToggle("emailVerification")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPasswordLength">
                الحد الأدنى لطول كلمة المرور
              </Label>
              <Input
                id="minPasswordLength"
                name="minPasswordLength"
                type="number"
                value={settings.minPasswordLength}
                onChange={handleInputChange}
                min={6}
                max={32}
                className="text-right"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5" />
              وضع الصيانة
            </CardTitle>
            <CardDescription>إخفاء المتجر عن العملاء للصيانة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل وضع الصيانة</Label>
                <p className="text-sm text-muted-foreground">
                  إخفاء المتجر عن جميع الزوار باستثناء المسؤولين
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={() => handleToggle("maintenanceMode")}
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

export default GeneralSettings;
