import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import type { SchemaConfig } from "../types";
import { resolveInput } from "./url";
import { isMavenInput, resolveMavenArtifact } from "./maven";

export async function generateTypes(
  config: SchemaConfig,
  root: string,
  log: (msg: string) => void,
): Promise<void> {
  let resolvedInput: string | URL;

  if (isMavenInput(config.input)) {
    const artifactPath = await resolveMavenArtifact(config.input, root);
    resolvedInput = pathToFileURL(artifactPath);
  }
  else {
    resolvedInput = resolveInput(config.input, root);
  }

  const outputPath = path.resolve(root, config.output);

  log(`Generating types: ${String(config.input)} → ${config.output}`);

  try {
    const ast = await openapiTS(resolvedInput, config.openapiTS);
    const contents = astToString(ast);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, contents, "utf-8");

    log(`Types written to ${config.output}`);
  }
  catch (err) {
    throw new Error(
      `Failed to generate types for "${String(config.input)}": ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
}
