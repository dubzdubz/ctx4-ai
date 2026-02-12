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
  const [result] = await db
    .insert(userGithubConfigs)
    .values(config)
    .onConflictDoUpdate({
      target: userGithubConfigs.userId,
      set: {
        installationId: config.installationId,
        githubUsername: config.githubUsername,
        repoFullName: config.repoFullName,
        repoId: config.repoId,
        repoUrl: config.repoUrl,
        defaultBranch: config.defaultBranch,
        isActive: config.isActive ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return result;
}

export async function deleteUserGithubConfig(userId: string): Promise<void> {
  await db
    .delete(userGithubConfigs)
    .where(eq(userGithubConfigs.userId, userId));
}
