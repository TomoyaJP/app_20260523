import { Suspense } from "react";
import { DeveloperLoginForm } from "./DeveloperLoginForm";

export default function DeveloperLoginRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
          準備しています...
        </div>
      }
    >
      <DeveloperLoginForm />
    </Suspense>
  );
}
