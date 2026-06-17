
import { Field } from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons-pro/core-stroke-standard"
import { Spinner } from "@/components/ui/spinner"

export function Searchbar({ loading }: { loading?: boolean }) {
    return (
        <Field className="max-w-xs bg-white dark:bg-slate-950 rounded-xl">
            <InputGroup className="px-1.5 py-5.5">
                <InputGroupAddon align="inline-start" className="px-2 items-center justify-center">
                    <HugeiconsIcon strokeWidth={2.5} className="w-5! h-5!" icon={Search01Icon} />
                </InputGroupAddon>
                {loading && <InputGroupAddon align="inline-end" className="text-slate-400 dark:text-slate-600">
                    <Spinner />
                </InputGroupAddon>}
                <InputGroupInput className="ps-0.5 font-medium placeholder:font-normal" id="input-group-url" placeholder="ابحث عن المنتجات" />
            </InputGroup>
        </Field>
    )
}
