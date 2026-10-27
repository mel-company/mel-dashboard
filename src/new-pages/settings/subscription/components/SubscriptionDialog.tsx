import { X } from "lucide-react";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type SubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * The settings dialog shell (as in `ShippingSettingsDialog`): rounded, its own
 * header with a visible close button, and a body that scrolls on its own. The
 * stock `DialogContent` close icon is white, so it vanished on the white card.
 */
const SubscriptionDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SubscriptionDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      dir="rtl"
      showCloseButton={false}
      className={cn(
        "max-h-[90dvh] gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 text-right sm:max-w-lg dark:bg-slate-950",
        className,
      )}
    >
      <div className="max-h-[90dvh] overflow-y-auto p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-50">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="mt-1 text-[13px] leading-relaxed text-slate-500">
                {description}
              </DialogDescription>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-label="إغلاق"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </DialogContent>
  </Dialog>
);

export default SubscriptionDialog;
