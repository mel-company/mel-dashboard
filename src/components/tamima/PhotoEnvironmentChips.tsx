import type { TamimaPhotoEnvironment } from "@/api/endpoints/tamima.endpoints";
import { cn } from "@/lib/utils";

type Props = {
  environments: TamimaPhotoEnvironment[];
  disabled?: boolean;
  onPick: (env: TamimaPhotoEnvironment) => void;
  className?: string;
};

/** Prompt Tamima to regenerate the open product's photo in a preset scene. */
export function photoEnvironmentPrompt(env: TamimaPhotoEnvironment): string {
  return `سوّي صورة احترافية لهذا المنتج ببيئة «${env.labelAr}». استخدمي صورة المنتج الحالية إن وجدت، ومرّري imageEnvironment=${env.id} مع إجراء REGENERATE_PRODUCT_IMAGE.`;
}

/**
 * «بيئة صورة المنتج» — chips under the composer on a product page.
 * Data from GET /tamima/photo-environments.
 */
export function PhotoEnvironmentChips({
  environments,
  disabled,
  onPick,
  className,
}: Props) {
  if (!environments.length) return null;

  return (
    <div className={cn("space-y-1.5", className)} dir="rtl">
      <p className="text-[11px] font-medium text-muted-foreground">
        بيئة صورة المنتج
      </p>
      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto pe-0.5">
        {environments.map((env) => (
          <button
            key={env.id}
            type="button"
            title={env.descriptionAr}
            disabled={disabled}
            onClick={() => onPick(env)}
            className={cn(
              "rounded-full border border-[#e7edf6] bg-white/90 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors",
              "hover:border-[#33c5ff]/50 hover:bg-[#00b7ff]/8",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:border-white/[0.08] dark:bg-[#12183b]/80 dark:hover:bg-white/8",
            )}
          >
            {env.labelAr}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PhotoEnvironmentChips;
