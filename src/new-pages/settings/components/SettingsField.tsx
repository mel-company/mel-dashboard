import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { filterIraqiMobileInput } from "@/utils/helpers";

export const settingsInputClassName =
  "h-12 rounded-2xl border-0 bg-slate-100 px-4 text-sm text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:ring-offset-0 dark:bg-slate-100 dark:text-slate-900";

export const settingsTextareaClassName =
  "min-h-[120px] resize-none rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 shadow-none ring-0 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 focus-visible:ring-offset-0 dark:bg-slate-100 dark:text-slate-900";

export const settingsLabelClassName =
  "text-sm font-medium text-slate-500 dark:text-slate-400";

type SettingsLabelProps = React.ComponentProps<typeof Label>;

export const SettingsLabel = ({ className, ...props }: SettingsLabelProps) => (
  <Label className={cn(settingsLabelClassName, className)} {...props} />
);

type SettingsInputProps = React.ComponentProps<typeof Input>;

export const SettingsInput = ({ className, ...props }: SettingsInputProps) => (
  <Input
    className={cn(settingsInputClassName, "text-right", className)}
    {...props}
  />
);

type SettingsTextareaProps = React.ComponentProps<typeof Textarea>;

export const SettingsTextarea = ({
  className,
  ...props
}: SettingsTextareaProps) => (
  <Textarea
    className={cn(settingsTextareaClassName, "text-right", className)}
    {...props}
  />
);

type SettingsFieldProps = {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
};

export const SettingsField = ({
  label,
  htmlFor,
  children,
  className,
}: SettingsFieldProps) => (
  <div className={cn("space-y-1.5", className)}>
    <SettingsLabel htmlFor={htmlFor}>{label}</SettingsLabel>
    {children}
  </div>
);

type SettingsPhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
>;

export const SettingsPhoneInput = ({
  className,
  id,
  value,
  onChange,
  ...props
}: SettingsPhoneInputProps) => (
  <div
    className={cn(
      "flex h-12 items-center gap-2 rounded-2xl bg-slate-100 px-2 focus-within:ring-2 focus-within:ring-sky-500/30 dark:bg-slate-100",
      className,
    )}
  >
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      maxLength={10}
      value={value}
      onChange={(e) => {
        const filtered = filterIraqiMobileInput(e.target.value);
        onChange?.({
          ...e,
          target: { ...e.target, value: filtered, name: e.target.name },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
      dir="ltr"
      placeholder="7xx xxx xxxx"
      className="min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
      {...props}
    />
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl bg-sky-100 px-1.5 py-2 text-sm font-medium text-slate-600 -mr-3 ">
      <span dir="ltr">+964</span>
      <span aria-hidden>🇮🇶</span>
    </div>
  </div>
);
