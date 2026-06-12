# openapi-typescript

[![CI](https://github.com/spokbjorn/openapi-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/spokbjorn/openapi-typescript/actions/workflows/ci.yml)

Monorepo extending [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) with a Vite plugin integration and a type-safe Axios client.

## Packages

| Package                                                                                  | Description                                                    | Docs                                                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| [`@spokbjorn/vite-plugin-openapi-typescript`](./packages/vite-plugin-openapi-typescript) | Vite plugin that generates TypeScript types from OpenAPI specs | [docs/vite-plugin-openapi-typescript](docs/vite-plugin-openapi-typescript/README.md) |
| [`@spokbjorn/axios-openapi-typescript`](./packages/axios-openapi-typescript)             | Axios extension for type-safe OpenAPI calls                    | [docs/axios-openapi-typescript](docs/axios-openapi-typescript/README.md) |

## AI Disclaimer

This project was developed with the assistance of AI tools (specifically, OpenCode by Anomaly) to aid in code generation and development tasks.
