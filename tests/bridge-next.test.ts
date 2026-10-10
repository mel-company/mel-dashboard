import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveBridgeNext } from "../src/utils/bridge-next.ts";

test("no next lands on the overview", () => {
  assert.equal(resolveBridgeNext(null), "/");
  assert.equal(resolveBridgeNext(""), "/");
});

test("a dashboard path is followed, query included", () => {
  assert.equal(resolveBridgeNext("/editor"), "/editor");
  assert.equal(
    resolveBridgeNext("/editor?generation=abc"),
    "/editor?generation=abc",
  );
});

test("anything off this origin is refused", () => {
  assert.equal(resolveBridgeNext("https://evil.example"), "/");
  assert.equal(resolveBridgeNext("//evil.example"), "/");
  assert.equal(resolveBridgeNext("/\\evil.example"), "/");
  assert.equal(resolveBridgeNext("editor"), "/");
});
