import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentType, ReactNode } from "react";
import { useEffect } from "react";
import { GithubRepoManager } from "./github-repo-manager";

const meta: Meta<typeof GithubRepoManager> = {
  title: "GitHub/GithubRepoManager",
  component: GithubRepoManager,
};

export default meta;

type Story = StoryObj<typeof GithubRepoManager>;

const mockGithubConfig = {
  repoFullName: "owner/my-context-repo",
  githubUsername: "owner",
  defaultBranch: "main",
  installationId: 12345,
};

const mockRepos = [
  {
    id: 1,
    fullName: "owner/repo1",
    name: "repo1",
    owner: "owner",
    cloneUrl: "https://github.com/owner/repo1.git",
    defaultBranch: "main",
    private: false,
    description: "My first context repository",
  },
  {
    id: 2,
    fullName: "owner/repo2",
    name: "repo2",
    owner: "owner",
    cloneUrl: "https://github.com/owner/repo2.git",
    defaultBranch: "main",
    private: true,
    description: null,
  },
];

function createFetchMock(behavior: "repos" | "empty" | "error" | "loading") {
  const original = globalThis.fetch;
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.includes("/api/github/repos") || url.includes("github/repos")) {
      if (behavior === "loading") {
        await new Promise((r) => setTimeout(r, 30_000)); // Long delay to simulate loading
      }
      if (behavior === "error") {
        return new Response(
          JSON.stringify({ error: "Failed to load repositories" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({
          installationId: 12345,
          repositories: behavior === "empty" ? [] : mockRepos,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    if (url.includes("/api/github/select-repo") && init?.method === "POST") {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    if (url.includes("/api/github/disconnect") && init?.method === "POST") {
      return new Response(JSON.stringify({}), { status: 200 });
    }
    return original(input, init);
  };
  return () => {
    globalThis.fetch = original;
  };
}

const withFetchMock = (behavior: "repos" | "empty" | "error" | "loading") => {
  return function Decorator(Story: ComponentType) {
    const restore = createFetchMock(behavior);
    return (
      <FetchMockWrapper restore={restore}>
        <Story />
      </FetchMockWrapper>
    );
  };
};

function FetchMockWrapper({
  children,
  restore,
}: {
  children: ReactNode;
  restore: () => void;
}) {
  useEffect(() => () => restore(), [restore]);
  return <>{children}</>;
}

export const NotConnected: Story = {
  args: {
    config: null,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
};

export const Connected: Story = {
  args: {
    config: mockGithubConfig,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
};

export const AppNotConfigured: Story = {
  args: {
    config: null,
    installUrl: null,
  },
};

export const RepoSelection: Story = {
  args: {
    config: mockGithubConfig,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
        query: { select_repo: "true" },
      },
    },
  },
  decorators: [withFetchMock("repos")],
};

export const RepoSelectionEmpty: Story = {
  args: {
    config: null,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
        query: { select_repo: "true" },
      },
    },
  },
  decorators: [withFetchMock("empty")],
};

export const RepoSelectionLoading: Story = {
  args: {
    config: null,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
        query: { select_repo: "true" },
      },
    },
  },
  decorators: [withFetchMock("loading")],
};

export const RepoSelectionError: Story = {
  args: {
    config: null,
    installUrl: "https://github.com/apps/ctx4/conversations/installations/new",
  },
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/settings",
        query: { select_repo: "true" },
      },
    },
  },
  decorators: [withFetchMock("error")],
};
