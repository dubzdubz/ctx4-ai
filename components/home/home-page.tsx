"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import {
  BookTextIcon,
  BotMessageSquareIcon,
  BrainIcon,
  FolderGit2Icon,
  GithubIcon,
  NfcIcon,
  RefreshCWIcon,
  SparklesIcon,
  WrenchIcon,
  ZapIcon,
} from "@/components/animated-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LinkButton } from "@/components/ui/link-button";

const features = [
  {
    icon: BrainIcon,
    title: "Personal Context",
    description:
      "Your preferences, role, and working style. The AI loads this at the start of every conversation.",
  },
  {
    icon: BookTextIcon,
    title: "Knowledge Base",
    description:
      "Processes, docs, and reference material. Organized by you or the AI.",
  },
  {
    icon: WrenchIcon,
    title: "Skills",
    description:
      "Reusable routines and workflows. Teach the AI once, use everywhere.",
  },
] as const;

const trustSignals = [
  { icon: GithubIcon, label: "Open Source", sublabel: "Apache 2.0" },
  { icon: SparklesIcon, label: "Free", sublabel: "Cloud or self-hosted" },
  {
    icon: FolderGit2Icon,
    label: "Your Data",
    sublabel: "Lives in your GitHub repo",
  },
  { icon: ZapIcon, label: "Portable", sublabel: "Works with any MCP client" },
] as const;

const howItWorksSteps = [
  {
    icon: NfcIcon,
    title: "Connect",
    description: "Add the MCP server to Claude or ChatGPT",
  },
  {
    icon: RefreshCWIcon,
    title: "Context loads",
    description: "The AI reads your instructions, knowledge, and skills",
  },
  {
    icon: BotMessageSquareIcon,
    title: "AI remembers",
    description: "New learnings are saved to your repo automatically",
  },
] as const;

type HomePageProps = {
  isAuthenticated: boolean;
};

type IconHandle = { startAnimation: () => void; stopAnimation: () => void };

export function HomePage({ isAuthenticated: _isAuthenticated }: HomePageProps) {
  const iconRefs = useRef<(IconHandle | null)[]>([]);
  const howItWorksIconRefs = useRef<(IconHandle | null)[]>([]);

  return (
    <main className="min-h-svh bg-[oklch(0.985_0.006_250)]">
      <div className="mx-auto max-w-5xl px-8 py-24 md:py-32 pt-32 md:pt-40">
        {/* Hero */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="relative inline-flex items-center">
              {/* Gradient glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl" />
              {/* Badge */}
              <div className="relative inline-flex items-center rounded-full border border-border bg-background/80 backdrop-blur-sm px-4 py-1.5 shadow-lg shadow-purple-500/10">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-sm font-bold tracking-wide text-transparent">
                  ctx4.ai
                </span>
              </div>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            A Notion for your AI agents
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg"
          >
            Portable context and long-term memory for Claude & ChatGPT. Open
            source. Works via MCP. Your data lives in your GitHub repo — you own
            it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <LinkButton
              href="/docs/getting-started"
              variant="default"
              size="lg"
            >
              Get Started
            </LinkButton>
            <LinkButton href="/docs/how-it-works" variant="outline" size="lg">
              How It Works
            </LinkButton>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mt-24">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onMouseEnter={() => iconRefs.current[index]?.startAnimation()}
                onMouseLeave={() => iconRefs.current[index]?.stopAnimation()}
              >
                <Card
                  size="sm"
                  className="h-full transition-colors duration-200 hover:bg-muted/5"
                >
                  <CardHeader>
                    <div className="flex size-9 shrink-0 mb-1 items-center justify-center rounded-lg border border-border/40 text-muted-foreground">
                      <feature.icon
                        ref={(el) => {
                          iconRefs.current[index] = el;
                        }}
                        size={16}
                        aria-hidden
                      />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Signals */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mt-24"
        >
          {/* Mobile: single column */}
          <div className="flex flex-col items-center gap-3 sm:hidden">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.label}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Icon size={16} className="shrink-0" aria-hidden />
                  <span className="text-sm whitespace-nowrap">
                    {signal.label}
                    <span className="ml-1 text-muted-foreground/60">
                      — {signal.sublabel}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
          {/* Desktop: 2×2 grid */}
          <div className="hidden sm:grid grid-cols-2 items-center gap-y-3">
            {trustSignals.map((signal, index) => {
              const Icon = signal.icon;
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={signal.label}
                  className={`flex items-center gap-2 text-muted-foreground ${
                    isLeft ? "justify-end pr-5" : "justify-start pl-5"
                  }`}
                >
                  <Icon size={16} className="shrink-0" aria-hidden />
                  <span className="text-sm whitespace-nowrap">
                    {signal.label}
                    <span className="ml-1 text-muted-foreground/60">
                      — {signal.sublabel}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* How it works teaser */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mt-24"
        >
          <h2 className="text-center text-lg font-medium text-foreground">
            How it works
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onMouseEnter={() =>
                  howItWorksIconRefs.current[index]?.startAnimation()
                }
                onMouseLeave={() =>
                  howItWorksIconRefs.current[index]?.stopAnimation()
                }
              >
                <Card
                  size="sm"
                  className="h-full transition-colors duration-200 hover:bg-muted/5"
                >
                  <CardHeader>
                    <div className="flex size-9 shrink-0 mb-1 items-center justify-center rounded-lg border border-border/40 text-muted-foreground">
                      <step.icon
                        ref={(el) => {
                          howItWorksIconRefs.current[index] = el;
                        }}
                        size={16}
                        aria-hidden
                      />
                    </div>
                    <CardTitle>{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <LinkButton
              href="/docs/getting-started"
              variant="outline"
              size="sm"
            >
              Learn more
            </LinkButton>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
