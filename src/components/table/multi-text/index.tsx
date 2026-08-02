const MultiText = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="space-y-1">
            <p className="line-clamp-1 font-normal text-sm text-slate-900 dark:text-slate-100">{title}</p>
            <p className="line-clamp-1 text-slate-600 font-light text-xs dark:text-slate-400">{description}</p>
        </div>
    )
}

export default MultiText