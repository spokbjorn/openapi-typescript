import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { MavenInput } from "../types";
import { downloadFile } from "./download";

const MAVEN_CACHE_DIR
  = "node_modules/.cache/vite-plugin-openapi-typescript/maven";
const MAVEN_CENTRAL = "https://repo1.maven.org/maven2";
const DEFAULT_EXTENSION = "yaml";

export function isMavenInput(input: unknown): input is MavenInput {
  return (
    typeof input === "object"
    && input !== null
    && !(input instanceof URL)
    && "groupId" in input
    && "artifactId" in input
    && "version" in input
  );
}

export function getMavenArtifactFilename(maven: MavenInput): string {
  const ext = maven.extension || DEFAULT_EXTENSION;
  return `${maven.artifactId}-${maven.version}.${ext}`;
}

export function getMavenRepoPath(maven: MavenInput): string {
  const groupPath = maven.groupId.replace(/\./g, "/");
  const filename = getMavenArtifactFilename(maven);
  return `${groupPath}/${maven.artifactId}/${maven.version}/${filename}`;
}

export function getLocalMavenPath(maven: MavenInput): string {
  return path.join(os.homedir(), ".m2", "repository", getMavenRepoPath(maven));
}

export function getCacheDir(root: string): string {
  return path.join(root, MAVEN_CACHE_DIR);
}

export function getCachePath(maven: MavenInput, root: string): string {
  return path.join(getCacheDir(root), getMavenRepoPath(maven));
}

export function getRemoteMavenUrl(maven: MavenInput): string {
  const baseUrl = (maven.repository || MAVEN_CENTRAL).replace(/\/+$/, "");
  return `${baseUrl}/${getMavenRepoPath(maven)}`;
}

export async function resolveMavenArtifact(
  maven: MavenInput,
  root: string,
): Promise<string> {
  const localPath = getLocalMavenPath(maven);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const cachePath = getCachePath(maven, root);
  if (fs.existsSync(cachePath)) {
    return cachePath;
  }

  const url = getRemoteMavenUrl(maven);
  await downloadFile(url, cachePath);
  return cachePath;
}
