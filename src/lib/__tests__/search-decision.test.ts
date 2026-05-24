import { describe, expect, it } from "vitest";
import { shouldPersistUnresolvedNeedSignals } from "@/lib/search-decision";

describe("shouldPersistUnresolvedNeedSignals", () => {
  it("returns true whenever no embeddings matches exist", () => {
    expect(
      shouldPersistUnresolvedNeedSignals({
        vectorMatches: false,
        topVectorSimilarity: 0,
        similarityFloor: 0.4,
        recommendationCount: 3,
        llmInsufficient: false,
        llmPickCount: 3,
      }),
    ).toBe(true);
  });

  it("returns false when embeddings are strong AND multiple picks exist AND LLM not insufficient", () => {
    expect(
      shouldPersistUnresolvedNeedSignals({
        vectorMatches: true,
        topVectorSimilarity: 0.92,
        similarityFloor: 0.37,
        recommendationCount: 3,
        llmInsufficient: false,
        llmPickCount: 4,
      }),
    ).toBe(false);
  });

  it("returns true when embeddings strong but insufficient recommendations remain", () => {
    expect(
      shouldPersistUnresolvedNeedSignals({
        vectorMatches: true,
        topVectorSimilarity: 0.92,
        similarityFloor: 0.37,
        recommendationCount: 1,
        llmInsufficient: false,
        llmPickCount: 1,
      }),
    ).toBe(true);
  });
});
