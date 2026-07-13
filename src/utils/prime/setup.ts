export function extractMerchantLoginId(
  response: unknown,
  fallback?: string,
): string | undefined {
  if (!response || typeof response !== "object") return fallback;
  const record = response as Record<string, unknown>;
  return (
    (record.loginId as string | undefined) ||
    (record.merchantLoginId as string | undefined) ||
    fallback
  );
}

export function extractSenderId(response: unknown): number | undefined {
  if (!response || typeof response !== "object") return undefined;
  const record = response as Record<string, unknown>;
  const fromField =
    (record.senderId as number | undefined) ||
    (record.sender_id as number | undefined);
  if (fromField != null) return Number(fromField);

  const id = record.id;
  if (typeof id === "number" && id > 0) return id;
  return undefined;
}

export function extractSenderIdFromShops(shopsRaw: unknown): number | undefined {
  if (!Array.isArray(shopsRaw)) {
    if (shopsRaw && typeof shopsRaw === "object") {
      const obj = shopsRaw as Record<string, unknown>;
      for (const key of ["data", "items", "shops"]) {
        const nested = obj[key];
        if (Array.isArray(nested) && nested.length > 0) {
          return extractSenderId(nested[0]);
        }
      }
    }
    return undefined;
  }
  if (shopsRaw.length === 0) return undefined;
  return extractSenderId(shopsRaw[0]);
}
