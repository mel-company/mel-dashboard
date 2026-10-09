import { test } from "node:test";
import assert from "node:assert/strict";
import { productFormDataToJson } from "../src/api/endpoints/product-form.ts";

test("stock the merchant typed reaches the API", () => {
  const form = new FormData();
  form.append("title", "Mug");
  form.append("price", "5000");
  form.append("stock", "25");

  assert.equal(productFormDataToJson(form).stock, 25);
});

test("a stock of zero is sent, not dropped", () => {
  const form = new FormData();
  form.append("stock", "0");

  assert.equal(productFormDataToJson(form).stock, 0);
});

test("an empty stock field leaves stock out", () => {
  const form = new FormData();
  form.append("stock", "");

  assert.equal("stock" in productFormDataToJson(form), false);
});

test("parcel measurements reach the API", () => {
  const form = new FormData();
  form.append("weightGrams", "750");
  form.append("lengthCm", "30");
  form.append("widthCm", "20");
  form.append("heightCm", "10");

  const body = productFormDataToJson(form);
  assert.deepEqual(
    [body.weightGrams, body.lengthCm, body.widthCm, body.heightCm],
    [750, 30, 20, 10],
  );
});
