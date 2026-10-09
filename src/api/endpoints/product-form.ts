function parseJsonField(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || !value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/**
 * The product forms build FormData; the API is sent a JSON body (or a
 * multipart rebuilt from it). Only the keys copied here reach the server, so a
 * field the form appends but this leaves out is silently dropped: that is how
 * stock and the parcel measurements were never saved.
 */
export function productFormDataToJson(
  formData: FormData,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  for (const key of ["title", "description"] as const) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) body[key] = value.trim();
  }

  // Empty means "not given" (on edit: leave as is), never zero.
  for (const key of [
    "price",
    "cost_to_produce",
    "rate",
    "stock",
    "weightGrams",
    "lengthCm",
    "widthCm",
    "heightCm",
  ] as const) {
    const value = formData.get(key);
    if (value == null || value === "") continue;
    const num = Number(value);
    if (Number.isFinite(num)) body[key] = num;
  }

  const enabled = formData.get("enabled");
  if (enabled != null && enabled !== "") {
    body.enabled = String(enabled) === "true";
  }

  for (const key of ["categoryIds", "properties", "options"] as const) {
    const parsed = parseJsonField(formData.get(key));
    if (parsed !== undefined) body[key] = parsed;
  }

  const tempImageUrl = formData.get("tempImageUrl");
  if (typeof tempImageUrl === "string" && tempImageUrl.trim()) {
    body.image = tempImageUrl.trim();
  }

  return body;
}
