import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortState = {
  key: string | null;
  order: "asc" | "desc";
  toggle: (key: string) => void;
};

/**
 * A column header with Figma's ⇅ affordance. The caret is only rendered when
 * the column is actually sortable — a control that looks clickable and moves
 * nothing is worse than no control at all.
 */
const SortableHead = ({
  children,
  sortKey,
  sort,
  className,
}: {
  children: React.ReactNode;
  /** Omit to render a plain, non-sortable header. */
  sortKey?: string;
  sort?: SortState;
  className?: string;
}) => {
  if (!sortKey || !sort) {
    return <TableHead className={className}>{children}</TableHead>;
  }

  const isActive = sort.key === sortKey;
  const ariaSort = isActive
    ? sort.order === "asc"
      ? "ascending"
      : "descending"
    : "none";

  return (
    <TableHead className={className} aria-sort={ariaSort}>
      <button
        type="button"
        onClick={() => sort.toggle(sortKey)}
        className={cn(
          "group inline-flex items-center gap-1.5 transition-colors",
          isActive
            ? "text-[#00b7ff] dark:text-[#33c5ff]"
            : "hover:text-[#00b7ff] dark:hover:text-[#33c5ff]",
        )}
      >
        <span>{children}</span>
        <Caret active={isActive} order={sort.order} />
      </button>
    </TableHead>
  );
};

const Caret = ({ active, order }: { active: boolean; order: "asc" | "desc" }) => (
  <svg
    aria-hidden
    viewBox="0 0 8 12"
    className={cn(
      "size-3 shrink-0 transition-opacity",
      active ? "opacity-100" : "opacity-45 group-hover:opacity-80",
    )}
  >
    <path
      d="M4 0.5 L7 4 H1 Z"
      fill="currentColor"
      opacity={active && order === "desc" ? 0.3 : 1}
    />
    <path
      d="M4 11.5 L1 8 H7 Z"
      fill="currentColor"
      opacity={active && order === "asc" ? 0.3 : 1}
    />
  </svg>
);

export default SortableHead;
