import { generateCategoryTagsJa } from "@/lib/ai/category-tags";
import { refineRecommendationsJa } from "@/lib/ai/app-recommendation";
import { summarizeUnmetNeedJa } from "@/lib/ai/unmet-enrichment";
import {
  distanceToSimilarityScore,
  findSimilarAppsRaw,
  findSimilarUnmetNeeds,
} from "@/lib/vector-search";
import { getSimilarityUnmetFloor, getUnmetMergeSimilarityFloor } from "@/lib/config";
import { createEmbedding } from "@/lib/embedding";
import { normalizeQueryText } from "@/lib/normalize-query";
import { prisma } from "@/lib/db";
import { logSearchOutcome } from "@/lib/safe-log";
import { updateUnmetNeedEmbedding } from "@/lib/embedding-updates";
import { shouldPersistUnresolvedNeedSignals } from "@/lib/search-decision";

export type RecommendedAppPayload = {
  id: string;
  name: string;
  description: string;
  url: string;
  platform: string;
  reason: string;
  mismatchNote: string;
  similarityScore: number;
};

export async function executeProblemSearch(rawQuery: string, secretMode: boolean) {
  const query = rawQuery.trim();
  if (!query) {
    throw new Error("クエリが空です");
  }

  const normalized = normalizeQueryText(query);
  const queryEmbedding = await createEmbedding(normalized || query.slice(0, 4000));

  const similarRows = await findSimilarAppsRaw(queryEmbedding, 12);
  const idOrder = similarRows.map((row) => row.id);
  const distanceMap = new Map(similarRows.map((r) => [r.id, r.distance]));

  const apps =
    idOrder.length === 0
      ? []
      : await prisma.app.findMany({
          where: { id: { in: idOrder } },
        });

  apps.sort(
    (a, b) => idOrder.indexOf(a.id.toString()) - idOrder.indexOf(b.id.toString()),
  );

  const candidateCards = apps.map((app) => ({
    id: app.id.toString(),
    name: app.name,
    platform: app.platform,
    description: shorten(app.description, 360),
    solved_problem: shorten(app.solved_problem, 260),
    suitable_for: shorten(app.suitable_for, 260),
    not_suitable_for: shorten(app.not_suitable_for, 220),
    tags: app.tags.slice(0, 8),
    similarity_preview: computePreviewScore(app.id.toString()),
  }));

  function computePreviewScore(id: string): number | null {
    const d = distanceMap.get(id);
    if (typeof d !== "number" || Number.isNaN(d)) return null;
    return roundSim(distanceToSimilarityScore(d));
  }

  const llmSelection = await refineRecommendationsJa({
    userProblem: query,
    candidatesJson: candidateCards,
  });

  const similarityFloor = getSimilarityUnmetFloor();

  let recommended: RecommendedAppPayload[] = [];
  for (const pick of llmSelection.picks) {
    const app = apps.find((a) => a.id.toString() === pick.appId);
    if (!app) continue;
    const distance = distanceMap.get(app.id.toString()) ?? null;
    const similarityScore =
      distance === null ? 0 : roundSim(distanceToSimilarityScore(distance));
    recommended.push({
      id: app.id.toString(),
      name: app.name,
      description: shorten(app.description, 220) ?? "",
      url: app.url,
      platform: app.platform,
      reason: pick.reason,
      mismatchNote: pick.mismatchNote.trim() ? pick.mismatchNote : "情報が限られるため適合しない可能性もあります。",
      similarityScore,
    });
  }

  if (recommended.length > 4) recommended = recommended.slice(0, 4);

  const topVectorSimilarity =
    similarRows.length > 0
      ? distanceToSimilarityScore(similarRows[0]?.distance ?? 1)
      : 0;

  const vectorNeighborIds = similarRows.slice(0, 8).map((row) => row.id);

  const shouldFlagUnmet = shouldPersistUnresolvedNeedSignals({
    vectorMatches: similarRows.length > 0,
    topVectorSimilarity,
    similarityFloor,
    recommendationCount: recommended.length,
    llmInsufficient: llmSelection.insufficientMatch,
    llmPickCount: llmSelection.picks.length,
  });

  let saved = false;
  let mergedUnresolvedNeed = false;

  if (!secretMode) {
    const categoryTags =
      normalized.length >= 8
        ? await generateCategoryTagsJa(normalized.slice(0, 1000))
        : await generateCategoryTagsJa(query.slice(0, 1200));

    await prisma.searchLog.create({
      data: {
        query_text: query,
        normalized_query: normalized || null,
        category_tags: categoryTags,
        matched_app_ids: recommended.map((item) => item.id),
        top_similarity_score:
          recommended[0]?.similarityScore ??
          topVectorSimilarity ??
          null,
        is_secret: false,
      },
    });
    saved = true;

    if (shouldFlagUnmet) {
      const hybridRelatedIds = uniqStrings([
        ...recommended.map((r) => r.id),
        ...vectorNeighborIds,
      ]);
      const mergeResult = await mergeOrCreateUnmetNeed({
        queryText: query,
        queryEmbedding,
        normalized,
        mergeRelatedIds: hybridRelatedIds,
      });
      mergedUnresolvedNeed = mergeResult.mergedExisting;
    }
  }

  logSearchOutcome({
    secretMode,
    saved,
    recommendedCount: recommended.length,
    mergedUnmetNeed: mergedUnresolvedNeed,
  });

  const message = secretMode
    ? "シークレットモードのため検索内容は保存されませんでした。"
    : "検索内容を保存しました。";

  return {
    recommendedApps: recommended,
    saved,
    secretMode,
    message,
  };
}

