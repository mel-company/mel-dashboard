import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons-pro/core-stroke-standard";
import { HugeiconsIcon } from "@hugeicons/react";
import classNames from "classnames"

type Props = {
    totalPages: number;
    activePage: number;
    viewCount: number;
    onPageChange: (page: number) => void;
    onViewCountChange: (count: number) => void;
}


const Pagination = (props: Props) => {

    return (
        <div className="flex items-center justify-between w-full gap-1 text-sm">
            <NumberList  {...props} />
            <ViewCountSelector  {...props} />
        </div>
    )
}

export default Pagination

const NumberList = ({ activePage, totalPages, onPageChange }: Props) => {

    return (
        <div className="flex items-center gap-1.5">
            <PaginationBtn totalPages={totalPages} activePage={activePage} onPageChange={onPageChange} type="prev" />

            {
                Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <NumberBtn key={number} number={number} onPageChange={onPageChange} isActive={number === activePage} />
                ))
            }
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

    return (
        <button className={classNames("transition-colors h-8 w-8 mx-1 aspect-square flex items-center justify-center rounded-full border border-sky-800 hover:bg-sky-100 bg-sky-50 text-sky-800",
            "disabled:bg-slate-50 disabled:hover:bg-slate-50 disabled:border-transparent disabled:text-slate-300",
            "dark:bg-sky-950/80 dark:hover:bg-sky-950 dark:text-slate-300",
            "dark:disabled:bg-slate-950/50 dark:disabled:hover:bg-slate-950/50 dark:disabled:border-transparent dark:disabled:text-slate-600",
            {
                "ps-px": type === 'next',
                "pe-px": type === 'prev',

            })} onClick={type === 'next' ? handleNext : handlePrev} disabled={disable[type]}>
            <HugeiconsIcon size={18} strokeWidth={3} icon={type === 'next' ? ArrowLeft01Icon : ArrowRight01Icon} />
        </button>
    )
}

const NumberBtn = ({ number, isActive, onPageChange }: { number: number, isActive: boolean, onPageChange: (page: number) => void }) => {
    return (
        <button
            onClick={() => onPageChange(number)}
            className={classNames("h-8 w-8 rounded-lg font-semibold aspect-square", {
                "bg-sky-700 text-white": isActive,
                "bg-slate-50 text-slate-500 dark:text-slate-300 dark:bg-slate-950/50 hover:bg-slate-100 transition-colors": !isActive
            })}>
            {number}
        </button>
    )
}

const ViewCountSelector = ({ viewCount, onViewCountChange }: { viewCount: number, onViewCountChange: (count: number) => void }) => {
    return (
        <div className="flex items-center gap-2">
            <select id="select-page-view-count" className="dark:bg-sky-500/15 p-1.5 rounded-md text-sky-500 dark:text-sky-400 border border-sky-500 font-medium" value={viewCount} onChange={(e) => onViewCountChange(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
            </select>
            <p className="font-light opacity-70">العناصر لكل صفحة</p>
        </div>
    )
}