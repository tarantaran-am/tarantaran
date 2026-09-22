import { defineConfig } from "lint-staged/config";

export default defineConfig({
  "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["eslint --fix --max-warnings=0", "prettier --write"],
  // Negated to avoid formatting JS/TS twice.
  "!*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": "prettier --write --ignore-unknown",
});
