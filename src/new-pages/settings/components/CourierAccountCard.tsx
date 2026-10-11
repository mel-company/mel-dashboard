import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import SettingsCard from "./SettingsCard";
import { SettingsInput } from "./SettingsField";
import {
  useActiveCourier,
  useClearCourierCredentials,
  useCourierAccounts,
  useSetCourierCredentials,
} from "@/api/wrappers/shipping.wrappers";

/**
 * حساب المتجر لدى شركة الشحن.
 *
 * Two different things can be missing before a store can ship, and they are
 * satisfied by two different people — which is the whole reason this card
 * distinguishes them instead of showing one "not ready":
 *
 * - **A branch**, for Prime and Boxy. An id issued inside the platform's own
 *   account at the vendor, so only an operator can provision it. The merchant
 *   is told to ask, not given a box to type in — a Prime shop id they invent
 *   points their parcels at somebody else's shop.
 * - **Their own login**, for Modon Express and Al-Waseet. Neither vendor
 *   publishes a sub-account endpoint, so a merchant who wants parcels filed
 *   under their own name supplies the login they already hold. Optional: the
 *   platform's account carries the parcel otherwise.
 *
 * The password is encrypted before storage and no route ever returns it, so
 * what comes back here is only whether one exists.
 */
const CourierAccountCard = () => {
  const { data: courier, isLoading } = useActiveCourier();
  const { data: accountsData } = useCourierAccounts();

  const setCredentials = useSetCourierCredentials();
  const clearCredentials = useClearCourierCredentials();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isLoading || !courier) return null;

  // No courier chosen, or a company with no integration behind it. Both are
  // reported by the picker above rather than here.
  if (courier.selected === false || courier.integrated === false) return null;

  /**
   * This courier's row, and the stored identity inside it.
   *
   * The two are different objects and reading the inner one off the outer was
   * silently always `undefined`: `hasPassword` and `username` live on
   * `summary.account`, which is null until a store has been provisioned at all.
   * So `hasOwnLogin` was permanently false — a merchant who had already linked
   * their Modon login was shown the empty credential form again on every
   * visit, with no sign the platform held anything, and «حذف الربط» was
   * unreachable.
   */
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
      // Never kept in component state after it is sent.
      setPassword("");
      setUsername("");
      toast.success("تم حفظ حسابك لدى شركة الشحن.");
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

  return (
    <SettingsCard
      title={`حسابك لدى ${courier.deliveryCompanyName || courier.displayName}`}
      titleAccessory={
        <div className="flex size-[35px] shrink-0 items-center justify-center rounded-[10px] bg-sky-500/10">
          <Truck className="size-5 text-sky-500" />
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[13px]">
          {courier.accountReady ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span className="font-bold text-emerald-700">
                جاهز لشحن الطلبات
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="size-4 text-amber-600" />
              <span className="font-bold text-amber-700">
                لم يكتمل التسجيل بعد
              </span>
            </>
          )}
        </div>

        {/*
          A branch is an operator's job, so this says who to ask rather than
          offering a field. The ids live inside the platform's account at the
          vendor and a wrong one sends a driver to another merchant's address.
        */}
        {/*
          Only where an operator can actually finish it.

          Modon Express and Al-Waseet publish no sub-account endpoint, so
          telling a merchant to contact support would send them to wait for a
          step nobody can take. Those two are ready by definition and their
          setup is the credential form below.
        */}
        {/*
          Withdrawn under the store's feet. The row above this card still shows
          the company's name and logo — store details carry no status — so
          without this the only visible sign is that the picker has stopped
          listing it.
        */}
        {!courier.companyActive && (
          <p className="rounded-[12px] bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-900">
            أوقفت المنصة التعامل مع {courier.displayName}. طلباتك تُشحن عبرها
            كما هي، لكنها لم تبقَ متاحة للاختيار — اختر شركة أخرى، وحد الـ30
            يوماً لا ينطبق هنا.
          </p>
        )}

        {!courier.accountReady && courier.supportsBranches && (
          <div className="space-y-2 rounded-[12px] bg-amber-50 px-3 py-2.5 text-[13px] leading-relaxed text-amber-800">
            <p>
              يحتاج تسجيل متجرك لدى {courier.displayName} إلى خطوة من فريق
              المنصة. تواصل مع الدعم لاستكمالها — لا يمكن شحن الطلبات قبل ذلك.
            </p>
            {/*
              The courier's own account model, in its words rather than ours.
              The server has carried it on this route all along and nothing
              rendered it, so what a merchant is waiting for was described
              twice — here in general terms, and in the catalogue precisely.
            */}
            {summary?.branchNoteAr && (
              <p className="text-[12px] text-amber-900/80">
                {summary.branchNoteAr}
              </p>
            )}
          </div>
        )}

        {courier.acceptsMerchantCredentials ? (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-slate-500">
              تستطيع ربط حسابك الخاص لدى {courier.displayName} لتُسجَّل الطرود
              باسمك. بدونه تُشحن الطلبات عبر حساب المنصة.
            </p>
            {/*
              Both vendors issue two kinds of login and only say so in their
              documentation: a *merchant* account and a *merchant user*
              sub-account. The difference surfaces at the invoice endpoints
              alone — a sub-user can create and track parcels perfectly well
              and is then refused at settlement, which is the worst possible
              place to find out.
            */}
            {!hasOwnLogin && (
              <p className="rounded-[12px] bg-sky-50 px-3 py-2.5 text-[12px] leading-relaxed text-sky-800">
                استخدم حساب التاجر الرئيسي وليس حساب مستخدم فرعي — الحساب
                الفرعي ينجح في إنشاء الطرود ثم تُرفض به كشوفات الحساب.
              </p>
            )}

            {/*
              Asked before a password is typed, not after.

              The server refuses to store a credential with no encryption key
              configured — correctly, since the alternative is plaintext — but
              it refuses by naming an environment variable, which is an
              operator's business and useless to a merchant. Closing the form
              here means they are told the feature is off rather than handed
              their own rejected password and a shell command.
            */}
            {!courier.canStoreCredentials ? (
              <p className="rounded-[12px] bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600">
                ربط الحساب الخاص غير متاح حالياً على هذه المنصة. تُشحن طلباتك
                عبر حساب المنصة لدى {courier.displayName} — تواصل مع الدعم إن
                أردت تفعيل الربط.
              </p>
            ) : hasOwnLogin ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-slate-50 px-3 py-2.5">
                <div className="text-[13px]">
                  <p className="font-bold text-slate-900">
                    مربوط بحسابك الخاص
                  </p>
                  {account?.username && (
                    <p className="text-slate-500" dir="ltr">
                      {account.username}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
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
                <Button
                  size="sm"
                  disabled={setCredentials.isPending}
                  onClick={save}
                >
                  {setCredentials.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  ربط الحساب
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed text-slate-500">
            تُشحن طلبات متجرك عبر حساب المنصة لدى {courier.displayName}، ولا
            تحتاج إلى إدخال أي بيانات دخول.
          </p>
        )}
      </div>
    </SettingsCard>
  );
};

export default CourierAccountCard;
