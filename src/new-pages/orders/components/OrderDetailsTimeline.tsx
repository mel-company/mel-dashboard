/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader2 } from "lucide-react";
import Ltr from "@/components/Ltr";
import { formatOrderDateParts } from "../utils";

type Props = {
  logs?: any[];
  isLoading?: boolean;
  className?: string;
};

/**
 * Figma draws the order's history as a stack of flat cards, each one naming
 * the event, the status transition behind it and when it happened — not a
 * connector-and-dot timeline.
 */
const OrderDetailsTimeline = ({ logs, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="size-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-xs text-slate-400 dark:bg-[#0a0e27] dark:text-[#a4b1fa]">
        لا يوجد سجل لهذا الطلب
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {logs.map((log: any) => {
        const { date, time } = formatOrderDateParts(log?.createdAt);
        // The transition is the one change worth surfacing here; the rest of
        // a log's changes belong to the fields they edited.
        const transition = (log?.changes ?? []).find(
          (c: any) => c?.oldValue && c?.newValue,
        );

        return (
          <div
            key={log?.id ?? `${log?.action}-${log?.createdAt}`}
            className="rounded-2xl bg-slate-50 px-4 py-3 text-right dark:bg-[#0a0e27]"
          >
            <p className="text-[13px] font-semibold text-slate-900 dark:text-[#e4e7fc]">
              {log?.message || log?.action || "—"}
            </p>
            {transition ? (
              <p className="mt-1 text-[11px] font-bold tracking-wide text-violet-600 dark:text-[#b282ff]">
                <Ltr>
                  {String(transition.oldValue)} → {String(transition.newValue)}
                </Ltr>
              </p>
            ) : null}
            <p className="mt-1 text-[11px] text-slate-400 dark:text-[#a4b1fa]">
              <Ltr>
                {date}
                {time ? ` في ${time}` : ""}
              </Ltr>
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderDetailsTimeline;
