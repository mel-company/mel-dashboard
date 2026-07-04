const publicUrl = import.meta.env.VITE_PUBLIC_URL ?? "";

export const getImageUrl = (
  image?: string | null,
  baseUrl?: string | null,
): string => {
  if (!image?.trim()) return "";

  const trimmed = image.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = (baseUrl || publicUrl).trim().replace(/\/+$/, "");
  const path = trimmed.replace(/^\/+/, "");

  if (!base) return path;
  return `${base}/${path}`;
};
