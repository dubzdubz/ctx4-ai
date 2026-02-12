import { App } from "octokit";

function getGithubApp(): App {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("Missing GITHUB_APP_ID or GITHUB_APP_PRIVATE_KEY env vars");
  }

  return new App({ appId, privateKey });
}

let _app: App | null = null;

export function githubApp(): App {
  if (!_app) {
    _app = getGithubApp();
  }
  return _app;
}

export async function getOctokitForInstallation(installationId: number) {
  return await githubApp().getInstallationOctokit(installationId);
}

export async function getInstallationToken(
  installationId: number,
): Promise<string> {
  const octokit = await getOctokitForInstallation(installationId);
  const { token } = (await octokit.auth({ type: "installation" })) as {
    token: string;
  };
  return token;
}

export async function listAccessibleRepos(installationId: number) {
  const octokit = await getOctokitForInstallation(installationId);
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
  return data.repositories;
}
