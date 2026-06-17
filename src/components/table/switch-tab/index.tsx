import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import classNames from "classnames";

type Props = {
    selected: string;
    options: {
        label: string
        value: string
        icon: IconSvgElement
    }[];
    onChange: (value: string) => void
}
const SwitchTab = ({
    options,
    onChange,
    selected
}: Props) => {
    return (
        <div className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-950 self-center">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={classNames("py-1.5 px-2.5 rounded-lg flex items-center gap-1", {
                        "bg-sky-700 text-sky-50": option.value === selected,
                        "text-slate-600 dark:text-slate-300": option.value !== selected,
                    })}
                >
                    <HugeiconsIcon size={22} icon={option.icon} />
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    )
}

export default SwitchTab