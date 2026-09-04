# openapi-typescript

[![CI](https://github.com/spokbjorn/openapi-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/spokbjorn/openapi-typescript/actions/workflows/ci.yml)

Monorepo extending [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) with a Vite plugin, a standalone CLI/generator, and a type-safe Axios client.

## Packages

| Package | Description | Docs |
| --- | --- | --- |
| [`@spokbjorn/vite-plugin-openapi-typescript`](./packages/vite-plugin-openapi-typescript) | Vite plugin that generates TypeScript types from OpenAPI specs | [docs/vite-plugin-openapi-typescript](docs/vite-plugin-openapi-typescript/README.md) |
| [`@spokbjorn/openapi-typescript-generator`](./packages/openapi-typescript-generator) | Standalone generator with CLI and programmatic API | [docs/openapi-typescript-generator](docs/openapi-typescript-generator/README.md) |
| [`@spokbjorn/axios-openapi-typescript`](./packages/axios-openapi-typescript) | Axios extension for type-safe OpenAPI calls | [docs/axios-openapi-typescript](docs/axios-openapi-typescript/README.md) |

## Examples

| Example | Description |
| --- | --- |
| [generator](./examples/generator) | Vite plugin with openapi-fetch |
| [axios](./examples/axios) | Vite plugin with Axios |
| [vite-and-cli](./examples/vite-and-cli) | Using the Vite plugin and CLI together (e.g., Vite + Jest) |

## AI Disclaimer

This project was developed with the assistance of AI tools (specifically, OpenCode by Anomaly) to aid in code generation and development tasks.
