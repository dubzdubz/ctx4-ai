type PageLayoutProps = {
  children: React.ReactNode;
  /** Page title - rendered as h1. Omit when content has its own title. */
  title?: string;
  /** Optional description below the title (string or ReactNode for dynamic content) */
  description?: React.ReactNode;
  /** Max width: "sm" (max-w-lg), "md" (max-w-2xl), "lg" (max-w-3xl) */
  maxWidth?: "sm" | "md" | "lg";
  /** Additional class for the inner content wrapper */
  className?: string;
};

const maxWidthClasses = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-3xl",
} as const;

export function PageLayout({
  children,
  title,
  description,
  maxWidth = "md",
  className,
}: PageLayoutProps) {
  return (
    <main className="mx-auto w-full px-6 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
      <div
        className={`mx-auto w-full ${maxWidthClasses[maxWidth]} ${className ?? ""}`}
      >
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {title}
              </h1>
            )}
            {description && (
              <div
                className={`text-muted-foreground leading-relaxed ${title ? "mt-2" : ""}`}
              >
                {description}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}
