import { ArrowUpRight03Icon } from '@hugeicons-pro/core-bulk-rounded'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import './style.css'

const TopCard = () => {
    return (
        <div>TopCard</div>
    )
}

export default TopCard

export const FeaturedCard = ({ icon, strokedIcon, title, value, color = "primary" }: { icon: IconSvgElement, strokedIcon?: IconSvgElement, title: string, value: string, color?: "orange" | "yellow" | "primary" }) => {
    return (
        <div className={`card ${color}-card`} >
            <div className='p-1 border border-white rounded-full'>
                <div className='p-2 rounded-full bg-linear-to-b from-white/15 to-white/30 text-white '>
                    <HugeiconsIcon icon={icon} size={24} />
                </div>
            </div>

            <div className='space-y-1 text-white'>
                <p className="title">{title}</p>
                <p className="value">{value}</p>
            </div>
            {strokedIcon &&
                <div className='absolute -end-4 h-full scale-125 opacity-25'>
                    <HugeiconsIcon icon={strokedIcon} size={120} />
                </div>}
        </div>
    )
}

export const BaseCard = ({ icon, title, value, growth, color = "default" }: { icon: IconSvgElement, title: string, value: string, growth?: string | number, color?: "default" | "accent" | "warning" | "danger" | "success" }) => {
    return (
        <div className="card base-card">
            <div className={`p-2 rounded-full ${color}-card`}>
                <HugeiconsIcon icon={icon} size={24} />
            </div>
            <div className='space-y-1'>
                <p className="title">{title}</p>
                <p className="value">{value}
                    {growth &&
                        <span className="growth">
                            +{growth}%
                            <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} />
                        </span>
                    }
                </p>
            </div>
        </div>
    )
}



