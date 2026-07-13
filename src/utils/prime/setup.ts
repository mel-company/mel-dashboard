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
