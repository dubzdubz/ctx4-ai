import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  type NewUserGithubConfig,
  type UserGithubConfig,
  userGithubConfigs,
} from "./schema";

export async function getUserGithubConfig(
  userId: string,
): Promise<UserGithubConfig | undefined> {
  const result = await db
    .select()
    .from(userGithubConfigs)
    .where(eq(userGithubConfigs.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertUserGithubConfig(
  config: NewUserGithubConfig,
): Promise<UserGithubConfig> {
  // Build the update set dynamically — only include repo fields when provided,
  // so a partial upsert (just installationId) doesn't null out existing repo data.
  const updateSet: Record<string, unknown> = {
    installationId: config.installationId,
    isActive: config.isActive ?? true,
    updatedAt: new Date(),
  };
  if (config.githubUsername !== undefined)
    updateSet.githubUsername = config.githubUsername;
  if (config.repoFullName !== undefined)
    updateSet.repoFullName = config.repoFullName;
  if (config.repoId !== undefined) updateSet.repoId = config.repoId;
  if (config.repoUrl !== undefined) updateSet.repoUrl = config.repoUrl;
  if (config.defaultBranch !== undefined)
    updateSet.defaultBranch = config.defaultBranch;

  const [result] = await db
    .insert(userGithubConfigs)
    .values(config)
    .onConflictDoUpdate({
      target: userGithubConfigs.userId,
      set: updateSet,
    })
    .returning();
  return result;
}

export async function deleteUserGithubConfig(userId: string): Promise<void> {
  await db
    .delete(userGithubConfigs)
    .where(eq(userGithubConfigs.userId, userId));
}
