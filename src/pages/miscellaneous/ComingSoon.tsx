import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PagePanel from "@/components/PagePanel";

/**
 * Several create routes are still unbuilt. They used to render their own
 * component name — a merchant who reached `/orders/add` saw the literal
 * string "AddOrder". This is the same "قريباً" state `AddEmployee` already
 * used, shared so no route leaks an identifier again.
 */
const ComingSoon = ({
  title = "قريباً",
  description = "هذه الصفحة قيد التطوير وستكون متاحة قريباً. شكراً لصبرك!",
  backTo,
  backLabel = "رجوع",
}: {
  title?: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
}) => {
  const navigate = useNavigate();

  return (
    <PagePanel className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-[#a4b1fa]">
        <Lock className="size-8" />
      </span>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-[#e4e7fc]">
          {title}
        </h2>
        <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-[#a4b1fa]">
          {description}
        </p>
      </div>
      <Button
        variant="brand-soft"
        className="h-11 px-6"
        onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
      >
        {backLabel}
      </Button>
    </PagePanel>
  );
};

export default ComingSoon;
