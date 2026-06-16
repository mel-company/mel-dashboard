import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  activeText?: string;
  disabledText?: string;
}

function Switch({
  className,
  activeText,
  disabledText,
  checked,
  ...props
}: SwitchProps) {
  const switchNode = (
    <SwitchPrimitive.Root
      dir="ltr"
      data-slot="switch"
      className={cn(
        "group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-0 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#00C9A7] data-[state=unchecked]:bg-amber-950/5 dark:data-[state=unchecked]:bg-amber-300/10 sm:h-9 sm:w-18",
        className
      )}
      checked={checked}
      {...props}
    >
      {/* Checked indicator: vertical bar */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-white/50 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100 group-data-[state=unchecked]:opacity-0 sm:left-4 sm:h-4 sm:w-1"
      />
      {/* Unchecked indicator: small dot */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 size-2 -translate-y-1/2 rounded-full border-2 border-amber-950/30 dark:border-amber-200/30 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-0 group-data-[state=unchecked]:opacity-100 sm:right-3 sm:size-2.5 sm:border-3"
      />
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-5 w-7 rounded-full bg-white/80 shadow-md transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-1 sm:h-7 sm:w-10 sm:data-[state=checked]:translate-x-[1.65rem]"
        )}
      />
    </SwitchPrimitive.Root>
  );

  if (!activeText && !disabledText) return switchNode;

  const labelText = checked ? activeText : disabledText;

  return (
    <label
      className={cn("inline-flex cursor-pointer items-center p-1 rounded-full", {
        "bg-green-500/10 text-green-600 dark:text-green-400": checked,
        "bg-amber-500/10 text-amber-600 dark:text-amber-400": !checked,
      })}
    >
      {switchNode}
      {labelText && (
        <span className="text-sm font-medium px-2 min-w-14 sm:text-lg sm:min-w-16">{labelText}</span>
      )}
    </label>
  );
}

export { Switch };
