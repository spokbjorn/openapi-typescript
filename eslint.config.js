import sharedConfig from "@spokbjorn/eslint-config";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/generated/**",
      "**/*.config.*",
      "**/bin/**",
      "pnpm-lock.yaml",
    ],
  },
  ...sharedConfig,
];
