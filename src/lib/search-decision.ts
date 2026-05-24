/** Pure helpers for deterministic tests around unresolved-need OR logic. */

export function shouldPersistUnresolvedNeedSignals(input: {
  vectorMatches: boolean;
  topVectorSimilarity: number;
  similarityFloor: number;
  recommendationCount: number;
  llmInsufficient: boolean;
  llmPickCount: number;
}): boolean {
  const matchesFloor =
    input.vectorMatches &&
    Number.isFinite(input.topVectorSimilarity) &&
    input.topVectorSimilarity >= input.similarityFloor;

  return (
    !input.vectorMatches ||
    !matchesFloor ||
    input.recommendationCount <= 1 ||
    input.llmInsufficient ||
    input.llmPickCount === 0
  );
}
