import { useState, useEffect, useRef, useMemo } from "react";
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
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useFetchCurrentSettings,
  useFetchStorePaymentMethods,
  useUpdatePaymentMethods,
  useUpsertStorePaymentMethod,
} from "@/api/wrappers/settings.wrappers";
import { useFetchPaymentProviders } from "@/api/wrappers/payment.wrappers";

type Props = {};

type RequirementsSchema = Record<
  string,
  { type?: string; required?: boolean; [k: string]: unknown }
>;

function isSecretLike(key: string): boolean {
  const k = key.toLowerCase();
  return [
    "apikey",
    "api_key",
    "secret",
    "secretkey",
    "secret_key",
    "password",
    "privatekey",
    "private_key",
    "token",
  ].some((s) => k.includes(s));
}

function requirementLabel(key: string): string {
  const labels: Record<string, string> = {
    apiKey: "مفتاح API",
    api_key: "مفتاح API",
    secretKey: "المفتاح السري",
    secret_key: "المفتاح السري",
    password: "كلمة المرور",
    merchantId: "معرف التاجر",
    merchant_id: "معرف التاجر",
  };
  return labels[key] ?? key;
}

const PaymentMethodsSettings = ({}: Props) => {
  const { data: currentSettings, isLoading: isLoadingSettings } =
    useFetchCurrentSettings();
  const { data: paymentProviders, isLoading: isLoadingProviders } =
    useFetchPaymentProviders();
  const { data: storePaymentMethods, isLoading: isLoadingStore } =
    useFetchStorePaymentMethods();
  const updatePaymentMethodsMutation = useUpdatePaymentMethods();
  const upsertMutation = useUpsertStorePaymentMethod();

  const [cashOnDelivery, setCashOnDelivery] = useState(false);
  const initialCashOnDeliveryRef = useRef<boolean | null>(null);

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [formState, setFormState] = useState<
    Record<
      string,
      {
        isEnabled: boolean;
        credentials: Record<string, string>;
        available?: boolean;
        unavailableReason?: string | null;
      }
    >
  >({});
  const initialRef = useRef<typeof formState | null>(null);

  const methodsByProvider = useMemo(() => {
    if (!paymentProviders) return [];
    return paymentProviders.flatMap((p: any) =>
      (p.methods ?? []).map((m: any) => ({ ...m, providerName: p.name }))
    );
  }, [paymentProviders]);

  useEffect(() => {
    if (!paymentProviders || !storePaymentMethods) return;

    const next: typeof formState = {};
    for (const provider of paymentProviders) {
      for (const method of provider.methods ?? []) {
        const storePm = (storePaymentMethods as any[]).find(
          (s: any) => s.paymentMethodId === method.id
        );
        const creds = (storePm?.credentials ?? {}) as Record<string, unknown>;
        const credentials: Record<string, string> = {};
        const req = method.requirements as RequirementsSchema | null | undefined;
        if (req && typeof req === "object") {
          for (const key of Object.keys(req)) {
            const v = creds[key];
            credentials[key] =
              v === null || v === undefined ? "" : String(v);
          }
        }
        next[method.id] = {
          isEnabled: storePm?.isEnabled ?? false,
          credentials,
          /**
           * The server's verdict, not a second opinion.
           *
           * It applies `canStoreEnable` — the same rule the write path
           * enforces — so a method can never be drawn as available and then
           * refused when you try to enable it. The fallback is for a row the
           * settings endpoint did not return at all, where the provider flag
           * is the only thing left to go on.
           */
          available: storePm?.available ?? provider.isActive !== false,
          unavailableReason: storePm?.unavailableReason ?? null,
        };
      }
    }
    setFormState(next);
    if (initialRef.current === null) {
      initialRef.current = JSON.parse(JSON.stringify(next));
    }
  }, [paymentProviders, storePaymentMethods]);

  useEffect(() => {
    if (currentSettings == null) return;
    const v = currentSettings.cash_on_delivery ?? false;
    setCashOnDelivery(v);
    if (initialCashOnDeliveryRef.current === null) {
      initialCashOnDeliveryRef.current = v;
    }
  }, [currentSettings]);

  const hasChanges = () => {
    if (initialCashOnDeliveryRef.current !== null && cashOnDelivery !== initialCashOnDeliveryRef.current)
      return true;
    if (initialRef.current === null) return false;
    const a = initialRef.current;
    const b = formState;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const id of keys) {
      if (a[id]?.isEnabled !== b[id]?.isEnabled) return true;
      if (
        JSON.stringify(a[id]?.credentials ?? {}) !==
        JSON.stringify(b[id]?.credentials ?? {})
      )
        return true;
    }
    return false;
  };

  const setEnabled = (methodId: string, isEnabled: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [methodId]: {
        ...(prev[methodId] ?? { credentials: {} }),
        isEnabled,
      },
    }));
  };

  const setCredential = (methodId: string, key: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [methodId]: {
        ...(prev[methodId] ?? { isEnabled: false, credentials: {} }),
        credentials: {
          ...(prev[methodId]?.credentials ?? {}),
          [key]: value,
        },
      },
    }));
  };

  const toggleShowSecret = (methodId: string, key: string) => {
    const k = `${methodId}-${key}`;
    setShowSecrets((s) => ({ ...s, [k]: !s[k] }));
  };

  const handleCancel = () => {
    if (initialRef.current) setFormState(JSON.parse(JSON.stringify(initialRef.current)));
    if (initialCashOnDeliveryRef.current !== null) setCashOnDelivery(initialCashOnDeliveryRef.current);
    toast.info("تم إلغاء التغييرات");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const paymentLegacyPromise = updatePaymentMethodsMutation.mutateAsync({
        cash_on_delivery: cashOnDelivery,
        credit_card: currentSettings?.credit_card ?? false,
      });
      /**
       * Only what the merchant actually changed.
       *
       * This used to PATCH every method in the catalogue on every save,
       * whether or not it had been touched — so saving one unrelated switch
       * wrote the whole form back. That is how a method the platform had
       * withdrawn got switched off for good: its control is disabled, the API
       * reports it as off, and the form dutifully echoed the off back into the
       * database, destroying a choice the merchant had made and never undone.
       *
       * The server refuses that particular write now as well, but a form that
       * speaks for controls nobody touched will find another way to be wrong —
       * and this also turns N writes per save into however many were edited,
       * which is usually none.
       */
      const initial = initialRef.current ?? {};
      const changed = methodsByProvider.filter((method: { id: string }) => {
        const next = formState[method.id];
        if (!next) return false;
        const before = initial[method.id];
        if (!before) return true;
        return (
          before.isEnabled !== next.isEnabled ||
          JSON.stringify(before.credentials ?? {}) !==
            JSON.stringify(next.credentials ?? {})
        );
      });

      const methodPromises = changed.map((method: { id: string }) => {
        const s = formState[method.id];
        return upsertMutation.mutateAsync({
          paymentMethodId: method.id,
          isEnabled: s.isEnabled,
          credentials: s.credentials,
        });
      });
      await Promise.all([paymentLegacyPromise, ...methodPromises]);
      initialRef.current = JSON.parse(JSON.stringify(formState));
      initialCashOnDeliveryRef.current = cashOnDelivery;
      toast.success("تم حفظ إعدادات طرق الدفع بنجاح");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "حدث خطأ أثناء حفظ إعدادات الدفع. يرجى المحاولة مرة أخرى."
      );
    }
  };

  const isLoading = isLoadingSettings || isLoadingProviders || isLoadingStore;
  const isSubmitting = updatePaymentMethodsMutation.isPending || upsertMutation.isPending;
  const hasUnsavedChanges = hasChanges();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p6 lg:p-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طرق الدفع</h1>
          <p className="text-muted-foreground mt-1">
            قم بتفعيل طرق الدفع التي تتناسب مع عملك
          </p>
        </div>
        {hasUnsavedChanges && (
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
        )}
      </div>

      <form
        id="payment-methods-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-muted-foreground" />
                <CardTitle>دفع عند الإستلام</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                {cashOnDelivery && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="size-3" />
                    مفعّل
                  </Badge>
                )}
                <Switch
                  checked={cashOnDelivery}
                  onCheckedChange={setCashOnDelivery}
                />
              </div>
            </div>
          </CardHeader>
        </Card>


        <div>
          <h1 className="text-2xl font-bold text-foreground">الدفع الإلكتروني</h1>
        </div>
        {paymentProviders?.map((provider: any) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* The gateway's own logo, supplied by the server so this
                      page keeps no code → logo table of its own. */}
                  {provider.gateway?.logoUrl && (
                    <img
                      src={provider.gateway.logoUrl}
                      alt=""
                      className="size-8 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <CardTitle>{provider.name}</CardTitle>
                </div>
                {provider.isActive === false && (
                  <Badge variant="secondary">موقوف من إدارة المنصة</Badge>
                )}
              </div>
              {provider.description && (
                <CardDescription>{provider.description}</CardDescription>
              )}
              {provider.isActive === false && (
                /**
                 * Said plainly, because the alternative is a switch that will
                 * not stay on and no explanation anywhere. The server refuses
                 * this too — the disabled attribute is the courtesy, not the
                 * control.
                 */
                <CardDescription className="text-destructive">
                  أوقفت إدارة المنصة هذا المزود مؤقتاً، لذلك لا يمكن تفعيل طرق
                  الدفع التابعة له ولن تظهر للمشتري عند الدفع.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {(provider.methods ?? []).map((method: any) => {
                const req = method.requirements as RequirementsSchema | null | undefined;
                const requirementKeys =
                  req && typeof req === "object"
                    ? Object.keys(req)
                    : [];
                const s = formState[method.id] ?? {
                  isEnabled: false,
                  credentials: {} as Record<string, string>,
                };

                /**
                 * One value, two consumers.
                 *
                 * The badge read `s.isEnabled` and the switch read
                 * `s.isEnabled && provider.isActive !== false`, so when the
                 * platform withdrew a provider you got a green «مفعّل» beside
                 * a dead switch — the page contradicting itself about the
                 * same method. Whatever "enabled" means here, it has to mean
                 * it in both places.
                 */
                const available = s.available ?? provider.isActive !== false;
                const enabled = s.isEnabled && available;

                return (
                  <Card key={method.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-5 text-muted-foreground" />
                          <CardTitle>{method.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3">
                          {enabled && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="size-3" />
                              مفعّل
                            </Badge>
                          )}
                          <Switch
                            checked={enabled}
                            disabled={!available}
                            onCheckedChange={(v) => setEnabled(method.id, v)}
                          />
                        </div>
                      </div>
                    </CardHeader>
                    {(s.isEnabled && requirementKeys.length > 0) && (
                      <CardContent className="pt-0 space-y-4 border-t">
                        <h4 className="font-medium pt-4">بيانات الاعتماد</h4>
                        {requirementKeys.map((key) => {
                          const schema = req![key];
                          const isSecret = isSecretLike(key);
                          const inputId = `${method.id}-${key}`;
                          const show = showSecrets[`${method.id}-${key}`];

                          return (
                            <div key={key} className="space-y-2">
                              <Label htmlFor={inputId}>
                                {requirementLabel(key)}
                                {schema?.required && (
                                  <span className="text-destructive mr-1">*</span>
                                )}
                              </Label>
                              <div className="relative">
                                <Input
                                  id={inputId}
                                  type={
                                    isSecret
                                      ? show
                                        ? "text"
                                        : "password"
                                      : schema?.type === "number"
                                      ? "number"
                                      : "text"
                                  }
                                  value={s.credentials[key] ?? ""}
                                  onChange={(e) =>
                                    setCredential(method.id, key, e.target.value)
                                  }
                                  placeholder={`أدخل ${requirementLabel(key)}`}
                                  className="text-right pr-10"
                                  dir="rtl"
                                />
                                {isSecret && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleShowSecret(method.id, key)
                                    }
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                  >
                                    {show ? (
                                      <EyeOff className="size-4" />
                                    ) : (
                                      <Eye className="size-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                    {s.isEnabled && requirementKeys.length === 0 && (
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">
                          لا يتطلب هذا الأسلوب إعدادات إضافية.
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </form>
    </div>
  );
};

export default PaymentMethodsSettings;
