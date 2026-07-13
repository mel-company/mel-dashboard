type StoreImageSource = {
  logo?: string | null;
  baseUrl?: string | null;
};

export function resolveTempImageUrl(
  store?: StoreImageSource | null,
): string | undefined {
  const logo = store?.logo;
  if (!logo?.trim()) return undefined;

  const trimmed = logo.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = store?.baseUrl?.trim().replace(/\/+$/, "");
  if (!base) return undefined;
  return `${base}/${trimmed.replace(/^\/+/, "")}`;
}
