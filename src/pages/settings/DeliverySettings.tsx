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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Truck,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Save,
  Package,
} from "lucide-react";
import { toast } from "sonner";

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

  const [settings, setSettings] = useState({
    localPickup: true,
    estimatedDeliveryDays: 3,
    deliveryNotes: "",
    enableShippingProviders: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "estimatedDeliveryDays" ? parseInt(value) || 0 : value,
    }));
  };

  const addShippingZone = () => {
    const newZone: ShippingZone = {
      id: Date.now().toString(),
      name: "",
      countries: [],
      rateType: "flat",
      rate: 0,
    };
    setShippingZones((prev) => [...prev, newZone]);
  };

  const removeShippingZone = (id: string) => {
    setShippingZones((prev) => prev.filter((zone) => zone.id !== id));
    toast.success("تم حذف منطقة الشحن");
  };

  const updateShippingZone = (
    id: string,
    field: keyof ShippingZone,
    value: any
  ) => {
    setShippingZones((prev) =>
      prev.map((zone) => (zone.id === id ? { ...zone, [field]: value } : zone))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ إعدادات التوصيل بنجاح");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات التوصيل</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين مناطق الشحن وأسعار التوصيل
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shipping Zones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-5" />
                  مناطق الشحن
                </CardTitle>
                <CardDescription>تحديد المناطق وأسعار الشحن</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addShippingZone}
                className="gap-2"
              >
                <Plus className="size-4" />
                إضافة منطقة
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {shippingZones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="size-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد مناطق شحن</p>
                <p className="text-sm">أضف منطقة شحن جديدة للبدء</p>
              </div>
            ) : (
              shippingZones.map((zone) => (
                <Card key={zone.id} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">منطقة الشحن #{zone.id}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShippingZone(zone.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>اسم المنطقة</Label>
                        <Input
                          value={zone.name}
                          onChange={(e) =>
                            updateShippingZone(zone.id, "name", e.target.value)
                          }
                          placeholder="مثل: بغداد"
                          className="text-right"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>نوع السعر</Label>
                        <select
                          value={zone.rateType}
                          onChange={(e) =>
                            updateShippingZone(
                              zone.id,
                              "rateType",
                              e.target.value
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right"
                        >
                          <option value="flat">سعر ثابت</option>
                          <option value="weight">حسب الوزن</option>
                          <option value="price">حسب السعر</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {zone.rateType === "flat"
                          ? "السعر (دينار)"
                          : zone.rateType === "weight"
                          ? "السعر لكل كيلوغرام (دينار)"
                          : "النسبة المئوية (%)"}
                      </Label>
                      <Input
                        type="number"
                        value={zone.rate}
                        onChange={(e) =>
                          updateShippingZone(
                            zone.id,
                            "rate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min={0}
                        className="text-right"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>حد الشحن المجاني (دينار)</Label>
                      <Input
                        type="number"
                        value={zone.freeShippingThreshold || ""}
                        onChange={(e) =>
                          updateShippingZone(
                            zone.id,
                            "freeShippingThreshold",
                            parseFloat(e.target.value) || undefined
                          )
                        }
                        placeholder="اتركه فارغاً لإلغاء الشحن المجاني"
                        min={0}
                        className="text-right"
                      />
                      <p className="text-xs text-muted-foreground">
                        إذا كان إجمالي الطلب أكبر من هذا المبلغ، سيتم الشحن
                        مجاناً
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Local Pickup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-5" />
              الاستلام من المتجر
            </CardTitle>
            <CardDescription>
              السماح للعملاء بالاستلام من المتجر مباشرة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل الاستلام من المتجر</Label>
                <p className="text-sm text-muted-foreground">
                  السماح للعملاء باختيار الاستلام من المتجر
                </p>
              </div>
              <Switch
                checked={settings.localPickup}
                onCheckedChange={() => handleToggle("localPickup")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5" />
              وقت التوصيل المتوقع
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
          </CardContent>
        </Card>

        {/* Shipping Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-5" />
              مزودو الشحن
            </CardTitle>
            <CardDescription>التكامل مع شركات الشحن الخارجية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل مزودي الشحن</Label>
                <p className="text-sm text-muted-foreground">
                  التكامل مع شركات الشحن لتتبع الشحنات
                </p>
              </div>
              <Switch
                checked={settings.enableShippingProviders}
                onCheckedChange={() => handleToggle("enableShippingProviders")}
              />
            </div>

            {settings.enableShippingProviders && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  قريباً: التكامل مع شركات الشحن المحلية والدولية
                </p>
              </div>
            )}
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

export default DeliverySettings;
