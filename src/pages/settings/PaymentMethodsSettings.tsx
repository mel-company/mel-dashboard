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
  CreditCard,
  Wallet,
  Building2,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

type Props = {};

interface PaymentMethod {
  id: string;
  name: string;
  enabled: boolean;
  testMode: boolean;
  credentials: Record<string, string>;
  autoCapture: boolean;
}

const PaymentMethodsSettings = ({}: Props) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "cash-on-delivery",
      name: "الدفع عند الاستلام",
      enabled: true,
      testMode: false,
      credentials: {},
      autoCapture: false,
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
  };

  const toggleTestMode = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id ? { ...method, testMode: !method.testMode } : method
      )
    );
  };

  const toggleAutoCapture = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? { ...method, autoCapture: !method.autoCapture }
          : method
      )
    );
  };

  const updateCredentials = (id: string, key: string, value: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id
          ? {
              ...method,
              credentials: { ...method.credentials, [key]: value },
            }
          : method
      )
    );
  };

  const toggleShowSecret = (id: string, key: string) => {
    const secretKey = `${id}-${key}`;
    setShowSecrets((prev) => ({
      ...prev,
      [secretKey]: !prev[secretKey],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    toast.success("تم حفظ إعدادات الدفع بنجاح");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">طرق الدفع</h1>
        <p className="text-muted-foreground mt-1">
          قم بتكوين طرق الدفع المتاحة للعملاء
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {method.id === "cash-on-delivery" ? (
                      <Wallet className="size-5" />
                    ) : method.id === "credit-card" ? (
                      <CreditCard className="size-5" />
                    ) : (
                      <Building2 className="size-5" />
                    )}
                    {method.name}
                  </CardTitle>
                  <CardDescription>
                    {method.id === "cash-on-delivery"
                      ? "الدفع نقداً عند استلام الطلب"
                      : "بوابة دفع إلكترونية"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  {method.enabled && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="size-3" />
                      مفعّل
                    </Badge>
                  )}
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                  />
                </div>
              </div>
            </CardHeader>

            {method.enabled && (
              <CardContent className="space-y-4">
                {method.id !== "cash-on-delivery" && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>وضع الاختبار</Label>
                        <p className="text-sm text-muted-foreground">
                          استخدام بيانات اختبارية للدفع
                        </p>
                      </div>
                      <Switch
                        checked={method.testMode}
                        onCheckedChange={() => toggleTestMode(method.id)}
                      />
                    </div>

                    {method.testMode && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg flex items-start gap-2">
                        <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          وضع الاختبار مفعّل. لن يتم خصم مبالغ حقيقية من
                          العملاء.
                        </p>
                      </div>
                    )}

                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium">بيانات الاعتماد</h4>
                      {Object.keys(method.credentials).map((key) => (
                        <div key={key} className="space-y-2">
                          <Label htmlFor={`${method.id}-${key}`}>
                            {key === "apiKey"
                              ? "مفتاح API"
                              : key === "secretKey"
                              ? "المفتاح السري"
                              : key === "merchantId"
                              ? "معرف التاجر"
                              : key}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${method.id}-${key}`}
                              type={
                                key.includes("secret") || key.includes("Secret")
                                  ? showSecrets[`${method.id}-${key}`]
                                    ? "text"
                                    : "password"
                                  : "text"
                              }
                              value={method.credentials[key] || ""}
                              onChange={(e) =>
                                updateCredentials(
                                  method.id,
                                  key,
                                  e.target.value
                                )
                              }
                              placeholder={`أدخل ${key}`}
                              className="text-right pr-10"
                            />
                            {(key.includes("secret") ||
                              key.includes("Secret")) && (
                              <button
                                type="button"
                                onClick={() => toggleShowSecret(method.id, key)}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showSecrets[`${method.id}-${key}`] ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="space-y-0.5">
                        <Label>الاستيلاء التلقائي</Label>
                        <p className="text-sm text-muted-foreground">
                          خصم المبلغ تلقائياً عند تأكيد الطلب
                        </p>
                      </div>
                      <Switch
                        checked={method.autoCapture}
                        onCheckedChange={() => toggleAutoCapture(method.id)}
                      />
                    </div>
                  </>
                )}

                {method.id === "cash-on-delivery" && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      لا يتطلب هذا الأسلوب أي إعدادات إضافية. سيتم تفعيله
                      تلقائياً عند تفعيله.
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}

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

export default PaymentMethodsSettings;
