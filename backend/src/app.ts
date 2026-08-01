import cors from "cors";
import express from "express";

import { pool } from "./db.js";
import { stockRouter } from "./routes/stock.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", service: "stock-wise-school-backend", database: "connected", time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", service: "stock-wise-school-backend", database: "disconnected", time: new Date().toISOString() });
  }
});

app.use("/api/stock", stockRouter);
