import classNames from "classnames"

const Badge = ({ color = "default", bold, children }: { color?: "danger" | "purple" | "success" | "warning" | "default"; bold?: boolean; children: React.ReactNode }) => {

    const colorMap = {
        danger: "text-[#ff0808] bg-[rgba(255,8,8,0.08)] dark:text-rose-300 dark:bg-rose-500/15",
        purple: "text-[#7d26f7] bg-[rgba(125,38,247,0.08)] dark:text-[#b282ff] dark:bg-[#9a5cff]/15",
        success: "text-[#00b88a] bg-[rgba(0,184,138,0.1)] dark:text-emerald-300 dark:bg-emerald-500/15",
        warning: "text-[#f57b00] bg-[rgba(245,123,0,0.1)] dark:text-amber-300 dark:bg-amber-500/15",
        default: "text-slate-500 bg-slate-50 dark:text-slate-300 dark:bg-slate-800",
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