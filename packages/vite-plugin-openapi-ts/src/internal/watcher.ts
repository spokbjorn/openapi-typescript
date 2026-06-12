import fs from "node:fs";
import type { SchemaConfig } from "../types";
import { isRemoteUrl, resolveInput } from "./url";
import { isMavenInput, getLocalMavenPath, getCachePath } from "./maven";

export function setupWatcher(
  config: SchemaConfig,
  root: string,
  onChange: () => void,
): { close: () => void } | null {
  if (isMavenInput(config.input)) {
    const localPath = getLocalMavenPath(config.input);
    const cachePath = getCachePath(config.input, root);
    const resolvedPath = fs.existsSync(localPath)
      ? localPath
      : fs.existsSync(cachePath)
        ? cachePath
        : null;
    if (!resolvedPath) return null;

    return createWatcher(resolvedPath, onChange);
  }

  if (isRemoteUrl(config.input)) {
    return null;
  }

  const resolvedInput = resolveInput(config.input, root);
  const resolvedPath =
    typeof resolvedInput === "string" ? resolvedInput : resolvedInput.pathname;

  if (!fs.existsSync(resolvedPath)) {
    return null;
  }

  return createWatcher(resolvedPath, onChange);
}

function createWatcher(
  filePath: string,
  onChange: () => void,
): { close: () => void } {
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const watcher = fs.watch(filePath, (eventType) => {
    if (eventType !== "change") return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(onChange, 200);
  });

  return {
    close: () => {
      watcher.close();
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
