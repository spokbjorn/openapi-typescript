# @spokbjorn/axios-openapi-typescript

Axios extension for type-safe OpenAPI calls using [openapi-typescript](https://github.com/openapi-ts/openapi-typescript).

Extends the Axios prototype with typed HTTP methods and a `typed()` setup method, returning a discriminated union response instead of throwing on HTTP errors.

## Install

```bash
npm add @spokbjorn/axios-openapi-typescript
```

Requires `axios@^1.0.0` and `typescript@^5.0.0` as peer dependencies.

## Setup

Import the package once for its side effect — it patches the Axios prototype globally:

```ts
import "@spokbjorn/axios-openapi-typescript";
import axios from "axios";
import type { paths } from "./generated/api";

const client = axios.create().typed<paths>({
  baseURL: "https://api.example.com",
});
```

## Usage

### Typed GET

```ts
const { data, error } = await client.GET("/pets/{id}", {
  pathParams: { id: "123" },
  params: { limit: 10 },
});

if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

### Typed POST

```ts
const { data, error } = await client.POST("/pets", {
  name: "Rex",
  species: "dog",
});
```

### Typed PUT, PATCH, DELETE, OPTIONS, HEAD

```ts
await client.PUT("/pets/{id}", body, { pathParams: { id: "123" } });
await client.PATCH("/pets/{id}", body, { pathParams: { id: "123" } });
await client.DELETE("/pets/{id}", { pathParams: { id: "123" } });
await client.OPTIONS("/pets/{id}", { pathParams: { id: "123" } });
await client.HEAD("/pets/{id}");
```

## Response handling

All typed methods return a discriminated union instead of throwing on HTTP errors:

```ts
type AxiosOpenApiResponse<Op> =
  | { data: SuccessData; error?: never; response: AxiosResponse }
  | { data?: never; error: ErrorData; response: AxiosResponse };
```

- **2xx responses** → `{ data, error: undefined, response }`
- **4xx/5xx responses** (Axios errors with a response) → `{ data: undefined, error, response }`
- **Network errors** (no response) → thrown as-is

## API

### `client.typed<Paths>(options?)`

Configures an Axios instance for typed OpenAPI usage.

| Option    | Type     | Description                                       |
| --------- | -------- | ------------------------------------------------- |
| `baseURL` | `string` | Optional base URL set on `axios.defaults.baseURL` |

Installs a request interceptor that replaces `{param}` placeholders in the URL with values from `config.pathParams`. Idempotent — calling `.typed()` multiple times on the same instance does not re-add interceptors.

Returns the same `AxiosInstance` (with typed methods).

### `OpenApiConfig<Op>`

Typed request config for a specific operation.

| Property                                 | Type                      | Description                                             |
| ---------------------------------------- | ------------------------- | ------------------------------------------------------- |
| `pathParams`                             | `Record<string, unknown>` | Path parameters substituted into the URL template       |
| `params`                                 | `QueryParams<Op>`         | Typed query parameters (inferred from the OpenAPI spec) |
| (all other `AxiosRequestConfig` options) |                           | Standard Axios config (headers, timeout, etc.)          |

### Exported types

| Type                               | Description                                                        |
| ---------------------------------- | ------------------------------------------------------------------ |
| `PathsWithMethod<P, M>`            | Extracts paths from a `paths` record that have a given HTTP method |
| `OpenApiConfig<Op>`                | Typed Axios request config with `pathParams` and typed `params`    |
| `AxiosOpenApiResponse<Op>`         | Discriminated union of success or error response                   |
| `AxiosOpenApi<Paths>`              | Interface extending `AxiosInstance` with typed HTTP methods        |
| `RequestBody<Op>`                  | Typed request body for an operation                                |
| `SuccessResponse`, `ErrorResponse` | Helpers re-exported from `openapi-typescript-helpers`              |
