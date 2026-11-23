// Starts the production container (see the Dockerfile), all in one Node
// process, which stays PID 1 and gets the stop signals itself: it applies
// pending migrations, then starts the server. A step that fails rejects here,
// which exits with an error before the server ever listens, so it never runs
// against an old schema.

// Resolves once the migrations have finished (or rejects if they fail).
await import("../.output/tools/migrate.mjs");

await import("../.output/server/index.mjs");
