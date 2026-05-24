/** Deterministic normalization for grouping & logging (never contains raw query in logs). */

export function normalizeQueryText(raw: string): string {
  return raw.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, 4000).toLowerCase();
}
