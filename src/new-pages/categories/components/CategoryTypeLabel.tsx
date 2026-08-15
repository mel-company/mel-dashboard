import { cn } from "@/lib/utils";
import { getCategoryType } from "../utils";

const CategoryTypeLabel = ({
  category,
  className,
}: {
  category: any;
  className?: string;
}) => {
  const type = getCategoryType(category);

  if (type.kind === "sub") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-sm", className)}>
        <span className="text-sky-600 dark:text-[#33c5ff]">{type.label}</span>
        <span className="text-slate-300 dark:text-[#00b7ff]/15">|</span>
        <span className="text-slate-700 dark:text-[#e4e7fc]">
          {type.parentName}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-sm text-violet-600 dark:text-[#b282ff]",
        className,
      )}
    >
      {type.label}
    </span>
  );
};

export default CategoryTypeLabel;
