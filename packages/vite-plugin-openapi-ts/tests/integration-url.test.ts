import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import type { AddressInfo } from "node:net";
import { generateTypes } from "../src/internal/generate";

const YAML_SPEC = `
  openapi: "3.0.3"
  info:
    title: URL Remote API
    version: "2.0.0"
  paths: {}
  components:
    schemas:
      Gadget:
        type: object
        properties:
          name:
            type: string
`;

describe("URL remote integration", () => {
  let server: http.Server;
  let port: number;
  let tmpDir: string;
  let logs: string[];

  beforeAll(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "int-url-"));

    server = http.createServer((req, res) => {
      if (req.url === "/spec.yaml") {
        res.writeHead(200, { "Content-Type": "text/yaml" });
        res.end(YAML_SPEC);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => {
    server.close();
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  beforeEach(() => {
    logs = [];
  });

  it("generates types from a remote URL", async () => {
    const outputFile = path.join(tmpDir, "generated/gadget.ts");

    await generateTypes(
      {
        input: `http://localhost:${port}/spec.yaml`,
        output: outputFile,
      },
      tmpDir,
      (msg) => logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("Gadget");
    expect(logs.length).toBeGreaterThan(0);
  });

  it("throws when remote URL returns 404", async () => {
    await expect(
      generateTypes(
        {
          input: `http://localhost:${port}/nonexistent.yaml`,
          output: path.join(tmpDir, "generated/missing.ts"),
        },
        tmpDir,
        (msg) => logs.push(msg),
      ),
    ).rejects.toThrow();
  });
});
