import { useStoreCreditBalance } from "@/api/wrappers/credits.wrapper";
import type { StoreCreditBalance } from "@/api/endpoints/credits.endpoint";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import { formatDay } from "./table";

/** Editor credits are charged by model cost, so they can be fractional. */
const num = (value?: number) =>
  (value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 });

type Bucket = StoreCreditBalance["generations"];

/** One balance: what is left in bold, where it comes from underneath. */
const Row = ({ label, bucket }: { label: string; bucket: Bucket }) => {
  const onTrial = !bucket.included && (bucket.trial?.limit ?? 0) > 0;
  const left =
    bucket.remaining +
    (bucket.purchased ?? 0) +
    (onTrial ? bucket.trial?.remaining ?? 0 : 0);
  const parts = [
    onTrial
      ? `تجربة ${num(bucket.trial?.remaining)} من ${num(bucket.trial?.limit)}`
      : `الباقة ${num(bucket.remaining)} من ${num(bucket.included)}`,
    `مشترى ${num(bucket.purchased)}`,
  ];
  return (
    <div className="rounded-[14px] bg-slate-100 px-4 py-3 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-slate-900 dark:text-slate-100">{label}</span>
        <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">
          {num(left)}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">{parts.join(" · ")}</p>
    </div>
  );
};

/** What is left of this month's AI builds and editor credits. */
const CreditsSection = () => {
  const { data, isError } = useStoreCreditBalance();
  if (isError || !data) return null;

  return (
    <SettingsCard title="رصيد الذكاء الاصطناعي">
      {data.unlimited ? (
        <p className="text-[13px] text-slate-700 dark:text-slate-300">
          حسابك بلا حدود
          {data.daily
            ? ` — ${data.daily.remaining} من ${data.daily.limit} توليد متبقٍ اليوم.`
            : "."}
        </p>
      ) : (
        <div className="space-y-2">
          <Row label="إنشاء متجر بالذكاء الاصطناعي" bucket={data.generations} />
          <Row label="رصيد مساعد المحرر" bucket={data.editor} />
          {data.periodEnd && (
            <p className="px-1 pt-1 text-xs text-slate-500">
              يتجدد رصيد الباقة في {formatDay(data.periodEnd)}. الرصيد المشترى لا
              ينتهي.
            </p>
          )}
        </div>
      )}
    </SettingsCard>
  );
};

export default CreditsSection;
