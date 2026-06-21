import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon } from '@hugeicons-pro/core-bulk-rounded'

const Rating = ({ count }: { count: number }) => {
    return (
        <div className='flex text-base items-center gap-1.5 text-amber-500 font-extrabold'>
            <span className='h-5'>{Math.round(count)}</span>
            <HugeiconsIcon icon={StarIcon} size={18} />
        </div>
    )
}

export default Rating