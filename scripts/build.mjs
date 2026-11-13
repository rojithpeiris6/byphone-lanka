import { spawnSync } from "node:child_process";
// Works on Windows and Unix without shell-specific environment assignment.
const result = spawnSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
  stdio: "inherit",
  env: { ...process.env, NITRO_PRESET: "netlify" },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
