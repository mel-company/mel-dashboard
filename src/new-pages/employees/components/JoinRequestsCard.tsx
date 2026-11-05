import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { employeeAPI } from "@/api/endpoints/employee.endpoints";
import type { EmployeeRoleTemplateKey } from "@/api/endpoints/employee.endpoints";
import { cn } from "@/lib/utils";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const ROLES: { key: EmployeeRoleTemplateKey; label: string }[] = [
  { key: "DATA", label: "مسؤول داتا" },
  { key: "ORDERS", label: "مسؤول طلبات" },
  { key: "ADMIN", label: "مدير (كامل)" },
];

const JoinRequestsCard = () => {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["join-requests"],
    queryFn: () => employeeAPI.fetchJoinRequests(),
  });
  const [roleById, setRoleById] = useState<Record<string, EmployeeRoleTemplateKey>>(
    {},
  );

  const approve = useMutation({
    mutationFn: ({
      id,
      roleTemplate,
    }: {
      id: string;
      roleTemplate: EmployeeRoleTemplateKey;
    }) => employeeAPI.approveJoinRequest(id, { roleTemplate }),
    onSuccess: () => {
      toast.success("تمت الموافقة — أُرسلت دعوة بالإيميل");
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, "تعذر الموافقة")),
  });

  const reject = useMutation({
    mutationFn: (id: string) => employeeAPI.rejectJoinRequest(id),
    onSuccess: () => {
      toast.success("رُفض الطلب");
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
    onError: (err) => toast.error(getErrorMessage(err, "تعذر الرفض")),
  });

  const pending = requests.filter((r: any) => r.status === "PENDING");
  if (isLoading) return null;
  if (!pending.length) return null;

  return (
    <div className="rounded-[28px] border border-violet-200/80 bg-violet-50/70 p-4 dark:border-violet-900/50 dark:bg-violet-950/25">
      <div className="mb-3 flex items-center gap-2 text-right">
        <UserPlus className="size-4 text-violet-700 dark:text-violet-300" />
        <h2 className="text-sm font-semibold text-violet-950 dark:text-violet-100">
          طلبات انضمام من صفحة الدخول ({pending.length})
        </h2>
      </div>
      <ul className="space-y-3">
        {pending.map((req: any) => {
          const role = roleById[req.id] || "DATA";
          return (
            <li
              key={req.id}
              className="rounded-2xl bg-white/90 p-3 dark:bg-slate-950/40"
            >
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {req.name}
                </p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {req.email}
                </p>
                {req.message ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {req.message}
                  </p>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() =>
                      setRoleById((prev) => ({ ...prev, [req.id]: r.key }))
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium",
                      role === r.key
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="brand"
                  className="h-9 rounded-xl"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() =>
                    approve.mutate({ id: req.id, roleTemplate: role })
                  }
                >
                  {approve.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  موافقة + دعوة
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 rounded-xl border-red-200 text-red-700"
                  disabled={approve.isPending || reject.isPending}
                  onClick={() => reject.mutate(req.id)}
                >
                  رفض
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default JoinRequestsCard;
