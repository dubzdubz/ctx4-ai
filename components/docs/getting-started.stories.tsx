import type { Meta, StoryObj } from "@storybook/react";
import { GettingStarted } from "./getting-started";

const meta: Meta<typeof GettingStarted> = {
  title: "Docs/GettingStarted",
  component: GettingStarted,
};

export default meta;

type Story = StoryObj<typeof GettingStarted>;

/** New user — not signed in, no repo linked. */
export const NotSignedIn: Story = {
  args: {
    isAuthenticated: false,
    hasLinkedRepo: false,
    linkedRepoName: null,
  },
};

/** Signed in but hasn't connected GitHub or selected a repo yet. */
export const SignedInNoRepo: Story = {
  args: {
    isAuthenticated: true,
    hasLinkedRepo: false,
    linkedRepoName: null,
  },
};

/** Signed in and has linked a repo. */
export const SignedInWithRepo: Story = {
  args: {
    isAuthenticated: true,
    hasLinkedRepo: true,
    linkedRepoName: "dubzdubz/private-ctx4-data",
  },
};
