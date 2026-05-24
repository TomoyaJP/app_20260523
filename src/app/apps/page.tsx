import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import Link from "next/link";

type Props = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

export default async function AppsPage(props: Props) {
  const sp = (await props.searchParams) ?? {};
  const keyword = sp.keyword?.trim() ?? "";
  const tag = sp.tag?.trim() ?? "";
  const platform = sp.platform?.trim() ?? "";

  const clauses: Prisma.AppWhereInput[] = [];
  if (keyword) {
    clauses.push({
      OR: [
        { name: { contains: keyword, mode: "insensitive" as const } },
        { description: { contains: keyword, mode: "insensitive" as const } },
      ],
    });
  }
  if (tag) {
    clauses.push({ tags: { has: tag } });
  }
  if (platform) {
    clauses.push({
      platform: { equals: platform, mode: "insensitive" as const },
    });
  }

  const whereClause = clauses.length > 0 ? { AND: clauses } : undefined;

  const apps = await prisma.app.findMany({
    where: whereClause,
    orderBy: { updated_at: "desc" },
    take: 60,
  });

  const platforms = await prisma.app.findMany({
    select: { platform: true },
    distinct: ["platform"],
  });

  const platformChoices = [...new Set(platforms.map((p) => p.platform))].sort();

  const tagHints = [...new Set(apps.flatMap((a) => a.tags))].slice(0, 24);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold">アプリ一覧</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          開発者が登録したアプリのみ表示されます。
        </p>
      </header>

      <form className="mb-8 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-4">
        <label className="text-sm md:col-span-2">
          アプリ名 / 概要
          <input
            name="keyword"
            defaultValue={keyword}
            placeholder="検索語"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>
        <label className="text-sm">
          タグ
          <input
            name="tag"
            defaultValue={tag}
            list="tag-suggestions"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          />
          <datalist id="tag-suggestions">
            {tagHints.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </label>
        <label className="text-sm">
          プラットフォーム
          <select
            name="platform"
            defaultValue={platform}
            className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
          >
            <option value="">すべて</option>
            {platformChoices.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="md:col-span-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
        >
          絞り込む
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {apps.length === 0 ? (
          <p className="text-sm text-zinc-600">該当するアプリがありません。</p>
        ) : (
          apps.map((app) => (
            <Link
              key={app.id.toString()}
              href={`/apps/${app.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{app.name}</h2>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  {app.platform}
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                {app.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                {app.tags.slice(0, 6).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
