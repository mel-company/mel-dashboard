import { X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CustomerSupportIcon } from "@hugeicons-pro/core-duotone-rounded";
import { formatTicketShortId } from "./utils";

type TicketDetailsHeaderProps = {
  ticketId: string;
  onClose: () => void;
};

const TicketDetailsHeader = ({
  ticketId,
  onClose,
}: TicketDetailsHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 dark:border-[#2a3266]">
      <button
        type="button"
        onClick={onClose}
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 transition-colors hover:bg-sky-100 dark:bg-transparent dark:text-[#e4e7fc] dark:hover:bg-white/5"
        aria-label="إغلاق"
      >
        <X className="size-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <h1 className="text-xl font-bold text-blue-950 dark:text-[#e4e7fc]">تفاصيل التذكرة</h1>
          <p className="mt-0.5 font-mono text-sm font-semibold text-violet-600 dark:text-[#b282ff]" dir="ltr">
            {formatTicketShortId(ticketId)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100 dark:bg-[#9a5cff]/12">
          <HugeiconsIcon icon={CustomerSupportIcon} size={24} className="text-violet-600 dark:text-[#b282ff]" />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsHeader;
