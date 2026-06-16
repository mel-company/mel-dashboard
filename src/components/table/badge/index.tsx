import classNames from "classnames"

const Badge = ({ color = "default", bold, children }: { color?: "danger" | "purple" | "success" | "default"; bold?: boolean; children: React.ReactNode }) => {

    const colorMap = {
        danger: "text-rose-500 bg-rose-50",
        purple: "text-purple-500 bg-purple-50",
        success: "text-green-500 bg-green-50",
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