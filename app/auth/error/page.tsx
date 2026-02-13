import { LinkButton } from "@/components/ui/link-button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sorry, something went wrong
        </h1>
        <p className="text-sm text-muted-foreground">
          {params?.error ? (
            <>Error: {params.error}</>
          ) : (
            <>An unspecified error occurred.</>
          )}
        </p>
        <LinkButton href="/auth/login" variant="outline" className="w-full">
          Back to login
        </LinkButton>
      </div>
    </div>
  );
}
