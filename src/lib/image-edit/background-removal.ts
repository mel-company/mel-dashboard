/**
 * Background removal, entirely in the merchant's browser.
 *
 * No server, no API key, no per-image cost: the model runs on the device with
 * ONNX Runtime Web — on the GPU through WebGPU where the browser has it, on
 * the CPU through WebAssembly everywhere else.
 *
 * The model is IS-Net general-use (the DIS project's weights, MIT on Hugging
 * Face), weight-only int8: ~44MB, fetched once from Hugging Face's CDN on the
 * first removal and kept in Cache Storage after that. It was picked by trying
 * the candidates on product photos and in a browser:
 *   - BiRefNet lite cut slightly cleaner, but needs WebGPU — on the CPU path
 *     it runs out of WebAssembly memory, so phones without WebGPU would get
 *     nothing — and it is 115MB;
 *   - ormbg and MODNet are trained on people and kept the reflection under a
 *     bag and the glass of a watch strap;
 *   - the AGPL-licensed IS-Net packages were ruled out on licence alone.
 * On the CPU a 1024² pass takes ~15s on a laptop, which the modal says.
 *
 * The revision is pinned so the file under a cached URL can never change.
 *
 * Nothing here is imported until the merchant presses the button: ONNX
 * Runtime is ~400KB of JS plus its WebAssembly binary, and the editor should
 * not pay for that on every load.
 */

import type { InferenceSession, Tensor } from "onnxruntime-web";

const MODEL_URL =
  "https://huggingface.co/xrds/isnet-general-onnx-int8/resolve/71eff2372ec9c8edbc6ca637ded591423d23b65a/onnx/model_quantized.onnx";
const CACHE_NAME = "mel-editor-bg-removal-v1";
/** The resolution the model was trained at: 1 × 3 × 1024 × 1024. */
const SIZE = 1024;
/** IS-Net's normalisation, on 0–255 values: (v − 128) / 256. */
const MEAN = 128;
const STD = 256;

export type RemovalProgress =
  | { stage: "download"; /** 0–1, or null when the size is unknown. */ ratio: number | null }
  | { stage: "prepare" }
  | { stage: "process" };

type Ort = typeof import("onnxruntime-web");

let ortPromise: Promise<Ort> | null = null;
let sessionPromise: Promise<InferenceSession> | null = null;
let modelPromise: Promise<ArrayBuffer> | null = null;

const loadOrt = () => {
  ortPromise ??= Promise.all([import("onnxruntime-web/webgpu"), hasWebGpu()]).then(([mod, gpu]) => {
    const ort = ((mod as { default?: Ort }).default ?? mod) as Ort;
    // Threads need cross-origin isolation, which the editor does not have
    // (it would break the canvas iframe and third-party embeds). Asking for
    // them anyway only produces a console warning.
    ort.env.wasm.numThreads = 1;
    // Without WebGPU the whole pass runs on the CPU for several seconds;
    // in a worker, so the page does not freeze while it does.
    if (!gpu) ort.env.wasm.proxy = true;
    return ort;
  });
  return ortPromise;
};

/** Reads the model from Cache Storage, or downloads it with progress. */
const loadModel = (onProgress: (p: RemovalProgress) => void) => {
  if (modelPromise) return modelPromise;
  modelPromise = (async () => {
    const cache = typeof caches !== "undefined" ? await caches.open(CACHE_NAME).catch(() => null) : null;
    const cached = await cache?.match(MODEL_URL);
    if (cached) return cached.arrayBuffer();

    const response = await fetch(MODEL_URL);
    if (!response.ok || !response.body) throw new Error(`Model download failed (${response.status})`);
    const total = Number(response.headers.get("content-length")) || 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    onProgress({ stage: "download", ratio: total ? 0 : null });
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress({ stage: "download", ratio: total ? Math.min(1, received / total) : null });
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    // Best effort: a full or disabled cache only means downloading again.
    await cache
      ?.put(MODEL_URL, new Response(bytes, { headers: { "content-type": "application/octet-stream" } }))
      .catch(() => undefined);
    return bytes.buffer;
  })();
  // A failed download must not poison every later attempt.
  modelPromise.catch(() => {
    modelPromise = null;
  });
  return modelPromise;
};

type GpuNavigator = { gpu?: { requestAdapter: () => Promise<unknown> } };

/**
 * Whether WebGPU can actually be used. `navigator.gpu` alone is not enough:
 * Chrome exposes it on machines whose GPU it then refuses, and only asking
 * for an adapter tells.
 */
let gpuPromise: Promise<boolean> | null = null;
const hasWebGpu = () =>
  (gpuPromise ??= (async () => {
    try {
      const gpu = (navigator as GpuNavigator).gpu;
      return !!(gpu && (await gpu.requestAdapter()));
    } catch {
      return false;
    }
  })());

