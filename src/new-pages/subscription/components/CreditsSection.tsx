import { useStoreCreditBalance } from "@/api/wrappers/credits.wrapper";
import type { StoreCreditBalance } from "@/api/endpoints/credits.endpoint";
import SettingsCard from "@/new-pages/settings/components/SettingsCard";
import {
  bodyClass,
  cellClass,
  formatDay,
  headRowClass,
  labelCellClass,
  tableClass,
  thClass,
} from "./table";

/** Editor credits are charged by model cost, so they can be fractional. */
const num = (value?: number) =>
  value === undefined || value === null
    ? "—"
    : value.toLocaleString("en-US", { maximumFractionDigits: 2 });

type Bucket = StoreCreditBalance["generations"];

/** A plan with no monthly allowance shows its one-time trial instead. */
const Row = ({ label, bucket }: { label: string; bucket: Bucket }) => {
  const onTrial = !bucket.included && (bucket.trial?.limit ?? 0) > 0;
  return (
    <tr>
      <td className={labelCellClass}>{label}</td>
      <td className={cellClass}>
        {onTrial ? `${num(bucket.trial?.limit)} (تجربة)` : num(bucket.included)}
      </td>
      <td className={cellClass}>
        {onTrial ? num(bucket.trial?.used) : num(bucket.used)}
      </td>
      <td className={cellClass}>{num(bucket.purchased)}</td>
      <td className={`${cellClass} font-bold`}>
        {num(
          bucket.remaining +
            (bucket.purchased ?? 0) +
            (onTrial ? bucket.trial?.remaining ?? 0 : 0),
        )}
      </td>
    </tr>
  );
};

/** What is left of this month's AI builds and editor credits. */
const CreditsSection = () => {
  const { data, isError } = useStoreCreditBalance();
  if (!data || isError) return null;

  if (data.unlimited) {
    return (
      <SettingsCard title="رصيد الذكاء الاصطناعي">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          حسابك بلا حدود
          {data.daily
            ? ` — ${data.daily.remaining} من ${data.daily.limit} توليد متبقٍ اليوم.`
            : "."}
        </p>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title="رصيد الذكاء الاصطناعي">
      <div className="overflow-x-auto">
        <table className={tableClass}>
          <thead>
            <tr className={headRowClass}>
              <th className={thClass}>البند</th>
              <th className={thClass}>من الباقة</th>
              <th className={thClass}>المستخدم</th>
              <th className={thClass}>رصيد مشترى</th>
              <th className={thClass}>المتبقي</th>
            </tr>
          </thead>
          <tbody className={bodyClass}>
            <Row label="إنشاء متجر بالذكاء الاصطناعي" bucket={data.generations} />
            <Row label="رصيد مساعد المحرر" bucket={data.editor} />
          </tbody>
        </table>
      </div>
      {data.periodEnd && (
        <p className="mt-2 text-xs text-slate-500">
          يتجدد رصيد الباقة في {formatDay(data.periodEnd)}. الرصيد المشترى لا
          ينتهي.
        </p>
      )}
    </SettingsCard>
  );
};

export default CreditsSection;
