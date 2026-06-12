import path from "node:path";
import { pathToFileURL } from "node:url";

export function isRemoteUrl(input: string | URL): boolean {
  if (input instanceof URL) {
    return input.protocol === "http:" || input.protocol === "https:";
  }
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  }
  catch {
    return false;
  }
}

export function resolveInput(input: string | URL, root: string): string | URL {
  if (input instanceof URL) {
    return input;
  }
  if (isRemoteUrl(input)) {
    return input;
  }
  const resolvedPath = path.resolve(root, input);
  return pathToFileURL(resolvedPath);
}
