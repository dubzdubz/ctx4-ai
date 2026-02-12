import matter from "gray-matter";
import { RESOURCES_DIR_NAME, SKILLS_DIR_NAME } from "@/lib/sandbox/constants";
import { sandboxManager } from "@/lib/sandbox/manager";

/**
 * Reads a resource markdown file from the sandbox and returns its content (frontmatter stripped).
 * Returns empty string if file doesn't exist or can't be read.
 */
export async function readResourceContent(name: string): Promise<string> {
  try {
    const raw = await sandboxManager.readFile(
      `${RESOURCES_DIR_NAME}/${name}.md`,
    );
    if (!raw) return "";
    const { content } = matter(raw);
    return content.trim();
  } catch {
    return "";
  }
}

export interface IndexEntry {
  name: string;
  description: string;
}

/**
 * Scans the resources directory in the sandbox for markdown files with frontmatter
 * and returns an array of resource definitions.
 */
export async function scanContextResources(): Promise<IndexEntry[]> {
  try {
    const { stdout, exitCode } = await sandboxManager.runCommand(
      `find ${RESOURCES_DIR_NAME} -maxdepth 1 -name '*.md' -type f 2>/dev/null`,
    );

    if (exitCode !== 0 || !stdout.trim()) return [];

    const files = stdout.trim().split("\n").filter(Boolean);
    const resources: IndexEntry[] = [];

    for (const filePath of files) {
      try {
        const raw = await sandboxManager.readFile(filePath);
        if (!raw) continue;

        const { data } = matter(raw);
        if (!data.name || !data.description) {
          console.warn(
            `Skipping resource ${filePath}: missing required frontmatter (name, description)`,
          );
          continue;
        }

        resources.push({
          name: data.name,
          description: data.description,
        });
      } catch (error) {
        console.warn(
          `Skipping resource ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return resources;
  } catch (error) {
    console.error("Error scanning context resources:", error);
    return [];
  }
}

/**
 * Scans the skills directory in the sandbox for subdirectories containing SKILL.md files
 * and returns an array of index entries with name + description.
 */
export async function scanSkills(): Promise<IndexEntry[]> {
  try {
    const { stdout, exitCode } = await sandboxManager.runCommand(
      `find ${SKILLS_DIR_NAME} -mindepth 2 -maxdepth 2 -name 'SKILL.md' -type f 2>/dev/null`,
    );

    if (exitCode !== 0 || !stdout.trim()) return [];

    const skillFiles = stdout.trim().split("\n").filter(Boolean);
    const skills: IndexEntry[] = [];

    for (const filePath of skillFiles) {
      // Extract the skill directory name from path like "skills/my-skill/SKILL.md"
      const parts = filePath.split("/");
      const dirName = parts[1];

      try {
        const raw = await sandboxManager.readFile(filePath);
        if (!raw) {
          skills.push({ name: dirName, description: "" });
          continue;
        }

        const { data } = matter(raw);
        skills.push({
          name: data.name || dirName,
          description: data.description || "",
        });
      } catch {
        skills.push({ name: dirName, description: "" });
      }
    }

    return skills;
  } catch {
    return [];
  }
}
