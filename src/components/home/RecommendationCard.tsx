type CardProps = {
  name: string;
  description: string;
  platform: string;
  reason: string;
  mismatchNote: string;
  url: string;
};

export function RecommendationCard({
  name,
  description,
  platform,
  reason,
  mismatchNote,
  url,
}: CardProps) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{name}</h3>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
          {platform}
        </span>
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-semibold text-emerald-800 dark:text-emerald-300">推薦理由</span>
          <span className="block text-zinc-700 dark:text-zinc-200">{reason}</span>
        </p>
        <p>
          <span className="font-semibold text-amber-800 dark:text-amber-200">合わない可能性</span>
          <span className="block text-zinc-600 dark:text-zinc-300">{mismatchNote}</span>
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        使ってみる
      </a>
    </article>
  );
}
