# UI Guide

How we handle UI components and design in this project.

## Core Principles

1. **Heavily rely on shadcn** — Use shadcn/ui components as the primary building blocks. Don't create custom components from scratch when shadcn provides a suitable option. Keep the design consistent with shadcn's style.

2. **Install via CLI only** — Always add shadcn components via the command line:

   ```bash
   pnpm dlx shadcn@latest add [component]
   ```

   Never copy-paste component code from docs or other sources.

3. **Motion over framer-motion** — Prefer the `motion` package for animations. Use `motion` (motion.dev) rather than `framer-motion` when adding animation dependencies.

4. **Aceternity and lucide-animated are permitted** — Add these via shadcn CLI when they add value (backgrounds, effects, animated icons). Use sparingly; keep forms and settings minimal.

## Adding Components

- **shadcn components**: `pnpm dlx shadcn@latest add button separator badge`
- **Aceternity components**: `pnpm dlx shadcn@latest add @aceternity/spotlight`
- **lucide-animated**: `pnpm dlx shadcn@latest add @lucide-animated/` (or equivalent registry)

## Design Guidelines

- Clean, minimal layouts — avoid heavy box/card containers when section + separator works
- Use `Separator` for grouping; use `Badge` for tags
- Typography: shadcn's text utilities (`text-muted-foreground`, etc.)
- Reserve visual effects (Spotlight, gradients) for hero/homepage; keep auth and settings pages simple
