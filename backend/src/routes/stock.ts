import { Router } from "express";

export const stockRouter = Router();

// Placeholder endpoints — implement real storage (e.g. a database) here later.
stockRouter.get("/", (_req, res) => {
  res.json({ items: [] });
});

stockRouter.post("/", (req, res) => {
  res.status(501).json({ message: "Not implemented yet" });
});
