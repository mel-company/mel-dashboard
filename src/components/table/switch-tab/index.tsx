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
    accent?: "sky" | "violet"
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
    selected,
    accent = "sky",
}: Props) => {
    const [selectedOption, setSelectedOption] = useState(selected || options[0]?.value);

    useEffect(() => {
        setSelectedOption(selected || options[0]?.value);
    }, [selected, options]);
    const toggle = (value: string) => {
        setSelectedOption(value)
        onChange(value)
    }
    const isViolet = accent === "violet";

    return (
        <div
            className={classNames(
                "flex w-full items-center justify-center self-center",
                isViolet
                    ? "h-[58px] rounded-[14px] bg-white p-1.5 dark:bg-[#12183b] md:w-auto"
                    : "rounded-xl border border-transparent bg-white p-1.5 dark:border-[#00b7ff]/20 dark:bg-transparent sm:w-auto sm:p-2",
            )}
        >
            {options?.map((option) => (
                <button
                    type="button"
                    key={option.value}
                    onClick={() => toggle(option.value)}
                    className={classNames(
                        "flex cursor-pointer items-center justify-center gap-1.5",
                        isViolet
                            ? "h-9 flex-1 rounded-xl px-[18px] text-sm font-medium md:flex-none"
                            : "min-h-10 flex-1 rounded-lg px-2.5 py-2 text-sm sm:flex-none sm:py-1.5",
                        option.value === selectedOption
                            ? isViolet
                                ? "bg-[#7d26f7] text-white dark:bg-[#b282ff] dark:text-white"
                                : "bg-sky-700 text-sky-50 dark:bg-[#33c5ff]/10 dark:text-[#33c5ff]"
                            : isViolet
                                ? "text-slate-600 dark:text-white"
                                : "text-slate-600 dark:text-[#a4b1fa]",
                    )}
                >
                    {option.icon && <HugeiconsIcon size={18} icon={option.icon} />}
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    )
}

export default SwitchTab
