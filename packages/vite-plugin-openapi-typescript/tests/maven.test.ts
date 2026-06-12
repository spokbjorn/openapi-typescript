import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  isMavenInput,
  getMavenArtifactFilename,
  getMavenRepoPath,
  getLocalMavenPath,
  getCacheDir,
  getCachePath,
  getRemoteMavenUrl,
  resolveMavenArtifact,
} from "../src/internal/maven";

const MAVEN_CENTRAL = "https://repo1.maven.org/maven2";

describe("isMavenInput", () => {
  it("returns true for a valid MavenInput object", () => {
    expect(
      isMavenInput({
        groupId: "com.example",
        artifactId: "my-api",
        version: "1.0.0",
      }),
    ).toBe(true);
  });

  it("returns true for a MavenInput with all optional fields", () => {
    expect(
      isMavenInput({
        groupId: "com.example",
        artifactId: "my-api",
        version: "1.0.0",
        extension: "json",
        repository: "https://nexus.company.com/repository/public/",
      }),
    ).toBe(true);
  });

  it("returns false for a URL object", () => {
    expect(isMavenInput(new URL("https://example.com/api.yaml"))).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isMavenInput("./spec.yaml")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isMavenInput(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isMavenInput(undefined)).toBe(false);
  });
});

describe("getMavenArtifactFilename", () => {
  it("defaults to yaml extension", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
    };
    expect(getMavenArtifactFilename(maven)).toBe("my-api-1.0.0.yaml");
  });

  it("uses custom extension when provided", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
      extension: "json",
    };
    expect(getMavenArtifactFilename(maven)).toBe("my-api-1.0.0.json");
  });
});

describe("getMavenRepoPath", () => {
  it("computes correct Maven repo path", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
    };
    expect(getMavenRepoPath(maven)).toBe(
      "com/example/my-api/1.0.0/my-api-1.0.0.yaml",
    );
  });
});

describe("getLocalMavenPath", () => {
  it("computes correct local ~/.m2 path", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
    };
    const expected = path.join(
      os.homedir(),
      ".m2",
      "repository",
      "com/example/my-api/1.0.0/my-api-1.0.0.yaml",
    );
    expect(getLocalMavenPath(maven)).toBe(expected);
  });
});

describe("getCacheDir", () => {
  it("returns cache dir under root", () => {
    const root = "/project";
    const result = getCacheDir(root);
    expect(result).toBe(
      path.join(
        root,
        "node_modules/.cache/vite-plugin-openapi-typescript/maven",
      ),
    );
  });
});

describe("getCachePath", () => {
  it("computes correct cache path", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
    };
    const root = "/project";
    const result = getCachePath(maven, root);
    expect(result).toBe(
      path.join(
        root,
        "node_modules/.cache/vite-plugin-openapi-typescript/maven/com/example/my-api/1.0.0/my-api-1.0.0.yaml",
      ),
    );
  });
});

describe("getRemoteMavenUrl", () => {
  it("defaults to Maven Central", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
    };
    expect(getRemoteMavenUrl(maven)).toBe(
      `${MAVEN_CENTRAL}/com/example/my-api/1.0.0/my-api-1.0.0.yaml`,
    );
  });

  it("uses custom repository URL", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
      repository: "https://nexus.company.com/repository/public/",
    };
    expect(getRemoteMavenUrl(maven)).toBe(
      "https://nexus.company.com/repository/public/com/example/my-api/1.0.0/my-api-1.0.0.yaml",
    );
  });

  it("strips trailing slash from repository URL", () => {
    const maven = {
      groupId: "com.example",
      artifactId: "my-api",
      version: "1.0.0",
      repository: "https://nexus.company.com/repo/",
    };
    expect(getRemoteMavenUrl(maven)).toBe(
      "https://nexus.company.com/repo/com/example/my-api/1.0.0/my-api-1.0.0.yaml",
    );
  });
});

describe("resolveMavenArtifact", () => {
  let tmpDir: string;
  let mavenDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "maven-test-"));
    mavenDir = path.join(
      tmpDir,
      "node_modules/.cache/vite-plugin-openapi-typescript/maven",
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("finds artifact in local .m2", async () => {
    const maven = {
      groupId: "com.example",
      artifactId: "test-api",
      version: "1.0.0",
    };
    const localM2Path = path.join(
      os.homedir(),
      ".m2/repository/com/example/test-api/1.0.0/test-api-1.0.0.yaml",
    );

    if (fs.existsSync(localM2Path)) {
      const result = await resolveMavenArtifact(maven, tmpDir);
      expect(result).toBe(localM2Path);
    }
  });

  it("finds artifact in project cache", async () => {
    const cachePath = path.join(
      mavenDir,
      "com/example/cached-api/1.0.0/cached-api-1.0.0.yaml",
    );
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    fs.writeFileSync(
      cachePath,
      "openapi: 3.0.3\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}",
      "utf-8",
    );

    const maven = {
      groupId: "com.example",
      artifactId: "cached-api",
      version: "1.0.0",
    };
    const result = await resolveMavenArtifact(maven, tmpDir);
    expect(result).toBe(cachePath);
  });
});