/**
 * `"webgpu"` first where the browser has it, `"wasm"` otherwise or once the
 * GPU path has failed. Decided before ONNX Runtime initialises, because the
 * one setting that depends on it — `proxy`, which runs the CPU path in a
 * worker so the modal's spinner keeps turning — cannot change afterwards and
 * cannot be combined with WebGPU.
 */
let backend: "webgpu" | "wasm" | null = null;

const createSession = async (ort: Ort, model: ArrayBuffer) => {
  backend ??= (await hasWebGpu()) ? "webgpu" : "wasm";
  if (backend === "webgpu") {
    try {
      return await ort.InferenceSession.create(model, { executionProviders: ["webgpu"] });
    } catch {
      // No usable adapter. The CPU path is slower but always there.
      backend = "wasm";
    }
  }
  return ort.InferenceSession.create(model, { executionProviders: ["wasm"] });
};

const loadSession = (onProgress: (p: RemovalProgress) => void) => {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const [ort, model] = await Promise.all([loadOrt(), loadModel(onProgress)]);
    onProgress({ stage: "prepare" });
    return createSession(ort, model);
  })();
  sessionPromise.catch(() => {
    sessionPromise = null;
  });
  return sessionPromise;
};

type Drawable = HTMLImageElement | HTMLCanvasElement | ImageBitmap;

const sizeOf = (source: Drawable) =>
  "naturalWidth" in source
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };

/** The image squashed to 1024² and normalised, as the model was trained. */
const toInput = (ort: Ort, source: Drawable): Tensor => {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(source, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  const plane = SIZE * SIZE;
  const input = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    input[i] = (data[i * 4] - MEAN) / STD;
    input[plane + i] = (data[i * 4 + 1] - MEAN) / STD;
    input[2 * plane + i] = (data[i * 4 + 2] - MEAN) / STD;
  }
  return new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]);
};

/**
 * The model's 1024² output as an alpha mask the size of the original.
 *
 * Some exports already end in a sigmoid and some do not; the range of the
 * values tells which (the same check transformers.js makes).
 */
const toMask = (values: Float32Array, width: number, height: number) => {
  const eps = 1e-5;
  let needsSigmoid = false;
  for (let i = 0; i < values.length; i++) {
    if (values[i] < -eps || values[i] > 1 + eps) {
      needsSigmoid = true;
      break;
    }
  }
  const small = document.createElement("canvas");
  small.width = SIZE;
  small.height = SIZE;
  const sctx = small.getContext("2d");
  if (!sctx) throw new Error("Canvas is not available");
  const img = sctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < values.length; i++) {
    const v = needsSigmoid ? 1 / (1 + Math.exp(-values[i])) : values[i];
    img.data[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, v)) * 255);
  }
  sctx.putImageData(img, 0, 0);

  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const mctx = mask.getContext("2d");
  if (!mctx) throw new Error("Canvas is not available");
  mctx.imageSmoothingQuality = "high";
  mctx.drawImage(small, 0, 0, width, height);
  return mask;
};

/**
 * Returns a canvas with the original pixels and the background made
 * transparent. Full resolution: the mask is scaled up, the photo is not
 * scaled down.
 */
export const removeBackground = async (
  source: Drawable,
  onProgress: (p: RemovalProgress) => void = () => undefined,
): Promise<HTMLCanvasElement> => {
  let session = await loadSession(onProgress);
  const ort = await loadOrt();
  onProgress({ stage: "process" });

  const input = toInput(ort, source);
  const feeds = { [session.inputNames[0]]: input };
  // The export also returns the decoder's side outputs; only the first is
  // the mask, and naming it skips copying the others back.
  const runMask = (s: InferenceSession) => s.run(feeds, [s.outputNames[0]]);
  let outputs: InferenceSession.OnnxValueMapType;
  try {
    outputs = await runMask(session);
  } catch (error) {
    // A GPU that created the session but cannot run it (missing features,
    // lost device): retry once on the CPU before giving up.
    if (backend !== "webgpu") throw error;
    console.warn("[bg-removal] WebGPU run failed, retrying on the CPU", error);
    backend = "wasm";
    sessionPromise = null;
    session = await loadSession(onProgress);
    outputs = await runMask(session);
  }
  const output = outputs[session.outputNames[0]];
  const values = (await output.getData()) as Float32Array;
  output.dispose?.();

  const { width, height } = sizeOf(source);
  const mask = toMask(values, width, height);

  const result = document.createElement("canvas");
  result.width = width;
  result.height = height;
  const ctx = result.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.drawImage(source, 0, 0, width, height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  return result;
};
