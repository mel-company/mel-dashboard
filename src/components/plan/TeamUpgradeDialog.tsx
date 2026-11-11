import { Sparkles, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePlanEntitlements } from "@/hooks/use-plan-entitlements";

type TeamUpgradeDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  /** If false, closing is blocked (page gate). Default true. */
  dismissible?: boolean;
};

/**
 * Popup when a starter-plan merchant opens Employees.
 * Grow unlocks 3 seats (owner + team).
 */
export function TeamUpgradeDialog({
  open,
  onOpenChange,
  dismissible = true,
}: TeamUpgradeDialogProps) {
  const { goUpgrade, upgradeTo, isLoading } = usePlanEntitlements();
  const planName = upgradeTo?.planName || "النمو";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!dismissible && !next) return;
        onOpenChange?.(next);
      }}
    >
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <div className="mb-4 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50">
              <Users className="size-8" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            ترقية إلى {planName}
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed">
            إدارة الموظفين غير متاحة في خطة البداية. رقِّ إلى باقة{" "}
            <span className="font-semibold text-foreground">{planName}</span>{" "}
            لتحصل على <span className="font-semibold text-foreground">3 موظفين</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex justify-center gap-2">
          {dismissible ? (
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              لاحقاً
            </Button>
          ) : null}
          <Button
            className="gap-2"
            disabled={isLoading}
            onClick={() => {
              onOpenChange?.(false);
              goUpgrade("team_users");
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

export default TeamUpgradeDialog;
