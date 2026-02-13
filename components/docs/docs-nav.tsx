"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const docsLinks = [
  { href: "/docs/getting-started", label: "Getting Started" },
  { href: "/docs/how-it-works", label: "How It Works" },
] as const;

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {docsLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
