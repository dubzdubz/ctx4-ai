import { App, Octokit } from "octokit";

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

/**
 * Exchange a GitHub OAuth code for a user access token.
 *
 * This is used during the GitHub App installation callback when
 * "Request user authorization (OAuth) during installation" is enabled.
 * The code proves which GitHub user triggered the installation.
 */
export async function exchangeCodeForUserToken(code: string): Promise<string> {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing GITHUB_APP_CLIENT_ID or GITHUB_APP_CLIENT_SECRET env vars",
    );
  }

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(
      `GitHub OAuth error: ${data.error_description || data.error}`,
    );
  }

  return data.access_token;
}

/**
 * Verify that a GitHub user has access to a specific installation.
 *
 * Calls GET /user/installations with the user's own GitHub token and checks
 * whether the given installation_id appears in the results. This prevents
 * installation hijacking — a user can only link installations they have access to.
 */
export async function verifyUserOwnsInstallation(
  userToken: string,
  installationId: number,
): Promise<boolean> {
  const octokit = new Octokit({ auth: userToken });

  try {
    const installations = await octokit.paginate(
      "GET /user/installations",
      { per_page: 100 },
      (response) => response.data,
    );

    return installations.some(
      (installation) => installation.id === installationId,
    );
  } catch {
    return false;
  }
}

/**
 * Get the authenticated GitHub user's profile from a user access token.
 */
export async function getGitHubUser(
  userToken: string,
): Promise<{ id: number; login: string }> {
  const octokit = new Octokit({ auth: userToken });
  const { data } = await octokit.rest.users.getAuthenticated();
  return { id: data.id, login: data.login };
}
