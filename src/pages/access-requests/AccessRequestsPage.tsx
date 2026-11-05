import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { useModulePermissions } from "@/hooks/use-module-permissions";
import {
  useApproveAccessRequest,
  useFetchStoreAccessRequests,
  useRejectAccessRequest,
} from "@/api/wrappers/access-request.wrappers";
import { Navigate } from "react-router-dom";
import type { AccessRequest } from "@/api/endpoints/access-request.endpoints";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const statusLabel: Record<string, string> = {
  PENDING: "بانتظار القرار",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
};

const AccessRequestsPage = () => {
  const { isOwner, isLoading: permsLoading } = useModulePermissions();
  const { data: requests = [], isLoading } = useFetchStoreAccessRequests(
    isOwner,
  );
  const approve = useApproveAccessRequest();
  const reject = useRejectAccessRequest();

  if (permsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!isOwner) {
    return <Navigate to="/" replace />;
  }

  const pending = requests.filter((r) => r.status === "PENDING");
  const decided = requests.filter((r) => r.status !== "PENDING");

  const onApprove = (req: AccessRequest) => {
    approve.mutate(
      { id: req.id },
      {
        onSuccess: () => toast.success(`تمت الموافقة على «${req.moduleName}»`),
        onError: (err) =>
          toast.error(getErrorMessage(err, "تعذر الموافقة")),
      },
    );
  };

  const onReject = (req: AccessRequest) => {
    reject.mutate(
      { id: req.id },
      {
        onSuccess: () => toast.success(`رُفض طلب «${req.moduleName}»`),
        onError: (err) => toast.error(getErrorMessage(err, "تعذر الرفض")),
      },
    );
  };

  return (
    <PagePanel className="mx-auto max-w-3xl space-y-6">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e7fc]">
          طلبات الصلاحيات
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#a4b1fa]">
          وافق أو ارفض طلبات الموظفين للوصول لوحدات خارج دورهم المسند
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-5 animate-spin text-sky-600" />
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              معلّقة ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400 dark:bg-white/[0.03]">
                لا توجد طلبات بانتظار القرار
              </p>
            ) : (
              pending.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  busy={approve.isPending || reject.isPending}
                  onApprove={() => onApprove(req)}
                  onReject={() => onReject(req)}
                />
              ))
            )}
          </section>

          {decided.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500">
                سابقة ({decided.length})
              </h2>
              {decided.map((req) => (
                <RequestCard key={req.id} req={req} />
              ))}
            </section>
          ) : null}
        </>
      )}
    </PagePanel>
  );
};

function RequestCard({
  req,
  busy,
  onApprove,
  onReject,
}: {
  req: AccessRequest;
  busy?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const name =
    req.requester.user.name ||
    req.requester.user.phone ||
    req.requester.user.email ||
    "موظف";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 text-right dark:border-white/8 dark:bg-[#0a0e27]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-[#e4e7fc]">
            {name}
            <span className="mx-1 text-slate-300">·</span>
            <span className="text-sky-700 dark:text-sky-300">
              {req.moduleName}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {req.requester.role.name} ·{" "}
            {new Date(req.createdAt).toLocaleString("ar-IQ")} ·{" "}
            {statusLabel[req.status] || req.status}
          </p>
          {req.message ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-[#a4b1fa]">
              {req.message}
            </p>
          ) : null}
        </div>

        {req.status === "PENDING" && onApprove && onReject ? (
          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              size="sm"
              variant="brand"
              className="h-9 gap-1.5 rounded-xl"
              disabled={busy}
              onClick={onApprove}
            >
              <Check className="size-3.5" />
              موافقة
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 gap-1.5 rounded-xl border-red-200 text-red-700"
              disabled={busy}
              onClick={onReject}
            >
              <X className="size-3.5" />
              رفض
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AccessRequestsPage;
