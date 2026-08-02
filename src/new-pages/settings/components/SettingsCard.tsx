import { cn } from "@/lib/utils";

type SettingsCardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
};

const SettingsCard = ({
  title,
  children,
  className,
  bodyClassName,
}: SettingsCardProps) => {
  return (
    <section
      className={cn(
        "rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5",
        "dark:border-slate-800 dark:bg-slate-950 dark:shadow-none",
        className,
      )}
    >
      <h2 className="mb-3 shrink-0 text-lg font-bold text-blue-950 dark:text-slate-50">
        {title}
      </h2>
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
};

export default SettingsCard;
