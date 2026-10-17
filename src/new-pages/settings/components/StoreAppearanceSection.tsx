import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Eye, Sparkles } from "lucide-react";
import {
  TemplateApplyIcon,
  TemplateCurrentIcon,
  TemplateEditIcon,
  TemplatePreviewIcon,
} from "@/components/icons/TemplateCardIcons";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useStoreDesigns } from "@/api/wrappers/design.wrappers";
import type { StoreDesign } from "@/api/endpoints/design.endpoints";
import SettingsCard from "./SettingsCard";
import DesignPreviewDialog from "./DesignPreviewDialog";
import DesignApplyDialog from "./DesignApplyDialog";

const CAROUSEL_OPTIONS = { direction: "rtl", align: "start" } as const;

/** One card's worth of space, shared by the real cards and the skeletons. */
const ITEM_BASIS = "basis-full sm:basis-1/2 2xl:basis-1/3";

/**
 * The carousel arrows, made actually visible.
 *
 * The shadcn default is `variant="outline"`, which resolves to `bg-background`
 * with `shadow-xs` and `text-[var(--accent)]` — a white circle carrying a pale
 * icon, sitting on a white card. These get a solid surface, a real border and
 * a shadow so they read as controls floating above the cards.
 *
 * `disabled:opacity-0` replaces the base button's `opacity-50`, and does the
 * job a `length > 3` check was doing: embla already knows whether there is
 * anything to scroll to, and it knows it per breakpoint. Three designs scroll
 * at `sm` (two per view) and do not at `2xl` (three per view), so counting
 * items hides the arrows on exactly the narrow screens that need them.
 */
const ARROW_CLASSES =
  "size-9 border-slate-200 bg-white text-slate-700 shadow-md " +
  "hover:bg-slate-50 hover:text-slate-900 " +
  "disabled:opacity-0 disabled:pointer-events-none " +
  "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700";

/** «معاينة» and «تعديل»: the outlined pair under each card's text. */
const SECONDARY_ACTION =
  "flex h-8 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 rounded-lg " +
  "border border-[#00b7ff]/15 px-2 text-[13px] font-medium text-[#00b7ff] " +
  "transition-colors hover:bg-[#00b7ff]/5 " +
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#00b7ff]/40 " +
  "dark:text-[#33c5ff]";

/**
 * A design with no screenshot yet still has its palette, so the card shows
 * that rather than an empty grey box — capture runs in the background after a
 * generation, so this is what a brand-new design looks like for a moment.
 */
function ThemeFallback({ theme }: { theme: StoreDesign["theme"] }) {
  const primary = (theme?.primary as string) || "#6366f1";
  const secondary = (theme?.secondary as string) || primary;

  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
      }}
    >
      <Sparkles className="size-7 text-white/80" />
    </div>
  );
}

