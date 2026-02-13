import { DocsNav } from "@/components/docs/docs-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl gap-8 px-6 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
      <aside className="hidden w-48 shrink-0 md:block">
        <div className="sticky top-24">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
            Docs
          </p>
          <DocsNav />
        </div>
      </aside>
      <div className="min-w-0 flex-1 [&>main]:px-0 [&>main]:pt-0 [&>main]:pb-0 [&>main]:md:px-0 [&>main]:md:pt-0 [&>main]:md:pb-0">
        {children}
      </div>
    </div>
  );
}
