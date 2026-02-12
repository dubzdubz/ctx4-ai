import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userGithubConfigs = pgTable("user_github_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),

  // GitHub App installation
  installationId: bigint("installation_id", { mode: "number" }).notNull(),
  githubUsername: text("github_username"),

  // Selected repository
  repoFullName: text("repo_full_name").notNull(),
  repoId: bigint("repo_id", { mode: "number" }).notNull(),
  repoUrl: text("repo_url").notNull(),
  defaultBranch: text("default_branch").default("main"),

  // Metadata
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserGithubConfig = typeof userGithubConfigs.$inferSelect;
export type NewUserGithubConfig = typeof userGithubConfigs.$inferInsert;
