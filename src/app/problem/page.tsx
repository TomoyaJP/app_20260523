import { ProblemSearchForm } from "@/components/home/ProblemSearchForm";

export default function ProblemSearchPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">AI相談検索</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          困りごとを入力すると、類似した登録アプリを提案します（送信時のみ API が呼び出されます）。
        </p>
      </header>
      <ProblemSearchForm />
    </div>
  );
}
