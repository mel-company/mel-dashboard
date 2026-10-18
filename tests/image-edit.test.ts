import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NEUTRAL_ADJUSTMENTS,
  adjustmentsToCss,
  applyAdjustments,
  editedFileName,
  fitWithin,
  hasTransparency,
  isEditableImage,
  rotatedSize,
} from "../src/lib/image-edit/render.ts";
import { editImage, editImages, imageEditorStore } from "../src/lib/image-edit/queue.ts";

const px = (...values: number[]) => new Uint8ClampedArray(values);
const jpeg = (name = "a.jpg") => new File(["x"], name, { type: "image/jpeg" });

test("adjustments follow the CSS filter maths", () => {
  const bright = px(100, 200, 50, 255);
  applyAdjustments(bright, { brightness: 1.5, contrast: 1, saturation: 1 });
  assert.deepEqual(Array.from(bright), [150, 255, 75, 255]);

  const contrast = px(64, 128, 192, 255);
  applyAdjustments(contrast, { brightness: 1, contrast: 2, saturation: 1 });
  assert.deepEqual(Array.from(contrast), [0, 128, 255, 255]);

  const grey = px(255, 0, 0, 40);
  applyAdjustments(grey, { brightness: 1, contrast: 1, saturation: 0 });
  const g = Math.round(0.213 * 255);
  assert.deepEqual(Array.from(grey), [g, g, g, 40]);

  assert.equal(adjustmentsToCss(NEUTRAL_ADJUSTMENTS), "none");
});

test("geometry and file helpers", () => {
  assert.deepEqual(rotatedSize(400, 300, 90), { width: 300, height: 400 });
  assert.deepEqual(fitWithin(4800, 2400, 2400), { width: 2400, height: 1200 });
  assert.deepEqual(fitWithin(800, 600, 2400), { width: 800, height: 600 });
  assert.equal(editedFileName("bag.png", "image/webp"), "bag.webp");
  assert.equal(editedFileName("shoe", "image/jpeg"), "shoe.jpg");
  assert.equal(hasTransparency(px(0, 0, 0, 255)), false);
  assert.equal(hasTransparency(px(0, 0, 0, 254)), true);
  assert.equal(isEditableImage(jpeg()), true);
  assert.equal(isEditableImage(new File(["x"], "l.svg", { type: "image/svg+xml" })), false);
  assert.equal(isEditableImage(new File(["x"], "a.gif", { type: "image/gif" })), false);
});

test("without a mounted modal files pass straight through", async () => {
  imageEditorStore.setHostMounted(false);
  const file = jpeg();
  assert.equal(await editImage(file), file);
});

test("a batch is edited one file at a time and cancelled files are dropped", async () => {
  imageEditorStore.setHostMounted(true);
  const a = jpeg("a.jpg");
  const b = jpeg("b.jpg");
  const edited = jpeg("a-edited.jpg");
  const pending = editImages([a, b]);

  await Promise.resolve();
  assert.equal(imageEditorStore.getRequest()?.file, a);
  assert.deepEqual(imageEditorStore.getRequest()?.position, { index: 1, total: 2 });
  imageEditorStore.finish(edited);

  await new Promise((r) => setTimeout(r, 0));
  assert.equal(imageEditorStore.getRequest()?.file, b);
  imageEditorStore.finish(null);

  assert.deepEqual(await pending, [edited]);
  imageEditorStore.setHostMounted(false);
});
