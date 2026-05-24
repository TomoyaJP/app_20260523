import OpenAI from "openai";
import { embeddingModel } from "@/lib/config";

let client: OpenAI | undefined;

function openai(): OpenAI {
  if (client) return client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  client = new OpenAI({ apiKey: key });
  return client;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const oa = openai();
  const clipped = text.trim().slice(0, 8000);
  if (!clipped) throw new Error("Empty embedding text");
  const res = await oa.embeddings.create({
    model: embeddingModel,
    input: clipped,
  });
  const vec = res.data[0]?.embedding;
  if (!vec?.length) throw new Error("Embedding creation failed");
  return vec;
}

/** Vector literal for Postgres `::vector`; values are constrained to embeddings from OpenAI. */
export function vectorLiteral(vector: number[]): string {
  if (!vector.length || vector.length !== 1536) {
    throw new Error("Invalid embedding dimension");
  }
  const parts = vector.map((n) =>
    typeof n === "number" && Number.isFinite(n) ? String(n) : "0",
  );
  return `[${parts.join(",")}]`;
}
