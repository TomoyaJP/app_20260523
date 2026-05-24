"use client";

type Props = {
  enabled: boolean;
  onToggle: () => void;
};

export function SecretModeToggle({ enabled, onToggle }: Props) {
  return (
    <div className="flex flex-wrap items-start gap-3 rounded-lg border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
      <label className="flex cursor-pointer items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
          className="h-4 w-4 rounded border-amber-400 text-emerald-600 focus:ring-emerald-500"
        />
        シークレットモード
      </label>
      <p className="min-w-[220px] flex-1 text-xs leading-relaxed">
        {enabled
          ? "シークレットモード中です。この検索内容は保存されません。"
          : "検索内容は未解決ニーズ分析のため保存されます。"}
      </p>
    </div>
  );
}
