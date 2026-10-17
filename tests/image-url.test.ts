import { test } from "node:test";
import assert from "node:assert/strict";
import { getImageUrl, resolveAssetBaseUrl } from "../src/utils/image-url/index.ts";

const signedLogo =
  "https://abc.r2.cloudflarestorage.com/mel/stores/d22ff866/brand/logo/1791710973314-photo.jpg?X-Amz-Signature=x";

test("a signed logo url is served from the CDN", () => {
  assert.equal(
    getImageUrl(signedLogo),
    "https://cdn.mel.iq/stores/d22ff866/brand/logo/1791710973314-photo.jpg",
  );
});

test("a relative base never becomes the asset host", () => {
  assert.equal(resolveAssetBaseUrl("/api/v1"), "https://cdn.mel.iq");
  assert.equal(
    getImageUrl(signedLogo, "/api/v1"),
    "https://cdn.mel.iq/stores/d22ff866/brand/logo/1791710973314-photo.jpg",
  );
});

test("an absolute base is still honoured", () => {
  assert.equal(resolveAssetBaseUrl("https://assets.example.com/"), "https://assets.example.com");
});
