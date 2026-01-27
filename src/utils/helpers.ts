import { phone } from "phone";

/**
 * Validates a domain name based on the following rules:
 * 1. Must start with a letter (not a number)
 * 2. Can only contain letters (a-z, A-Z), numbers (0-9), and hyphens (-)
 * 3. No spaces allowed
 * 4. No periods (.) allowed
 * 5. No underscores (_) allowed
 * 6. No special symbols allowed
 *
 * Valid examples: mystore, my-store, store123
 * Invalid examples: 123store, my_store, store.com
 *
 * @param domain - The domain string to validate
 * @returns true if the domain is valid, false otherwise
 */
export const isValidDomain = (domain: string): boolean => {
  // Check if domain is empty or null
  if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
    return false;
  }

  // Trim the domain
  const trimmedDomain = domain.trim();

  // Check if domain starts with a letter (a-z or A-Z)
  if (!/^[a-zA-Z]/.test(trimmedDomain)) {
    return false;
  }

  // Check if domain contains only letters, numbers, and hyphens
  // Pattern: starts with letter, followed by letters, numbers, or hyphens
  const validDomainPattern = /^[a-zA-Z][a-zA-Z0-9-]*$/;

  if (!validDomainPattern.test(trimmedDomain)) {
    return false;
  }

  // Additional checks for specific invalid characters
  // Check for spaces
  if (/\s/.test(trimmedDomain)) {
    return false;
  }

  // Check for periods
  if (trimmedDomain.includes(".")) {
    return false;
  }

  // Check for underscores
  if (trimmedDomain.includes("_")) {
    return false;
  }

  // Check for special symbols (excluding hyphen which is already allowed)
  const specialSymbols = /[\/\?\!\\\|@#\$%\^\&\*\(\)\[\]\{\}]/;
  if (specialSymbols.test(trimmedDomain)) {
    return false;
  }

  // Check that domain doesn't end with a hyphen
  if (trimmedDomain.endsWith("-")) {
    return false;
  }

  // Check that domain doesn't have consecutive hyphens
  if (trimmedDomain.includes("--")) {
    return false;
  }

  return true;
};

export const sanitizePhoneNumber = (
  phone: string,
  countryCode: string
): string => {
  const countryCodeWithoutPlus = countryCode.replace("+", "");

  if (phone.startsWith("+")) {
    phone = phone.replace("+", "");
  }
  if (phone.startsWith("00")) {
    phone = phone.replace("00", "");
  }
  if (phone.startsWith("0")) {
    phone = phone.replace(/^0+/, "");
  }
  if (phone.startsWith(countryCode)) {
    phone = phone.replace(/^countryCode+/, "");
  }
  if (phone.startsWith(countryCodeWithoutPlus)) {
    phone = phone.replace(countryCodeWithoutPlus, "");
  }

  console.log("Phone before error: ", phone);
  console.log("Phone length before error: ", phone.length);

  if (!phone.startsWith("7") || phone.length !== 10) {
    console.log("Inside Error: ", phone, phone.length);
    throw new Error("Invalid phone number: must start with 7 and be 10 digits");
  }

  const validPrefixes = ["75", "77", "78"];

  if (!validPrefixes.some((p) => phone.startsWith(p))) {
    throw new Error("Invalid Iraqi mobile prefix");
  }

  return countryCode + phone;
};

export const validateInternationalPhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
  const validPhoneNumber = phone(phoneNumber, { country: countryCode });
  return validPhoneNumber.isValid;
}

export function formatDate(dateString: string) {
  if (!dateString || dateString === "") return { date: "", day: "" };

  try {
    const dateObj = new Date(dateString);

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return { date: "", day: "", time: "" };
    }

    const date = dateObj.toISOString().split("T")[0];
    const formatter = new Intl.DateTimeFormat("ar-IQ", { weekday: "long" });
    const day = formatter.format(dateObj);
    const time = dateObj.toLocaleTimeString();
    return { date, day, time };
  } catch (error) {
    console.warn("Invalid date format:", dateString, error);
    return { date: "", day: "", time: "" };
  }
}

// CSV Export utility function
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Headers row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that contain commas, quotes, or newlines
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"') || value.includes("\n"))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || "";
        })
        .join(",")
    ),
  ].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};