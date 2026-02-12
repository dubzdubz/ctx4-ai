-- Make repo fields nullable so we can save installation_id before repo selection
ALTER TABLE "user_github_configs" ALTER COLUMN "repo_full_name" DROP NOT NULL;
ALTER TABLE "user_github_configs" ALTER COLUMN "repo_id" DROP NOT NULL;
ALTER TABLE "user_github_configs" ALTER COLUMN "repo_url" DROP NOT NULL;
