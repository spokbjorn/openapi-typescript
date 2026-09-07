import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { MavenInput } from "./types";
import { downloadFile } from "./download";
import { isSnapshotVersion, parseMavenMetadata, resolveSnapshotVersion } from "./maven-metadata";

const MAVEN_CACHE_DIR
  = "node_modules/.cache/openapi-typescript-generator/maven";
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

function getMavenArtifactFilenameWithVersion(
  maven: MavenInput,
  version: string,
): string {
  const ext = maven.extension || DEFAULT_EXTENSION;
  return `${maven.artifactId}-${version}.${ext}`;
}

export function getMavenArtifactFilename(maven: MavenInput): string {
  return getMavenArtifactFilenameWithVersion(maven, maven.version);
}

export function getMavenRepoPath(maven: MavenInput, version?: string): string {
  const groupPath = maven.groupId.replace(/\./g, "/");
  const filename = getMavenArtifactFilenameWithVersion(
    maven,
    version ?? maven.version,
  );
  return `${groupPath}/${maven.artifactId}/${maven.version}/${filename}`;
}

export function getLocalMavenPath(
  maven: MavenInput,
  version?: string,
): string {
  return path.join(
    os.homedir(),
    ".m2",
    "repository",
    getMavenRepoPath(maven, version),
  );
}

export function getCacheDir(root: string): string {
  return path.join(root, MAVEN_CACHE_DIR);
}

export function getCachePath(
  maven: MavenInput,
  root: string,
  version?: string,
): string {
  return path.join(getCacheDir(root), getMavenRepoPath(maven, version));
}

export function getRemoteMavenUrl(
  maven: MavenInput,
  version?: string,
): string {
  const baseUrl = (maven.repository || MAVEN_CENTRAL).replace(/\/+$/, "");
  return `${baseUrl}/${getMavenRepoPath(maven, version)}`;
}

export function getMetadataUrl(maven: MavenInput): string {
  const baseUrl = (maven.repository || MAVEN_CENTRAL).replace(/\/+$/, "");
  const groupPath = maven.groupId.replace(/\./g, "/");
  return `${baseUrl}/${groupPath}/${maven.artifactId}/${maven.version}/maven-metadata.xml`;
}

export async function resolveSnapshotMetadata(
  maven: MavenInput,
): Promise<string> {
  const url = getMetadataUrl(maven);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Maven metadata ${url}: ${response.status} ${response.statusText}`,
    );
  }
  return response.text();
}

export async function resolveArtifactVersion(
  maven: MavenInput,
): Promise<string> {
  if (!isSnapshotVersion(maven.version)) {
    return maven.version;
  }
  const xml = await resolveSnapshotMetadata(maven);
  return resolveSnapshotVersion(maven.version, parseMavenMetadata(xml));
}

export async function resolveMavenArtifact(
  maven: MavenInput,
  root: string,
): Promise<string> {
  const resolvedVersion = await resolveArtifactVersion(maven);

  const localPath = getLocalMavenPath(maven, resolvedVersion);
  if (fs.existsSync(localPath)) {
    return localPath;
  }

  const cachePath = getCachePath(maven, root, resolvedVersion);
  if (fs.existsSync(cachePath)) {
    return cachePath;
  }

  const url = getRemoteMavenUrl(maven, resolvedVersion);
  await downloadFile(url, cachePath);
  return cachePath;
}
