/** Never logs user query text — used everywhere to honour secret-mode/no-PII policy. */

export function logSearchOutcome(meta: {
  secretMode?: boolean;
  saved?: boolean;
  recommendedCount?: number;
  mergedUnmetNeed?: boolean;
}) {
  if (process.env.NODE_ENV === "test") return;
  console.info("[search]", {
    secretMode: Boolean(meta.secretMode),
    saved: Boolean(meta.saved),
    recommendedCount: meta.recommendedCount ?? 0,
    mergedUnmetNeed: Boolean(meta.mergedUnmetNeed),
  });
}
