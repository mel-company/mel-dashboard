/**
 * Shared formatting for the collections surfaces.
 *
 * Deliberately a subset of `new-pages/categories/utils.ts`: there is no
 * `getCollectionType` (a collection has no parent) and no capital column (it
 * has no cost of its own). The formatters that *are* here behave identically,
 * so a date reads the same on both pages.
 */

export { formatDate, formatTime, formatDateTime, formatIQD, shortId } from "../categories/utils";

/** The member thumbnails a row or card shows. */
export function getCollectionProducts(
  collection: any,
): Array<{ id: string; title: string; image?: string }> {
  const rows = collection?.products ?? [];
  return rows
    .map((row: any, index: number) => ({
      id: row?.product?.id ?? row?.id ?? String(index),
      title: row?.product?.title ?? row?.title ?? "",
      image: row?.product?.image ?? row?.image,
    }))
    .filter((product: { id: string }) => product.id);
}

export function productCount(collection: any): number {
  return collection?._count?.products ?? getCollectionProducts(collection).length;
}
