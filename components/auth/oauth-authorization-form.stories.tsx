import type { Meta, StoryObj } from "@storybook/react";
import type { User } from "@supabase/supabase-js";
import { OAuthAuthorizationForm } from "./oauth-authorization-form";

const meta: Meta<typeof OAuthAuthorizationForm> = {
  title: "Auth/OAuthAuthorizationForm",
  component: OAuthAuthorizationForm,
};

export default meta;

type Story = StoryObj<typeof OAuthAuthorizationForm>;

const mockUser = { email: "user@example.com" } as User;

export const Default: Story = {
  args: {
    user: mockUser,
    authorizationId: "auth-123",
    clientName: "Example App",
    scopes: ["openid", "email", "mcp:tools"],
  },
};

export const MinimalScopes: Story = {
  args: {
    user: mockUser,
    authorizationId: "auth-456",
    clientName: "Simple Client",
    scopes: ["openid"],
  },
};
