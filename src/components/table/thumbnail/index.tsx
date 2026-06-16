const Thumbnail = ({ className, src }: { className?: string; src?: string }) => {
    return (
        <div className={`bg-slate-100 rounded-lg p-2 skeleton w-16 h-16 aspect-square ${className}`}>
            {src && <img src={src} alt="thumbnail" />}
        </div>
    )
}

export default Thumbnail