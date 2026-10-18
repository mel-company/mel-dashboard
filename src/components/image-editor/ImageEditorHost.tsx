import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import Cropper, { type Area } from "react-easy-crop";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  Cancel01Icon,
  CropIcon,
  FlipHorizontalIcon,
  Loading03Icon,
  MagicWand01Icon,
  RotateLeft01Icon,
  RotateRight01Icon,
  SearchAddIcon,
  SearchMinusIcon,
  SlidersHorizontalIcon,
} from "@hugeicons-pro/core-stroke-rounded";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { imageEditorStore } from "@/lib/image-edit/queue";
import {
  NEUTRAL_ADJUSTMENTS,
  adjustmentsToCss,
  renderEdit,
  type Adjustments,
} from "@/lib/image-edit/render";
import type { RemovalProgress } from "@/lib/image-edit/background-removal";

/**
 * The image-editor modal: crop, zoom, rotate, flip, colour adjustments and
 * background removal, between picking an image and handing it to the form.
 *
 * Same tool as the store editor's (mel-editor `components/image-editor`),
 * dressed in the dashboard's tokens. Mounted once in `App`; inputs reach it
 * through `withImageEditor` (see `lib/image-edit/queue.ts`).
 *
 * Built on the Radix dialog primitive on purpose: most image inputs here live
 * inside a Radix dialog already, and a plain portal would count as an
 * "outside click" for it and close the form underneath. Radix stacks nested
 * dialogs, so this one sits on top and the form waits behind it.
 */
export const ImageEditorHost = () => {
  const request = useSyncExternalStore(
    imageEditorStore.subscribe,
    imageEditorStore.getRequest,
    imageEditorStore.getRequest,
  );

  useEffect(() => {
    imageEditorStore.setHostMounted(true);
    return () => imageEditorStore.setHostMounted(false);
  }, []);

  if (!request) return null;
  return (
    <ImageEditorModal
      key={`${request.file.name}-${request.file.lastModified}-${request.position?.index ?? 0}`}
      file={request.file}
      position={request.position}
    />
  );
};

type Tab = "crop" | "adjust" | "background";
type AspectKey = "original" | "1:1" | "4:3" | "3:4" | "16:9";
type Fill = "transparent" | "white";

const TABS: ReadonlyArray<{ value: Tab; label: string; icon: typeof CropIcon }> = [
  { value: "crop", label: "القص", icon: CropIcon },
  { value: "adjust", label: "الألوان", icon: SlidersHorizontalIcon },
  { value: "background", label: "الخلفية", icon: MagicWand01Icon },
];

const ASPECTS: ReadonlyArray<{ value: AspectKey; label: string }> = [
  { value: "original", label: "الأصلي" },
  { value: "1:1", label: "1:1" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
  { value: "16:9", label: "16:9" },
];

const ASPECT_RATIOS: Record<Exclude<AspectKey, "original">, number> = {
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
};

const FILLS: ReadonlyArray<{ value: Fill; label: string }> = [
  { value: "transparent", label: "شفافة" },
  { value: "white", label: "بيضاء" },
];

const MIN_ZOOM = 1;
/**
 * A cut-out can be zoomed out past the image's edges so the product sits
 * inside a square with room around it; the margin becomes the chosen fill.
 */
const MIN_ZOOM_CUTOUT = 0.4;
const MAX_ZOOM = 4;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image"));
    img.src = src;
  });

/** A mirrored copy of `source`, so the flip is part of the pixels the cropper shows. */
const flipped = (source: HTMLImageElement | HTMLCanvasElement) => {
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0);
  return canvas;
};

const canvasUrl = (canvas: HTMLCanvasElement) =>
  new Promise<string>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("encode"))), "image/png"),
  );

const removalLabel = (p: RemovalProgress | null) => {
  if (!p) return "جارٍ إزالة الخلفية…";
  if (p.stage === "download")
    return p.ratio === null
      ? "جارٍ تجهيز الأداة لأول مرة…"
      : `جارٍ تجهيز الأداة لأول مرة… ${Math.round(p.ratio * 100)}%`;
  if (p.stage === "prepare") return "جارٍ تشغيل الأداة…";
  return "جارٍ إزالة الخلفية، لحظات…";
};

