"use client";

import type { RecommendedAppView } from "./RecommendedAppList";
import { RecommendedAppList } from "./RecommendedAppList";
import { SecretModeToggle } from "./SecretModeToggle";
import { useState } from "react";

export function ProblemSearchForm() {
  const [query, setQuery] = useState("");
  const [secretMode, setSecretMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<RecommendedAppView[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, secretMode }),
      });
      const data = (await res.json()) as {
        recommendedApps?: RecommendedAppView[];
        message?: string;
      };
      if (!res.ok) {
        setApps([]);
        setMessage(null);
        setError(data.message ?? "検索に失敗しました");
        return;
      }
      setApps(
        (data.recommendedApps ?? []).map((item) => ({
          ...item,
          mismatchNote: item.mismatchNote ?? "",
        })),
      );
      setMessage(data.message ?? null);
    } catch {
      setError("通信に失敗しました");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
        困りごとを自由に入力
        <textarea
          value={query}
          required
          minLength={4}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: サークルの出欠確認と会費管理をまとめて行いたい"
          className="mt-2 w-full min-h-[120px] rounded-lg border border-zinc-300 bg-white p-3 text-base text-zinc-900 outline-none ring-emerald-500/40 transition focus:border-emerald-600 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </label>
      <SecretModeToggle
        enabled={secretMode}
        onToggle={() => setSecretMode((v) => !v)}
      />
      <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-2 text-xs text-rose-950 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-50">
        個人情報や機密情報は入力しないでください。
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-400"
      >
        {loading ? "検索しています..." : "課題に合うアプリを検索"}
      </button>

      {message ? <div className="text-xs text-zinc-500">{message}</div> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="pt-6">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          AIの提案
        </h2>
        <RecommendedAppList apps={apps} statusMessage={message} />
      </div>
    </form>
  );
}
