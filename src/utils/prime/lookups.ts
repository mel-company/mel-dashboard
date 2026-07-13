export function asPrimeList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === "string" ? { code: item, name: item } : (item as Record<string, unknown>),
    );
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["data", "items", "states", "districts", "branches"]) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return asPrimeList(value);
      }
    }
  }
  return [];
}

export function getPrimeStateCode(item: Record<string, unknown>): string {
  const code =
    item.code ??
    item.stateCode ??
    item.state_code ??
    item.state ??
    item.id;
  return code != null ? String(code) : "";
}

export function getPrimeStateLabel(item: Record<string, unknown>): string {
  const name =
    item.name ??
    item.stateName ??
    item.state_name ??
    item.nameAr ??
    item.name_ar ??
    item.arabicName;
  const code = getPrimeStateCode(item);
  if (name != null && String(name).trim()) return String(name);
  return code || "—";
}

export function getPrimeDistrictId(
  item: Record<string, unknown>,
): number | null {
  const raw =
    item.id ??
    item.districtId ??
    item.district_id ??
    item.district ??
    item.code;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

export function getPrimeDistrictLabel(item: Record<string, unknown>): string {
  const name =
    item.name ??
    item.districtName ??
    item.district_name ??
    item.nameAr ??
    item.name_ar;
  const id = getPrimeDistrictId(item);
  if (name != null && String(name).trim()) return String(name);
  return id != null ? String(id) : "—";
}

export function pickDefaultPrimeState(
  states: Record<string, unknown>[],
  preferred?: string,
): string {
  const codes = states.map(getPrimeStateCode).filter(Boolean);
  if (codes.length === 0) return "";
  if (preferred && codes.includes(preferred)) return preferred;
  return codes[0];
}

export function pickDefaultPrimeDistrict(
  districts: Record<string, unknown>[],
  preferred?: number,
): string {
  if (preferred != null) {
    const preferredStr = String(preferred);
    if (
      districts.some((d) => String(getPrimeDistrictId(d)) === preferredStr)
    ) {
      return preferredStr;
    }
  }
  const firstId = getPrimeDistrictId(districts[0] ?? {});
  return firstId != null ? String(firstId) : "";
}
