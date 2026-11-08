import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/UserAvatar";
import {
  useDeleteEmployee,
  useFetchEmployee,
  useFetchEmployeeRoleTemplates,
  useUpdateEmployee,
} from "@/api/wrappers/employee.wrappers";
import type { EmployeeRoleTemplateKey } from "@/api/endpoints/employee.endpoints";
import { cn } from "@/lib/utils";
import EmployeeDeleteModal from "@/new-pages/employees/components/EmployeeDeleteModal";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

function templateKeyFromRoleName(
  roleName?: string,
): EmployeeRoleTemplateKey | null {
  if (roleName === "مسؤول الداتا") return "DATA";
  if (roleName === "مسؤول الطلبات") return "ORDERS";
  if (roleName === "مدير المتجر") return "ADMIN";
  return null;
}

const EmployeeDetails = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error, refetch } = useFetchEmployee(id);
  const { data: templates = [] } = useFetchEmployeeRoleTemplates();
  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
  const { mutate: deleteEmployee, isPending: isDeleting } = useDeleteEmployee();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const currentKey = useMemo(
    () => templateKeyFromRoleName(employee?.role?.name),
    [employee?.role?.name],
  );

  if (isLoading) {
    return (
      <PagePanel className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-slate-400" />
      </PagePanel>
    );
  }

  if (error || !employee) {
    return (
      <PagePanel className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <User className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">الموظف غير موجود</h2>
        <p className="text-sm text-muted-foreground">
          الموظف الذي تبحث عنه غير موجود أو تم حذفه.
        </p>
        <Button variant="brand-soft" onClick={() => navigate("/employees")}>
          العودة إلى الموظفين
        </Button>
      </PagePanel>
    );
  }

  const user = employee.user;
  const permissions = employee.role?.permissions ?? [];

  const handleRoleChange = (key: EmployeeRoleTemplateKey) => {
    if (key === currentKey) return;
    updateEmployee(
      { id, data: { roleTemplate: key } },
      {
        onSuccess: () => {
          toast.success("تم تحديث دور الموظف");
          refetch();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, "فشل تحديث الدور"));
        },
      },
    );
  };

  return (
    <PagePanel className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="brand-soft"
          className="h-11 gap-2"
          onClick={() => navigate("/employees")}
        >
          <ArrowRight className="size-4" />
          رجوع
        </Button>
        <Button
          type="button"
          variant="destructive-outline"
          className="h-11 gap-2"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          حذف
        </Button>
      </div>

      <div className="rounded-[28px] bg-white p-6 dark:bg-[#0a0e27]">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <UserAvatar
            seed={String(employee.id)}
            alt={user?.name ?? "موظف"}
            className="size-24 shadow-md ring-4 ring-white/70 dark:ring-white/10"
          />
          <div className="min-w-0 flex-1 space-y-3 text-center sm:text-right">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-[#f0f2ff]">
                {user?.name ?? "—"}
              </h1>
              <Badge variant="outline" className="mt-2 rounded-full px-3 py-1">
                {employee.role?.name ?? "موظف"}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-[#a4b1fa]">
              <p className="inline-flex items-center justify-center gap-2 sm:justify-start" dir="ltr">
                <Phone className="size-4" />
                {user?.phone ?? "—"}
              </p>
              {user?.email && !String(user.email).endsWith("@employees.mel.local") ? (
                <p className="inline-flex items-center justify-center gap-2 sm:justify-start" dir="ltr">
                  <Mail className="size-4" />
                  {user.email}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[28px] bg-white p-6 dark:bg-[#0a0e27]">
        <div className="flex items-center gap-2 text-slate-900 dark:text-[#f0f2ff]">
          <Shield className="size-5" />
          <h2 className="text-lg font-semibold">تغيير الدور</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t: any) => {
            const selected = currentKey === t.key;
            return (
              <button
                key={t.key}
                type="button"
                disabled={isUpdating}
                onClick={() => handleRoleChange(t.key)}
                className={cn(
                  "rounded-2xl border p-4 text-right transition disabled:opacity-60",
                  selected
                    ? "border-[#00b7ff] bg-[#00b7ff]/8 ring-2 ring-[#00b7ff]/25"
                    : "border-slate-100 bg-slate-50 hover:border-slate-200 dark:border-white/8 dark:bg-white/[0.03]",
                )}
              >
                <p className="font-semibold text-slate-900 dark:text-[#f0f2ff]">
                  {t.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-[#a4b1fa]">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {permissions.length > 0 ? (
        <div className="space-y-3 rounded-[28px] bg-white p-6 dark:bg-[#0a0e27]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#f0f2ff]">
            الصلاحيات
          </h2>
          <div className="divide-y divide-slate-100 dark:divide-white/6">
            {permissions.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <span className="font-medium text-slate-800 dark:text-[#e4e7fc]">
                  {p.module?.name ?? "—"}
                </span>
                <span className="text-xs text-slate-400 dark:text-[#4a5596]">
                  {[
                    p.view && "عرض",
                    p.add && "إضافة",
                    p.edit && "تعديل",
                    p.delete && "حذف",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "بدون صلاحية"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <EmployeeDeleteModal
        deleteId={deleteOpen ? id : null}
        setDeleteId={(v) => setDeleteOpen(!!v)}
        isDeleting={isDeleting}
        employeeName={user?.name}
        handleDelete={() => {
          deleteEmployee(id, {
            onSuccess: () => {
              toast.success("تم حذف الموظف");
              navigate("/employees");
            },
            onError: (err) => {
              toast.error(getErrorMessage(err, "فشل حذف الموظف"));
            },
          });
        }}
      />
    </PagePanel>
  );
};

export default EmployeeDetails;
