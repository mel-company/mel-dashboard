import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { useModulePermissions } from "@/hooks/use-module-permissions";
import {
  useCreateAccessRequest,
  useFetchMyAccessRequests,
} from "@/api/wrappers/access-request.wrappers";
import { REQUESTABLE_MODULES } from "@/lib/module-permissions";
import { cn } from "@/lib/utils";

function getErrorMessage(err: unknown, fallback: string): string {
  const message = (
    err as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join("، ");
  if (typeof message === "string") return message;
  return fallback;
}

const statusLabel: Record<string, string> = {
  PENDING: "بانتظار المالك",
  APPROVED: "موافق عليه",
  REJECTED: "مرفوض",
};

/**
 * Employee self-serve: pick a module and ask the owner to grant it.
 * Always reachable from the sidebar — not only via the lock screen.
 */
const RequestAccessPage = () => {
  const { isOwner, isLoading, permissions, canViewModule } =
    useModulePermissions();
  const { data: mine = [], isLoading: loadingMine } =
    useFetchMyAccessRequests(!isOwner);
  const createRequest = useCreateAccessRequest();

  const [moduleName, setModuleName] = useState<string>("");
  const [message, setMessage] = useState("");

  const available = useMemo(
    () =>
      REQUESTABLE_MODULES.filter(
        (m) => m !== "الإعدادات" && !canViewModule(m),
      ),
    [canViewModule],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (isOwner) {
    return <Navigate to="/access-requests" replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleName) {
      toast.error("اختر الوحدة التي تريد الانضمام لها");
      return;
    }
    createRequest.mutate(
      {
        moduleName,
        ...(message.trim() ? { message: message.trim() } : {}),
      },
      {
        onSuccess: () => {
          toast.success("أُرسل طلب الانضمام للمالك");
          setMessage("");
          setModuleName("");
        },
        onError: (err) =>
          toast.error(getErrorMessage(err, "تعذر إرسال الطلب")),
      },
    );
  };

  return (
    <PagePanel className="mx-auto max-w-xl space-y-6">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e4e7fc]">
          طلب انضمام لوحدة
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[#a4b1fa]">
          اختر وحدة خارج صلاحياتك الحالية — يصل إشعار للمالك للموافقة أو الرفض
        </p>
        {permissions.length > 0 ? (
          <p className="mt-2 text-xs text-slate-400">
            لديك حالياً:{" "}
            {permissions
              .filter((p) => p.view)
              .map((p) => p.module)
              .join(" · ") || "لا شيء بعد"}
          </p>
        ) : null}
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-[28px] bg-white p-5 dark:bg-[#0a0e27]"
      >
        {available.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            لديك صلاحية كل الوحدات المتاحة للطلب حالياً.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                الوحدة
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {available.map((m) => {
                  const selected = moduleName === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModuleName(m)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition",
                        selected
                          ? "border-sky-500 bg-sky-50 font-semibold text-sky-900 ring-2 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-100"
                          : "border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200 dark:border-white/8 dark:bg-white/[0.03] dark:text-slate-200",
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="join-message"
                className="text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                ملاحظة للمالك (اختياري)
              </label>
              <textarea
                id="join-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={280}
                placeholder="مثلاً: أحتاج المنتجات لتحديث الأسعار"
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-[#070b1f]"
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              className="h-12 w-full gap-2"
              disabled={createRequest.isPending || !moduleName}
            >
              {createRequest.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              إرسال طلب الانضمام
            </Button>
          </>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          طلباتي
        </h2>
        {loadingMine ? (
          <Loader2 className="mx-auto size-5 animate-spin text-sky-600" />
        ) : mine.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-400 dark:bg-white/[0.03]">
            لا توجد طلبات بعد
          </p>
        ) : (
          <ul className="space-y-2">
            {mine.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-right dark:border-white/8 dark:bg-[#0a0e27]"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-[#e4e7fc]">
                    {r.moduleName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleString("ar-IQ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    r.status === "PENDING" &&
                      "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
                    r.status === "APPROVED" &&
                      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
                    r.status === "REJECTED" &&
                      "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200",
                  )}
                >
                  {statusLabel[r.status] || r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PagePanel>
  );
};

export default RequestAccessPage;
