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

type TeamUpgradePanelProps = {
  className?: string;
};

/**
 * Inline page gate when starter plan opens Employees.
 * Grow unlocks 3 seats.
 */
export function TeamUpgradePanel({ className }: TeamUpgradePanelProps) {
  const { goUpgrade, upgradeTo, isLoading } = usePlanEntitlements();
  const planName = upgradeTo?.planName || "النمو";

  return (
    <div
      className={
        className ||
        "flex min-h-[50vh] flex-col items-center justify-center gap-5 px-6 py-16 text-center"
      }
      dir="rtl"
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50">
        <Users className="size-8" />
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          ترقية إلى {planName}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          إدارة الموظفين غير متاحة في خطة البداية. رقِّ إلى باقة{" "}
          <span className="font-semibold text-foreground">{planName}</span>{" "}
          لتحصل على{" "}
          <span className="font-semibold text-foreground">3 موظفين</span>.
        </p>
      </div>
      <Button
        size="lg"
        className="gap-2 rounded-full px-6"
        disabled={isLoading}
        onClick={() => goUpgrade("team_users")}
      >
        <Sparkles className="size-4" />
        ترقية الخطة
      </Button>
    </div>
  );
}

type TeamUpgradeDialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  dismissible?: boolean;
};

/** Popup variant — used from AppsGrid before navigating. */
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
            لتحصل على{" "}
            <span className="font-semibold text-foreground">3 موظفين</span>.
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
