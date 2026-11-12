import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";

type TamimaUpgradeDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * Popup when a starter-plan merchant opens Tamima.
 * Grow unlocks the assistant + full-store analysis.
 */
export function TamimaUpgradeDialog({
  open,
  onOpenChange,
}: TamimaUpgradeDialogProps) {
  const { goUpgrade, upgradeTo, isLoading } = usePlanEntitlements();
  const planName = upgradeTo?.planName || "النمو";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <div className="mb-4 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50">
              <Sparkles className="size-8" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            ترقية إلى {planName}
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            مساعد تميمة مع تحليل المتجر بالكامل متاح في باقة{" "}
            <span className="font-semibold text-foreground">{planName}</span>{" "}
            فقط. رقِّ خطتك عشان ينطلق المساعد ويحلّل متجرك.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            لاحقاً
          </Button>
          <Button
            className="gap-2"
            disabled={isLoading}
            onClick={() => {
              onOpenChange?.(false);
              goUpgrade("tamima");
            }}
          >
            <Sparkles className="size-4" />
            ترقية الخطة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TamimaUpgradeDialog;
