import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import type { AddressInfo } from "node:net";
import { resolveMavenArtifact } from "../src/maven";
import { generateTypes } from "../src/generate";

const YAML_SPEC = `
  openapi: "3.0.3"
  info:
    title: Remote API
    version: "1.0.0"
  paths: {}
  components:
    schemas:
      Widget:
        type: object
        properties:
          id:
            type: integer
`;

const SNAPSHOT_METADATA = `
  <?xml version="1.0" encoding="UTF-8"?>
  <metadata>
    <groupId>com.example</groupId>
    <artifactId>snapshot-api</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <versioning>
      <snapshot>
        <timestamp>20240102.140000</timestamp>
        <buildNumber>3</buildNumber>
      </snapshot>
      <lastUpdated>20240102140000</lastUpdated>
    </versioning>
  </metadata>
`;

const SNAPSHOT_YAML_SPEC = `
  openapi: "3.0.3"
  info:
    title: Snapshot API
    version: "1.0.0-SNAPSHOT"
  paths: {}
  components:
    schemas:
      SnapshotWidget:
        type: object
        properties:
          id:
            type: integer
`;

describe("Maven remote integration", () => {
  let server: http.Server;
  let port: number;
  let tmpDir: string;
  let logs: string[];

  beforeAll(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "int-maven-"));

    server = http.createServer((req, res) => {
      if (req.url === "/com/example/test-api/1.0.0/test-api-1.0.0.yaml") {
        res.writeHead(200, { "Content-Type": "text/yaml" });
        res.end(YAML_SPEC);
      }
      else if (
        req.url
        === "/com/example/snapshot-api/1.0.0-SNAPSHOT/maven-metadata.xml"
      ) {
        res.writeHead(200, { "Content-Type": "application/xml" });
        res.end(SNAPSHOT_METADATA);
      }
      else if (
        req.url
        === "/com/example/snapshot-api/1.0.0-SNAPSHOT/snapshot-api-1.0.0-20240102.140000-3.yaml"
      ) {
        res.writeHead(200, { "Content-Type": "text/yaml" });
        res.end(SNAPSHOT_YAML_SPEC);
      }
      else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise<void>(resolve => server.listen(0, resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    logs = [];
  });

  it("downloads artifact from remote when not in .m2 or cache", async () => {
    const result = await resolveMavenArtifact(
      {
        groupId: "com.example",
        artifactId: "test-api",
        version: "1.0.0",
        repository: `http://localhost:${port}/`,
      },
      tmpDir,
    );

    expect(fs.existsSync(result)).toBe(true);
    const content = fs.readFileSync(result, "utf-8");
    expect(content).toContain("Remote API");
  });

  it("generates types from a remote Maven artifact end-to-end", async () => {
    const outputFile = path.join(tmpDir, "generated/widget.ts");

    await generateTypes(
      {
        input: {
          groupId: "com.example",
          artifactId: "test-api",
          version: "1.0.0",
          repository: `http://localhost:${port}/`,
        },
        output: outputFile,
      },
      tmpDir,
      msg => logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("Widget");
    expect(logs.length).toBeGreaterThan(0);
  });

  it("throws when artifact is not found on remote", async () => {
    await expect(
      resolveMavenArtifact(
        {
          groupId: "com.example",
          artifactId: "nonexistent",
          version: "9.9.9",
          repository: `http://localhost:${port}/`,
        },
        tmpDir,
      ),
    ).rejects.toThrow(/404/);
  });

  it("throws when generating types from a nonexistent Maven artifact", async () => {
    await expect(
      generateTypes(
        {
          input: {
            groupId: "com.example",
            artifactId: "nonexistent",
            version: "9.9.9",
            repository: `http://localhost:${port}/`,
          },
          output: path.join(tmpDir, "generated/nope.ts"),
        },
        tmpDir,
        msg => logs.push(msg),
      ),
    ).rejects.toThrow(/404/);
  });

  it("resolves a SNAPSHOT artifact via maven-metadata.xml end-to-end", async () => {
    const result = await resolveMavenArtifact(
      {
        groupId: "com.example",
        artifactId: "snapshot-api",
        version: "1.0.0-SNAPSHOT",
        repository: `http://localhost:${port}/`,
      },
      tmpDir,
    );

    expect(fs.existsSync(result)).toBe(true);
    const content = fs.readFileSync(result, "utf-8");
    expect(content).toContain("Snapshot API");
  });

  it("generates types from a SNAPSHOT Maven artifact end-to-end", async () => {
    const outputFile = path.join(tmpDir, "generated/snapshot-widget.ts");

    await generateTypes(
      {
        input: {
          groupId: "com.example",
          artifactId: "snapshot-api",
          version: "1.0.0-SNAPSHOT",
          repository: `http://localhost:${port}/`,
        },
        output: outputFile,
      },
      tmpDir,
      msg => logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("SnapshotWidget");
    expect(logs.length).toBeGreaterThan(0);
  });
});
