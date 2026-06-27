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
        "rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-200 dark:bg-white sm:p-5",
        className,
      )}
    >
      <h2 className="mb-3 shrink-0 text-lg font-bold text-blue-950">{title}</h2>
      <div className={cn(bodyClassName)}>{children}</div>
    </section>
  );
};

export default SettingsCard;
