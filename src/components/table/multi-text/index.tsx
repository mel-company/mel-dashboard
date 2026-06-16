const MultiText = ({ title, description }: { title: string; description: string }) => {
    return (
        <div className="space-y-1">
            <p className="line-clamp-1 font-normal text-sm">{title}</p>
            <p className="line-clamp-1 text-slate-600 font-light text-xs">{description}</p>
        </div>
    )
}

export default MultiText