# AGENTS.md

## Project

Monorepo extending [openapi-typescript](https://github.com/openapi-ts/openapi-typescript) with a Vite plugin and a type-safe Axios client.

### Packages

| Package | Description |
|---|---|
| `@spokbjorn/vite-plugin-openapi-typescript` | Vite plugin that generates TS types from OpenAPI specs at build/dev time |
| `@spokbjorn/axios-openapi-typescript` | Axios prototype extensions for type-safe HTTP calls (GET/POST/PUT/DELETE/PATCH/OPTIONS/HEAD + path param substitution) |

### Tooling packages

| Package | Description |
|---|---|
| `@spokbjorn/tsconfig` | Shared TypeScript base config |
| `@spokbjorn/eslint-config` | Shared ESLint flat config (typescript-eslint + @stylistic) |

## Tech Stack

- **Package manager**: pnpm workspaces
- **Language**: TypeScript (ES2022 target, ESNext modules, Bundler resolution)
- **Build**: tsup (dual CJS + ESM output)
- **Test**: Vitest (globals: true, testTimeout: 30s)
- **Lint**: ESLint 9 with flat config (typescript-eslint + @stylistic)
- **Git hooks**: husky + lint-staged

## Commands

| Command | Description |
|---|---|
| `pnpm build` | Build all public packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type-check all packages (tsc --noEmit) |
| `pnpm lint` | ESLint check |
| `pnpm format` | ESLint auto-fix |

## Project Structure

```
.
├── packages/
│   ├── vite-plugin-openapi-typescript/   # Vite plugin package
│   └── axios-openapi-typescript/         # Axios extension package
├── tools/
│   ├── tsconfig/                         # Shared TypeScript config
│   │   ├── package.json
│   │   └── base.json
│   └── eslint-config/                    # Shared ESLint config
│       ├── package.json
│       └── index.js
├── examples/
│   ├── generator/                        # Example: Vite + generator plugin
│   └── axios/                            # Example: Vite + Axios typed client
├── docs/
├── eslint.config.js                      # Root ESLint flat config
└── .editorconfig
```

## Code Conventions

- **Semicolons**: always
- **Quotes**: double
- **Indentation**: 2 spaces
- **Imports**: `import type` for type-only imports
- **Comments**: avoid it in source code
- **Exports**: prefer named exports, default export for the main plugin function
- **Error handling**: warn (not throw) for recoverable errors in the plugin
- **File naming**: kebab-case for files (`generate.ts`, `setup-watcher.ts`)

## Testing

- Tests live in `tests/` directory next to `src/`
- Vitest with `globals: true` (no need to import `describe`/`it`/`expect`)
- Tests follow the pattern: `describe("module name")` / `it("does something")`
- No test files in source packages — test files mirror source structure

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. `pnpm ci` — install
2. `pnpm lint` — ESLint
3. `pnpm typecheck` — TypeScript type-check
4. `pnpm test` — Vitest
5. `pnpm build` — tsup

## Editor Setup

### VSCode
Requires the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint). Config is in `.vscode/settings.json` — format-on-save enabled for TS/JS.

### WebStorm
ESLint is pre-configured in `.idea/jsLinters/gieslint.xml`. Enable "Run eslint --fix on save" in: **Settings → Tools → Actions on Save**.
