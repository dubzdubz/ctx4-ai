import type { Metadata } from "next";
import { Suspense } from "react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "Sign in — ctx4.ai",
  description: "Sign in to ctx4.ai with your email.",
};

export default function LoginPage() {
  return (
    <PageLayout maxWidth="sm">
      <Suspense
        fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}
      >
        <MagicLinkForm />
      </Suspense>
    </PageLayout>
  );
}
