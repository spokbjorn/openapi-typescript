import { XMLParser } from "fast-xml-parser";

export interface MavenSnapshot {
  timestamp: string
  buildNumber: number
}

const SNAPSHOT_SUFFIX = "-SNAPSHOT";

function parseNumber(value: unknown): number {
  const result = Number.parseInt(String(value), 10);
  return Number.isNaN(result) ? 0 : result;
}

export function parseMavenMetadata(xml: string): MavenSnapshot {
  const parser = new XMLParser({ parseTagValue: false });
  const parsed = parser.parse(xml) as {
    metadata?: {
      versioning?: {
        snapshot?: {
          timestamp?: unknown
          buildNumber?: unknown
        }
      }
    }
  };

  const snapshot = parsed.metadata?.versioning?.snapshot ?? {};
  return {
    timestamp: String(snapshot.timestamp ?? ""),
    buildNumber: parseNumber(snapshot.buildNumber),
  };
}

export function isSnapshotVersion(version: string): boolean {
  return version.endsWith(SNAPSHOT_SUFFIX);
}

export function resolveSnapshotVersion(
  version: string,
  snapshot: MavenSnapshot,
): string {
  const base = version.slice(0, -SNAPSHOT_SUFFIX.length);
  return `${base}-${snapshot.timestamp}-${snapshot.buildNumber}`;
}
