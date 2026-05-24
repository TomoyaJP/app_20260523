import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AppDetailPage(props: Props) {
  const { id } = await props.params;
  const app = await prisma.app.findUnique({ where: { id } });
  if (!app) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4 text-sm text-emerald-800 dark:text-emerald-300">
        <Link href="/apps" className="hover:underline">
          アプリ一覧に戻る
        </Link>
        <span className="text-zinc-300">/</span>
        <span>{app.platform}</span>
      </div>
      <article className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              更新日時:{" "}
              <time dateTime={app.updated_at.toISOString()}>
                {new Intl.DateTimeFormat("ja-JP", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(app.updated_at)}
              </time>
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
            {app.platform}
          </span>
        </div>
        <dl className="mt-8 space-y-4 text-sm">
          <DetailItem label="説明">{app.description}</DetailItem>
          <DetailItem label="URL">{app.url}</DetailItem>
          <DetailItem label="想定ユーザー">{app.target_user}</DetailItem>
          <DetailItem label="利用シーン">{app.use_case}</DetailItem>
          <DetailItem label="解決する課題">{app.solved_problem}</DetailItem>
          <DetailItem label="向いている人">{app.suitable_for}</DetailItem>
          <DetailItem label="向いていない人">{app.not_suitable_for}</DetailItem>
          <DetailItem label="開発者">{app.developer_contact}</DetailItem>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          >
            使ってみる
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
          {app.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </article>
    </div>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs uppercase tracking-[0.2em] text-zinc-400">{label}</dt>
      <dd className="mt-2 text-base text-zinc-800 dark:text-zinc-100">{children}</dd>
    </div>
  );
}
