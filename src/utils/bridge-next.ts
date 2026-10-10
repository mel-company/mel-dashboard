/**
 * Where `/bridge` sends the merchant once the session exists.
 *
 * The landing page signs the merchant in here right after an AI generation
 * and asks for `/editor`, so they arrive on the editor inside the dashboard
 * rather than on the overview. Only a same-origin path is honoured: `next`
 * comes from a URL anyone can craft, and following `//evil.example` or an
 * absolute URL would turn the sign-in link into an open redirect.
 */
export function resolveBridgeNext(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/";
  }
  return next;
}
