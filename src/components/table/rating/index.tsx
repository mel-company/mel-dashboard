import { HugeiconsIcon } from '@hugeicons/react'
import { StarIcon } from '@hugeicons-pro/core-bulk-rounded'

const Rating = ({ count }: { count: number }) => {
    return (
        <div className='flex items-center gap-1 text-amber-400 font-extrabold'>
            <HugeiconsIcon icon={StarIcon} />
            <span>{Math.round(count)}</span>
        </div>
    )
}

export default Rating