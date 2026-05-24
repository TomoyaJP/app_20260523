/** Cosine similarity in [0,1] roughly; triggers unmet_need when strongest match falls below this. */
export function getSimilarityUnmetFloor(): number {
  const raw = Number.parseFloat(process.env.SIMILARITY_THRESHOLD ?? "0.37");
  return Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0.37;
}

/** Minimum cosine similarity required to merge a new unresolved need into an existing cluster. */
export function getUnmetMergeSimilarityFloor(): number {
  const raw = Number.parseFloat(process.env.UNMET_MERGE_SIMILARITY ?? "0.88");
  return Number.isFinite(raw) ? Math.min(Math.max(raw, 0), 1) : 0.88;
}

export const embeddingModel =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

export const routingModel =
  process.env.OPENAI_ROUTING_MODEL ?? "gpt-4o-mini";
