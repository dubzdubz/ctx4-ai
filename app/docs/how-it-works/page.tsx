import type { Metadata } from "next";
import { HowItWorks } from "@/components/docs/how-it-works";

export const metadata: Metadata = {
  title: "How It Works — ctx4.ai",
  description:
    "ctx4 gives your AI persistent, structured context in a GitHub repo you control. Learn how the flow works.",
};

export default function HowItWorksPage() {
  return <HowItWorks />;
}
