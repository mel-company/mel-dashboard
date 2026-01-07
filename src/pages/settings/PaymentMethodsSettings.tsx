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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUpdatePaymentMethods,
  useFetchCurrentSettings,
} from "@/api/wrappers/settings.wrappers";

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
  const { data: currentSettings, isLoading: isLoadingSettings } =
    useFetchCurrentSettings();
  const updatePaymentMethodsMutation = useUpdatePaymentMethods();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "cash-on-delivery",
      name: "الدفع عند الاستلام",
      enabled: false,
      testMode: false,
      credentials: {},
      autoCapture: false,
    },
    {
      id: "credit-card",
      name: "الدفع بالبطاقة الائتمانية",
      enabled: false,
      testMode: false,
      credentials: {
        merchantId: "",
        IBAN: "",
      },
      autoCapture: false,
    },
  ]);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const originalPaymentMethodsRef = useRef<PaymentMethod[]>([]);

  // Load current settings when they're available
  useEffect(() => {
    if (currentSettings) {
      setPaymentMethods((prev) => {
        const updatedMethods = prev.map((method) => {
          if (method.id === "cash-on-delivery") {
            return {
              ...method,
              enabled: currentSettings.cash_on_delivery ?? false,
            };
          }
          if (method.id === "credit-card") {
            return {
              ...method,
              enabled: currentSettings.credit_card ?? false,
            };
          }
          return method;
        });
        // Store original values for comparison
        originalPaymentMethodsRef.current = JSON.parse(
          JSON.stringify(updatedMethods)
        );
        return updatedMethods;
      });
    }
  }, [currentSettings]);

  // Check if values have changed
  const hasChanges = () => {
    const original = originalPaymentMethodsRef.current;
    const current = paymentMethods;

    if (original.length !== current.length) return true;

    return original.some((originalMethod, index) => {
      const currentMethod = current[index];
      return (
        originalMethod.enabled !== currentMethod.enabled ||
        JSON.stringify(originalMethod.credentials) !==
          JSON.stringify(currentMethod.credentials)
      );
    });
  };

  const handleCancel = () => {
    // Reset to original values
    setPaymentMethods(
      JSON.parse(JSON.stringify(originalPaymentMethodsRef.current))
    );
    toast.info("تم إلغاء التغييرات");
  };

  const togglePaymentMethod = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Transform payment methods state to backend format
      const cashOnDelivery = paymentMethods.find(
        (m) => m.id === "cash-on-delivery"
      );
      const creditCard = paymentMethods.find((m) => m.id === "credit-card");

      const paymentMethodsData = {
        cash_on_delivery: cashOnDelivery?.enabled ?? false,
        credit_card: creditCard?.enabled ?? false,
      };

      await updatePaymentMethodsMutation.mutateAsync(paymentMethodsData);
      // Update original values after successful save
      originalPaymentMethodsRef.current = JSON.parse(
        JSON.stringify(paymentMethods)
      );
      toast.success("تم حفظ إعدادات الدفع بنجاح");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "حدث خطأ أثناء حفظ إعدادات الدفع. يرجى المحاولة مرة أخرى."
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

  const isSubmitting = updatePaymentMethodsMutation.isPending;
  const hasUnsavedChanges = hasChanges();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طرق الدفع</h1>
          <p className="text-muted-foreground mt-1">
            قم بتكوين طرق الدفع المتاحة للعملاء
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
                form="payment-methods-form"
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
        id="payment-methods-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {paymentMethods.map((method) => (
          <Card key={method.id} className="gap-0">
            <CardHeader className="">
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
                  </>
                )}

                {/* {method.id === "cash-on-delivery" && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      لا يتطلب هذا الأسلوب أي إعدادات إضافية. سيتم تفعيله
                      تلقائياً عند تفعيله.
                    </p>
                  </div>
                )} */}
              </CardContent>
            )}
          </Card>
        ))}
      </form>
    </div>
  );
};

export default PaymentMethodsSettings;
