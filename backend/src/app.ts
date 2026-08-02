import cors from "cors";
import express from "express";

import { pool } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { stockRouter } from "./routes/stock.js";

export const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL ?? "https://stock-wise-school.vercel.app",
  "https://stock-wise-school.vercel.app",
  "https://stock-wise-school.lovable.app",
  "http://localhost:5173",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // Allow local network IPs for development testing across devices
      if (/^http:\/\/(192\.168|10|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+\.\d+:\d+$/.test(origin)) {
        return callback(null, true);
      }
      
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", service: "stock-wise-school-backend", database: "connected", time: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: "error", service: "stock-wise-school-backend", database: "disconnected", time: new Date().toISOString() });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/stock", stockRouter);
