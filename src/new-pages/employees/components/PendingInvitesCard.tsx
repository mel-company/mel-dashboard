import { Loader2, Mail, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useFetchEmployeeInvites,
  useResendEmployeeInvite,
  useRevokeEmployeeInvite,
} from "@/api/wrappers/employee.wrappers";
import type { EmployeeInvite } from "@/api/endpoints/employee.endpoints";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const PendingInvitesCard = () => {
  const { data: invites = [], isLoading } = useFetchEmployeeInvites();
  const resend = useResendEmployeeInvite();
  const revoke = useRevokeEmployeeInvite();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-3xl bg-amber-50/80 px-4 py-6 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <Loader2 className="size-4 animate-spin" />
        جاري تحميل الدعوات…
      </div>
    );
  }

  if (!invites.length) return null;

  const onResend = (invite: EmployeeInvite) => {
    resend.mutate(invite.id, {
      onSuccess: (data) => {
        toast.success(
          data?.emailed === false
            ? "تم تجديد الدعوة (الإيميل غير مفعّل حالياً)"
            : "أُعيد إرسال الدعوة",
        );
      },
      onError: (err) =>
        toast.error(getErrorMessage(err, "تعذر إعادة الإرسال")),
    });
  };

  const onRevoke = (invite: EmployeeInvite) => {
    revoke.mutate(invite.id, {
      onSuccess: () => toast.success("أُلغيت الدعوة"),
      onError: (err) => toast.error(getErrorMessage(err, "تعذر الإلغاء")),
    });
  };

  return (
    <div className="rounded-[28px] border border-amber-200/80 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/25">
      <div className="mb-3 flex items-center gap-2 text-right">
        <Mail className="size-4 text-amber-700 dark:text-amber-300" />
        <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
          دعوات معلّقة ({invites.length})
        </h2>
      </div>
      <ul className="space-y-2">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex flex-col gap-2 rounded-2xl bg-white/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-950/40"
          >
            <div className="min-w-0 text-right">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {invite.name}
              </p>
              <p className="truncate text-xs text-slate-500" dir="ltr">
                {invite.email}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-200/80">
                {invite.roleName || invite.roleTemplate} · تنتهي{" "}
                {new Date(invite.expiresAt).toLocaleDateString("ar-IQ")}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-xl"
                disabled={resend.isPending || revoke.isPending}
                onClick={() => onResend(invite)}
              >
                {resend.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                إعادة إرسال
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                disabled={resend.isPending || revoke.isPending}
                onClick={() => onRevoke(invite)}
              >
                <Trash2 className="size-3.5" />
                إلغاء
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingInvitesCard;
