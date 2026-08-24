import { Field } from "@/components/ui/field"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons-pro/core-stroke-standard"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function Searchbar({
  value,
  onChange,
  loading,
  placeholder = "ابحث عن المنتجات",
  showSearchLabel = true,
}: {
  value?: string;
  onChange?: (value: string) => void;
  loading?: boolean;
  placeholder?: string;
  showSearchLabel?: boolean;
}) {
    return (
        <Field
          className={cn(
            "w-full max-w-none rounded-[14px] border bg-white sm:max-w-[402px]",
            "border-[#00b7ff]/15",
            "dark:border-[#00b7ff]/15 dark:bg-[#0a0e27]",
          )}
        >
            <InputGroup className="min-h-12 gap-2 px-2 py-2">
                {showSearchLabel ? (
                  <InputGroupAddon align="inline-start" className="px-0">
                    <span className="flex h-8 items-center rounded-lg bg-[#00b7ff]/5 px-4 text-[15px] font-medium text-[#00b7ff]">
                      البحث
                    </span>
                  </InputGroupAddon>
                ) : (
                  <InputGroupAddon align="inline-start" className="px-2 items-center justify-center">
                    <HugeiconsIcon strokeWidth={2.5} className="w-5! h-5! text-[#91a0b6]" icon={Search01Icon} />
                  </InputGroupAddon>
                )}
                <InputGroupInput
                    className="ps-0.5 text-right text-[15px] font-normal text-[#3b4656] placeholder:text-[#91a0b6] dark:text-[#e4e7fc] dark:placeholder:text-[#4a5596]"
                    id="input-group-url"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                />
                {showSearchLabel ? (
                  <InputGroupAddon align="inline-end" className="px-1 text-[#91a0b6] dark:text-[#4a5596]">
                    {loading ? (
                      <Spinner />
                    ) : (
                      <HugeiconsIcon strokeWidth={2} className="size-6" icon={Search01Icon} />
                    )}
                  </InputGroupAddon>
                ) : loading ? (
                  <InputGroupAddon align="inline-end" className="text-slate-400 dark:text-slate-600">
                    <Spinner />
                  </InputGroupAddon>
                ) : null}
            </InputGroup>
        </Field>
    )
}
