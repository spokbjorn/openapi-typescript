import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { generateTypes } from "../src/internal";

const PETSTORE_YAML = `openapi: "3.0.3"
info:
  title: Swagger Petstore
  version: "1.0.0"
paths:
  /pet/{petId}:
    get:
      operationId: getPetById
      parameters:
        - name: petId
          in: path
          required: true
          schema:
            type: integer
            format: int64
      responses:
        "200":
          description: successful operation
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Pet"
        "404":
          description: Pet not found
components:
  schemas:
    Pet:
      type: object
      required:
        - name
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
        tag:
          type: string
    Error:
      type: object
      properties:
        code:
          type: integer
          format: int32
        message:
          type: string
`;

describe("integration", () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "openapi-ts-test-"));
    fs.writeFileSync(
      path.join(tmpDir, "petstore.yaml"),
      PETSTORE_YAML,
      "utf-8",
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("generates TypeScript types from an OpenAPI spec", async () => {
    const outDir = path.join(tmpDir, "generated");
    const outputFile = path.join(outDir, "petstore.ts");
    const logs: string[] = [];

    await generateTypes(
      { input: path.join(tmpDir, "petstore.yaml"), output: outputFile },
      tmpDir,
      msg => logs.push(msg),
    );

    expect(fs.existsSync(outputFile)).toBe(true);

    const contents = fs.readFileSync(outputFile, "utf-8");
    expect(contents).toContain("paths");
    expect(contents).toContain("components");
    expect(contents).toContain("Pet");
    expect(contents).toContain("Error");
    expect(logs.length).toBeGreaterThan(0);
  });
});
