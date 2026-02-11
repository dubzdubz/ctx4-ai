import type { Meta, StoryObj } from "@storybook/react";
import { MagicLinkForm } from "./magic-link-form";

const meta: Meta<typeof MagicLinkForm> = {
  title: "Auth/MagicLinkForm",
  component: MagicLinkForm,
};

export default meta;

type Story = StoryObj<typeof MagicLinkForm>;

export const Default: Story = {};
