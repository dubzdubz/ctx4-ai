import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sorry, something went wrong</CardTitle>
          <CardDescription>
            {params?.error ? (
              <>Error: {params.error}</>
            ) : (
              <>An unspecified error occurred.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkButton href="/auth/login" variant="outline" className="w-full">
            Back to login
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