const StoreAppearanceSection = () => {
  const navigate = useNavigate();
  const { data: designs, isLoading, isError } = useStoreDesigns();

  const [previewDesign, setPreviewDesign] = useState<StoreDesign | null>(null);
  const [designToApply, setDesignToApply] = useState<StoreDesign | null>(null);

  const items = designs ?? [];

  return (
    <SettingsCard title="مظهر المتجر">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-slate-100 px-4 py-3 dark:bg-slate-900">
        <div className="min-w-0 text-right">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            محرر الموقع
          </p>
          <p className="text-[13px] text-slate-500">
            خصّص صفحات متجرك من داخل لوحة التحكم
          </p>
        </div>
        <Button
          type="button"
          className="gap-2 shrink-0"
          onClick={() => navigate("/editor")}
        >
          فتح المحرر
          <ExternalLink className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn("shrink-0 grow-0 space-y-2", ITEM_BASIS)}
            >
              <Skeleton className="h-[116px] w-full rounded-[10px]" />
              <Skeleton className="mx-auto h-4 w-2/3" />
              <Skeleton className="mx-auto h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-[13px] text-slate-500">
          تعذر تحميل التصاميم، حدّث الصفحة للمحاولة مرة أخرى
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-slate-200 py-8 text-center dark:border-slate-700">
          <p className="text-[15px] font-medium text-slate-700 dark:text-slate-200">
            لا توجد تصاميم بعد
          </p>
          <p className="mt-1 text-[13px] text-slate-500">
            التصاميم التي ينشئها الذكاء الاصطناعي لمتجرك ستظهر هنا لتختار بينها
          </p>
        </div>
      ) : (
        // The arrows sit inside the padding rather than outside it: this card
        // lives in a narrow settings column with no room to hang them off the
        // edge the way the carousel defaults to.
        <Carousel dir="rtl" opts={CAROUSEL_OPTIONS}>
          <CarouselContent>
            {items.map((design) => (
              <CarouselItem key={design.id} className={ITEM_BASIS}>
                <div
                  className={cn(
                    "h-full rounded-[18px] p-[3px] transition-shadow",
                    design.isActive
                      ? "bg-linear-to-br from-[#00b7ff] to-[#7d26f7] shadow-md"
                      : "bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-full flex-col items-center gap-3 rounded-[15px] p-2",
                      design.isActive
                        ? "bg-white dark:bg-slate-950 [background-image:linear-gradient(rgba(125,38,247,0.05),rgba(125,38,247,0.05))]"
                        : "bg-transparent",
                    )}
                  >
                    {/* The picture is the obvious thing to press, so it is
                        the control. The hint over it is decoration for a
                        pointer and nothing else — `pointer-events-none` so it
                        can never sit between a tap and this button. */}
                    <button
                      type="button"
                      onClick={() => setPreviewDesign(design)}
                      aria-label={`معاينة ${design.storeName || "التصميم"}`}
                      className="group relative w-full cursor-pointer overflow-hidden rounded-[10px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      <div className="h-[116px] w-full overflow-hidden rounded-[10px] bg-white dark:bg-slate-800">
                        {design.thumbnail ? (
                          <img
                            src={design.thumbnail}
                            alt={design.storeName ?? ""}
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <ThemeFallback theme={design.theme} />
                        )}
                      </div>

                      {/* The design's 10% black wash, which also darkens a
                          little further on hover to show the hint. */}
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[10px] bg-black/10 transition duration-300 group-hover:bg-slate-900/30">
                        <span className="flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-[13px] font-medium text-slate-700 opacity-0 shadow-sm backdrop-blur-sm transition duration-300 group-hover:opacity-100 dark:bg-slate-900/90 dark:text-slate-100">
                          <Eye className="size-3.5" />
                          معاينة حيّة
                        </span>
                      </span>
                    </button>

                    <p
                      className={cn(
                        "w-full truncate text-center text-[15.5px] leading-4 text-[#3b4656] dark:text-slate-100",
                        design.isActive ? "font-bold" : "font-normal",
                      )}
                    >
                      {design.storeName || "تصميم بدون اسم"}
                    </p>
                    <p className="line-clamp-2 min-h-8 w-full text-center text-[10.5px] leading-4 text-[#6c809d] dark:text-slate-400">
                      {design.tagline || design.prompt}
                    </p>

                    {/* Preview and edit side by side, then the main action
                        across the full width, as in the design. */}
                    <div className="mt-auto flex w-full flex-col gap-2">
                      <div className="flex w-full gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDesign(design)}
                          className={SECONDARY_ACTION}
                        >
                          <TemplatePreviewIcon />
                          معاينة
                        </button>

                        {/* Re-runs the generation handoff into the editor
                            draft. Everyday «فتح المحرر» omits `generation=`,
                            so a merchant whose landing link dropped it stays
                            on an old/default template with no way to pull
                            this design into the editor except this. */}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/editor?generation=${encodeURIComponent(design.id)}`,
                            )
                          }
                          className={SECONDARY_ACTION}
                        >
                          <TemplateEditIcon />
                          تعديل
                        </button>
                      </div>

                      {design.isActive ? (
                        <div className="flex h-9 w-full items-center justify-center gap-1 rounded-lg bg-[#00b7ff] px-[18px] text-[13px] font-medium text-[#060219]">
                          <TemplateCurrentIcon />
                          القالب الحالي
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDesignToApply(design)}
                          className="flex h-9 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-[#7d26f7]/10 px-[18px] text-[13px] font-medium text-[#7d26f7] transition-colors hover:bg-[#7d26f7]/15 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#7d26f7]/40 dark:bg-[#9a5cff]/15 dark:text-[#b282ff] dark:hover:bg-[#9a5cff]/25"
                        >
                          <TemplateApplyIcon />
                          تعيين القالب
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* `start-0`/`end-0`, not the component's default `-start-12`: the
              arrows belong inside the card's own `px-10` gutter, since this
              section sits in a narrow settings column with nothing to hang
              them over. tailwind-merge drops the negative default for these. */}
          <CarouselPrevious className={cn("start-0 z-10", ARROW_CLASSES)} />
          <CarouselNext className={cn("end-0 z-10", ARROW_CLASSES)} />
        </Carousel>
      )}

      <DesignPreviewDialog
        design={previewDesign}
        onOpenChange={(open) => !open && setPreviewDesign(null)}
      />
      <DesignApplyDialog
        design={designToApply}
        onOpenChange={(open) => !open && setDesignToApply(null)}
      />
    </SettingsCard>
  );
};

export default StoreAppearanceSection;
