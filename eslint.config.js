import sharedConfig from "@spokbjorn/eslint-config";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.config.*",
      "pnpm-lock.yaml",
    ],
  },
  ...sharedConfig,
];
