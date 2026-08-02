import classNames from "classnames"

const Badge = ({ color = "default", bold, children }: { color?: "danger" | "purple" | "success" | "warning" | "default"; bold?: boolean; children: React.ReactNode }) => {

    const colorMap = {
        danger: "text-rose-500 bg-rose-50 dark:text-rose-300 dark:bg-rose-500/15",
        purple: "text-violet-900 bg-violet-50 dark:text-violet-200 dark:bg-violet-500/15",
        success: "text-emerald-500 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/15",
        warning: "text-amber-600 bg-amber-50 dark:text-amber-300 dark:bg-amber-500/15",
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