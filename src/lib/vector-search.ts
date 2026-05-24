import { prisma } from "@/lib/db";
import { vectorLiteral } from "@/lib/embedding";

export type SimilarAppRow = {
  id: string;
  distance: number;
};

export async function findSimilarAppsRaw(
  vector: number[],
  limit: number,
): Promise<SimilarAppRow[]> {
  const lit = vectorLiteral(vector);
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; distance: number | string }>
  >(
    `
    SELECT id::text AS id,
           (embedding <=> $1::vector) AS distance
    FROM apps
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2
    `,
    lit,
    limit,
  );

  return rows.map((row) => ({
    id: row.id,
    distance: Number(row.distance),
  }));
}

/** Cosine similarity in [–1,1] when pgvector cosine distance semantics apply; normalized OpenAI embeddings sit near ~[0,1]. */
export function distanceToSimilarityScore(distance: number): number {
  return 1 - distance;
}

export async function findSimilarUnmetNeeds(
  vector: number[],
  limit: number,
): Promise<SimilarAppRow[]> {
  const lit = vectorLiteral(vector);
  const rows = await prisma.$queryRawUnsafe<
    Array<{ id: string; distance: number | string }>
  >(
    `
    SELECT id::text AS id,
           (embedding <=> $1::vector) AS distance
    FROM unmet_needs
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2
    `,
    lit,
    limit,
  );
  return rows.map((row) => ({
    id: row.id,
    distance: Number(row.distance),
  }));
}