function shorten(text: string | null | undefined, max: number): string | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function roundSim(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 1000) / 1000;
}

async function mergeOrCreateUnmetNeed(input: {
  queryText: string;
  normalized: string;
  queryEmbedding: number[];
  mergeRelatedIds: string[];
}) {
  const neighbors = await findSimilarUnmetNeeds(input.queryEmbedding, 5);
  const mergeFloor = getUnmetMergeSimilarityFloor();
  const nearest = neighbors[0];
  if (
    nearest &&
    distanceToSimilarityScore(nearest.distance) >= mergeFloor
  ) {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.unmetNeed.findUnique({
        where: { id: nearest.id },
      });
      if (!existing) return;
      const mergedIds = uniqStrings([
        ...existing.related_app_ids,
        ...input.mergeRelatedIds,
      ]);

      await tx.unmetNeed.update({
        where: { id: existing.id },
        data: {
          interested_count: { increment: 1 },
          last_seen_at: new Date(),
          related_app_ids: mergedIds,
          representative_query: pickShorterRepresentative(
            existing.representative_query,
            input.normalized || input.queryText,
          ),
        },
      });
      await tx.unmetNeedQuery.create({
        data: {
          unmet_need_id: existing.id.toString(),
          query_text: input.queryText,
        },
      });
    });
    return { mergedExisting: true };
  }

  const relatedApps = await prisma.app.findMany({
    ...(input.mergeRelatedIds.length > 0
      ? {
          where: { id: { in: input.mergeRelatedIds } },
        }
      : {}),
    take: 12,
    orderBy: { updated_at: "desc" },
  });

  const enrichment = await summarizeUnmetNeedJa({
    userQueries: [input.queryText],
    relatedApps: relatedApps.map((a) => ({
      id: a.id.toString(),
      name: a.name,
      solved_problem: a.solved_problem,
      suitable_for: a.suitable_for,
    })),
  });

  const created = await prisma.unmetNeed.create({
    data: {
      representative_query:
        enrichment.representative_sentence || input.normalized.slice(0, 200) || input.queryText.slice(0, 200),
      summary: enrichment.summary,
      category_tags: enrichment.category_tags,
      interested_count: 1,
      related_app_ids: uniqStrings([
        ...input.mergeRelatedIds,
        ...relatedApps.map((a) => a.id.toString()),
      ]),
      ai_target_user_estimate: enrichment.target_user_estimate || null,
      ai_suggested_features: enrichment.suggested_features || null,
      ai_gap_notes: enrichment.gap_notes || null,
    },
  });

  await prisma.unmetNeedQuery.create({
    data: {
      unmet_need_id: created.id.toString(),
      query_text: input.queryText,
    },
  });

  const embedSource =
    enrichment.representative_sentence || input.normalized || input.queryText;
  const needEmbedding = await createEmbedding(embedSource.slice(0, 4000));
  await updateUnmetNeedEmbedding(created.id.toString(), needEmbedding);
  return { mergedExisting: false };
}

function uniqStrings(ids: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  ids.forEach((id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  });
  return out.slice(0, 32);
}

function pickShorterRepresentative(current: string, candidate: string) {
  const cur = current.trim().slice(0, 400);
  const next = candidate.trim().slice(0, 400);
  if (!cur.length) return next;
  if (!next.length) return cur;
  return cur.length <= next.length ? cur : next;
}
