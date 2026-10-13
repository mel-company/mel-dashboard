import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveBridgeNext,
  withEditorGeneration,
} from "../src/utils/bridge-next.ts";

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

test("top-level generation is folded into a bare /editor next", () => {
  assert.equal(
    resolveBridgeNext("/editor", "gen-1"),
    "/editor?generation=gen-1",
  );
  assert.equal(
    resolveBridgeNext("/editor?theme=dark", "gen-1"),
    "/editor?theme=dark&generation=gen-1",
  );
});

test("existing generation on next is left alone", () => {
  assert.equal(
    resolveBridgeNext("/editor?generation=kept", "other"),
    "/editor?generation=kept",
  );
});

test("generation is ignored for non-editor next", () => {
  assert.equal(resolveBridgeNext("/settings", "gen-1"), "/settings");
  assert.equal(withEditorGeneration("/", "gen-1"), "/");
});

test("anything off this origin is refused", () => {
  assert.equal(resolveBridgeNext("https://evil.example"), "/");
  assert.equal(resolveBridgeNext("//evil.example"), "/");
  assert.equal(resolveBridgeNext("/\\evil.example"), "/");
  assert.equal(resolveBridgeNext("editor"), "/");
});
