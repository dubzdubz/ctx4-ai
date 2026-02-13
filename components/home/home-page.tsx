"use client";

import { motion } from "motion/react";
import { useRef } from "react";
import { BookTextIcon } from "@/components/ui/book-text";
import { BrainIcon } from "@/components/ui/brain";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { WrenchIcon } from "@/components/ui/wrench";

const features = [
  {
    icon: BrainIcon,
    title: "Personal Context",
    description: "Who you are, what you do, and how you prefer to work.",
  },
  {
    icon: BookTextIcon,
    title: "Knowledge Base",
    description: "Processes, docs, and shared knowledge.",
  },
  {
    icon: WrenchIcon,
    title: "Skills",
    description: "Routines and capabilities extracted from past conversations.",
  },
] as const;

type HomePageProps = {
  isAuthenticated: boolean;
};

type IconHandle = { startAnimation: () => void; stopAnimation: () => void };

export function HomePage({ isAuthenticated: _isAuthenticated }: HomePageProps) {
  const iconRefs = useRef<(IconHandle | null)[]>([]);

  return (
    <main className="min-h-svh bg-[oklch(0.985_0.006_250)]">
      <div className="mx-auto max-w-5xl px-8 py-24 md:py-32 pt-32 md:pt-40">
        {/* Hero */}
        <section className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            ctx4.ai
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-4 text-muted-foreground"
          >
            Portable context via MCP for Claude & ChatGPT
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-10"
          >
            <LinkButton
              href="/docs/getting-started"
              variant="default"
              size="lg"
            >
              Get Started
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="mt-24 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Connect Claude or ChatGPT via MCP. The AI saves what matters. Browse
            and edit anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            Your data lives in your GitHub repo. You stay in control.
          </p>
          <LinkButton
            href="/docs/getting-started"
            variant="link"
            size="sm"
            className="mt-2 text-muted-foreground"
          >
            Learn more &rarr;
          </LinkButton>
        </motion.div>
      </div>
    </main>
  );
}
