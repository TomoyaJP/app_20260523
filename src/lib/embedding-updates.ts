import { prisma } from "@/lib/db";
import { vectorLiteral } from "@/lib/embedding";

export async function updateAppEmbedding(
  appId: string,
  vector: number[],
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE apps SET embedding = $1::vector WHERE id = $2::uuid`,
    vectorLiteral(vector),
    appId,
  );
}

export async function updateUnmetNeedEmbedding(
  needId: string,
  vector: number[],
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `UPDATE unmet_needs SET embedding = $1::vector WHERE id = $2::uuid`,
    vectorLiteral(vector),
    needId,
  );
}
