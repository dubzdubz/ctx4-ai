import { Suspense } from "react";
import { SelectRepoForm } from "./select-repo-form";

export default function SelectRepoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Select your repository
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the repository where your context lives. This is where ctx4
            will read and write your context files.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          }
        >
          <SelectRepoForm />
        </Suspense>
      </div>
    </div>
  );
}
