import { PageLayout } from "@/components/layout/page-layout";
import { LinkButton } from "@/components/ui/link-button";

function StepNumber({ n }: { n: number }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
      {n}
    </span>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export function HowItWorks() {
  return (
    <PageLayout
      title="How It Works"
      description="ctx4 gives your AI persistent, structured context stored in a GitHub repo you control. Here's how the flow works."
      maxWidth="lg"
    >
      <div className="space-y-16">
        {/* The Problem */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Problem</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every conversation starts from scratch. You repeat your preferences,
            your team's processes, your project context. Built-in memory
            features are locked to one provider and opaque — you can't see or
            control what's stored.
          </p>
        </section>

        {/* The Solution */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">The Solution</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ctx4 is an MCP server that gives your AI persistent, structured
            context stored in a GitHub repo you control. Connect Claude,
            ChatGPT, or any MCP client — your context follows you everywhere.
          </p>
        </section>

        {/* How the Flow Works */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">How the Flow Works</h2>
          <div className="space-y-4">
            {[
              {
                title: "You connect your MCP client",
                desc: "Add the ctx4 MCP URL to Claude, ChatGPT, or any MCP client",
              },
              {
                title: "AI loads your context",
                desc: "The AI calls ctx_instructions to read your full context: who you are, what you know, what skills you've taught it",
              },
              {
                title: "You have a conversation",
                desc: "The AI works with your full context loaded",
              },
              {
                title: "AI saves what matters",
                desc: "During the conversation, the AI saves relevant preferences, learnings, and knowledge via ctx_bash",
              },
              {
                title: "Auto-syncs to GitHub",
                desc: "Changes are committed and pushed to your repo automatically",
              },
              {
                title: "Next conversation picks up where you left off",
                desc: "Any client, any time. Your context is always there.",
              },
            ].map((step, i) => (
              <div key={step.title} className="flex gap-3">
                <StepNumber n={i + 1} />
                <div>
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What Gets Stored */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">What Gets Stored</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Everything lives in a GitHub repo you own. That means you can
            inspect any file, download your data, upload changes manually, or
            reorganize things however you like. Your context is just files in a
            repo — no lock-in, no black box.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The structure is flexible. The AI has full control and can create
            folders, add files, and evolve your context as you use it. Our
            template suggests a starting point:
          </p>
          <CodeBlock>
            {`your-context-repo/
├── resources/     # Loaded every conversation (instructions, who you are)
├── skills/        # Reusable workflows (invoked on demand)
└── knowledge/     # Memories, notes, reference material`}
          </CodeBlock>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You can stick with this or change it. The AI adapts to whatever
            structure you choose.
          </p>
        </section>

        {/* How It's Built */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">How It's Built</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ctx4 is open source. It's an MCP server that sits between your AI
            client (Claude, ChatGPT, etc.) and your GitHub repo. When you chat,
            it receives requests via MCP, reads and writes your context in an
            isolated sandbox, and syncs everything to GitHub. Each user gets
            their own sandbox — your data stays yours. Changes are committed and
            pushed automatically, so your repo is always up to date.
          </p>
        </section>
      </div>

      {/* CTA */}
      <div className="mt-24 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Ready to try it?</p>
        <LinkButton
          href="/docs/getting-started"
          variant="default"
          size="default"
        >
          Get Started
        </LinkButton>
      </div>
    </PageLayout>
  );
}
