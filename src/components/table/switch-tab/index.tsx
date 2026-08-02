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
        <div className="flex w-full items-center justify-center self-center rounded-xl bg-white p-1.5 dark:bg-slate-950 sm:w-auto sm:p-2">
            {options?.map((option) => (
                <button
                    type="button"
                    key={option.value}
                    onClick={() => toggle(option.value)}
                    className={classNames(
                        "flex min-h-10 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg px-2.5 py-2 text-sm transition-colors duration-75 sm:flex-none sm:py-1.5",
                        {
                            "bg-sky-700 text-sky-50": option.value === selectedOption,
                            "text-slate-600 dark:text-slate-300": option.value !== selectedOption,
                        },
                    )}
                >
                    {option.icon && <HugeiconsIcon size={20} icon={option.icon} />}
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    )
}

export default SwitchTab