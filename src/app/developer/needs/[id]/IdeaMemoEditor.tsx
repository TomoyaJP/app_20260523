"use client";

import { useState } from "react";

export function IdeaMemoEditor({ needId, initial }: { needId: string; initial: string | null }) {
  const [value, setValue] = useState(initial ?? "");
  const [status, setStatus] = useState<string | null>(null);

  async function save() {
    const res = await fetch(`/api/developer/needs/${needId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ developer_idea_notes: value }),
    });
    if (!res.ok) {
      setStatus("保存に失敗しました");
      return;
    }
    setStatus("保存しました");
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">開発アイデアメモ</label>
      <textarea
        value={value}
        rows={8}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      />
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          onClick={save}
        >
          メモを保存
        </button>
        {status ? <span className="text-xs text-zinc-600">{status}</span> : null}
      </div>
    </div>
  );
}
