# Code Style & Linting Guide

This document defines the **canonical code style, formatting, and linting rules** for this repository.

Its goals are to:

- keep the codebase consistent and readable
- minimize formatting bikeshedding
- ensure AI-generated code blends in seamlessly
- catch real bugs early without slowing development

This guide is designed to work well with **Cursor**, **Next.js**, and a modern TypeScript + React stack.

---

## Core Principles

1. **Formatting is automated** — humans and AI should not hand-format code.
2. **Biome is the single source of truth** for formatting and linting.
3. **Consistency > personal preference**.

---

## Tooling Standard

- **TypeScript** — type safety by default
- **Biome** — formatting + linting (replaces Prettier + ESLint)
- **pnpm** — package manager

### Linting Commands

```bash
pnpm lint        # Check only (CI)
pnpm lint:fix    # Check and auto-fix
```

Run `pnpm lint:fix` before committing. It formats and fixes lint issues in one pass.

---

## Indentation (Canonical)

> Indentation rules are strict and non-negotiable.

- **2 spaces per indentation level**
- **Tabs are not allowed**
- Applies to all files: TypeScript, React/TSX, JSON, CSS, etc.

### Enforcement

**Biome** (`biome.jsonc`):

- `indentStyle: "space"`
- `indentWidth: 2`

AI tools (including Cursor) must follow these rules exactly.

---

## Formatting Rules (Biome)

Biome controls all formatting. Defaults align with common best practices:

- Semicolons
- Single quotes
- Trailing commas
- Arrow parens always

### Newlines at End of File

- Exactly **one newline** at end of file
- Never multiple blank lines at EOF

This prevents noisy diffs and formatting drift.

---

## Biome Rules Overview

The project uses Biome for both formatting and linting. Some rules are relaxed in `biome.jsonc` for pragmatic reasons (e.g. `noExplicitAny`, `noConsole`). When adding new code:

- Prefer `unknown` over `any` when possible
- Keep `console.*` usage minimal (debugging only)
- Avoid magic numbers in shared logic — extract to named constants
- Use `@ts-expect-error` **only with an explanatory comment**

**Excluded from Biome:** `components/ui`, `lib/utils.ts` (shadcn-generated files). Do not extend these exclusions without good reason.

---

## Naming Conventions

- **Files & folders:** `kebab-case`
- **React components:** `PascalCase`
- **Functions & variables:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE` (true constants only)
- **Types:** `PascalCase`
- Prefer `type` over `interface` unless declaration merging is required

---

## TypeScript Conventions

- Avoid `any` — use `unknown` or proper types
- Narrow types whenever possible (unions, literals)
- Avoid type assertions (`as X`) unless unavoidable
- Type function boundaries in shared or core modules

---

## React & Next.js Conventions

- Prefer **Server Components** by default
- Add `"use client"` only when required (hooks, event handlers, browser APIs)
- Keep client components small and focused
- No conditional hooks
- Extract complex logic out of components

### UI Components

**Always prefer shadcn/ui components over building custom UI from scratch.**

- Check the [shadcn/ui registry](https://ui.shadcn.com) before creating new components
- Use `pnpm dlx shadcn@latest add [component]` to add components via CLI
- Common components: `card`, `button`, `badge`, `separator`, `alert`, `dialog`, `sheet`, `select`, `input`, `field`
- Only build custom components when shadcn/ui doesn't provide a suitable option
- Benefits: consistent design system, built-in accessibility, type-safe and composable

### Storybook

- Add `.stories.tsx` files alongside new or significantly modified components
- Cover key states: default, loading, error, empty
- Mock API calls when needed

---

## Import Order

Imports should be grouped in this order, separated by one blank line:

1. React / Next.js
2. External packages
3. Internal absolute imports (`@/…`)
4. Relative imports (`./…`)

Unused imports are not allowed. Biome can remove them via `lint:fix`.

---

## File & Module Structure

- One primary export per file when possible
- Keep files under ~200–300 lines (soft rule)
- UI components live in `components/`
- Shared logic lives in `lib/`
- Feature-specific components live in domain folders (e.g. `components/auth/`, `components/github/`)

---

## Comments & Documentation

- Comments should explain **why**, not what
- Use JSDoc for exported utilities and SDK-like code
- Document new patterns (runtime adapters, stream formats, etc.) briefly

---

## Cursor Guidelines

When generating or editing code, Cursor should:

- Follow Biome formatting exactly
- Use **2 spaces for indentation**
- **Never use tabs**
- Never manually align code with spaces
- Ensure exactly one newline at EOF
- Keep changes minimal and focused
- Respect existing naming and file conventions
- Avoid introducing `any` unless explicitly requested
- Add `"use client"` only when necessary
- Run `pnpm lint:fix` after significant edits to catch issues
