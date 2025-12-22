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
  if (!domain || typeof domain !== 'string' || domain.trim().length === 0) {
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
  if (trimmedDomain.includes('.')) {
    return false;
  }

  // Check for underscores
  if (trimmedDomain.includes('_')) {
    return false;
  }

  // Check for special symbols (excluding hyphen which is already allowed)
  const specialSymbols = /[\/\?\!\\\|@#\$%\^\&\*\(\)\[\]\{\}]/;
  if (specialSymbols.test(trimmedDomain)) {
    return false;
  }

  // Check that domain doesn't end with a hyphen
  if (trimmedDomain.endsWith('-')) {
    return false;
  }

  // Check that domain doesn't have consecutive hyphens
  if (trimmedDomain.includes('--')) {
    return false;
  }

  return true;
};