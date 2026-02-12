"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";

interface Repository {
  id: number;
  fullName: string;
  name: string;
  owner: string;
  cloneUrl: string;
  defaultBranch: string;
  private: boolean;
  description: string | null;
}

interface GithubConfig {
  repoFullName: string;
  githubUsername: string | null;
  defaultBranch: string;
  installationId: number;
}

interface GithubRepoManagerProps {
  config: GithubConfig | null;
  installUrl: string | null;
}

export function GithubRepoManager({
  config,
  installUrl,
}: GithubRepoManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectRepoFromUrl = searchParams.get("select_repo") === "true";

  const [repos, setRepos] = useState<Repository[]>([]);
  const [installationId, setInstallationId] = useState<number | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRepoSelection, setShowRepoSelection] = useState(selectRepoFromUrl);

  const shouldFetchRepos = showRepoSelection;

  useEffect(() => {
    if (!shouldFetchRepos) {
      return;
    }

    async function fetchRepos() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/github/repos");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load repositories");
        }
        const data = await res.json();
        setRepos(data.repositories);
        setInstallationId(data.installationId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load repositories",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepos();
  }, [shouldFetchRepos]);

  const handleSelectRepo = async () => {
    if (!selectedRepo || !installationId) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/github/select-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installationId,
          repoId: selectedRepo.id,
          repoFullName: selectedRepo.fullName,
          repoUrl: selectedRepo.cloneUrl,
          defaultBranch: selectedRepo.defaultBranch,
          githubUsername: selectedRepo.owner,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save repository");
      }

      // Remove query params and refresh
      if (selectRepoFromUrl) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("select_repo");
        window.history.replaceState({}, "", newUrl.toString());
      }

      setShowRepoSelection(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save repository",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectFromExisting = () => {
    // Show repo selection from already-granted repos (no GitHub redirect)
    setError(null);
    setShowRepoSelection(true);
  };

  const handleUpdateGithubAccess = () => {
    // Trigger reinstall flow - GitHub will redirect back with installation_id
    if (installUrl) {
      window.location.href = installUrl;
    }
  };

  const handleCancelSelection = () => {
    setShowRepoSelection(false);
    setError(null);
    setSelectedRepo(null);
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect GitHub? This will remove your context repository configuration.",
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    setError(null);

    try {
      const res = await fetch("/api/github/disconnect", {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to disconnect GitHub");
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disconnect GitHub",
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">GitHub</CardTitle>
        <CardDescription>
          {showRepoSelection
            ? "Select a repository to use as your context store."
            : config
              ? "Your context repository is connected."
              : "Connect a GitHub repository to use as your context store."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <FieldError>{error}</FieldError>}

        {/* Show repo selection if installation_id is present */}
        {showRepoSelection ? (
          <>
            <div className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading your repositories..."
                : `${repos.length} ${repos.length === 1 ? "repository" : "repositories"} available`}
            </div>

            {isLoading && (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            )}

            {!isLoading && repos.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">
                No repositories found. Make sure you granted access to at least
                one repository when installing the GitHub App.
              </p>
            )}

            {repos.map((repo) => (
              <button
                key={repo.id}
                type="button"
                onClick={() => setSelectedRepo(repo)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  selectedRepo?.id === repo.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{repo.fullName}</span>
                  {repo.private && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                      private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {repo.description}
                  </p>
                )}
              </button>
            ))}

            <div className="flex gap-2 pt-2">
              {selectedRepo && (
                <Button
                  onClick={handleSelectRepo}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? "Saving..." : `Use ${selectedRepo.fullName}`}
                </Button>
              )}
              {config && (
                <Button
                  onClick={handleCancelSelection}
                  variant="outline"
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        ) : config ? (
          /* Show existing config when not selecting */
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repository</span>
              <span className="text-sm font-medium">{config.repoFullName}</span>
            </div>
            {config.githubUsername && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  GitHub user
                </span>
                <span className="text-sm font-medium">
                  {config.githubUsername}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Branch</span>
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {config.defaultBranch}
              </code>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectFromExisting}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Change Repository
                </Button>
                <Button
                  onClick={handleUpdateGithubAccess}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Update Access
                </Button>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isDisconnecting}
              >
                {isDisconnecting ? "Disconnecting..." : "Disconnect GitHub"}
              </Button>
            </div>
          </>
        ) : installUrl ? (
          /* Show connect button when no config */
          <LinkButton href={installUrl} variant="outline">
            Connect GitHub
          </LinkButton>
        ) : (
          <p className="text-sm text-muted-foreground">
            GitHub App not configured.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
