import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
          FindFromProblem
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-300">
            課題から探す
          </Link>
          <Link href="/apps" className="hover:text-emerald-700 dark:hover:text-emerald-300">
            アプリ一覧
          </Link>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <Link href="/developer/apps/new" className="hover:text-emerald-700 dark:hover:text-emerald-300">
            アプリ登録
          </Link>
          <Link href="/developer/needs" className="hover:text-emerald-700 dark:hover:text-emerald-300">
            未解決ニーズ
          </Link>
          <Link href="/developer/login" className="hover:text-emerald-700 dark:hover:text-emerald-300">
            開発者ログイン
          </Link>
        </nav>
      </div>
    </header>
  );
}
