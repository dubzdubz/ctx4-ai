"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

function StepComplete({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50/50 px-4 py-3 text-sm dark:border-green-800 dark:bg-green-950/30">
      <Check
        className="size-4 shrink-0 text-green-600 dark:text-green-500"
        strokeWidth={2.5}
      />
      <span className="text-muted-foreground">{children}</span>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
      {children}
    </code>
  );
}

function CodeBlock({
  children,
  showCopy = false,
  copyText,
}: {
  children: string;
  showCopy?: boolean;
  copyText?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = copyText ?? children;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
      {showCopy && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="absolute right-2 top-2 size-8"
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="size-4 text-green-600 dark:text-green-500" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      )}
    </div>
  );
}

type GettingStartedProps = {
  isAuthenticated: boolean;
  hasLinkedRepo: boolean;
  linkedRepoName: string | null;
};

export function GettingStarted({
  isAuthenticated,
  hasLinkedRepo,
  linkedRepoName,
}: GettingStartedProps) {
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
            <h2 className="text-xl font-semibold">Create your context repo</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-10">
            Click the button below to create a private repo from our template.
            This is where your AI context will live — instructions, knowledge,
            and skills.
          </p>
          <div className="pl-10">
            <LinkButton
              href={TEMPLATE_DEEPLINK}
              variant="outline"
              size="default"
              className="flex w-full max-w-xs items-center justify-center gap-2 px-6 py-3 text-base font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Use template repo
            </LinkButton>
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
            <h2 className="text-xl font-semibold">Sign up</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-10">
            Create a free ctx4.ai account to link your context repo and
            authenticate with AI clients.
          </p>
          <div className="pl-10 max-w-xs">
            {isAuthenticated ? (
              <StepComplete>Signed in</StepComplete>
            ) : (
              <LinkButton
                href="/auth/login"
                variant="outline"
                size="default"
                className="flex w-full items-center justify-center gap-2 px-6 py-3 text-base font-medium"
              >
                Sign up
              </LinkButton>
            )}
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepNumber n={3} />
            <h2 className="text-xl font-semibold">Connect GitHub</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-10">
            Install the ctx4.ai GitHub App and select the repo you created in
            Step 1. The app gets read/write access to that single repo so your
            AI can save context there.
          </p>
          <div className="pl-10 max-w-xs">
            {hasLinkedRepo && linkedRepoName ? (
              <StepComplete>{linkedRepoName}</StepComplete>
            ) : (
              <LinkButton
                href="/settings"
                variant="outline"
                size="default"
                className="flex w-full items-center justify-center gap-2 px-6 py-3 text-base font-medium"
              >
                {isAuthenticated ? "Connect GitHub" : "Go to Settings"}
              </LinkButton>
            )}
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepNumber n={4} />
            <h2 className="text-xl font-semibold">Connect your AI client</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pl-10">
            Add the ctx4.ai MCP server to any MCP-compatible client. The MCP URL
            is:
          </p>
          <div className="pl-10">
            <CodeBlock showCopy copyText={MCP_URL}>
              {MCP_URL}
            </CodeBlock>
          </div>
          <div className="pl-10">
            <Tabs defaultValue="claude-desktop" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                <TabsTrigger value="claude-desktop">
                  Claude Web/Desktop
                </TabsTrigger>
                <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
                <TabsTrigger value="chatgpt">ChatGPT</TabsTrigger>
                <TabsTrigger value="cursor">Cursor</TabsTrigger>
              </TabsList>

              {/* Claude Desktop */}
              <TabsContent value="claude-desktop" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Open Claude Desktop and navigate to Settings → Connectors →
                  Add Custom Connector.
                </p>
                <p className="text-sm text-muted-foreground">
                  Enter the name as <Code>ctx4</Code> and the remote MCP server
                  URL as:
                </p>
                <CodeBlock showCopy copyText={MCP_URL}>
                  {MCP_URL}
                </CodeBlock>
                <p className="text-sm text-muted-foreground">
                  Click <strong>Connect</strong> to authenticate.
                </p>
              </TabsContent>

              {/* Claude Code */}
              <TabsContent value="claude-code" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Open a terminal and run the following command:
                </p>
                <CodeBlock
                  showCopy
                  copyText={`claude mcp add --transport http ctx4 ${MCP_URL}`}
                >
                  {`claude mcp add --transport http ctx4 ${MCP_URL}`}
                </CodeBlock>
                <p className="text-sm text-muted-foreground">
                  Use <Code>/mcp</Code> to connect and authenticate.
                </p>
              </TabsContent>

              {/* Cursor */}
              <TabsContent value="cursor" className="space-y-3 mt-4">
                <p className="text-sm font-medium">Installation Link</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Click the button below to install directly:
                </p>
                <LinkButton
                  href={`cursor://anysphere.cursor-deeplink/mcp/install?name=ctx4&config=${btoa(JSON.stringify({ url: MCP_URL }))}`}
                  variant="outline"
                  size="sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add to Cursor
                </LinkButton>
                <p className="text-sm font-medium mt-4">Manual Installation</p>
                <p className="text-sm text-muted-foreground">
                  Add the following to your <Code>mcp.json</Code> file:
                </p>
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
              </TabsContent>

              {/* ChatGPT */}
              <TabsContent value="chatgpt" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground italic mb-2">
                  Available for Pro, Plus, Business, Enterprise, and Education
                  accounts
                </p>
                <p className="text-sm text-muted-foreground">
                  Follow these steps to add ctx4.ai as an MCP app:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>
                    Navigate to{" "}
                    <strong>Settings → Apps → Advanced settings</strong>
                  </li>
                  <li>
                    Enable <strong>Developer mode</strong>
                  </li>
                  <li>
                    Click <strong>Create app</strong> next to Advanced settings
                  </li>
                  <li>Add the MCP server URL:</li>
                </ol>
                <CodeBlock showCopy copyText={MCP_URL}>
                  {MCP_URL}
                </CodeBlock>
                <ol
                  start={5}
                  className="list-decimal list-inside space-y-2 text-sm text-muted-foreground mt-2"
                >
                  <li>
                    Select <strong>OAuth</strong> for authentication
                  </li>
                  <li>
                    Leave the OAuth fields empty (ctx4.ai handles authentication
                    automatically)
                  </li>
                </ol>
                <p className="text-sm text-muted-foreground mt-2">
                  The app will appear in the composer's "Developer Mode" tool
                  during conversations.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  For detailed instructions, see{" "}
                  <a
                    href="https://developers.openai.com/api/docs/guides/developer-mode"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ChatGPT's Developer Mode documentation
                  </a>
                  .
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Step 5 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <StepNumber n={5} />
            <h2 className="text-xl font-semibold">Start using it</h2>
          </div>
          <div className="pl-10 space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Once connected, your AI client will authenticate via OAuth and
              gain access to your context repo. Run the <Code>/onboarding</Code>{" "}
              prompt to get set up:
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
