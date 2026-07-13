import { filterIraqiMobileInput } from "@/utils/helpers";

/** Prime يتوقع 07xxxxxxxxx */
export function formatPhoneForPrime(phone?: string | null): string {
  const digits = filterIraqiMobileInput(phone ?? "");
  if (digits.length === 10) return `0${digits}`;
  return "07700000000";
}
