import "dotenv/config";

import { app } from "./app.js";
import { pool } from "./db.js";

const port = Number(process.env.PORT ?? 5000);

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

      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        food_item VARCHAR(255) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        started_with NUMERIC NOT NULL DEFAULT 0,
        received NUMERIC NOT NULL DEFAULT 0,
        supplier_name VARCHAR(255),
        supplier_signature VARCHAR(255),
        provided NUMERIC NOT NULL DEFAULT 0,
        cook_name VARCHAR(255),
        cook_signature VARCHAR(255),
        destroyed NUMERIC NOT NULL DEFAULT 0,
        thrown_away NUMERIC NOT NULL DEFAULT 0,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS release_records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        food_item VARCHAR(255) NOT NULL,
        started_with NUMERIC NOT NULL DEFAULT 0,
        quantity NUMERIC NOT NULL DEFAULT 0,
        cook_name VARCHAR(255),
        students_fed INTEGER,
        meal_type VARCHAR(100),
        notes TEXT,
        cook_signature VARCHAR(255),
        remaining NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS school_info (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        number VARCHAR(255),
        district VARCHAR(255),
        academic_year VARCHAR(50),
        students_pre_primary INTEGER DEFAULT 0,
        students_primary INTEGER DEFAULT 0,
        students_secondary INTEGER DEFAULT 0,
        total_students INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL
      );

      -- Add user_id to existing tables if they don't have it
      ALTER TABLE records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
      ALTER TABLE release_records ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

      -- Add demographic columns to school_info if they don't have it
      ALTER TABLE school_info ADD COLUMN IF NOT EXISTS students_pre_primary INTEGER DEFAULT 0;
      ALTER TABLE school_info ADD COLUMN IF NOT EXISTS students_primary INTEGER DEFAULT 0;
      ALTER TABLE school_info ADD COLUMN IF NOT EXISTS students_secondary INTEGER DEFAULT 0;
      ALTER TABLE school_info ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0;

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables ready.");
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  }
}

initDB().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Stock Wise School backend listening on port ${port} (0.0.0.0)`);
  });
});

const shutdown = async () => {
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
