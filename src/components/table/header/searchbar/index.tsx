
import { Field } from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons-pro/core-stroke-standard"
import { Spinner } from "@/components/ui/spinner"

export function Searchbar({
  value,
  onChange,
  loading,
  placeholder = "ابحث عن المنتجات",
}: {
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
}) {
    return (
        <Field className="w-full max-w-none rounded-xl border border-transparent bg-white sm:max-w-xs dark:border-slate-800 dark:bg-slate-900">
            <InputGroup className="min-h-11 px-1.5 py-2 sm:py-5.5">
                <InputGroupAddon align="inline-start" className="px-2 items-center justify-center">
                    <HugeiconsIcon strokeWidth={2.5} className="w-5! h-5!" icon={Search01Icon} />
                </InputGroupAddon>
                {loading && <InputGroupAddon align="inline-end" className="text-slate-400 dark:text-slate-600">
                    <Spinner />
                </InputGroupAddon>}
                <InputGroupInput
                    className="ps-0.5 font-medium placeholder:font-normal"
                    id="input-group-url"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                />
            </InputGroup>
        </Field>
    )
}
