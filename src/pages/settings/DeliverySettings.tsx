import { useState, useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Save, Package, Truck, InfoIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { useFetchStoreDetails } from "@/api/wrappers/store.wrappers";
import {
  useFetchDeliveryCompanies,
  useFetchDeliveryCompany,
} from "@/api/wrappers/delivery-company.wrappers";
import {
  useFetchCurrentSettings,
  useUpdateCurrentSettings,
} from "@/api/wrappers/settings.wrappers";
import SelectDeliveryCompanyDialog from "./SelectDeliveryCompanyDialog";

type Props = {};

interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rateType: "flat" | "weight" | "price";
  rate: number;
  freeShippingThreshold?: number;
}

const DeliverySettings = ({}: Props) => {
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([
    {
      id: "1",
      name: "بغداد",
      countries: ["IQ"],
      rateType: "flat",
      rate: 5000,
      freeShippingThreshold: 100000,
    },
    {
      id: "2",
      name: "المحافظات الأخرى",
      countries: ["IQ"],
      rateType: "weight",
      rate: 10000,
    },
  ]);

  const { data: storeDetails } = useFetchStoreDetails();
  const { data: storeSettings } = useFetchCurrentSettings();
  const { mutate: updateSettings, isPending: isSaving } =
    useUpdateCurrentSettings();
  const [isDeliveryCompanyDialogOpen, setIsDeliveryCompanyDialogOpen] =
    useState(false);

  // Fetch delivery company details if a delivery company is selected
  const { data: deliveryCompanyDetails } = useFetchDeliveryCompany(
    storeDetails?.deliveryCompanyId || "",
    !!storeDetails?.deliveryCompanyId
  );

  // Initialize settings from store details and store settings
  const initialSettings = useMemo(() => {
    return {
      localDeliveryCompany: !!storeDetails?.deliveryCompanyId,
      estimatedDeliveryDays: storeSettings?.estimated_delivery_days ?? 3,
      deliveryNotes: storeSettings?.delivery_notes ?? "",
      enableShippingProviders:
        storeSettings?.enable_shipping_providers ?? false,
      selectedDeliveryCompanyId: storeDetails?.deliveryCompanyId || "",
    };
  }, [storeDetails, storeSettings]);

  const [settings, setSettings] = useState(initialSettings);

  // Fetch delivery companies when localDeliveryCompany is enabled
  const { data: deliveryCompanies } = useFetchDeliveryCompanies(
    settings.localDeliveryCompany
  );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "لم يتم التحديث";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if user can change delivery company (30 days restriction)
  const canChangeDeliveryCompany = useMemo(() => {
    const lastUpdate = storeDetails?.settings?.delivery_company_last_update;
    if (!lastUpdate) return true; // Can change if never updated

    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const daysSinceLastUpdate =
      (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastUpdate >= 30;
  }, [storeDetails?.settings?.delivery_company_last_update]);

  // Calculate remaining days if restriction applies
  const daysRemaining = useMemo(() => {
    const lastUpdate = storeDetails?.settings?.delivery_company_last_update;
    if (!lastUpdate) return 0;

    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const daysSinceLastUpdate =
      (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastUpdate < 30) {
      return Math.ceil(30 - daysSinceLastUpdate);
    }
    return 0;
  }, [storeDetails?.settings?.delivery_company_last_update]);

  // Update settings when store details or store settings change
  useEffect(() => {
    if (storeDetails && storeSettings !== undefined) {
      setSettings({
        localDeliveryCompany: !!storeDetails.deliveryCompanyId,
        estimatedDeliveryDays: storeSettings.estimated_delivery_days ?? 3,
        deliveryNotes: storeSettings.delivery_notes ?? "",
        enableShippingProviders:
          storeSettings.enable_shipping_providers ?? false,
        selectedDeliveryCompanyId: storeDetails.deliveryCompanyId || "",
      });
    }
  }, [storeDetails, storeSettings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "estimatedDeliveryDays" ? parseInt(value) || 0 : value,
    }));
  };

  // Check if delivery company section has changed
  const hasDeliveryCompanyChanges = useMemo(() => {
    return (
      settings.localDeliveryCompany !== initialSettings.localDeliveryCompany ||
      settings.selectedDeliveryCompanyId !==
        initialSettings.selectedDeliveryCompanyId
    );
  }, [settings, initialSettings]);

  // Check if delivery time section has changed
  const hasDeliveryTimeChanges = useMemo(() => {
    return (
      settings.estimatedDeliveryDays !==
        initialSettings.estimatedDeliveryDays ||
      settings.deliveryNotes !== initialSettings.deliveryNotes
    );
  }, [settings, initialSettings]);

  const handleResetDeliveryCompany = () => {
    setSettings((prev) => ({
      ...prev,
      localDeliveryCompany: initialSettings.localDeliveryCompany,
      selectedDeliveryCompanyId: initialSettings.selectedDeliveryCompanyId,
    }));
  };

  const handleResetDeliveryTime = () => {
    setSettings((prev) => ({
      ...prev,
      estimatedDeliveryDays: initialSettings.estimatedDeliveryDays,
      deliveryNotes: initialSettings.deliveryNotes,
    }));
  };

  const handleSubmitDeliveryTime = (e: React.FormEvent) => {
    e.preventDefault();

    updateSettings(
      {
        estimated_delivery_days: settings.estimatedDeliveryDays,
        delivery_notes: settings.deliveryNotes,
      },
      {
        onSuccess: () => {
          toast.success("تم حفظ إعدادات التوصيل بنجاح");
          // Settings will be refetched automatically due to cache invalidation
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              "فشل في حفظ الإعدادات. حاول مرة أخرى."
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات التوصيل</h1>
        <p className="text-muted-foreground mt-1">إدارة التوصيل وأسعار الشحن</p>
      </div>

      <div className="space-y-6">
        {/* Delivery Company Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              شركة التوصيل
            </CardTitle>
            <CardDescription>
              اختيار شركة التوصيل المناسبة للمتجر
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="">شركة التوصيل</Label>
              <div
                // type="button"
                // variant="secondary"
                className="w-full mt-2 flex bg-muted rounded-md p-2 justify-between text-right"
                onClick={() => {
                  if (
                    canChangeDeliveryCompany ||
                    !settings.selectedDeliveryCompanyId
                  ) {
                    setIsDeliveryCompanyDialogOpen(true);
                  }
                }}
                // disabled={!canChangeDeliveryCompany}
              >
                <div className="flex items-center gap-x-2">
                  <Truck className="size-4 ml-2" />
                  {settings.selectedDeliveryCompanyId
                    ? storeDetails?.deliveryCompany?.name ||
                      deliveryCompanies?.find(
                        (c: any) => c.id === settings.selectedDeliveryCompanyId
                      )?.name ||
                      "شركة التوصيل المحددة"
                    : "لم يتم تحديد شركة التوصيل"}
                </div>

                <Button
                  variant="secondary"
                  className=""
                  disabled={!canChangeDeliveryCompany}
                >
                  <Plus />
                  <p className="text-sm">تحديد</p>
                </Button>
              </div>
              {!settings.selectedDeliveryCompanyId && (
                <p className="text-xs text-destructive">
                  يرجى اختيار شركة التوصيل
                </p>
              )}
              {!canChangeDeliveryCompany && (
                <p className="text-xs text-destructive">
                  لا يمكن تغيير شركة التوصيل إلا بعد مرور 30 يوماً من آخر تحديث.
                  متبقي {daysRemaining} يوم/أيام
                </p>
              )}
            </div>

            <div className="flex gap-x-2 items-center">
              <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-sm">
                يمكنك تغيير شركة التوصيل كل 30 يوم
              </Label>
            </div>

            <div className="flex gap-x-2 items-center">
              <InfoIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <Label className="text-sm">
                تاريخ اخر تحديث:{" "}
                {formatDate(
                  storeDetails?.settings?.delivery_company_last_update
                )}
              </Label>
            </div>

            {!canChangeDeliveryCompany && (
              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex gap-x-2 items-start">
                  <InfoIcon className="size-4 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      لا يمكن تغيير شركة التوصيل حالياً
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      يجب أن يمر 30 يوماً على الأقل منذ آخر تحديث لشركة التوصيل.
                      متبقي {daysRemaining} يوم/أيام قبل إمكانية التغيير.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Company Details */}
            {deliveryCompanyDetails && (
              <div className="pt-4 border-t space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    تفاصيل شركة التوصيل
                  </Label>
                  <div className="space-y-3">
                    {deliveryCompanyDetails.logo && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الشعار:
                        </Label>
                        <img
                          src={deliveryCompanyDetails.logo}
                          alt={deliveryCompanyDetails.name || "شعار الشركة"}
                          className="h-16 w-16 object-cover rounded-full border"
                        />
                      </div>
                    )}
                    {deliveryCompanyDetails.name && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الاسم:
                        </Label>
                        <p className="text-sm font-medium">
                          {deliveryCompanyDetails.name}
                        </p>
                      </div>
                    )}
                    {deliveryCompanyDetails.description && (
                      <div className="flex items-start gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الوصف:
                        </Label>
                        <p className="text-sm flex-1">
                          {deliveryCompanyDetails.description}
                        </p>
                      </div>
                    )}
                    {deliveryCompanyDetails.phone && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الهاتف:
                        </Label>
                        <p className="text-sm">
                          {deliveryCompanyDetails.phone}
                        </p>
                      </div>
                    )}
                    {deliveryCompanyDetails.email && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          البريد الإلكتروني:
                        </Label>
                        <p className="text-sm">
                          {deliveryCompanyDetails.email}
                        </p>
                      </div>
                    )}
                    {deliveryCompanyDetails.website && (
                      <div className="flex items-center gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الموقع الإلكتروني:
                        </Label>
                        <a
                          href={deliveryCompanyDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {deliveryCompanyDetails.website}
                        </a>
                      </div>
                    )}
                    {deliveryCompanyDetails.address && (
                      <div className="flex items-start gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          العنوان:
                        </Label>
                        <p className="text-sm flex-1">
                          {deliveryCompanyDetails.address}
                        </p>
                      </div>
                    )}
                    {(deliveryCompanyDetails.country ||
                      deliveryCompanyDetails.state ||
                      deliveryCompanyDetails.region) && (
                      <div className="flex items-start gap-3">
                        <Label className="text-sm text-muted-foreground min-w-[120px]">
                          الموقع:
                        </Label>
                        <div className="text-sm flex-1 space-y-1 flex gap-x-2 items-center">
                          {deliveryCompanyDetails.country && (
                            <p>{deliveryCompanyDetails?.country?.name?.ar}</p>
                          )}
                          {deliveryCompanyDetails.state && (
                            <p>
                              / {deliveryCompanyDetails?.state?.name?.arabic}
                            </p>
                          )}
                          {deliveryCompanyDetails.region && (
                            <p>
                              / {deliveryCompanyDetails?.region?.name?.arabic}
                            </p>
                          )}
                          {deliveryCompanyDetails.zip && (
                            <p>/ {deliveryCompanyDetails.zip}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reset Button - Only show when delivery company section has changes */}
            {hasDeliveryCompanyChanges && (
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResetDeliveryCompany}
                >
                  إلغاء
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery Time Section */}
        <form onSubmit={handleSubmitDeliveryTime}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-5" />
                وقت التوصيل وملاحظات
              </CardTitle>
              <CardDescription>
                معلومات وقت التوصيل المعروضة للعملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDeliveryDays">
                  عدد أيام التوصيل المتوقعة
                </Label>
                <Input
                  id="estimatedDeliveryDays"
                  name="estimatedDeliveryDays"
                  type="number"
                  value={settings.estimatedDeliveryDays}
                  onChange={handleInputChange}
                  min={1}
                  className="text-right"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم عرض "التوصيل خلال {settings.estimatedDeliveryDays} أيام"
                  للعملاء
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">ملاحظات التوصيل</Label>
                <Textarea
                  id="deliveryNotes"
                  name="deliveryNotes"
                  value={settings.deliveryNotes}
                  onChange={handleInputChange}
                  placeholder="معلومات إضافية حول التوصيل تظهر للعملاء (مثل: التوصيل من الساعة 9 صباحاً حتى 5 مساءً)"
                  rows={3}
                  className="text-right"
                />
              </div>

              {/* Submit Button - Only show when delivery time section has changes */}
              {hasDeliveryTimeChanges && (
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResetDeliveryTime}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" className="gap-2" disabled={isSaving}>
                    <Save className="size-4" />
                    {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Delivery Company Dialog */}
      <SelectDeliveryCompanyDialog
        open={isDeliveryCompanyDialogOpen && canChangeDeliveryCompany}
        onOpenChange={(open) => {
          // Only allow opening if user can change delivery company
          if (open && !canChangeDeliveryCompany) {
            toast.error(
              `لا يمكن تغيير شركة التوصيل إلا بعد مرور 30 يوماً من آخر تحديث. متبقي ${daysRemaining} يوم/أيام`
            );
            return;
          }
          setIsDeliveryCompanyDialogOpen(open);
        }}
        currentDeliveryCompanyId={settings.selectedDeliveryCompanyId}
        onSuccess={() => {
          // The store details will be refetched automatically due to cache invalidation
          // Update settings when store details refetch completes
          // This will be handled by the useEffect that watches storeDetails
        }}
      />
    </div>
  );
};

export default DeliverySettings;
