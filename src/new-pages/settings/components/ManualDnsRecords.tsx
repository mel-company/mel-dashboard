import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Loading03Icon,
  RefreshIcon,
  Tick02Icon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DomainStatusBadge from "./DomainStatusBadge";
import { useCustomDomainStatus } from "@/api/wrappers/domain.wrappers";
import type {
  CustomDomainResponse,
  DomainDnsRecord,
} from "@/api/endpoints/domain.endpoints";

const PURPOSE_LABELS: Record<DomainDnsRecord["purpose"], string> = {
  routing: "توجيه الزيارات",
  ownership: "إثبات الملكية",
  ssl: "شهادة SSL",
};

/**
 * `navigator.clipboard` is unavailable on an insecure origin and can be denied
 * outright, so fall back to the legacy selection copy before giving up.
 */
const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // fall through
  }

  try {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
};

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!(await copyText(value))) {
      toast.error("تعذّر النسخ — انسخ القيمة يدوياً");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="نسخ"
      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      {copied ? (
        <HugeiconsIcon
          icon={Tick02Icon}
          size={16}
          className="text-emerald-500"
        />
      ) : (
        <HugeiconsIcon icon={Copy01Icon} size={16} />
      )}
    </button>
  );
};

const RecordRow = ({ record }: { record: DomainDnsRecord }) => (
  <div className="space-y-2 rounded-2xl bg-slate-100 p-3 dark:bg-slate-900">
    <div className="flex items-center justify-between gap-2">
      <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        {record.type}
      </span>
      <span className="text-[13px] text-slate-500 dark:text-slate-400">
        {PURPOSE_LABELS[record.purpose] ?? record.purpose}
      </span>
    </div>

    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[13px] text-slate-500">الاسم</span>
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate text-left text-[13px] text-slate-900 dark:text-slate-100"
          title={record.name}
        >
          {record.name}
        </code>
        <CopyButton value={record.name} />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-[13px] text-slate-500">القيمة</span>
        <code
          dir="ltr"
          className="min-w-0 flex-1 truncate text-left text-[13px] text-slate-900 dark:text-slate-100"
          title={record.value}
        >
          {record.value}
        </code>
        <CopyButton value={record.value} />
      </div>
    </div>
  </div>
);

type ManualDnsRecordsProps = {
  /**
   * The attach response, when this is rendered right after attaching. Omit it
   * to read the stored state for the domain already on the store.
   */
  initialData?: CustomDomainResponse | null;
  enabled?: boolean;
};

/**
 * The DNS records a merchant must add at their own registrar, plus how far
 * Cloudflare has got with them.
 *
 * Verification is a DNS round-trip that can take minutes, so the query polls
 * itself while the status is `pending` and settles once it isn't.
 */
const ManualDnsRecords = ({
  initialData,
  enabled = true,
}: ManualDnsRecordsProps) => {
  const { data, isFetching, isError, refetch } = useCustomDomainStatus(enabled);
  const details = data ?? initialData ?? null;

  if (!details?.customDomain) {
    // Nothing to show is a legitimate state; a failed read is not — say so
    // rather than letting the whole panel disappear.
    if (!isError) return null;

    return (
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          تعذّر قراءة حالة الدومين.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="shrink-0 gap-1.5"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={16}
            className={cn(isFetching && "animate-spin")}
          />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const records = details.dns?.records ?? [];
  const errors = details.ssl?.verificationErrors ?? [];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <code
            dir="ltr"
            className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            {details.customDomain}
          </code>
          <DomainStatusBadge status={details.ssl?.status} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="shrink-0 gap-1.5"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={16}
            className={cn(isFetching && "animate-spin")}
          />
          تحديث
        </Button>
      </div>

      {details.ssl?.status === "pending" && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          أضف السجلات التالية عند مزوّد الدومين. قد يستغرق التحقق بضع دقائق بعد
          إضافتها.
        </p>
      )}

      {records.length > 0 ? (
        <div className="space-y-2">
          {records.map((record) => (
            <RecordRow
              key={`${record.type}-${record.name}-${record.value}`}
              record={record}
            />
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {details.dns?.cnameTarget
            ? `وجّه الدومين عبر سجل CNAME إلى ${details.dns.cnameTarget}`
            : "لا توجد سجلات مطلوبة حالياً."}
        </p>
      )}

      {details.ssl?.error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {details.ssl.error}
        </p>
      )}

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {isFetching && !data && (
        <p className="flex items-center gap-2 text-[13px] text-slate-500">
          <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
          جاري قراءة الحالة...
        </p>
      )}
    </div>
  );
};

export default ManualDnsRecords;
