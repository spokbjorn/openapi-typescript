import type { Plugin, ViteDevServer } from "vite";
import fs from "node:fs";
import path from "node:path";
import type { PluginOptions, SchemaConfig, GeneratorOptions } from "./types";
import { generateTypes } from "@spokbjorn/openapi-typescript-generator";
import { setupWatcher } from "./internal/watcher";

const PLUGIN_NAME = "vite-plugin-openapi-typescript";
const DEFAULT_CONFIG_FILE = "openapi.config.json";

export type { PluginOptions, SchemaConfig, MavenInput } from "./types";

export default function openapiTs(options?: PluginOptions | string): Plugin {
  const watchers: { close: () => void }[] = [];
  let configs: SchemaConfig[] = [];
  let root: string = "";

  function loadConfigFile(configPath: string): GeneratorOptions {
    const resolved = path.resolve(root, configPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Config file not found: ${resolved}`);
    }
    const raw = fs.readFileSync(resolved, "utf-8");
    return JSON.parse(raw) as GeneratorOptions;
  }

  return {
    name: PLUGIN_NAME,

    configResolved(resolvedConfig) {
      root = resolvedConfig.root;

      if (!options) {
        const loaded = loadConfigFile(DEFAULT_CONFIG_FILE);
        configs = Array.isArray(loaded) ? loaded : [loaded];
      }
      else if (typeof options === "string") {
        const loaded = loadConfigFile(options);
        configs = Array.isArray(loaded) ? loaded : [loaded];
      }
      else {
        configs = Array.isArray(options) ? options : [options];
      }
    },

    async buildStart() {
      const logger = (msg: string) => {
        console.log(`[${PLUGIN_NAME}] ${msg}`);
      };

      const results = await Promise.allSettled(
        configs.map(config => generateTypes(config, root, logger)),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          this.warn(
            `[${PLUGIN_NAME}] ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`,
          );
        }
      }
    },

    configureServer(server: ViteDevServer) {
      const onChange = (config: SchemaConfig) => {
        const logger = (msg: string) => {
          server.config.logger.info(`[${PLUGIN_NAME}] ${msg}`);
        };

        generateTypes(config, root, logger)
          .then(() => {
            server.ws.send({ type: "full-reload" });
          })
          .catch((err) => {
            server.config.logger.warn(
              `[${PLUGIN_NAME}] ${err instanceof Error ? err.message : String(err)}`,
            );
          });
      };

      for (const config of configs) {
        const watcher = setupWatcher(config, root, () => onChange(config));
        if (watcher) {
          watchers.push(watcher);
        }
      }
    },

    closeBundle() {
      for (const watcher of watchers) {
        watcher.close();
      }
      watchers.length = 0;
    },
  };
}
