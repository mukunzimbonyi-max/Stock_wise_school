import "dotenv/config";
import { pool } from "./db.js";

async function initDB() {
  console.log("Initializing database...");
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
    console.log("Users table created or already exists.");
  } catch (err) {
    console.error("Error creating users table:", err);
  } finally {
    await pool.end();
  }
}

initDB();
