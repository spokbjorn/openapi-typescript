import { parseArgs } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { generateTypes } from "./generate";
import type { GeneratorOptions, SchemaConfig } from "./types";

const VERSION = "0.0.2-pre.0";

function printUsage(): void {
  console.log(`
Usage: openapi-typescript-generator [options]

Generate TypeScript types from OpenAPI specs.

Options:
  --input <path|url>      OpenAPI spec input (file path, URL, or omit to use config)
  --output <path>         Output file path (or omit to use config)
  --config <path>         Path to config file (default: openapi.config.json)
  --help                  Show this help message
  --version               Show version number

Config file (openapi.config.json):
  {
    "input": "./petstore.yaml",
    "output": "./src/generated/petstore.ts",
    "openapiTS": {}
  }

  Or an array for multiple schemas:
  [
    { "input": "./api-v1.yaml", "output": "./src/generated/v1.ts" },
    { "input": "./api-v2.yaml", "output": "./src/generated/v2.ts" }
  ]
`.trim());
}

function loadConfig(configPath: string): GeneratorOptions {
  const resolved = path.resolve(process.cwd(), configPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Config file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, "utf-8");
  const parsed = JSON.parse(raw);
  return parsed as GeneratorOptions;
}

function buildOptionsFromArgs(
  input?: string,
  output?: string,
): GeneratorOptions {
  if (!input || !output) {
    throw new Error("Both --input and --output are required when not using a config file");
  }
  return { input, output };
}

export async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      output: { type: "string" },
      config: { type: "string" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    strict: true,
  });

  if (values.help) {
    printUsage();
    process.exit(0);
  }

  if (values.version) {
    console.log(VERSION);
    process.exit(0);
  }

  let options: GeneratorOptions;

  if (values.input || values.output) {
    options = buildOptionsFromArgs(values.input, values.output);
  }
  else {
    const configPath = values.config || "openapi.config.json";
    options = loadConfig(configPath);
  }

  const configs: SchemaConfig[] = Array.isArray(options) ? options : [options];
  const root = process.cwd();
  const logger = (msg: string) => console.log(`[openapi-typescript-generator] ${msg}`);

  const results = await Promise.allSettled(
    configs.map(config => generateTypes(config, root, logger)),
  );

  let hasErrors = false;
  for (const result of results) {
    if (result.status === "rejected") {
      console.error(
        `[openapi-typescript-generator] ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
      );
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  }
}

const isMainModule
  = process.argv[1]
    && import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
