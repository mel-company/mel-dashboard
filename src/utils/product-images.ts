import { MAX_PRODUCT_IMAGES } from "@/api/types/product";
import type { ProductImage, ProductListItem } from "@/api/types/product";
import { coerceImagePath } from "@/utils/image-url";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export type ValidatedImageFilesResult = {
  files: File[];
  error?: string;
};

/** Validate and merge newly selected image files into an existing list (max 10). */
export function mergeProductImageFiles(
  current: File[],
  incoming: FileList | File[] | null | undefined,
  max = MAX_PRODUCT_IMAGES,
): ValidatedImageFilesResult {
  const selected = Array.from(incoming ?? []);
  if (selected.length === 0) return { files: current };

  const next = [...current];

  for (const file of selected) {
    if (!file.type.startsWith("image/")) {
      return { files: current, error: "الرجاء اختيار ملفات صور فقط" };
    }
    if (file.size > MAX_FILE_BYTES) {
      return { files: current, error: "حجم كل صورة يجب أن يكون أقل من 2MB" };
    }
    if (next.length >= max) {
      return {
        files: next,
        error: `يمكنك رفع ${max} صور كحد أقصى للمنتج`,
      };
    }
    next.push(file);
  }

  return { files: next };
}

export function revokeObjectUrls(urls: string[]) {
  urls.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  });
}

/**
 * Resolve cover image for list/cards:
 * product.image → primary in images[] → first gallery item.
 */
export function getProductCoverImage(
  product?: Pick<ProductListItem, "image" | "images"> | null,
): string {
  if (!product) return "";

  const cover = coerceImagePath(product.image);
  if (cover) return cover;

  const images = Array.isArray(product.images)
    ? (product.images as ProductImage[])
    : [];
  if (images.length === 0) return "";

  const sorted = [...images].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const primary = sorted.find((img) => img.isPrimary);
  return coerceImagePath(primary?.url ?? sorted[0]?.url);
}
