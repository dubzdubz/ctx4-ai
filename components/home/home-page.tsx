"use client";

import { motion } from "motion/react";
import { Brain, BookOpen, Github, Wrench } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Personal Context",
    description: "Who you are, what you do, and how you prefer to work.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Processes, docs, and shared knowledge.",
  },
  {
    icon: Wrench,
    title: "Skills",
    description: "Routines and capabilities extracted from past conversations.",
  },
] as const;

type HomePageProps = {
  isAuthenticated: boolean;
};

export function HomePage({ isAuthenticated }: HomePageProps) {
  return (
    <main className="min-h-screen bg-[oklch(0.985_0.006_250)]">
      <div className="mx-auto max-w-5xl px-8 py-24 md:py-32">
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
            {isAuthenticated ? (
              <LinkButton href="/settings" variant="default" size="default">
                Settings
              </LinkButton>
            ) : (
              <LinkButton href="/auth/login" variant="default" size="default">
                Get Started
              </LinkButton>
            )}
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
              >
                <Card size="sm" className="h-full">
                  <CardHeader>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <feature.icon className="size-4" aria-hidden />
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
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Github className="size-4 shrink-0" aria-hidden />
            Your data lives in your GitHub repo. You stay in control.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
