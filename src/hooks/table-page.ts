/**
 * Which page a table shows, and whether it must pull another cursor page
 * first.
 *
 * The page used to be clamped to the pages already loaded *before* deciding
 * whether to fetch. Pressing «التالي» past the loaded rows asked for page 2,
 * got clamped back to 1, and "need more rows?" was then asked about page 1,
 * which never needs any. So the arrow did nothing and the footer was stuck on
 * whatever the first request returned (10 products, 20 orders).
 *
 * Now the fetch is driven by the page the reader asked for, and the page
 * shown stays on the last loaded one until the rows arrive. Only one page
 * past the loaded rows can be asked for, because that is all the footer
 * offers while more exist; a caller should store `wantedPage` back so a
 * stale far-off page (say, page 6 before a search) doesn't walk the cursor.
 */
export function resolveTablePage({
  requestedPage,
  viewCount,
  loadedCount,
  hasNextPage,
}: {
  requestedPage: number;
  viewCount: number;
  loadedCount: number;
  hasNextPage: boolean;
}) {
  const loadedPages = Math.ceil(loadedCount / viewCount) || 1;
  const reachable = hasNextPage ? loadedPages + 1 : loadedPages;
  const wantedPage = Math.max(1, Math.min(requestedPage, reachable));
  const activePage = Math.min(wantedPage, loadedPages);
  const needsMoreData = hasNextPage && wantedPage * viewCount > loadedCount;
  return {
    /** The requested page, limited to what can be reached. */
    wantedPage,
    activePage,
    loadedPages,
    needsMoreData,
    /** What the footer offers: one page past the loaded rows while more exist. */
    footerPages: hasNextPage ? Math.max(loadedPages, activePage + 1) : loadedPages,
  };
}
