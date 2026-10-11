/**
 * Matching a cached query by the entity it holds, under either naming scheme.
 *
 * This app keys the same entity two different ways and nothing reconciles
 * them. The wrappers use a key factory rooted at a plural English noun —
 * `["products"]`, `["customers"]`, `["categories"]` — while every table page
 * goes through `useTableData`, which roots its key at the API path it calls:
 * `["product/filter-cursor", "list", {…}]`, `["customer/cursor", …]`.
 * React Query matches a `queryKey` by prefix, and `["products"]` is not a
 * prefix of `["product/filter-cursor", …]`, so a mutation invalidating
 * `productKeys.all` left every table untouched. With `staleTime` at five
 * minutes on those queries, that is five minutes of a row the merchant has
 * already deleted still sitting on screen.
 *
 * Matching on the root *string prefix* covers both schemes at once, and costs
 * nothing when no such query is mounted.
 */
export const entityQueryPredicate =
  (prefix: string) =>
  (query: { queryKey: readonly unknown[] }): boolean => {
    const root = query.queryKey[0];
    return typeof root === "string" && root.startsWith(prefix);
  };
