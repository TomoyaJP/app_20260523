import Link from "next/link";

/** Static home so `/` never depends on DB or client fetch during initial render. */
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-12">
      <header className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          FindFromProblem
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          課題からニッチなアプリを見つける
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          このページは静的表示です。一覧検索・AI相談・登録は下のリンクからどうぞ。
        </p>
      </header>

      <section
        aria-labelledby="app-search-heading"
        className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h2 id="app-search-heading" className="text-lg font-semibold">
          アプリ検索（一覧）
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          キーワードで登録アプリを絞り込みます。
        </p>
        <form action="/apps" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="keyword"
            placeholder="例: 出欠 会費"
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
            autoComplete="off"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            検索
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/apps"
          className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold hover:border-emerald-600 dark:border-zinc-700"
        >
          アプリ一覧へ
        </Link>
        <Link
          href="/developer/apps/new"
          className="inline-flex items-center justify-center rounded-xl border border-transparent bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          アプリ登録へ
        </Link>
      </section>

      <section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
        <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
          AI相談検索（困りごとから探す）
        </h2>
        <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
          自然文で課題を入力すると、登録済みアプリへの候補と推薦理由を返します。
        </p>
        <Link
          href="/problem"
          className="mt-4 inline-flex w-fit items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          AI相談検索を開く
        </Link>
        <p className="mt-3 text-xs text-emerald-800/70 dark:text-emerald-200/70">
          または API{" "}
          <code className="rounded bg-white/60 px-1 dark:bg-black/40">POST /api/search</code>{" "}
          を直接叩くこともできます。
        </p>
      </section>
    </div>
  );
}
