/**
 * Local fill colours for Tamima photo-environment ids after background
 * removal. Scenes that need AI stay for Tamima; here we composite the cut-out
 * onto a solid backdrop that matches each preset's mood.
 */

export type PhotoEnvironmentFill = {
  id: string;
  labelAr: string;
  /** Canvas / CSS solid fill behind transparent pixels. */
  color: string;
};

/** Fallback when GET /tamima/photo-environments is unavailable. */
export const PHOTO_ENVIRONMENT_FILLS: readonly PhotoEnvironmentFill[] = [
  {
    id: "studio_white",
    labelAr: "استوديو أبيض",
    color: "#ffffff",
  },
  {
    id: "studio_grey",
    labelAr: "استوديو رمادي",
    color: "#e5e7eb",
  },
  {
    id: "marble_luxury",
    labelAr: "رخام فاخر",
    color: "#f3f0ea",
  },
  {
    id: "wood_warm",
    labelAr: "خشب دافئ",
    color: "#c4a574",
  },
  {
    id: "desk_library",
    labelAr: "مكتب / مكتبة",
    color: "#d4c4a8",
  },
  {
    id: "shelf_retail",
    labelAr: "رف متجر",
    color: "#ebe6df",
  },
  {
    id: "kitchen_counter",
    labelAr: "سطح مطبخ",
    color: "#e8ecef",
  },
  {
    id: "fabric_soft",
    labelAr: "قماش ناعم",
    color: "#e8dfe8",
  },
  {
    id: "flat_lay",
    labelAr: "من الأعلى (Flat lay)",
    color: "#f5f5f4",
  },
  {
    id: "outdoor_natural",
    labelAr: "إضاءة طبيعية",
    color: "#e8f0e4",
  },
  {
    id: "packaging",
    labelAr: "مع التغليف",
    color: "#fafafa",
  },
  {
    id: "minimal_color",
    labelAr: "خلفية لون بسيط",
    color: "#dbeafe",
  },
] as const;

const COLOR_BY_ID = Object.fromEntries(
  PHOTO_ENVIRONMENT_FILLS.map((e) => [e.id, e.color]),
) as Record<string, string>;

export function fillColorForEnvironmentId(id: string | null | undefined): string | null {
  if (!id) return null;
  return COLOR_BY_ID[id] ?? null;
}

export function mergeEnvironmentFills(
  fromApi: Array<{ id: string; labelAr: string; descriptionAr?: string }> | undefined,
): PhotoEnvironmentFill[] {
  if (!fromApi?.length) return [...PHOTO_ENVIRONMENT_FILLS];
  return fromApi.map((env) => ({
    id: env.id,
    labelAr: env.labelAr,
    color: COLOR_BY_ID[env.id] ?? "#f5f5f5",
  }));
}
