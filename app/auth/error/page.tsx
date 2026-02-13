import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/link-button";
import { PageLayout } from "@/components/layout/page-layout";

export const metadata: Metadata = {
  title: "Error — ctx4.ai",
  description: "An error occurred during authentication.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <PageLayout
      title="Sorry, something went wrong"
      description={
        params?.error ? (
          <>Error: {params.error}</>
        ) : (
          <>An unspecified error occurred.</>
        )
      }
      maxWidth="sm"
    >
      <div className="space-y-4">
        <LinkButton href="/auth/login" variant="outline" className="w-full">
          Back to login
        </LinkButton>
      </div>
    </PageLayout>
  );
}
