import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export type SortOrder = "asc" | "desc";

type Props = {
    totalPages: number;
    activePage: number;
    viewCount: number;
    onPageChange: (page: number) => void;
    onViewCountChange: (count: number) => void;
    /** Renders Figma's «مرتبة بشكل» select beside the page size. */
    sortOrder?: SortOrder;
    onSortOrderChange?: (order: SortOrder) => void;
    /** Any extra control to sit with the selects. */
    trailing?: React.ReactNode;
}

const Pagination = (props: Props) => {

    // RTL: the first child sits rightmost. Figma puts the selects on the
    // right and the page numbers on the left.
    return (
        <div className="flex flex-wrap items-center justify-between w-full gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
                <ViewCountSelector  {...props} />
                <SortOrderSelector  {...props} />
                {props.trailing}
            </div>
            <NumberList  {...props} />
        </div>
    )
}

export default Pagination

/**
 * Figma shows `1 2 3 4 5 … 24`, not every page. Renders the first and last
 * page plus a window around the active one, with an ellipsis for each gap.
 */
function paginationRange(totalPages: number, activePage: number, siblings = 1): (number | "…")[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const first = 1;
    const last = totalPages;
    const start = Math.max(first + 1, activePage - siblings);
    const end = Math.min(last - 1, activePage + siblings);

    const out: (number | "…")[] = [first];
    if (start > first + 1) out.push("…");
    for (let p = start; p <= end; p++) out.push(p);
    if (end < last - 1) out.push("…");
    out.push(last);
    return out;
}

const NumberList = ({ activePage, totalPages, onPageChange }: Props) => {
    if (totalPages < 1) return null;

    return (
        <div className="flex items-center gap-1">
            <PaginationBtn totalPages={totalPages} activePage={activePage} onPageChange={onPageChange} type="prev" />

            {paginationRange(totalPages, activePage).map((entry, i) =>
                entry === "…" ? (
                    <span
                        key={`gap-${i}`}
                        aria-hidden
                        className="w-6 text-center text-[#6c809d] dark:text-[#4a5596]"
                    >
                        …
                    </span>
                ) : (
                    <NumberBtn key={entry} number={entry} onPageChange={onPageChange} isActive={entry === activePage} />
                )
            )}

            <PaginationBtn totalPages={totalPages} activePage={activePage} onPageChange={onPageChange} type="next" />
        </div>
    )
}

const PaginationBtn = ({ activePage, onPageChange, type, totalPages }: { activePage: number, onPageChange: (page: number) => void, type: 'prev' | 'next', totalPages: number }) => {
    const handleNext = () => onPageChange(activePage + 1)
    const handlePrev = () => onPageChange(activePage - 1)

    const disable = {
        next: activePage >= totalPages,
        prev: activePage <= 1
    }

    // Figma's chevrons are bare glyphs, not filled buttons.
    return (
        <button
            type="button"
            aria-label={type === "next" ? "الصفحة التالية" : "الصفحة السابقة"}
            className={cn(
                "flex size-8 items-center justify-center rounded-full text-[#3b4656] transition-colors",
                "hover:bg-[#00b7ff]/10 hover:text-[#00b7ff] dark:text-[#a4b1fa] dark:hover:bg-white/5",
                "disabled:pointer-events-none disabled:text-[#c8cbdf] dark:disabled:text-[#31396e]",
            )}
            onClick={type === 'next' ? handleNext : handlePrev}
            disabled={disable[type]}
        >
            <HugeiconsIcon size={18} strokeWidth={2.5} icon={type === 'next' ? ArrowLeft01Icon : ArrowRight01Icon} />
        </button>
    )
}

const NumberBtn = ({ number, isActive, onPageChange }: { number: number, isActive: boolean, onPageChange: (page: number) => void }) => {
    // Active page is a ringed circle; the rest are plain numerals.
    return (
        <button
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onPageChange(number)}
            className={cn(
                "size-8 rounded-full text-sm tabular-nums transition-colors",
                isActive
                    ? "border border-[#00b7ff] font-bold text-[#00b7ff] dark:border-[#33c5ff] dark:text-[#33c5ff]"
                    : "font-medium text-[#6c809d] hover:bg-[#00b7ff]/10 hover:text-[#00b7ff] dark:text-[#a4b1fa] dark:hover:bg-white/5",
            )}
        >
            {number}
        </button>
    )
}

const selectClass = cn(
    "h-9 rounded-[10px] border px-2.5 text-sm font-medium transition-colors",
    "border-[#e7edf6] bg-white text-[#3b4656]",
    "dark:border-white/[0.08] dark:bg-[#12183b] dark:text-[#e4e7fc]",
);

const selectLabelClass = "text-[#6c809d] dark:text-[#a4b1fa]";

const ViewCountSelector = ({ viewCount, onViewCountChange }: Props) => {
    return (
        <div className="flex items-center gap-2">
            <select
                id="select-page-view-count"
                className={selectClass}
                value={viewCount}
                onChange={(e) => onViewCountChange(Number(e.target.value))}
                aria-label="العناصر لكل صفحة"
            >
                {[10, 20, 50, 100, 500, 1000].map((n) => (
                    <option key={n} value={n}>{n}</option>
                ))}
            </select>
            <p className={selectLabelClass}>العناصر لكل صفحة</p>
        </div>
    )
}

const SortOrderSelector = ({ sortOrder, onSortOrderChange }: Props) => {
    if (!onSortOrderChange) return null;
    return (
        <div className="hidden items-center gap-2 sm:flex">
            <select
                className={selectClass}
                value={sortOrder ?? "desc"}
                onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                aria-label="الترتيب"
            >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
            </select>
            <p className={selectLabelClass}>مرتبة بشكل</p>
        </div>
    )
}
