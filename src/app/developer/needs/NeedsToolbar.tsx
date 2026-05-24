"use client";

export function NeedsToolbar() {
  async function logout() {
    await fetch("/api/developer/auth/logout", { method: "POST" });
    window.location.href = "/developer/login";
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-md border border-zinc-300 px-4 py-1 text-xs dark:border-zinc-700"
      >
        ログアウト
      </button>
      <button
        type="button"
        onClick={() => {
          window.location.href = "/developer/apps/new";
        }}
        className="rounded-md bg-emerald-700 px-4 py-1 text-xs text-white"
      >
        新規アプリ登録
      </button>
    </div>
  );
}