const ImageEditorModal = ({
  file,
  position,
}: {
  file: File;
  position: { index: number; total: number } | null;
}) => {
  const finish = imageEditorStore.finish;

  const [original, setOriginal] = useState<HTMLImageElement | null>(null);
  const [cutout, setCutout] = useState<HTMLCanvasElement | null>(null);
  const [useCutout, setUseCutout] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [display, setDisplay] = useState<HTMLImageElement | HTMLCanvasElement | null>(null);
  const [loadError, setLoadError] = useState(false);

  const [tab, setTab] = useState<Tab>("crop");
  const [aspect, setAspect] = useState<AspectKey>("original");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments>(NEUTRAL_ADJUSTMENTS);
  const [fill, setFill] = useState<Fill>("transparent");

  const [removing, setRemoving] = useState(false);
  const [removal, setRemoval] = useState<RemovalProgress | null>(null);
  const [removalError, setRemovalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    let alive = true;
    loadImage(url)
      .then((img) => alive && setOriginal(img))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (!original) return;
    const base = useCutout && cutout ? cutout : original;
    let alive = true;
    let made: string | null = null;
    (async () => {
      const source = flipX ? flipped(base) : base;
      const url = source instanceof HTMLImageElement ? source.src : await canvasUrl(source);
      if (!(source instanceof HTMLImageElement)) made = url;
      if (!alive) {
        if (made) URL.revokeObjectURL(made);
        return;
      }
      setDisplay(source);
      setDisplayUrl(url);
    })();
    return () => {
      alive = false;
      if (made) {
        const stale = made;
        setTimeout(() => URL.revokeObjectURL(stale), 1000);
      }
    };
  }, [original, cutout, useCutout, flipX]);

  const sourceSize = useMemo(() => {
    if (!display) return null;
    const w = "naturalWidth" in display ? display.naturalWidth : display.width;
    const h = "naturalHeight" in display ? display.naturalHeight : display.height;
    return { w, h };
  }, [display]);

  const aspectRatio = useMemo(() => {
    if (aspect !== "original") return ASPECT_RATIOS[aspect];
    if (!sourceSize) return 1;
    const sideways = Math.abs(rotation % 180) === 90;
    return sideways ? sourceSize.h / sourceSize.w : sourceSize.w / sourceSize.h;
  }, [aspect, sourceSize, rotation]);

  const busy = removing || saving;
  const minZoom = useCutout ? MIN_ZOOM_CUTOUT : MIN_ZOOM;

  useEffect(() => {
    if (useCutout) return;
    setZoom((z) => Math.max(z, MIN_ZOOM));
    setCrop({ x: 0, y: 0 });
  }, [useCutout]);

  const cancel = useCallback(() => {
    if (!busy) finish(null);
  }, [busy, finish]);

  const rotate = (delta: number) => setRotation((r) => (r + delta + 360) % 360);

  const resetCrop = () => {
    setAspect("original");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipX(false);
  };

  const startRemoval = async () => {
    if (!original || removing) return;
    if (cutout) {
      setUseCutout(true);
      return;
    }
    setRemoving(true);
    setRemovalError(null);
    setRemoval(null);
    try {
      const { removeBackground } = await import("@/lib/image-edit/background-removal");
      const result = await removeBackground(original, setRemoval);
      setCutout(result);
      setUseCutout(true);
    } catch (error) {
      console.error("[image-editor] background removal failed", error);
      setRemovalError("تعذّرت إزالة الخلفية على هذا الجهاز. تحقق من الاتصال وحاول مرة أخرى.");
    } finally {
      setRemoving(false);
      setRemoval(null);
    }
  };

  const save = async () => {
    if (!display || !area || busy) return;
    setSaving(true);
    setSaveError(null);
    try {
      const edited = await renderEdit(
        display,
        {
          area,
          rotation,
          adjustments,
          background: useCutout && fill === "white" ? "#ffffff" : null,
        },
        file.name,
      );
      finish(edited);
    } catch (error) {
      console.error("[image-editor] save failed", error);
      setSaveError("تعذّر حفظ الصورة. حاول مرة أخرى.");
      setSaving(false);
    }
  };

  const setAdjustment = (key: keyof Adjustments) => (value: number) =>
    setAdjustments((prev) => ({ ...prev, [key]: value / 100 }));

  const stage =
    useCutout && fill === "transparent"
      ? "image-editor-checker"
      : useCutout && fill === "white"
        ? "bg-white"
        : "bg-muted";

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && cancel()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm" />
        <DialogPrimitive.Content
          dir="rtl"
          aria-describedby={undefined}
          onInteractOutside={(event) => busy && event.preventDefault()}
          onEscapeKeyDown={(event) => busy && event.preventDefault()}
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-card text-foreground shadow-2xl outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(720px,calc(100dvh-2rem))] sm:w-[calc(100%-2rem)] sm:max-w-[920px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <DialogPrimitive.Title className="text-sm font-bold">
                تعديل الصورة
                {position ? (
                  <span className="ms-2 text-xs font-medium text-muted-foreground">
                    {position.index} من {position.total}
                  </span>
                ) : null}
              </DialogPrimitive.Title>
              <p dir="auto" className="truncate text-[11px] text-muted-foreground">
                {file.name}
              </p>
            </div>
            <button
              type="button"
              onClick={cancel}
              disabled={busy}
              aria-label="إغلاق"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
            </button>
          </div>

          {/* Body: controls first, so on desktop they sit on the right. */}
          <div className="flex min-h-0 flex-1 flex-col-reverse sm:flex-row">
            <div className="flex min-h-0 flex-col gap-4 overflow-y-auto border-t border-border p-4 sm:w-[300px] sm:shrink-0 sm:border-t-0 sm:border-l sm:p-5">
              <div role="radiogroup" aria-label="أدوات التعديل" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                {TABS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={tab === option.value}
                    onClick={() => setTab(option.value)}
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-all",
                      tab === option.value
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <HugeiconsIcon icon={option.icon} className="size-3.5" />
                    {option.label}
                  </button>
                ))}
              </div>

              {tab === "crop" ? (
                <div className="flex flex-col gap-4">
                  <ControlGroup title="الأبعاد">
                    <div className="grid grid-cols-5 gap-1.5">
                      {ASPECTS.map((option) => (
                        <ChoiceButton
                          key={option.value}
                          active={aspect === option.value}
                          onClick={() => setAspect(option.value)}
                        >
                          <span dir="ltr">{option.label}</span>
                        </ChoiceButton>
                      ))}
                    </div>
                  </ControlGroup>

                  <ControlGroup title="التكبير" value={`${Math.round(zoom * 100)}%`}>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={SearchMinusIcon} className="size-4 shrink-0 text-muted-foreground" />
                      <Range
                        label="التكبير"
                        min={minZoom * 100}
                        max={MAX_ZOOM * 100}
                        value={Math.round(zoom * 100)}
                        onChange={(v) => setZoom(v / 100)}
                      />
                      <HugeiconsIcon icon={SearchAddIcon} className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </ControlGroup>

                  <ControlGroup title="التدوير والقلب">
                    <div className="grid grid-cols-3 gap-1.5">
                      <ToolButton icon={RotateRight01Icon} label="تدوير يمين" onClick={() => rotate(90)} />
                      <ToolButton icon={RotateLeft01Icon} label="تدوير يسار" onClick={() => rotate(-90)} />
                      <ToolButton
                        icon={FlipHorizontalIcon}
                        label="قلب أفقي"
                        active={flipX}
                        onClick={() => setFlipX((f) => !f)}
                      />
                    </div>
                  </ControlGroup>

                  <Button variant="link" size="sm" className="self-start px-0" onClick={resetCrop}>
                    إعادة ضبط القص
                  </Button>
                </div>
              ) : null}

              {tab === "adjust" ? (
                <div className="flex flex-col gap-4">
                  <AdjustSlider title="السطوع" value={adjustments.brightness} onChange={setAdjustment("brightness")} />
                  <AdjustSlider title="التباين" value={adjustments.contrast} onChange={setAdjustment("contrast")} />
                  <AdjustSlider title="التشبع" value={adjustments.saturation} onChange={setAdjustment("saturation")} />
                  <Button
                    variant="link"
                    size="sm"
                    className="self-start px-0"
                    onClick={() => setAdjustments(NEUTRAL_ADJUSTMENTS)}
                  >
                    إعادة ضبط الألوان
                  </Button>
                </div>
              ) : null}

              {tab === "background" ? (
                <div className="flex flex-col gap-4">
                  <p className="text-xs leading-5 text-muted-foreground">
                    تُزال الخلفية على جهازك مباشرة، ولا تُرسل الصورة لأي جهة. أول استخدام ينزّل الأداة
                    (حوالي 45 ميغابايت) مرة واحدة فقط.
                  </p>

                  {useCutout ? (
                    <>
                      <ControlGroup title="لون الخلفية">
                        <div className="grid grid-cols-2 gap-1.5">
                          {FILLS.map((option) => (
                            <ChoiceButton
                              key={option.value}
                              active={fill === option.value}
                              onClick={() => setFill(option.value)}
                            >
                              {option.label}
                            </ChoiceButton>
                          ))}
                        </div>
                      </ControlGroup>
                      <Button variant="outline" className="rounded-full text-foreground" onClick={() => setUseCutout(false)}>
                        استعادة الخلفية الأصلية
                      </Button>
                    </>
                  ) : (
                    <Button variant="brand" className="h-10" onClick={startRemoval} disabled={removing || !original}>
                      <HugeiconsIcon
                        icon={removing ? Loading03Icon : MagicWand01Icon}
                        className={cn("size-4", removing && "animate-spin")}
                      />
                      {removing ? removalLabel(removal) : cutout ? "إزالة الخلفية مرة أخرى" : "إزالة الخلفية"}
                    </Button>
                  )}

                  {removing && removal?.stage === "download" && removal.ratio !== null ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${Math.round(removal.ratio * 100)}%` }}
                      />
                    </div>
                  ) : null}

                  {removalError ? <ErrorNote text={removalError} /> : null}
                </div>
              ) : null}
            </div>

            {/* The image */}
            <div className={cn("relative h-[46dvh] shrink-0 sm:h-auto sm:min-h-[460px] sm:flex-1", stage)}>
              {displayUrl ? (
                <Cropper
                  image={displayUrl}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={aspectRatio}
                  minZoom={minZoom}
                  maxZoom={MAX_ZOOM}
                  restrictPosition={!useCutout}
                  zoomSpeed={0.25}
                  objectFit="contain"
                  showGrid
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                  onCropComplete={(_, pixels) => setArea(pixels)}
                  style={{
                    containerStyle: { background: "transparent" },
                    mediaStyle: { filter: adjustmentsToCss(adjustments) },
                    cropAreaStyle: {
                      border: "2px solid rgba(255,255,255,0.9)",
                      borderRadius: 8,
                      boxShadow: "0 0 0 9999em rgba(10,14,39,0.55)",
                    },
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  {loadError ? (
                    <ErrorNote text="تعذّرت قراءة هذه الصورة. جرّب ملفاً آخر." />
                  ) : (
                    <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
                  )}
                </div>
              )}

              {removing ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="inline-flex items-center gap-2 rounded-full bg-card/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-lg">
                    <HugeiconsIcon icon={Loading03Icon} className="size-3.5 animate-spin text-primary" />
                    {removalLabel(removal)}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
            {saveError ? <ErrorNote text={saveError} className="basis-full" /> : null}
            <Button variant="link" size="sm" className="px-0" onClick={() => finish(file)} disabled={busy}>
              رفع بدون تعديل
            </Button>
            <div className="ms-auto flex items-center gap-2">
              <Button variant="ghost" onClick={cancel} disabled={busy}>
                إلغاء
              </Button>
              <Button variant="brand" className="h-10 min-w-[120px] px-5" onClick={save} disabled={busy || !area}>
                {saving ? <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" /> : null}
                {saving ? "جارٍ الحفظ…" : "حفظ الصورة"}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const ControlGroup = ({
  title,
  value,
  children,
}: {
  title: string;
  value?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-muted-foreground">{title}</span>
      {value ? (
        <span dir="ltr" className="text-xs tabular-nums text-muted-foreground">
          {value}
        </span>
      ) : null}
    </div>
    {children}
  </div>
);

/** A native range, coloured with the brand primary; RTL like the page. */
const Range = ({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (next: number) => void;
}) => (
  <input
    type="range"
    aria-label={label}
    min={min}
    max={max}
    value={value}
    onChange={(event) => onChange(Number(event.target.value))}
    className="h-1.5 w-full cursor-pointer accent-[var(--primary)]"
  />
);

const AdjustSlider = ({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (next: number) => void;
}) => {
  const pct = Math.round(value * 100);
  const delta = pct - 100;
  return (
    <ControlGroup title={title} value={delta > 0 ? `+${delta}` : `${delta}`}>
      <Range label={title} min={50} max={150} value={pct} onChange={onChange} />
    </ControlGroup>
  );
};

const ChoiceButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "h-8 cursor-pointer rounded-lg border text-xs font-medium transition-colors",
      active
        ? "border-primary/70 bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:text-foreground",
    )}
  >
    {children}
  </button>
);

const ToolButton = ({
  icon,
  label,
  onClick,
  active,
}: {
  icon: typeof CropIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    title={label}
    className={cn(
      "flex h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-medium transition-colors",
      active
        ? "border-primary/70 bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
    )}
  >
    <HugeiconsIcon icon={icon} className="size-4" />
    {label}
  </button>
);

const ErrorNote = ({ text, className }: { text: string; className?: string }) => (
  <div
    className={cn(
      "flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs leading-5 text-destructive",
      className,
    )}
  >
    <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 size-3.5 shrink-0" />
    <span>{text}</span>
  </div>
);
