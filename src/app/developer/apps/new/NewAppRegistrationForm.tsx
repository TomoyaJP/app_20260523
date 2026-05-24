"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewAppRegistrationForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const tags =
      tagsInput
        .split(/[,、\n]/)
        .map((t) => t.trim())
        .filter(Boolean) ?? [];

    const body = {
      name: form.get("name"),
      url: form.get("url"),
      platform: form.get("platform"),
      description: form.get("description"),
      target_user: form.get("target_user") || undefined,
      use_case: form.get("use_case") || undefined,
      solved_problem: form.get("solved_problem") || undefined,
      suitable_for: form.get("suitable_for") || undefined,
      not_suitable_for: form.get("not_suitable_for") || undefined,
      developer_contact: form.get("developer_contact") || undefined,
      tags: tags.length ? tags : undefined,
    };

    const res = await fetch("/api/apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as { message?: string; id?: string };
    if (!res.ok) {
      setError(data.message ?? "登録に失敗しました");
      setBusy(false);
      return;
    }
    if (data.id) router.push(`/apps/${data.id}`);
    else router.push("/apps");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">アプリ登録</h1>
          <p className="text-xs text-zinc-500">
            開発者のみ登録できます。http/httpsのみ対応です。
          </p>
        </div>
        <Link href="/apps" className="text-sm text-emerald-800 dark:text-emerald-300">
          一覧を見る
        </Link>
      </div>
      <Field label="アプリ名 *" name="name" required minLength={1} disabled={busy} />
      <Field label="アプリURL *" name="url" type="url" required placeholder="https://example.com" disabled={busy} />
      <SelectPlatform disabled={busy} />
      <TextArea label="説明文 *" name="description" required minLength={10} disabled={busy} />
      <TextArea label="想定ユーザー" name="target_user" disabled={busy} />
      <TextArea label="利用シーン" name="use_case" disabled={busy} />
      <TextArea label="解決する課題" name="solved_problem" disabled={busy} />
      <TextArea label="向いている人" name="suitable_for" disabled={busy} />
      <TextArea label="向いていない人" name="not_suitable_for" disabled={busy} />
      <label className="block text-sm">
        タグ（カンマ区切り／未入力時はAI自動生成）
        <textarea
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="mt-1 min-h-[60px] w-full rounded-md border px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          placeholder="イベント, SaaS..."
          disabled={busy}
        />
      </label>
      <Field label="開発者連絡先" name="developer_contact" disabled={busy} />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="rounded-md bg-emerald-700 px-4 py-2 text-white disabled:opacity-60"
      >
        {busy ? "登録処理中..." : "登録する"}
      </button>
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  const { label, ...rest } = props;
  return (
    <label className="block text-sm font-medium">
      {label}
      <input {...rest} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-800 dark:bg-black" />
    </label>
  );
}

function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <label className="block text-sm font-medium">
      {label}
      <textarea
        {...rest}
        rows={rest.rows ?? 3}
        className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-800 dark:bg-black"
      />
    </label>
  );
}

function SelectPlatform({ disabled }: { disabled?: boolean }) {
  return (
    <label className="block text-sm font-medium">
      プラットフォーム *
      <select
        required
        name="platform"
        disabled={disabled}
        className="mt-1 w-full rounded-md border px-3 py-2 dark:border-zinc-800 dark:bg-black"
      >
        <option value="">選択してください</option>
        <option value="Web">Web</option>
        <option value="iOS">iOS</option>
        <option value="Android">Android</option>
        <option value="Desktop">Desktop</option>
        <option value="Other">Other</option>
      </select>
    </label>
  );
}
