import { Suspense } from "react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg">
        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}
        >
          <MagicLinkForm />
        </Suspense>
      </div>
    </div>
  );
}
