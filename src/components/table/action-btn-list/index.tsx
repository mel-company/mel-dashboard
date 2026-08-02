import { EyeIcon } from "@hugeicons-pro/core-twotone-rounded"
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons-pro/core-stroke-rounded"
import { HugeiconsIcon } from "@hugeicons/react"

const ActionBtnList = ({ onDelete, onEdit, onView }: { onDelete?: () => void; onEdit?: () => void; onView?: () => void }) => {
    return (
        <div className="flex items-center gap-2 ">
            {onView &&
                <button onClick={onView} className="p-1.5 cursor-pointer rounded-md bg-slate-100 text-slate-600 hover:bg-blue-500/10 hover:text-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-sky-500/15 dark:hover:text-sky-300">
                    <HugeiconsIcon icon={EyeIcon} size={22} />
                </button>}
            {onEdit &&
                <button onClick={onEdit} className="p-1.5 cursor-pointer rounded-md bg-slate-100 text-slate-600 hover:bg-blue-500/10 hover:text-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-sky-500/15 dark:hover:text-sky-300">
                    <HugeiconsIcon icon={PencilEdit02Icon} size={22} />
                </button>}
            {onDelete &&
                <button onClick={() => {
                    console.log('Delete button clicked');
                    onDelete();
                }} className="p-1.5 cursor-pointer rounded-md bg-red-50 text-red-500 hover:bg-red-500/10 transition-colors dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25">
                    <HugeiconsIcon icon={Delete02Icon} size={22} />
                </button>}
        </div>
    )
}

export default ActionBtnList