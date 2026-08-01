import cors from "cors";
import express from "express";

import { stockRouter } from "./routes/stock.js";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "stock-wise-school-backend", time: new Date().toISOString() });
});

app.use("/api/stock", stockRouter);
