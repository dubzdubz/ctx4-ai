import type { Meta, StoryObj } from "@storybook/react";
import { AuthConfirmClient } from "./auth-confirm-client";

const meta: Meta<typeof AuthConfirmClient> = {
  title: "Auth/AuthConfirmClient",
  component: AuthConfirmClient,
};

export default meta;

type Story = StoryObj<typeof AuthConfirmClient>;

export const Default: Story = {
  args: { next: "/" },
};
