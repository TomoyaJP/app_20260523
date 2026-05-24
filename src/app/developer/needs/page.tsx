import { NeedsToolbar } from "@/app/developer/needs/NeedsToolbar";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { requireDeveloperSession } from "@/lib/developer-session";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

export default async function DeveloperNeedsPage(props: Props) {
  await requireDeveloperSession();
  const sp = (await props.searchParams) ?? {};
  const keyword = sp.keyword?.trim() ?? "";
  const tag = sp.tag?.trim() ?? "";
  const sort = sp.sort ?? "newest";

  const clauses: Prisma.UnmetNeedWhereInput[] = [];
  if (keyword) {
    clauses.push({
      OR: [
        { representative_query: { contains: keyword, mode: "insensitive" } },
        { summary: { contains: keyword, mode: "insensitive" } },
      ],
    });
  }
  if (tag) clauses.push({ category_tags: { has: tag } });

  const whereClause = clauses.length ? { AND: clauses } : undefined;

  const orderBy: Prisma.UnmetNeedOrderByWithRelationInput =
    sort === "interested_count"
      ? { interested_count: "desc" }
      : sort === "last_seen"
        ? { last_seen_at: "desc" }
        : { created_at: "desc" };

  const needs = await prisma.unmetNeed.findMany({
    where: whereClause,
    orderBy,
    take: 48,
  });

  const allTags = new Set<string>();
  needs.forEach((n) => n.category_tags.forEach((t) => allTags.add(t)));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Developer insight</p>
          <h1 className="text-3xl font-bold">未解決ニーズ</h1>
          <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
            検索クエリ類似によるクラスタ表示。需要人数などを把握し、アイデアの種にしてください。
          </p>
        </div>
        <NeedsToolbar />
      </header>

      <form className="mb-8 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          キーワード
          <input
            name="keyword"
            defaultValue={keyword}
            placeholder="短文で検索"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>
        <label className="text-sm">
          カテゴリタグ
          <input
            name="tag"
            defaultValue={tag}
            list="need-tags"
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
          <datalist id="need-tags">
            {[...allTags].map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <label className="text-sm">
          並び替え
          <select
            name="sort"
            defaultValue={sort}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          >
            <option value="interested_count">需要人数</option>
            <option value="newest">新着</option>
            <option value="last_seen">更新</option>
          </select>
        </label>
        <button
          type="submit"
          className="md:col-span-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          フィルター適用
        </button>
      </form>

      <section className="space-y-4">
        {needs.length === 0 ? (
          <p className="text-sm text-zinc-500">まだクラスタがありません。</p>
        ) : (
          needs.map((need) => (
            <article
              key={need.id.toString()}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-3">
                  <p className="text-xs uppercase text-zinc-500">代表的な課題</p>
                  <h2 className="text-xl font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {need.representative_query}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300">{need.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    {need.category_tags.map((category) => (
                      <span
                        key={`${need.id}-${category}`}
                        className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <Link
                  href={`/developer/needs/${need.id}`}
                  className="text-sm font-semibold text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-300"
                >
                  詳細 →
                </Link>
              </header>
              <footer className="mt-6 grid gap-4 text-xs text-zinc-500 md:grid-cols-3">
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300">検索関心</p>
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {need.interested_count} ヒット
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300">初回検索</p>
                  <p>{formatDateTime(need.first_seen_at)}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-300">最終検索</p>
                  <p>{formatDateTime(need.last_seen_at)}</p>
                </div>
              </footer>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}
