/**
 * Turning the image-editor modal's settings into a file.
 *
 * The modal previews everything with CSS — a transform for rotation, a
 * `filter` for the light adjustments — because that is instant and costs no
 * pixels. The file that gets uploaded has to look the same, so this module
 * redoes the same operations on a canvas, in the same order.
 *
 * The adjustments are applied by hand on the pixel data rather than through
 * `ctx.filter`: Safari ignored `ctx.filter` until recently, and a merchant on
 * an older iPhone would have seen the brightness they picked in the preview
 * and silently lost it in the saved file. The maths below is the one the CSS
 * filter spec defines, so preview and output agree on every browser.
 */

export type Adjustments = {
  /** 1 = unchanged. CSS `brightness()`. */
  brightness: number;
  /** 1 = unchanged. CSS `contrast()`. */
  contrast: number;
  /** 1 = unchanged. CSS `saturate()`. */
  saturation: number;
};

export const NEUTRAL_ADJUSTMENTS: Adjustments = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
};

export type PixelArea = { x: number; y: number; width: number; height: number };

export type RenderSettings = {
  /** The crop, in pixels of the image *after* rotation (react-easy-crop's
   *  `croppedAreaPixels`, which is measured on the rotated bounding box). */
  area: PixelArea;
  /** Degrees, clockwise. */
  rotation: number;
  adjustments: Adjustments;
  /** Filled behind transparent pixels; `null` keeps them transparent. */
  background: string | null;
  /** Longest side of the saved file. Larger crops are scaled down. */
  maxSide?: number;
};

/**
 * A storefront never shows an image wider than ~1600 CSS px, and phones
 * upload 4000px+ photos. 2400 keeps retina sharpness with room to spare while
 * staying well under the editor's 10MB upload limit.
 */
export const DEFAULT_MAX_SIDE = 2400;

export const isNeutral = (a: Adjustments) =>
  a.brightness === 1 && a.contrast === 1 && a.saturation === 1;

/** The CSS twin of `applyAdjustments`, for the live preview. */
export const adjustmentsToCss = (a: Adjustments) =>
  isNeutral(a)
    ? "none"
    : `brightness(${a.brightness}) contrast(${a.contrast}) saturate(${a.saturation})`;

/** Size of the box a `width × height` image needs once rotated. */
export const rotatedSize = (width: number, height: number, rotation: number) => {
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: Math.round(width * cos + height * sin),
    height: Math.round(width * sin + height * cos),
  };
};

/** Scales `width × height` down so its longest side is at most `maxSide`. */
export const fitWithin = (width: number, height: number, maxSide: number) => {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

/**
 * brightness → contrast → saturate, on RGBA bytes in place, exactly as the
 * Filter Effects spec defines each function. Alpha is left alone.
 */
export const applyAdjustments = (data: Uint8ClampedArray, a: Adjustments) => {
  if (isNeutral(a)) return;
  const b = a.brightness;
  const c = a.contrast;
  const intercept = 0.5 * (1 - c) * 255;
  const s = a.saturation;
  // feColorMatrix type="saturate"
  const m00 = 0.213 + 0.787 * s, m01 = 0.715 - 0.715 * s, m02 = 0.072 - 0.072 * s;
  const m10 = 0.213 - 0.213 * s, m11 = 0.715 + 0.285 * s, m12 = 0.072 - 0.072 * s;
  const m20 = 0.213 - 0.213 * s, m21 = 0.715 - 0.715 * s, m22 = 0.072 + 0.928 * s;

  for (let i = 0; i < data.length; i += 4) {
    // Each CSS filter step clamps its output, so clamp between steps too.
    let r = clamp255(data[i] * b);
    let g = clamp255(data[i + 1] * b);
    let bl = clamp255(data[i + 2] * b);
    r = clamp255(r * c + intercept);
    g = clamp255(g * c + intercept);
    bl = clamp255(bl * c + intercept);
    data[i] = m00 * r + m01 * g + m02 * bl;
    data[i + 1] = m10 * r + m11 * g + m12 * bl;
    data[i + 2] = m20 * r + m21 * g + m22 * bl;
  }
};

/**
 * Whether any pixel is less than fully opaque. Decides PNG/WebP over JPEG:
 * a JPEG would paint a cut-out product onto black.
 */
export const hasTransparency = (data: Uint8ClampedArray) => {
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
};

/**
 * Name for the edited file: the original's stem with the extension the new
 * encoding actually has, so the R2 key and the content type agree.
 */
export const editedFileName = (original: string, mime: string) => {
  const stem = original.replace(/\.[^./\\]+$/, "") || "image";
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return `${stem}.${ext}`;
};

/**
 * Formats the modal should not touch. An SVG is a vector — rasterising it to
 * crop it would throw away the reason it was an SVG — and a GIF is usually
 * animated, which a canvas flattens to its first frame.
 */
export const isEditableImage = (file: File) =>
  file.type.startsWith("image/") &&
  file.type !== "image/svg+xml" &&
  file.type !== "image/gif";

type Drawable = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

const sizeOf = (source: Drawable) =>
  "naturalWidth" in source
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Renders the edit and encodes it.
 *
 * Opaque results go out as JPEG — the smallest for photographs, and what the
 * storefront already serves for most uploads. Anything with transparency goes
 * out as WebP, falling back to PNG where the browser cannot encode WebP (Safari
 * returns a PNG when asked for WebP, which the type check below catches).
 */
export const renderEdit = async (
  source: Drawable,
  settings: RenderSettings,
  originalName: string,
): Promise<File> => {
  const { width: srcW, height: srcH } = sizeOf(source);
  const rotated = rotatedSize(srcW, srcH, settings.rotation);

  // 1. The whole image, rotated, on a canvas that just fits it. (A flip is
  //    already baked into `source` by the modal, so it needs no step here.)
  const stage = document.createElement("canvas");
  stage.width = rotated.width;
  stage.height = rotated.height;
  const sctx = stage.getContext("2d");
  if (!sctx) throw new Error("Canvas is not available");
  sctx.translate(rotated.width / 2, rotated.height / 2);
  sctx.rotate((settings.rotation * Math.PI) / 180);
  sctx.drawImage(source, -srcW / 2, -srcH / 2);

  // 2. The crop, scaled to the output size.
  const area = settings.area;
  const out = fitWithin(area.width, area.height, settings.maxSide ?? DEFAULT_MAX_SIDE);
  const canvas = document.createElement("canvas");
  canvas.width = out.width;
  canvas.height = out.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.imageSmoothingQuality = "high";
  if (settings.background) {
    ctx.fillStyle = settings.background;
    ctx.fillRect(0, 0, out.width, out.height);
  }
  ctx.drawImage(
    stage,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    out.width,
    out.height,
  );

  // 3. Light adjustments, and the format decision, from the same pixels.
  const pixels = ctx.getImageData(0, 0, out.width, out.height);
  applyAdjustments(pixels.data, settings.adjustments);
  ctx.putImageData(pixels, 0, 0);
  const transparent = hasTransparency(pixels.data);

  let blob: Blob | null = null;
  if (transparent) {
    blob = await toBlob(canvas, "image/webp", 0.92);
    if (!blob || blob.type !== "image/webp") blob = await toBlob(canvas, "image/png");
  } else {
    blob = await toBlob(canvas, "image/jpeg", 0.9);
  }
  if (!blob) throw new Error("Could not encode the image");

  return new File([blob], editedFileName(originalName, blob.type), {
    type: blob.type,
  });
};
