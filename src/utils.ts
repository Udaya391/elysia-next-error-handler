/**
 * Checks if an error is a Next.js internal error (like redirect or notFound).
 * These errors should be re-thrown so Next.js can handle them.
 */
export function isNextJsInternalError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }

  const digest = (error as { digest?: string }).digest;

  // Checks for NEXT_REDIRECT, NEXT_NOT_FOUND, etc.
  return typeof digest === "string" && digest.startsWith("NEXT_");
}
