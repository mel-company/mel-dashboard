import { EyeIcon } from "@hugeicons-pro/core-twotone-rounded"
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons-pro/core-stroke-rounded"
import { HugeiconsIcon } from "@hugeicons/react"

const ActionBtnList = ({ onDelete, onEdit, onView }: { onDelete?: () => void; onEdit?: () => void; onView?: () => void }) => {
    return (
        <div className="flex items-center gap-1.5 sm:gap-2">
            {onView &&
                <button type="button" onClick={onView} className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-500/10 hover:text-blue-500 dark:bg-transparent dark:text-[#a4b1fa] dark:hover:bg-white/5 sm:size-9 sm:rounded-[14px] sm:p-1.5">
                    <HugeiconsIcon icon={EyeIcon} size={22} />
                </button>}
            {onEdit &&
                <button type="button" onClick={onEdit} className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-500/10 hover:text-blue-500 dark:bg-transparent dark:text-[#a4b1fa] dark:hover:bg-white/5 sm:size-9 sm:rounded-[14px] sm:p-1.5">
                    <HugeiconsIcon icon={PencilEdit02Icon} size={22} />
                </button>}
            {onDelete &&
                <button type="button" onClick={() => {
                    onDelete();
                }} className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-500/10 dark:bg-transparent dark:text-[#ff5252] dark:hover:bg-[#ff5252]/10 sm:size-9 sm:rounded-[14px] sm:p-1.5">
                    <HugeiconsIcon icon={Delete02Icon} size={22} />
                </button>}
        </div>
    )
}

export default ActionBtnList