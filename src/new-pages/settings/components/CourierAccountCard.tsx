import { useState } from "react";
import { CheckCircle2, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SettingsCard from "./SettingsCard";
import { usePlanFeature } from "@/hooks/use-plan-limits";
import { PlanFeatureUpgrade } from "@/components/plan/PlanFeatureUpgrade";
import { SettingsInput } from "./SettingsField";
import {
  useActiveCourier,
  useClearCourierCredentials,
  useCourierAccounts,
  useSetCourierCredentials,
} from "@/api/wrappers/shipping.wrappers";

/**
 * ربط حساب التاجر الخاص (مدن / وسيط).
 *
 * شروط التفعيل (هاتف، موقع، ensure، تغطية) ترسمها `CourierSetupCard` من
 * `GET /shipping/couriers/setup` — هذه البطاقة للنموذج فقط.
 */
const CourierAccountCard = ({ embedded = false }: { embedded?: boolean }) => {
  const { data: courier, isLoading } = useActiveCourier();
  const { data: accountsData } = useCourierAccounts();
  const courierAllowed = usePlanFeature("courier_integrations");

  const setCredentials = useSetCourierCredentials();
  const clearCredentials = useClearCourierCredentials();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  /** Changing a linked login — the form again, over the stored one. */
  const [editing, setEditing] = useState(false);

  if (isLoading || !courier) return null;

  if (courier.selected === false || courier.integrated === false) return null;

  // No merchant-login path for this courier — setup card covers readiness.
  if (!courier.acceptsMerchantCredentials) return null;

  if (!courierAllowed) {
    return (
      <SettingsCard
        title={`حسابك لدى ${courier.deliveryCompanyName || courier.displayName}`}
        className={
          embedded
            ? "border-0 bg-slate-50 p-4 shadow-none sm:p-4 dark:bg-slate-900"
            : undefined
        }
      >
        <PlanFeatureUpgrade feature="courier_integrations" />
      </SettingsCard>
    );
  }

  const summary = accountsData?.accounts?.find(
    (row) => row.courierCode === courier.code,
  );
  const account = summary?.account ?? null;
  const hasOwnLogin = Boolean(account?.hasPassword);

  const save = async () => {
    if (!username.trim() || !password) {
      toast.error("أدخل اسم المستخدم وكلمة المرور.");
      return;
    }

    try {
      await setCredentials.mutateAsync({
        code: courier.code,
        username: username.trim(),
        password,
      });
      setPassword("");
      setUsername("");
      setEditing(false);
      toast.success(
        editing ? "تم تحديث حسابك لدى شركة الشحن." : "تم حفظ حسابك لدى شركة الشحن.",
      );
    } catch (error) {
      const message = (
        error as { response?: { data?: { message?: unknown } } }
      )?.response?.data?.message;
      toast.error(
        typeof message === "string" && message.trim()
          ? message
          : "تعذر حفظ الحساب.",
      );
    }
  };

  const forget = async () => {
    try {
      await clearCredentials.mutateAsync(courier.code);
      toast.success("تم حذف الحساب — ستُشحن الطلبات عبر حساب المنصة.");
    } catch {
      toast.error("تعذر حذف الحساب.");
    }
  };

  const title = `حسابك لدى ${courier.deliveryCompanyName || courier.displayName}`;

  return (
    <SettingsCard
      title={title}
      className={
        embedded
          ? "border-0 bg-slate-50 p-4 shadow-none sm:p-4 dark:bg-slate-900"
          : undefined
      }
      headerClassName={embedded ? "mb-2" : undefined}
      titleAccessory={
        <div className="flex size-[35px] shrink-0 items-center justify-center rounded-[10px] bg-sky-500/10">
          <Truck className="size-5 text-sky-500" />
        </div>
      }
    >
      <div id="courier-credentials" className="space-y-3 scroll-mt-4">
        {!courier.companyActive && (
          <p className="rounded-[12px] bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-900">
            أوقفت المنصة التعامل مع {courier.displayName}. طلباتك تُشحن عبرها
            كما هي، لكنها لم تبقَ متاحة للاختيار — اختر شركة أخرى، وحد الـ30
            يوماً لا ينطبق هنا.
          </p>
        )}

        <p className="text-[13px] leading-relaxed text-slate-500">
          تستطيع ربط حسابك الخاص لدى {courier.displayName} لتُسجَّل الطرود
          باسمك. بدونه تُشحن الطلبات عبر حساب المنصة.
        </p>

        {!hasOwnLogin && (
          <p className="rounded-[12px] bg-sky-50 px-3 py-2.5 text-[12px] leading-relaxed text-sky-800">
            استخدم حساب التاجر الرئيسي وليس حساب مستخدم فرعي — الحساب
            الفرعي ينجح في إنشاء الطرود ثم تُرفض به كشوفات الحساب.
          </p>
        )}

        {!courier.canStoreCredentials ? (
          <p className="rounded-[12px] bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600">
            ربط الحساب الخاص غير متاح حالياً على هذه المنصة. تُشحن طلباتك
            عبر حساب المنصة لدى {courier.displayName} — تواصل مع الدعم إن
            أردت تفعيل الربط.
          </p>
        ) : hasOwnLogin && !editing ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-slate-50 px-3 py-2.5">
            <div className="text-[13px]">
              <p className="flex items-center gap-1.5 font-bold text-slate-900">
                <CheckCircle2 className="size-4 text-emerald-600" />
                مربوط بحسابك الخاص
              </p>
              {account?.username && (
                <p className="text-slate-500" dir="ltr">
                  {account.username}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-sky-700 dark:text-sky-300"
                onClick={() => {
                  setUsername(account?.username ?? "");
                  setPassword("");
                  setEditing(true);
                }}
              >
                تعديل
              </Button>
              <Button
                variant="destructive-outline"
                size="sm"
                disabled={clearCredentials.isPending}
                onClick={forget}
              >
                {clearCredentials.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                حذف الربط
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <SettingsInput
              placeholder="اسم المستخدم"
              value={username}
              autoComplete="off"
              onChange={(event) => setUsername(event.target.value)}
            />
            <SettingsInput
              type="password"
              placeholder="كلمة المرور"
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            {editing && (
              <p className="text-[12px] text-slate-500">
                أدخل كلمة المرور من جديد — لا نحتفظ بها بشكل يمكن عرضه.
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={setCredentials.isPending}
                onClick={save}
              >
                {setCredentials.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                {editing ? "حفظ التعديل" : "ربط الحساب"}
              </Button>
              {editing && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={setCredentials.isPending}
                  onClick={() => {
                    setEditing(false);
                    setUsername("");
                    setPassword("");
                  }}
                >
                  إلغاء
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  );
};

export default CourierAccountCard;
