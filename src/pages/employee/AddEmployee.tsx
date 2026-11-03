import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PlanUpgradeGate from "@/components/PlanUpgradeGate";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";
import PagePanel from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import {
  SettingsField,
  SettingsInput,
  SettingsPhoneInput,
} from "@/new-pages/settings/components/SettingsField";
import {
  useCreateEmployee,
  useFetchEmployeeRoleTemplates,
  useFetchEmployeeStats,
} from "@/api/wrappers/employee.wrappers";
import { sanitizePhoneNumber } from "@/utils/helpers";
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

const AddEmployee = () => {
  const navigate = useNavigate();
  const { isLocked, isLoading: entitlementsLoading } = usePlanEntitlements();
  const { data: templates = [], isLoading: templatesLoading } =
    useFetchEmployeeRoleTemplates();
  const { data: stats } = useFetchEmployeeStats();
  const { mutate: createEmployee, isPending } = useCreateEmployee();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [roleTemplate, setRoleTemplate] =
    useState<EmployeeRoleTemplateKey | null>(null);

  const seatsLabel = useMemo(() => {
    if (!stats) return null;
    return `${stats.seatsUsed ?? 0} / ${stats.seatsMax ?? 1}`;
  }, [stats]);

  if (!entitlementsLoading && isLocked("team_users")) {
    return <PlanUpgradeGate feature="team_users" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error("أدخل اسم الموظف");
      return;
    }
    if (!roleTemplate) {
      toast.error("اختر دور الموظف");
      return;
    }

    let canonicalPhone: string;
    try {
      canonicalPhone = sanitizePhoneNumber(phone, "+964");
    } catch {
      toast.error("رقم الهاتف غير صالح");
      return;
    }

    createEmployee(
      {
        name: trimmedName,
        phone: canonicalPhone,
        ...(email.trim() ? { email: email.trim() } : {}),
        roleTemplate,
      },
      {
        onSuccess: () => {
          toast.success("تمت إضافة الموظف بنجاح");
          navigate("/employees");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "فشلت إضافة الموظف"));
        },
      },
    );
  };

  return (
    <PagePanel className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e7fc]">
            إضافة موظف جديد
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a4b1fa]">
            عيّن مسؤول داتا أو مسؤول طلبات — يدخل بنفس رقم الهاتف عبر OTP
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
          المقاعد المستخدمة:{" "}
          <span className="font-semibold text-slate-900 dark:text-[#e4e7fc]">
            {seatsLabel}
          </span>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[28px] bg-white p-5 shadow-none dark:bg-[#0a0e27] sm:p-6"
      >
        <SettingsField label="اسم الموظف" htmlFor="employee-name">
          <SettingsInput
            id="employee-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلاً: أحمد علي"
            autoComplete="name"
          />
        </SettingsField>

        <SettingsField label="رقم الهاتف" htmlFor="employee-phone">
          <SettingsPhoneInput
            id="employee-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </SettingsField>

        <SettingsField label="البريد (اختياري)" htmlFor="employee-email">
          <SettingsInput
            id="employee-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            className="text-left"
            autoComplete="email"
          />
        </SettingsField>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            الدور
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
                      <p className="mt-2 text-[11px] text-slate-400 dark:text-[#4a5596]">
                        {t.modules.join(" · ")}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-start">
          <Button
            type="submit"
            variant="brand"
            className="h-12 min-w-[160px]"
            disabled={isPending || templatesLoading}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            حفظ الموظف
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
