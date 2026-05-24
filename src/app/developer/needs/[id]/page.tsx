import { IdeaMemoEditor } from "@/app/developer/needs/[id]/IdeaMemoEditor";
import { prisma } from "@/lib/db";
import { requireDeveloperSession } from "@/lib/developer-session";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function NeedDetailPage(props: Props) {
  await requireDeveloperSession();
  const { id } = await props.params;
  const need = await prisma.unmetNeed.findUnique({ where: { id } });
  if (!need) notFound();

  const queries = await prisma.unmetNeedQuery.findMany({
    where: { unmet_need_id: id },
    orderBy: { created_at: "desc" },
  });

  const relatedApps =
    need.related_app_ids.length > 0
      ? await prisma.app.findMany({
          where: { id: { in: need.related_app_ids.slice(0, 24) } },
        })
      : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/developer/needs"
        className="text-sm font-semibold text-emerald-800 dark:text-emerald-300"
      >
        ← 一覧へ戻る
      </Link>

      <header className="mt-6 space-y-3 border-b pb-8">
        <p className="text-xs uppercase text-zinc-500">課題の代表クエリ</p>
        <h1 className="text-3xl font-bold">{need.representative_query}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{need.summary}</p>
        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>需要ヒット数: {need.interested_count}</span>
          <span>初回: {formatJa(need.first_seen_at)}</span>
          <span>最新: {formatJa(need.last_seen_at)}</span>
        </div>
      </header>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">類似検索文一覧</h2>
        <ul className="space-y-3 text-sm">
          {queries.map((row) => (
            <li
              key={row.id.toString()}
              className="rounded-xl border border-dashed border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-black"
            >
              <p>{row.query_text}</p>
              <p className="text-xs text-zinc-400">{formatJa(row.created_at)}</p>
            </li>
          ))}
          {queries.length === 0 ? <li>クエリログがありません。</li> : null}
        </ul>
      </section>

      <section className="mt-10 grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black md:grid-cols-2">
        <Insight title="AI要約">{need.summary}</Insight>
        <Insight title="推定ターゲットユーザー">{need.ai_target_user_estimate}</Insight>
        <Insight title="必要そうな機能">{need.ai_suggested_features}</Insight>
        <Insight title="既存アプリで不足しそうな点">{need.ai_gap_notes}</Insight>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">近しい登録アプリ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedApps.map((app) => (
            <Link
              key={app.id.toString()}
              href={`/apps/${app.id}`}
              className="rounded-xl border bg-white p-4 text-sm hover:border-emerald-500 dark:border-zinc-800 dark:bg-black"
            >
              <p className="text-lg font-semibold">{app.name}</p>
              <p className="text-xs uppercase text-emerald-800 dark:text-emerald-300">{app.platform}</p>
              <p className="mt-2 text-zinc-600 dark:text-zinc-300">{app.description.slice(0, 200)}...</p>
            </Link>
          ))}
          {relatedApps.length === 0 ? (
            <p className="text-sm text-zinc-500">関連アプリヒントがありません。</p>
          ) : null}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <IdeaMemoEditor needId={need.id.toString()} initial={need.developer_idea_notes ?? ""} />
      </section>
    </div>
  );
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <h3 className="text-xs uppercase text-zinc-500">{title}</h3>
      <p className="mt-2 text-sm">{children}</p>
    </div>
  );
}

function formatJa(dt: Date) {
  return new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(dt);
}
