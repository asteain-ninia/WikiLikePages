import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function createTemplateRegistry(handlers) {
  const registry = new Map();

  for (const handler of handlers) {
    registry.set(handler.templateName, handler.build);
  }

  return registry;
}

export async function loadTemplateHandlers(templatesDir) {
  const entries = await readdir(templatesDir, { withFileTypes: true });
  const handlers = [];

  for (const entry of entries) {
    if (!entry.isFile() || !/\.js$/i.test(entry.name)) {
      continue;
    }

    const modulePath = pathToFileURL(join(templatesDir, entry.name)).href;
    const mod = await import(modulePath);

    if (typeof mod.templateName === "string" && typeof mod.build === "function") {
      handlers.push({ templateName: mod.templateName, build: mod.build });
    }
  }

  return createTemplateRegistry(handlers);
}

export function applyTemplateHandlers(templates, registry) {
  if (!registry || registry.size === 0) {
    return [];
  }

  return templates
    .map((template) => {
      const handler = registry.get(template.name);
      if (!handler) {
        return null;
      }

      return handler(template);
    })
    .filter(Boolean);
}
