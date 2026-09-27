import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading03Icon,
  Search01Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { settingsInputClassName, SettingsLabel } from "./SettingsField";
import ManualDnsRecords from "./ManualDnsRecords";
import type {
  CustomDomainResponse,
  DomainConnectDiscovery,
} from "@/api/endpoints/domain.endpoints";
import {
  useDiscoverDomainConnect,
  useSetCustomDomain,
  useStartDomainConnect,
} from "@/api/wrappers/domain.wrappers";

type BringYourOwnDomainProps = {
  /** A custom domain already on the store — its DNS state is shown straight away. */
  attachedDomain?: string | null;
  /** Pre-fills the field, so a merchant can re-check the domain they already have. */
  defaultDomain?: string;
};

/**
 * Path 3: the merchant already owns a domain.
 *
 * Discover → buttons come from `ui.primaryAction`, never from the provider
 * name. Automatic hands off to the DNS provider's own UX via a signed applyUrl;
 * manual attaches the domain here and then shows the records to add.
 */
const BringYourOwnDomain = ({
  attachedDomain,
  defaultDomain = "",
}: BringYourOwnDomainProps) => {
  const [domain, setDomain] = useState(defaultDomain);
  const [result, setResult] = useState<DomainConnectDiscovery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attached, setAttached] = useState<CustomDomainResponse | null>(null);

  const discoverMutation = useDiscoverDomainConnect();
  const startMutation = useStartDomainConnect();
  const attachMutation = useSetCustomDomain();

  const onCheck = () => {
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
      toast.error("أدخل الدومين أولاً");
      return;
    }

    setError(null);
    setResult(null);
    setAttached(null);

    discoverMutation.mutate(
      { domain: trimmed },
      {
        onSuccess: (data) => setResult(data),
        onError: () => {
          setError("ما قدرنا نفحص هذا الدومين. جرّب مرة ثانية.");
        },
      },
    );
  };

  const onConnectAutomatically = () => {
    const target = (result?.domain || domain).trim().toLowerCase();
    if (!target) {
      toast.error("أدخل الدومين أولاً");
      return;
    }

    startMutation.mutate(
      { domain: target },
      {
        onSuccess: (data) => {
          if (!data?.applyUrl) {
            toast.error("ما استلمنا رابط الربط التلقائي. جرّب مرة ثانية.");
            return;
          }
          window.location.href = data.applyUrl;
        },
        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message ||
              "تعذر بدء الربط التلقائي. جرّب مرة ثانية.",
          );
        },
      },
    );
  };

  /**
   * Manual is the only branch that writes: attaching provisions the Cloudflare
   * custom hostnames, and the DNS records to add come back with the response.
   */
  const onConnectManually = () => {
    const target = (result?.domain || domain).trim().toLowerCase();
    if (!target) {
      toast.error("أدخل الدومين أولاً");
      return;
    }

    attachMutation.mutate(
      { domain: target },
      {
        onSuccess: (data) => {
          setAttached(data);
          toast.success("تم ربط الدومين — أضف السجلات التالية عند مزوّد الدومين");
        },
        onError: (err: any) => {
          const message = err?.response?.data?.message;
          toast.error(
            Array.isArray(message)
              ? message.join(" — ")
              : message || "تعذر ربط الدومين. جرّب مرة ثانية.",
          );
        },
      },
    );
  };

  const loading = discoverMutation.isPending;
  const starting = startMutation.isPending;
  const attaching = attachMutation.isPending;
  const busy = loading || starting || attaching;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <SettingsLabel htmlFor="byod-input">عندي دومين جاهز</SettingsLabel>
        <p className="px-1 text-[13px] text-slate-500 dark:text-slate-400">
          أدخل دوميناً تملكه مسبقاً — نفحص إن كان الربط التلقائي متاحاً أو
          يدوياً. التحقق لا يربط الدومين بالمتجر.
        </p>
        <div className="flex gap-2">
          <Input
            id="byod-input"
            value={domain}
            onChange={(e) => {
              setDomain(e.target.value);
              setResult(null);
              setError(null);
              setAttached(null);
            }}
            placeholder="example.com"
            disabled={busy}
            dir="ltr"
            className={cn(settingsInputClassName, "text-center")}
          />
          <Button
            type="button"
            onClick={onCheck}
            disabled={busy || !domain.trim()}
            className={cn(
              "h-12 shrink-0 gap-2 rounded-2xl border px-5 font-semibold shadow-none",
              "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
              "dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50",
            )}
          >
            {loading ? (
              <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
            ) : (
              <HugeiconsIcon icon={Search01Icon} size={16} />
            )}
            تحقق
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {result && !attached && (
        <div className="space-y-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-900">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {result.ui.title}
            </h3>
            {result.provider.displayName && (
              <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
                المزود: {result.provider.displayName}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-400" dir="ltr">
              {result.domain} · {result.connectionMode}
              {result.automaticAvailable ? " · automatic available" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {result.ui.primaryAction === "connect_automatically" ? (
              <Button
                type="button"
                onClick={onConnectAutomatically}
                disabled={starting}
                className="h-11 rounded-2xl"
              >
                {starting && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                {starting ? "جاري التحويل…" : "ربط تلقائي"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onConnectManually}
                disabled={attaching}
                className="h-11 rounded-2xl"
              >
                {attaching && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                ربط يدوي
              </Button>
            )}

            {result.ui.secondaryAction === "connect_manually" && (
              <Button
                type="button"
                variant="outline"
                onClick={onConnectManually}
                disabled={busy}
                className="h-11 rounded-2xl"
              >
                {attaching && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                ربط يدوي
              </Button>
            )}
          </div>
        </div>
      )}

      {(attached || attachedDomain) && (
        <ManualDnsRecords
          initialData={attached}
          enabled={Boolean(attached || attachedDomain)}
        />
      )}
    </div>
  );
};

export default BringYourOwnDomain;
