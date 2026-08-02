import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsRouter = Router();

// ─── Uploads directory ─────────────────────────────────────────────────────────
export const UPLOADS_DIR = path.join(__dirname, "../../../uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ─── Auto-purge files older than 1 month ──────────────────────────────────────
export function purgeOldUploads() {
  try {
    const now = Date.now();
    const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
    const files = fs.readdirSync(UPLOADS_DIR);
    let deleted = 0;
    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > ONE_MONTH_MS) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    }
    if (deleted > 0) {
      console.log(`[uploads] Purged ${deleted} file(s) older than 1 month.`);
    }
  } catch (err) {
    console.error("[uploads] Error during purge:", err);
  }
}

// Run purge on startup
purgeOldUploads();

// ─── Multer config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    cb(null, `${ts}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── POST /api/uploads/pdf ─────────────────────────────────────────────────────
uploadsRouter.post("/pdf", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }
  res.json({
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// ─── GET /api/uploads ─────────────────────────────────────────────────────────
uploadsRouter.get("/", (_req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR).map((name) => {
      const stat = fs.statSync(path.join(UPLOADS_DIR, name));
      return { name, savedAt: stat.mtime.toISOString(), size: stat.size };
    });
    res.json(files.sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
  } catch {
    res.json([]);
  }
});

// ─── DELETE /api/uploads/:filename ────────────────────────────────────────────
uploadsRouter.delete("/:filename", (req, res) => {
  const safe = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  fs.unlinkSync(filePath);
  res.json({ deleted: safe });
});
