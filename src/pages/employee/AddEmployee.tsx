import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import TeamUpgradeDialog from "@/components/plan/TeamUpgradeDialog";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import PagePanel from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import {
  SettingsField,
  SettingsInput,
} from "@/new-pages/settings/components/SettingsField";
import {
  useCreateEmployee,
  useFetchEmployeeRoleTemplates,
  useFetchEmployeeStats,
} from "@/api/wrappers/employee.wrappers";
import { cn } from "@/lib/utils";
import type { EmployeeRoleTemplateKey } from "@/api/endpoints/employee.endpoints";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

/**
 * Invite-only hire: email is the identity for the magic invite link.
 * Accepting the link signs the employee in — no phone / OTP.
 */
const AddEmployee = () => {
  const navigate = useNavigate();
  const {
    isLocked,
    isLoading: entitlementsLoading,
    handleUpgradeError,
  } = usePlanEntitlements();
  const { data: templates = [], isLoading: templatesLoading } =
    useFetchEmployeeRoleTemplates();
  const { data: stats } = useFetchEmployeeStats();
  const { mutate: inviteEmployee, isPending } = useCreateEmployee();
  const teamLocked =
    isLocked("team_users") || stats?.teamEnabled === false;
  const canInvite =
    !teamLocked && stats?.canInvite !== false;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [roleTemplate, setRoleTemplate] =
    useState<EmployeeRoleTemplateKey | null>(null);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const seatsLabel = useMemo(() => {
    if (!stats) return null;
    const pending = stats.pendingInvites ?? 0;
    const used = (stats.seatsUsed ?? 0) + pending;
    return `${used} / ${stats.seatsMax ?? 1}`;
  }, [stats]);

  if (!entitlementsLoading && teamLocked) {
    return (
      <PagePanel className="relative min-h-[50vh]">
        <div className="pointer-events-none flex min-h-[50vh] flex-col items-center justify-center gap-3 opacity-40 blur-[1px]">
          <p className="text-lg font-bold text-slate-700 dark:text-[#e4e7fc]">
            دعوة موظف
          </p>
          <p className="text-sm text-slate-500">متاح بعد ترقية الخطة</p>
        </div>
        <TeamUpgradeDialog
          open
          dismissible
          onOpenChange={(open) => {
            if (!open) navigate("/", { replace: true });
          }}
        />
      </PagePanel>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLastInviteUrl(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("أدخل بريداً إلكترونياً صالحاً");
      return;
    }
    if (trimmedName.length < 2) {
      toast.error("أدخل اسم الموظف");
      return;
    }
    if (!roleTemplate) {
      toast.error("اختر دور الموظف");
      return;
    }

    inviteEmployee(
      {
        email: trimmedEmail,
        name: trimmedName,
        roleTemplate,
      },
      {
        onSuccess: (data) => {
          if (data?.inviteUrl && data?.emailed === false) {
            setLastInviteUrl(data.inviteUrl);
            toast.success("تم إنشاء الدعوة — انسخ الرابط وأرسله يدوياً");
            return;
          }
          toast.success("تم إرسال دعوة الانضمام على الإيميل");
          navigate("/employees");
        },
        onError: (err) => {
          // Starter plan: API 403 PLAN_UPGRADE_REQUIRED — open upgrade, not a bare toast.
          if (handleUpgradeError(err, getErrorMessage(err, "فشل إرسال الدعوة"))) {
            return;
          }
        },
      },
    );
  };

  const copyInviteUrl = async () => {
    if (!lastInviteUrl) return;
    try {
      await navigator.clipboard.writeText(lastInviteUrl);
      toast.success("تم نسخ الرابط");
    } catch {
      toast.error("تعذر النسخ — انسخ الرابط يدوياً");
    }
  };

  return (
    <PagePanel className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e7fc]">
            دعوة موظف
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a4b1fa]">
            أرسل دعوة بالإيميل — يفتح الرابط ويكمل حسابه بنفسه
          </p>
        </div>
        <Button
          type="button"
          variant="brand-soft"
          className="h-11 shrink-0 gap-2"
          onClick={() => navigate("/employees")}
        >
          <ArrowRight className="size-4" />
          رجوع
        </Button>
      </div>

      {seatsLabel ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-white/[0.04] dark:text-[#a4b1fa]">
          المقاعد المستخدمة (مع الدعوات المعلّقة):{" "}
          <span className="font-semibold text-slate-900 dark:text-[#e4e7fc]">
            {seatsLabel}
          </span>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[28px] bg-white p-5 shadow-none dark:bg-[#0a0e27] sm:p-6"
      >
        <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/50 dark:bg-sky-950/30">
          <div className="mb-3 flex items-center gap-2 text-sky-900 dark:text-sky-100">
            <Mail className="size-4 shrink-0" />
            <p className="text-sm font-semibold">البريد الإلكتروني</p>
            <span className="rounded-full bg-sky-600/10 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
              الأهم
            </span>
          </div>
          <SettingsInput
            id="employee-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            className="h-12 border-sky-200 bg-white text-left text-base dark:border-sky-800 dark:bg-[#070b1f]"
            autoComplete="email"
            required
            autoFocus
          />
          <p className="mt-2 text-[11px] leading-relaxed text-sky-800/80 dark:text-sky-200/70">
            نرسل على هذا الإيميل رابط قبول الدعوة لدخول لوحة المتجر
          </p>
        </div>

        <SettingsField label="اسم الموظف" htmlFor="employee-name">
          <SettingsInput
            id="employee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: أحمد علي"
            autoComplete="name"
          />
        </SettingsField>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            الدور المسند
          </p>
          {templatesLoading ? (
            <p className="text-sm text-slate-400">جاري تحميل الأدوار…</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((t: any) => {
                const selected = roleTemplate === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setRoleTemplate(t.key)}
                    className={cn(
                      "rounded-2xl border p-4 text-right transition",
                      selected
                        ? "border-[#00b7ff] bg-[#00b7ff]/8 ring-2 ring-[#00b7ff]/25"
                        : "border-slate-100 bg-slate-50 hover:border-slate-200 dark:border-white/8 dark:bg-white/[0.03] dark:hover:border-white/15",
                    )}
                  >
                    <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">
                      {t.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-[#a4b1fa]">
                      {t.description}
                    </p>
                    {Array.isArray(t.modules) && t.modules.length > 0 ? (
                      <p className="mt-2 text-[11px] leading-5 text-slate-400 dark:text-[#4a5596]">
                        {t.modules.join(" · ")}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {lastInviteUrl ? (
          <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              الإيميل لم يُرسل — انسخ رابط الدعوة
            </p>
            <p
              className="break-all rounded-xl bg-white/80 px-3 py-2 text-left text-[11px] text-slate-600 dark:bg-black/20 dark:text-slate-300"
              dir="ltr"
            >
              {lastInviteUrl}
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-10 gap-2"
              onClick={() => void copyInviteUrl()}
            >
              <Copy className="size-3.5" />
              نسخ الرابط
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-start">
          <Button
            type="submit"
            variant="brand"
            className="h-12 min-w-[180px] gap-2"
            disabled={isPending || templatesLoading || !canInvite}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            إرسال دعوة بالإيميل
          </Button>
          <Button
            type="button"
            variant="brand-soft"
            className="h-12"
            disabled={isPending}
            onClick={() => navigate("/employees")}
          >
            إلغاء
          </Button>
        </div>
      </form>
    </PagePanel>
  );
};

export default AddEmployee;
