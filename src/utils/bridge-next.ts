/**
 * Where `/bridge` sends the merchant once the session exists.
 *
 * The landing page signs the merchant in here right after an AI generation
 * and asks for `/editor`, so they arrive on the editor inside the dashboard
 * rather than on the overview. Only a same-origin path is honoured: `next`
 * comes from a URL anyone can craft, and following `//evil.example` or an
 * absolute URL would turn the sign-in link into an open redirect.
 *
 * Some landings put `generation` on `/bridge` itself and leave `next=/editor`
 * bare. Without folding that param into `next`, the editor opens without
 * `?generation=` and the new template never overwrites the draft — which
 * reads as "the template only didn't arrive for me".
 */
export function resolveBridgeNext(
  next: string | null | undefined,
  generation?: string | null,
): string {
  if (!next) return withEditorGeneration("/", generation);
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/";
  }
  return withEditorGeneration(next, generation);
}

/** Attach `generation` to an `/editor` path when the query does not already have it. */
export function withEditorGeneration(
  path: string,
  generation?: string | null,
): string {
  const id = typeof generation === "string" ? generation.trim() : "";
  if (!id) return path;

  const qIndex = path.indexOf("?");
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  if (pathname !== "/editor") return path;

  const params = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : "");
  if (params.has("generation")) return path;
  params.set("generation", id);
  return `${pathname}?${params.toString()}`;
}
