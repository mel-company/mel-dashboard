import { cn } from "@/lib/utils";

type SettingsCardProps = {
  title?: string;
  titleAccessory?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
};

const SettingsCard = ({
  title,
  titleAccessory,
  children,
  className,
  bodyClassName,
  headerClassName,
}: SettingsCardProps) => {
  return (
    <section
      className={cn(
        "rounded-[18px] border border-slate-100 bg-white p-[14px] shadow-sm sm:p-4",
        "dark:border-slate-800 dark:bg-slate-950 dark:shadow-none",
        className,
      )}
    >
      {title ? (
        <div
          className={cn(
            "mb-3 flex shrink-0 items-center justify-start gap-2.5",
            headerClassName,
          )}
        >
          {titleAccessory}
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
        </div>
      ) : null}
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
};

export default SettingsCard;
