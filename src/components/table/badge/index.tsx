import classNames from "classnames"

const Badge = ({ color = "default", bold, children }: { color?: "danger" | "purple" | "success" | "warning" | "default"; bold?: boolean; children: React.ReactNode }) => {

    const colorMap = {
        danger: "text-rose-500 bg-rose-50",
        purple: "text-violet-900 bg-violet-50",
        success: "text-emerald-500 bg-emerald-50",
        warning: "text-amber-600 bg-amber-50",
        default: "text-slate-500 bg-slate-50",
    }

    return (
        <p className={classNames(`px-3 py-1.5 rounded-full text-sm text-center`, {
            [colorMap[color]]: true,
            "font-semibold": bold,
            "font-medium": !bold,
        })}>
            {children}
        </p>)
}

export default Badge