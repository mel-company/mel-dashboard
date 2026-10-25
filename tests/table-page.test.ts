import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTablePage } from "../src/hooks/table-page.ts";

test("next past the loaded rows fetches instead of snapping back", () => {
  // 10 products loaded, 10 per page, more on the server, reader pressed next.
  const r = resolveTablePage({
    requestedPage: 2,
    viewCount: 10,
    loadedCount: 10,
    hasNextPage: true,
  });
  assert.equal(r.needsMoreData, true);
  assert.equal(r.activePage, 1); // stays put until the rows arrive
  assert.equal(r.footerPages, 2);
});

test("once the rows arrive the requested page shows", () => {
  const r = resolveTablePage({
    requestedPage: 2,
    viewCount: 10,
    loadedCount: 20,
    hasNextPage: true,
  });
  assert.equal(r.activePage, 2);
  assert.equal(r.needsMoreData, false);
  assert.equal(r.footerPages, 3);
});

test("orders: 20 loaded, 10 per page, page 3 fetches", () => {
  const r = resolveTablePage({
    requestedPage: 3,
    viewCount: 10,
    loadedCount: 20,
    hasNextPage: true,
  });
  assert.equal(r.needsMoreData, true);
  assert.equal(r.activePage, 2);
});

test("a larger page size keeps fetching until the page is full", () => {
  const r = resolveTablePage({
    requestedPage: 1,
    viewCount: 50,
    loadedCount: 20,
    hasNextPage: true,
  });
  assert.equal(r.needsMoreData, true);
  assert.equal(r.activePage, 1);
});

test("nothing more on the server clamps to the last page", () => {
  const r = resolveTablePage({
    requestedPage: 5,
    viewCount: 10,
    loadedCount: 23,
    hasNextPage: false,
  });
  assert.equal(r.activePage, 3);
  assert.equal(r.needsMoreData, false);
  assert.equal(r.footerPages, 3);
});

test("a stale page far ahead only reaches one page past the loaded rows", () => {
  // e.g. the reader was on page 6, then searched: don't walk 6 pages.
  const r = resolveTablePage({
    requestedPage: 6,
    viewCount: 10,
    loadedCount: 10,
    hasNextPage: true,
  });
  assert.equal(r.wantedPage, 2);
  assert.equal(r.needsMoreData, true);
  assert.equal(r.footerPages, 2);
});

test("an empty list is page 1 of 1", () => {
  const r = resolveTablePage({
    requestedPage: 1,
    viewCount: 10,
    loadedCount: 0,
    hasNextPage: false,
  });
  assert.equal(r.activePage, 1);
  assert.equal(r.footerPages, 1);
});
