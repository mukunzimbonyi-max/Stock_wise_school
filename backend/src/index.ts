import "dotenv/config";

import { app } from "./app.js";
import { pool } from "./db.js";

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  console.log(`Stock Wise School backend listening on http://127.0.0.1:${port}`);
});

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
