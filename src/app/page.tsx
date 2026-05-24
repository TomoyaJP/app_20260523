import { ProblemSearchForm } from "@/components/home/ProblemSearchForm";

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Problem-led discovery
        </p>
        <h1 className="text-3xl font-bold leading-snug md:text-4xl">
          アプリ名を知らなくても、自分の「困りごと」から小さなアプリへ辿り着く。
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400">
          サークルの会計、イベント告知、開発メモなど、抽象的な説明だけで大丈夫です。
          AIが登録済みアプリと照合して、おすすめ理由と慎重な注意点を添えます。
        </p>
      </div>
      <ProblemSearchForm />
    </div>
  );
}
