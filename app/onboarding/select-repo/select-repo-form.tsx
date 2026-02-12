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

export function SelectRepoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const installationId = searchParams.get("installation_id");

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!installationId) {
      setError("Missing installation ID. Please connect GitHub first.");
      setIsLoading(false);
      return;
    }

    async function fetchRepos() {
      try {
        const res = await fetch(
          `/api/github/repos?installation_id=${installationId}`,
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load repositories");
        }
        const data = await res.json();
        setRepos(data.repositories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load repositories",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchRepos();
  }, [installationId]);

  const handleSelect = async () => {
    if (!selectedRepo || !installationId) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/github/select-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installationId: Number(installationId),
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

      router.push("/me");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save repository",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Repositories</CardTitle>
        <CardDescription>
          {isLoading
            ? "Loading your repositories..."
            : `${repos.length} ${repos.length === 1 ? "repository" : "repositories"} available`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <FieldError>{error}</FieldError>}

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
            No repositories found. Make sure you granted access to at least one
            repository when installing the GitHub App.
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

        {selectedRepo && (
          <Button
            onClick={handleSelect}
            disabled={isSaving}
            className="mt-2 w-full"
          >
            {isSaving ? "Saving..." : `Use ${selectedRepo.fullName}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
