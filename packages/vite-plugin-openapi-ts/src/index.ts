import type { Plugin, ViteDevServer } from "vite";
import type { PluginOptions, SchemaConfig } from "./types";
import { generateTypes, setupWatcher } from "./internal";

const PLUGIN_NAME = "vite-plugin-openapi-typescript";

export type { PluginOptions, SchemaConfig, MavenInput } from "./types";

export default function openapiTs(options: PluginOptions): Plugin {
  const configs: SchemaConfig[] = Array.isArray(options) ? options : [options];
  const watchers: { close: () => void }[] = [];

  let root: string = "";

  return {
    name: PLUGIN_NAME,

    configResolved(resolvedConfig) {
      root = resolvedConfig.root;
    },

    async buildStart() {
      const logger = (msg: string) => {
        console.log(`[${PLUGIN_NAME}] ${msg}`);
      };

      const results = await Promise.allSettled(
        configs.map((config) => generateTypes(config, root, logger)),
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
