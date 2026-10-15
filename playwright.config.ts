import { defineConfig, devices } from "@playwright/test";

// Starter configuration — LOCAL ONLY.
//
// It builds the Nuxt app, starts it on port 3000 and runs the whole suite on three
// browsers. Nothing in here knows about CI, Vercel, environments or secrets yet: making it
// do so is your job (PL-02 in the pipeline specification). Do not create a second config
// file for CI — one suite, one configuration, behaviour chosen by the environment.
//
// Tip: while you work, keep `npm run dev` running in another terminal. The config reuses
// a server that is already listening on port 3000 instead of building again.

try {
  process.loadEnvFile(); // does not override variables that are already set
} catch (error) {
  // A missing .env is normal in CI. Anything else is a real problem.
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

// AC-02.1: fail early, and name the variable.
for (const name of ["TEST_USER", "TEST_PASS"]) {
  if (!process.env[name]) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env (local) or as a repository secret (CI).`,
    );
  }
}

// AC-02.3: an empty BASE_URL counts as "not set" (hence || and not ??).
const deployedURL = process.env.BASE_URL || undefined;
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }], ["blob"]]
    : "html",

  use: {
    baseURL: deployedURL ?? "http://localhost:3000",
    trace: "on-first-retry",
    extraHTTPHeaders:
      deployedURL && bypassSecret
        ? { "x-vercel-protection-bypass": bypassSecret }
        : undefined,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  webServer: deployedURL
    ? undefined
    : {
        command: "npm run build && npm start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
