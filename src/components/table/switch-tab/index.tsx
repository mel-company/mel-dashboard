import { LayoutBottomIcon, LayoutTable01Icon } from "@hugeicons-pro/core-duotone-rounded";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import classNames from "classnames";
import { useEffect, useState } from "react";

type Props = {
    selected: string;
    options?: {
        label: string
        value: string
        icon: IconSvgElement
    }[];
    onChange: (value: string) => void
}

const defaultOptions = [
    {
        label: "جدول",
        value: "table",
        icon: LayoutTable01Icon
    },
    {
        label: "بطاقات",
        value: "cards",
        icon: LayoutBottomIcon
    }
]
const SwitchTab = ({
    options = defaultOptions,
    onChange,
    selected
}: Props) => {
    const [selectedOption, setSelectedOption] = useState(selected || options[0]?.value);

    useEffect(() => {
        setSelectedOption(selected || options[0]?.value);
    }, [selected, options]);
    const toggle = (value: string) => {
        setSelectedOption(value)
        onChange(value)
    }
    return (
        <div className="flex items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-950 self-center">
            {options?.map((option) => (
                <button
                    key={option.value}
                    onClick={() => toggle(option.value)}
                    className={classNames("transition-colors cursor-pointer duration-75 py-1.5 px-2.5 rounded-lg flex items-center gap-1 text-sm", {
                        "bg-sky-700 text-sky-50": option.value === selectedOption,
                        "text-slate-600 dark:text-slate-300": option.value !== selectedOption,
                    })}
                >
                    {option.icon && <HugeiconsIcon size={20} icon={option.icon} />}
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    )
}

export default SwitchTab