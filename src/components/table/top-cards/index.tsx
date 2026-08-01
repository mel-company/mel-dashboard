import { ArrowUpRight03Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import './style.css'



export const FeaturedCard = ({
    icon,
    strokedIcon,
    title,
    value,
    color = "primary",
    suffix,
}: {
    icon: IconSvgElement
    strokedIcon?: IconSvgElement
    title: string
    value: string
    color?: "orange" | "yellow" | "primary"
    /** e.g. "د.ع" for money — omit for counts */
    suffix?: string
}) => {
    return (
        <div className={`card ${color}-card`} >
            <div className='p-1 border border-white rounded-full'>
                <div className='p-2.5 rounded-full bg-linear-to-b from-white/15 to-white/30 text-white '>
                    <HugeiconsIcon icon={icon} size={28} />
                </div>
            </div>

            <div className='text-white'>
                <p className="title">{title}</p>
                <p className="value">
                    {value}
                    {suffix ? <span> {suffix}</span> : null}
                </p>
            </div>
            {strokedIcon &&
                <div className='absolute end-1.5 -top-4 h-full scale-125 opacity-10'>
                    <HugeiconsIcon icon={strokedIcon} size={120} />
                </div>
            }
        </div>
    )
}

export const BaseCard = ({ icon, title, value, growth, color = "default" }: { icon: IconSvgElement, title: string, value: string, growth?: string | number, color?: "default" | "accent" | "warning" | "danger" | "success" }) => {
    return (
        <div className="card base-card">
            <div className={`p-2.5 rounded-full ${color}-card`}>
                <HugeiconsIcon icon={icon} size={28} />
            </div>
            <div  >
                <p className="title">{title}</p>
                <p className="value">{value}
                    {growth &&
                        <span className="growth">
                            <HugeiconsIcon icon={ArrowUpRight03Icon} size={16} />
                            <span>{growth}%</span>
                        </span>
                    }
                </p>
            </div>
        </div>
    )
}



