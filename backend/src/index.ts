import { env } from "./config/env";
import { app } from "./app";

const server = app.listen(env.PORT, () => {
  console.log(`CreatorOS API listening on port ${env.PORT} (${env.NODE_ENV})`);
});

// Finish in-flight requests before exiting when the host stops the process.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
