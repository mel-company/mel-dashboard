import { useState, useEffect, useRef } from "react";
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
import { Settings, ShoppingCart, Package, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useUpdateGeneralSettings,
  useFetchCurrentSettings,
} from "@/api/wrappers/settings.wrappers";
import { PRODUCT_STATUS } from "@/utils/constants";

type Props = {};

const GeneralSettings = ({}: Props) => {
  const { data: currentSettings, isLoading: isLoadingSettings } =
    useFetchCurrentSettings();
  const updateGeneralSettingsMutation = useUpdateGeneralSettings();

  const [settings, setSettings] = useState({
    // Products & Inventory
    defaultProductStatus: "DRAFT",
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

  const originalSettingsRef = useRef<typeof settings | null>(null);

  // Load current settings when they're available
  useEffect(() => {
    if (currentSettings) {
      setSettings((prev) => {
        const updatedSettings = {
          ...prev,
          defaultProductStatus:
            currentSettings.product_default_state?.toUpperCase() || "DRAFT",
          lowStockThreshold: currentSettings.low_stock_alert ?? 10,
          autoCancelUnpaidHours: currentSettings.cancel_order_after_hours ?? 24,
          allowOrderEditing: currentSettings.allow_edit_order ?? false,
          maintenanceMode: currentSettings.under_maintenance ?? false,
        };
        // Store original values for comparison
        originalSettingsRef.current = JSON.parse(
          JSON.stringify(updatedSettings)
        );
        return updatedSettings;
      });
    }
  }, [currentSettings]);

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

  // Check if values have changed
  const hasChanges = () => {
    if (!originalSettingsRef.current) return false;
    const original = originalSettingsRef.current;
    const current = settings;

    return (
      original.defaultProductStatus !== current.defaultProductStatus ||
      original.lowStockThreshold !== current.lowStockThreshold ||
      original.autoCancelUnpaidHours !== current.autoCancelUnpaidHours ||
      original.allowOrderEditing !== current.allowOrderEditing ||
      original.maintenanceMode !== current.maintenanceMode
    );
  };

  const handleCancel = () => {
    if (originalSettingsRef.current) {
      setSettings(JSON.parse(JSON.stringify(originalSettingsRef.current)));
      toast.info("تم إلغاء التغييرات");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Transform settings to backend format
      const generalSettingsData = {
        product_default_state: settings.defaultProductStatus.toUpperCase(),
        low_stock_alert: settings.lowStockThreshold,
        cancel_order_after_hours: settings.autoCancelUnpaidHours,
        allow_edit_order: settings.allowOrderEditing,
        under_maintenance: settings.maintenanceMode,
      };

      await updateGeneralSettingsMutation.mutateAsync(generalSettingsData);
      // Update original values after successful save
      if (originalSettingsRef.current) {
        originalSettingsRef.current = JSON.parse(JSON.stringify(settings));
      }
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "حدث خطأ أثناء حفظ الإعدادات. يرجى المحاولة مرة أخرى."
      );
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSubmitting = updateGeneralSettingsMutation.isPending;
  const hasUnsavedChanges = hasChanges();

  return (
    <div className="space-y-6 min-h-screen pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            الإعدادات العامة
          </h1>
          <p className="text-muted-foreground mt-1">
            قم بتكوين الإعدادات العامة للمتجر والمنتجات والطلبات
          </p>
        </div>

        {hasUnsavedChanges && (
          <div>
            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={handleCancel}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={isSubmitting}
                form="general-settings-form"
              >
                {isSubmitting ? (
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
          </div>
        )}
      </div>

      <form
        id="general-settings-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
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
            {/* <div className="flex items-center justify-between">
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
            </div> */}

            {/* <div className="flex items-center justify-between">
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
            </div> */}

            {/* <div className="flex items-center justify-between">
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
            </div> */}

            <div className="flex flex-col gap-y-2">
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
                <option value={PRODUCT_STATUS.DRAFT}>مسودة</option>
                <option value={PRODUCT_STATUS.PUBLISHED}>منشور</option>
              </select>
            </div>

            {settings.inventoryTracking && (
              <div className="flex flex-col gap-y-2">
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

            {/* <div className="space-y-2">
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
            </div> */}
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
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>السماح بتعديل الطلبات</Label>
                <p className="text-sm text-muted-foreground">
                  السماح بتعديل الطلبات قبل المعالجة والشحن
                </p>
              </div>
              <Switch
                checked={settings.allowOrderEditing}
                onCheckedChange={() => handleToggle("allowOrderEditing")}
              />
            </div>

            <div className="flex flex-col gap-y-2">
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
          </CardContent>
        </Card>

        {/* Customers
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
        </Card> */}

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
      </form>
    </div>
  );
};

export default GeneralSettings;
