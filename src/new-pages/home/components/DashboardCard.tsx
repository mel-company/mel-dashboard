import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  action,
  className,
  contentClassName,
  children,
}: DashboardCardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[18px] border border-border bg-card text-card-foreground shadow-[0_2px_12px_rgba(17,44,113,0.05)]",
        "dark:shadow-none",
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <h3 className="text-base font-bold text-text-secondary dark:text-foreground">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={cn("flex-1 p-4 sm:p-5", contentClassName)}>{children}</div>
    </div>
  );
};

export default DashboardCard;
