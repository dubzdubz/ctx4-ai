"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { LinkButton } from "@/components/ui/link-button";

const MCP_URL = "https://ctx4-ai.vercel.app/mcp";

const TEMPLATE_DEEPLINK =
  "https://github.com/new?template_owner=dubzdubz&template_name=ctx4-data-template&visibility=private&name=private-ctx4-data";
const TEMPLATE_REPO = "https://github.com/dubzdubz/ctx4-data-template";

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
      {n}
    </span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

type GettingStartedProps = {
  isAuthenticated: boolean;
};

export function GettingStarted({ isAuthenticated }: GettingStartedProps) {
  return (
    <PageLayout
      title="Getting Started"
      description="ctx4.ai gives your AI assistants persistent context via MCP. Your preferences, knowledge, and skills live in a GitHub repo and follow you across conversations in Claude, ChatGPT, VS Code, and any MCP client."
      maxWidth="md"
    >
      {/* Steps */}
      <div className="space-y-16">
          {/* Step 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <StepNumber n={1} />
              <h2 className="text-xl font-semibold">
                Create your context repo
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-10">
              Click the button below to create a private repo from our template.
              This is where your AI context will live — instructions, knowledge,
              and skills.
            </p>
            <div className="pl-10">
              <a
                href={TEMPLATE_DEEPLINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
              >
                Use template repo
              </a>
            </div>
            <div className="pl-10 space-y-2 text-sm text-muted-foreground">
              <p>
                The template ({" "}
                <a
                  href={TEMPLATE_REPO}
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  dubzdubz/ctx4-data-template
                </a>{" "}
                ) creates this structure:
              </p>
              <CodeBlock>
                {[
                  "resources/",
                  "  instructions.md    # Your preferences & instructions",
                  "  context.md         # Who you are, what you do",
                  "skills/",
                  "  skill-creator/     # A built-in skill for creating new skills",
                  "knowledge/           # General knowledge & memories",
                ].join("\n")}
              </CodeBlock>
            </div>
          </section>

          {/* Step 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <StepNumber n={2} />
              <h2 className="text-xl font-semibold">
                Sign up &amp; connect GitHub
              </h2>
            </div>
            <div className="pl-10 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                <a
                  href="/auth/login"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Sign up
                </a>{" "}
                for ctx4.ai, then go to{" "}
                <a
                  href="/settings"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Settings
                </a>{" "}
                to install the GitHub App and select the repo you just created.
              </p>
              <p>
                The GitHub App gives ctx4.ai read/write access to that single
                repo so your AI can save context there.
              </p>
            </div>
          </section>

          {/* Step 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <StepNumber n={3} />
              <h2 className="text-xl font-semibold">Connect your AI client</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-10">
              Add the ctx4.ai MCP server to any MCP-compatible client. The MCP
              URL is:
            </p>
            <div className="pl-10">
              <CodeBlock>{MCP_URL}</CodeBlock>
            </div>
            <div className="pl-10 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Claude Desktop</p>
                <CodeBlock>
                  {JSON.stringify(
                    {
                      mcpServers: {
                        ctx4: {
                          url: MCP_URL,
                        },
                      },
                    },
                    null,
                    2,
                  )}
                </CodeBlock>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Claude Code</p>
                <CodeBlock>
                  {`claude mcp add --transport streamable-http ctx4 ${MCP_URL}`}
                </CodeBlock>
              </div>
              <p className="text-sm text-muted-foreground">
                This also works with ChatGPT, VS Code, and any other client that
                supports MCP.
              </p>
            </div>
          </section>

          {/* Step 4 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <StepNumber n={4} />
              <h2 className="text-xl font-semibold">Start using it</h2>
            </div>
            <div className="pl-10 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Once connected, your AI client will authenticate via OAuth and
                gain access to your context repo. Run the{" "}
                <Code>/onboarding</Code> prompt to get set up:
              </p>
              <CodeBlock>Use the /onboarding prompt</CodeBlock>
              <p>
                The onboarding flow will scaffold your repo if needed, ask about
                your preferences and workflow, and save everything to the right
                files. After that, your AI will have full context about you in
                every conversation.
              </p>
            </div>
          </section>
        </div>

      {/* Footer CTA */}
      <div className="mt-24 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Ready to get started?</p>
        {isAuthenticated ? (
          <LinkButton href="/settings" variant="default" size="default">
            Settings
          </LinkButton>
        ) : (
          <LinkButton href="/auth/login" variant="default" size="default">
            Sign up
          </LinkButton>
        )}
      </div>
    </PageLayout>
  );
}
