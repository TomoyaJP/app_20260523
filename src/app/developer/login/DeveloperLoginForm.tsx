"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function DeveloperLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/developer/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json()) as { message?: string };
    if (!res.ok) {
      setError(data.message ?? "ログインに失敗しました");
      return;
    }
    const nextTarget = searchParams.get("next") ?? "/developer/needs";
    router.push(nextTarget);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-6 text-2xl font-semibold">開発者ログイン</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          開発者パスワード
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-md border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            required
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-emerald-700 py-2 text-white">
          ログイン
        </button>
        <p className="text-xs text-zinc-500">
          JWTクッキーにより7日間保持されます。{" "}
          <Link href="/" className="text-emerald-700 dark:text-emerald-300">
            トップへ戻る
          </Link>
        </p>
      </form>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
