import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { generateTypes } from "../src/internal/generate";

describe("generateTypes with MavenInput", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "maven-gen-test-"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates types from a cached Maven artifact", async () => {
    const maven = {
      groupId: "com.example",
      artifactId: "gen-test-api",
      version: "1.0.0",
    };

    const cachePath = path.join(
      tmpDir,
      "node_modules/.cache/vite-plugin-openapi-typescript/maven/com/example/gen-test-api/1.0.0/gen-test-api-1.0.0.yaml",
    );
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    const yamlSpec = [
      'openapi: "3.0.3"',
      "info:",
      "  title: Test API",
      '  version: "1.0.0"',
      "paths: {}",
      "components:",
      "  schemas:",
      "    Pet:",
      "      type: object",
      "      properties:",
      "        name:",
      "          type: string",
    ].join("\n");
    fs.writeFileSync(cachePath, yamlSpec, "utf-8");

    const outputFile = path.join(tmpDir, "generated/api.ts");
    const logs: string[] = [];

    await generateTypes({ input: maven, output: outputFile }, tmpDir, (msg) =>
      logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("Pet");
    expect(logs.length).toBeGreaterThan(0);
  });

  it("generates types for JSON Maven artifact", async () => {
    const maven = {
      groupId: "com.example",
      artifactId: "json-test-api",
      version: "2.0.0",
      extension: "json",
    };

    const cachePath = path.join(
      tmpDir,
      "node_modules/.cache/vite-plugin-openapi-typescript/maven/com/example/json-test-api/2.0.0/json-test-api-2.0.0.json",
    );
    fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    const spec = {
      openapi: "3.0.3",
      info: { title: "JSON API", version: "2.0.0" },
      paths: {},
      components: {
        schemas: {
          User: { type: "object", properties: { id: { type: "integer" } } },
        },
      },
    };
    fs.writeFileSync(cachePath, JSON.stringify(spec, null, 2), "utf-8");

    const outputFile = path.join(tmpDir, "generated/json-api.ts");
    const logs: string[] = [];

    await generateTypes({ input: maven, output: outputFile }, tmpDir, (msg) =>
      logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("User");
  });
});
