import "dotenv/config";

import { app } from "./app.js";
import { pool } from "./db.js";

const port = Number(process.env.PORT ?? 4000);

// Auto-create tables if they don't exist (runs on every startup)
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables ready.");
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  }
}

initDB().then(() => {
  app.listen(port, () => {
    console.log(`Stock Wise School backend listening on http://127.0.0.1:${port}`);
  });
});

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
