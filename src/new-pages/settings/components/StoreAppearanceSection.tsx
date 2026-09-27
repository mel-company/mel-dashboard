import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Eye, Sparkles } from "lucide-react";
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

const DATE_FORMAT = new Intl.DateTimeFormat("ar-IQ", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : DATE_FORMAT.format(date);
}

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
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
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
            <div key={i} className={cn("shrink-0 grow-0 space-y-2", ITEM_BASIS)}>
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
        <Carousel dir="rtl" opts={CAROUSEL_OPTIONS} >
          <CarouselContent>
            {items.map((design) => (
              <CarouselItem key={design.id} className={ITEM_BASIS}>
                <div
                  className={cn(
                    "h-full rounded-[18px] p-[3px] transition-shadow",
                    design.isActive
                      ? "bg-linear-to-br from-cyan-400 to-violet-500 shadow-md"
                      : "bg-transparent",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex h-full flex-col items-center gap-2 rounded-[15px] p-2",
                      design.isActive
                        ? "bg-violet-500/5 dark:bg-violet-500/10"
                        : "bg-transparent",
                    )}
                  >
                    <div className="relative w-full group overflow-hidden">
                      <div className="h-[116px] w-full overflow-hidden rounded-[10px] bg-white shadow-sm dark:bg-slate-800">
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

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPreviewDesign(design)}
                        className="absolute opacity-0 group-hover:opacity-100 duration-300 bottom-1/2 translate-y-4/3 group-hover:translate-y-1/2 left-1/2 h-8 -translate-x-1/2 gap-1 rounded-lg bg-white/90 px-3 text-[13px] font-medium text-slate-700 shadow-sm backdrop-blur-sm hover:bg-white dark:bg-slate-900/90 dark:text-slate-100"
                      >
                        <Eye className="size-3.5" />
                        معاينة حيّة
                      </Button>
                    </div>

                    <div className="w-full space-y-1 text-center">
                      <p
                        className={cn(
                          "truncate text-[15px] text-slate-700 dark:text-slate-100",
                          design.isActive ? "font-bold" : "font-normal",
                        )}
                      >
                        {design.storeName || "تصميم بدون اسم"}
                      </p>
                      <p className="line-clamp-2 text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                        {design.tagline || design.prompt}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDate(design.createdAt)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      disabled={design.isActive}
                      onClick={() => setDesignToApply(design)}
                      className={cn(
                        "mt-auto h-8 w-full rounded-lg text-[13px] font-medium shadow-none",
                        design.isActive
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-100"
                          : "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20",
                      )}
                    >
                      {design.isActive ? "التصميم الحالي" : "استخدام التصميم"}
                    </Button>
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
