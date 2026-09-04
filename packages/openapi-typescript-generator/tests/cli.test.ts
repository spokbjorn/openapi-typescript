import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const PETSTORE_YAML = `openapi: "3.0.3"
info:
  title: Test Petstore
  version: "1.0.0"
paths: {}
components:
  schemas:
    Pet:
      type: object
      properties:
        name:
          type: string
`;

describe("CLI", () => {
  let tmpDir: string;
  let cliPath: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "cli-test-"));
    fs.writeFileSync(
      path.join(tmpDir, "petstore.yaml"),
      PETSTORE_YAML,
      "utf-8",
    );
    cliPath = path.resolve(__dirname, "../dist/cli.js");
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates types with --input and --output flags", async () => {
    const outputFile = path.join(tmpDir, "out/petstore.ts");

    const { stdout } = await exec(
      process.execPath,
      [cliPath, "--input", path.join(tmpDir, "petstore.yaml"), "--output", outputFile],
      { cwd: tmpDir },
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("Pet");
    expect(stdout).toContain("Generating types");
  });

  it("generates types from a config file", async () => {
    const outputFile = path.join(tmpDir, "out/config-petstore.ts");
    const config = {
      input: path.join(tmpDir, "petstore.yaml"),
      output: outputFile,
    };
    fs.writeFileSync(
      path.join(tmpDir, "openapi.config.json"),
      JSON.stringify(config),
      "utf-8",
    );

    const { stdout } = await exec(
      process.execPath,
      [cliPath, "--config", "openapi.config.json"],
      { cwd: tmpDir },
    );

    expect(fs.existsSync(outputFile)).toBe(true);
    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("Pet");
    expect(stdout).toContain("Generating types");
  });

  it("exits with code 1 on errors", async () => {
    try {
      await exec(
        process.execPath,
        [cliPath, "--input", "nonexistent.yaml", "--output", "/tmp/nope.ts"],
        { cwd: tmpDir },
      );
      expect.fail("Should have thrown");
    }
    catch (err: any) {
      expect(err.code).toBe(1);
    }
  });
});
