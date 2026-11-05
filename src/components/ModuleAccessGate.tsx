import { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Loader2, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useModulePermissions } from "@/hooks/use-module-permissions";
import { useCreateAccessRequest } from "@/api/wrappers/access-request.wrappers";
import { moduleForPath } from "@/lib/module-permissions";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

/**
 * Blocks employees from routes outside their RolePermission set and offers
 * «طلب صلاحية» which notifies the store owner.
 */
const ModuleAccessGate = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { isLoading, isOwner, canViewPath, refetch } = useModulePermissions();
  const createRequest = useCreateAccessRequest();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  // Pick up owner approvals without a full reload.
  useEffect(() => {
    void refetch();
  }, [pathname, refetch]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (isOwner || canViewPath(pathname)) {
    return <>{children}</>;
  }

  const moduleName = moduleForPath(pathname);

  // Owner-only areas (الإعدادات) — no request form for random modules that
  // employees shouldn't self-promote into team admin. Still allow request
  // for real catalogue modules.
  const canRequest =
    typeof moduleName === "string" && moduleName !== "الإعدادات";

  const submit = () => {
    if (!moduleName) return;
    createRequest.mutate(
      {
        moduleName,
        ...(message.trim() ? { message: message.trim() } : {}),
      },
      {
        onSuccess: () => {
          setSent(true);
          toast.success("أُرسل الطلب للمالك — بانتظار الموافقة");
        },
        onError: (err) =>
          toast.error(getErrorMessage(err, "تعذر إرسال الطلب")),
      },
    );
  };

  if (!canRequest) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
        <Lock className="size-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-[#e4e7fc]">
        هذه الوحدة غير مسندة لك
      </h1>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-[#a4b1fa]">
        صلاحياتك تغطي عملك المسند فقط. لفتح «{moduleName}» أرسل طلب موافقة
        لمالك المتجر.
      </p>

      {sent ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          تم إرسال الطلب. ستصلك إشعار عند الموافقة أو الرفض.
        </p>
      ) : (
        <div className="w-full space-y-3 text-right">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="سبب الطلب (اختياري)"
            className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-[#0a0e27]"
          />
          <Button
            type="button"
            variant="brand"
            className="h-11 w-full gap-2"
            disabled={createRequest.isPending}
            onClick={submit}
          >
            {createRequest.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            طلب موافقة من المالك
          </Button>
        </div>
      )}
    </div>
  );
};

export default ModuleAccessGate;
