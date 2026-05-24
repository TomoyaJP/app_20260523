import { RecommendationCard } from "./RecommendationCard";

export type RecommendedAppView = {
  id: string;
  name: string;
  description: string;
  url: string;
  platform: string;
  reason: string;
  mismatchNote: string;
};

type Props = {
  apps: RecommendedAppView[];
  statusMessage?: string | null;
};

export function RecommendedAppList({ apps, statusMessage }: Props) {
  if (!apps.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
        <p className="font-medium text-zinc-800 dark:text-zinc-100">
          適合できそうなアプリが十分に見つかりませんでした。
        </p>
        <p className="mt-2">
          入力内容から近いサービスや、開発者ヒントとなる未解決ニーズへの記録が行われた可能性があります。
        </p>
        {statusMessage ? <p className="mt-2 text-xs">{statusMessage}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {apps.map((item) => (
        <RecommendationCard
          key={item.id}
          name={item.name}
          description={item.description}
          platform={item.platform}
          reason={item.reason}
          mismatchNote={item.mismatchNote}
          url={item.url}
        />
      ))}
      {apps.length <= 2 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          結果が少ない場合は、関連するサービス自体がニッチだったり、embeddingライブラリの内容がまだ乏しい可能性があります。
        </p>
      ) : null}
    </div>
  );
}
