import type { Meta, StoryObj } from "@storybook/react";
import { HowItWorks } from "./how-it-works";

const meta: Meta<typeof HowItWorks> = {
  title: "Docs/HowItWorks",
  component: HowItWorks,
};

export default meta;

type Story = StoryObj<typeof HowItWorks>;

/** Default view of the How It Works page. */
export const Default: Story = {};
