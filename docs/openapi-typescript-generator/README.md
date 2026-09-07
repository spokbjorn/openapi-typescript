# @spokbjorn/openapi-typescript-generator

Standalone generator for TypeScript types from [OpenAPI](https://www.openapis.org/) 3.0/3.1 specifications. Provides both a **CLI tool** and a **programmatic API** built on [openapi-typescript](https://github.com/openapi-ts/openapi-typescript).

Use this when you need to generate types outside of Vite — for example with Jest, Webpack, Rollup, or in CI pipelines.

## Install

```bash
npm add -D @spokbjorn/openapi-typescript-generator
```

Requires `typescript@^5.0.0` as a peer dependency.

## CLI

### Quick start

```bash
npx openapi-typescript-generator --input ./petstore.yaml --output ./src/generated/petstore.ts
```

### Config file

Create an `openapi.config.json` in your project root:

```json
{
  "input": "./petstore.yaml",
  "output": "./src/generated/petstore.ts"
}
```

Then run with no flags:

```bash
npx openapi-typescript-generator
```

For multiple schemas, use an array:

```json
[
  { "input": "./schemas/v1.yaml", "output": "./src/generated/v1.ts" },
  { "input": "./schemas/v2.yaml", "output": "./src/generated/v2.ts" }
]
```

### CLI options

| Flag | Description |
|---|---|
| `--input <path\|url>` | OpenAPI spec input (file path, URL, or omit to use config) |
| `--output <path>` | Output file path (or omit to use config) |
| `--config <path>` | Path to config file (default: `openapi.config.json`) |
| `--help` | Show help message |
| `--version` | Show version number |

## Programmatic API

```ts
import { generateTypes } from "@spokbjorn/openapi-typescript-generator";

await generateTypes(
  {
    input: "./petstore.yaml",
    output: "./src/generated/petstore.ts",
  },
  process.cwd(),
  console.log,
);
```

### generateTypes

```ts
function generateTypes(
  config: SchemaConfig,
  root: string,
  log: (msg: string) => void,
): Promise<void>
```

Generates TypeScript types from an OpenAPI spec and writes the output file.

| Parameter | Type | Description |
|---|---|---|
| `config` | `SchemaConfig` | Input spec, output path, and optional openapi-typescript options |
| `root` | `string` | Project root directory (used to resolve relative paths) |
| `log` | `(msg: string) => void` | Logger function for status messages |

## Options

### SchemaConfig

| Option | Type | Required | Description |
|---|---|---|---|
| `input` | `string \| URL \| MavenInput` | Yes | Path, URL, or Maven artifact to an OpenAPI spec |
| `output` | `string` | Yes | Output path for the generated `.ts` file |
| `openapiTS` | `OpenAPITSOptions` | No | Options forwarded to openapi-typescript |

### MavenInput

You can resolve an OpenAPI spec from a Maven repository. The artifact is checked in `~/.m2/repository` first, then the project cache, then downloaded from the remote repository.

| Option | Type | Required | Default | Description |
|---|---|---|---|---|
| `groupId` | `string` | Yes | — | Maven group ID |
| `artifactId` | `string` | Yes | — | Maven artifact ID |
| `version` | `string` | Yes | — | Maven version |
| `extension` | `string` | No | `"yaml"` | File extension (`yaml`, `yml`, `json`) |
| `repository` | `string` | No | Maven Central | Remote Maven repository URL |

When `version` ends with `-SNAPSHOT`, the generator fetches the version-level [`maven-metadata.xml`](https://maven.apache.org/ref/3.9.9/maven-repository-metadata/repository-metadata.html) from the repository to resolve the current timestamped snapshot (e.g. `1.0.0-SNAPSHOT` → `1.0.0-20240102.140000-3`). The metadata is always re-fetched so the latest snapshot is picked up.

```ts
import { generateTypes } from "@spokbjorn/openapi-typescript-generator";

await generateTypes(
  {
    input: {
      groupId: "com.example",
      artifactId: "my-api-spec",
      version: "1.0.0",
    },
    output: "./src/generated/api.ts",
  },
  process.cwd(),
  console.log,
);
```

### GeneratorOptions

The type accepted by the CLI config file. Either a single `SchemaConfig` or an array:

```ts
type GeneratorOptions = SchemaConfig | SchemaConfig[];
```

## Exported utilities

| Export | Description |
|---|---|
| `generateTypes` | Core generation function |
| `isRemoteUrl` | Check if an input is a remote HTTP(S) URL |
| `resolveInput` | Resolve a local path or pass through a remote URL |
| `downloadFile` | Download a file from a URL to a local path |
| `isMavenInput` | Type guard for `MavenInput` objects |
| `resolveMavenArtifact` | Resolve a Maven artifact (local → cache → remote) |
| `getMavenRepoPath` | Compute the Maven repository path for an artifact |
| `getLocalMavenPath` | Compute the local `~/.m2` path for an artifact |
| `getCacheDir` | Get the project cache directory |
| `getCachePath` | Get the cached artifact path |
| `getRemoteMavenUrl` | Get the remote download URL for an artifact |
| `getMavenArtifactFilename` | Get the artifact filename with extension |
| `getMetadataUrl` | Get the URL of the version-level `maven-metadata.xml` |
| `resolveSnapshotMetadata` | Fetch and return the remote `maven-metadata.xml` for a version |
| `resolveArtifactVersion` | Resolve `-SNAPSHOT` to a timestamped version or return the version as-is |
| `isSnapshotVersion` | Check if a version ends with `-SNAPSHOT` |
| `parseMavenMetadata` | Parse `maven-metadata.xml` into `{ timestamp, buildNumber }` |

## Use cases

### CI pipeline

Run the generator before tests to ensure types are up to date:

```yaml
# .github/workflows/ci.yml
- run: npx openapi-typescript-generator
- run: npm test
```

### Custom build plugin

Use the programmatic API to build a generator into your own bundler plugin:

```ts
import { generateTypes } from "@spokbjorn/openapi-typescript-generator";

// In your custom plugin's build hook:
await generateTypes(
  { input: "./api.yaml", output: "./src/generated/api.ts" },
  projectRoot,
  console.log,
);
```

### Shared config with Vite plugin

If your project uses both the Vite plugin and this CLI (e.g., Vite for dev and Jest for testing), both tools can read the same `openapi.config.json`:

```json
{
  "input": "./petstore.yaml",
  "output": "./src/generated/petstore.ts"
}
```

```ts
// vite.config.ts — Vite plugin reads the config automatically
import openapiTs from "@spokbjorn/vite-plugin-openapi-typescript";
export default defineConfig({
  plugins: [openapiTs()],
});
```

```bash
# CLI — for Jest or CI
npx openapi-typescript-generator
```

See the [vite-and-cli example](../../examples/vite-and-cli) for a complete working setup.
