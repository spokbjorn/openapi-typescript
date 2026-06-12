# @spokbjorn/vite-plugin-openapi-typescript

A Vite plugin that generates TypeScript types from [OpenAPI](https://www.openapis.org/) 3.0/3.1 specifications using [openapi-typescript](https://github.com/openapi-ts/openapi-typescript).

## Install

```bash
npm add -D @spokbjorn/vite-plugin-openapi-typescript
```

## Usage

### Single schema

```ts
// vite.config.ts
import { defineConfig } from "vite";
import openapiTs from "@spokbjorn/vite-plugin-openapi-typescript";

export default defineConfig({
  plugins: [
    openapiTs({
      input: "./path/to/schema.yaml",
      output: "./src/generated/api.ts",
    }),
  ],
});
```

### Multiple schemas

Pass an array of configs to generate types from several OpenAPI specs:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import openapiTs from "@spokbjorn/vite-plugin-openapi-typescript";

export default defineConfig({
  plugins: [
    openapiTs([
      {
        input: "./schemas/v1.yaml",
        output: "./src/generated/v1.ts",
      },
      {
        input: "https://api.example.com/openapi.json",
        output: "./src/generated/external.ts",
        openapiTS: {
          silent: true,
        },
      },
    ]),
  ],
});
```

### Maven artifact input

You can resolve an OpenAPI spec from a Maven repository. The artifact (a YAML or JSON file) is resolved from the local `~/.m2/repository` first, then the project cache, then downloaded from the remote repository.

#### Maven Central (default)

```ts
openapiTs({
  input: {
    groupId: "com.example",
    artifactId: "my-api-spec",
    version: "1.0.0",
  },
  output: "./src/generated/api.ts",
});
```

#### Custom repository

```ts
openapiTs({
  input: {
    groupId: "com.example",
    artifactId: "my-api-spec",
    version: "1.0.0",
    extension: "json",
    repository: "https://nexus.example.com/repository/maven-public/",
  },
  output: "./src/generated/api.ts",
});
```

### Remote URL

Pass a URL string directly as input. The spec is fetched at build time via `openapi-typescript`.

```ts
openapiTs({
  input: "https://api.example.com/openapi.json",
  output: "./src/generated/api.ts",
});
```

## Plugin behavior

| Hook              | Description                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `configResolved`  | Captures the Vite project root path                                                      |
| `buildStart`      | Generates types for all configured schemas (errors logged as warnings, non-blocking)     |
| `configureServer` | Sets up file watchers on local schema files for HMR; triggers full page reload on change |
| `closeBundle`     | Cleans up all file watchers                                                              |

File watching only applies to local file inputs. Remote URLs and Maven artifacts are not watched.

## Options

### SchemaConfig

| Option      | Type                          | Required | Description                                     |
| ----------- | ----------------------------- | -------- | ----------------------------------------------- |
| `input`     | `string \| URL \| MavenInput` | Yes      | Path, URL, or Maven artifact to an OpenAPI spec |
| `output`    | `string`                      | Yes      | Output path for the generated `.ts` file        |
| `openapiTS` | `OpenAPITSOptions`            | No       | Options forwarded to openapi-typescript         |

### MavenInput

| Option       | Type     | Required | Default                           | Description                            |
| ------------ | -------- | -------- | --------------------------------- | -------------------------------------- |
| `groupId`    | `string` | Yes      | —                                 | Maven group ID                         |
| `artifactId` | `string` | Yes      | —                                 | Maven artifact ID                      |
| `version`    | `string` | Yes      | —                                 | Maven version                          |
| `extension`  | `string` | No       | `"yaml"`                          | File extension (`yaml`, `yml`, `json`) |
| `repository` | `string` | No       | `https://repo1.maven.org/maven2/` | Remote Maven repository URL            |

### OpenAPITSOptions

All [openapi-typescript CLI flags](https://openapi-ts.dev/cli#flags) in camelCase form plus the [Node API options](https://openapi-ts.dev/node#options) such as `transform`, `postTransform`, `inject`, `silent`, etc.

## Integration with typed clients

Pair the generated types with a typed API client:

### axios-openapi-typescript

See [docs/axios-openapi-typescript](../axios-openapi-typescript/README.md) for full documentation.

### openapi-fetch

```ts
import createClient from "openapi-fetch";
import type { paths } from "./generated/api";

const client = createClient<paths>({ baseUrl: "https://api.example.com" });

const { data, error } = await client.GET("/pets/{id}", {
  params: { path: { id: "123" } },
});
```
