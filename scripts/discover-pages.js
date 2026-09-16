import { readdirSync } from "node:fs";
import { resolve } from "node:path";

const templates = resolve(import.meta.dirname, "../src/templates");

export function discoverPages() {
  return readdirSync(templates, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".twig"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name }) => ({
      template: resolve(templates, name),
      output: name.replace(/\.twig$/, ".html")
    }));
}
