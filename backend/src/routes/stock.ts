import { Router } from "express";
import { pool } from "../db.js";

export const stockRouter = Router();

// ─── Stock Records ───────────────────────────────────────────────────────────

// GET /api/stock/records
stockRouter.get("/records", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM records ORDER BY date DESC, created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/stock/records error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/stock/records
stockRouter.post("/records", async (req, res) => {
  try {
    const {
      date, food_item, unit, started_with, received,
      supplier_name, supplier_signature, provided,
      cook_name, cook_signature, destroyed, thrown_away, explanation,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO records
        (date, food_item, unit, started_with, received,
         supplier_name, supplier_signature, provided,
         cook_name, cook_signature, destroyed, thrown_away, explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [date, food_item, unit, started_with, received,
       supplier_name, supplier_signature, provided,
       cook_name, cook_signature, destroyed, thrown_away, explanation]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/stock/records error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/stock/records/:id
stockRouter.put("/records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, food_item, unit, started_with, received,
      supplier_name, supplier_signature, provided,
      cook_name, cook_signature, destroyed, thrown_away, explanation,
    } = req.body;

    const result = await pool.query(
      `UPDATE records SET
        date=$1, food_item=$2, unit=$3, started_with=$4, received=$5,
        supplier_name=$6, supplier_signature=$7, provided=$8,
        cook_name=$9, cook_signature=$10, destroyed=$11, thrown_away=$12, explanation=$13
       WHERE id=$14 RETURNING *`,
      [date, food_item, unit, started_with, received,
       supplier_name, supplier_signature, provided,
       cook_name, cook_signature, destroyed, thrown_away, explanation, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/stock/records/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/stock/records/:id
stockRouter.delete("/records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM records WHERE id=$1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/stock/records/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Release Records ──────────────────────────────────────────────────────────

// GET /api/stock/releases
stockRouter.get("/releases", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM release_records ORDER BY date DESC, created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/stock/releases error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/stock/releases
stockRouter.post("/releases", async (req, res) => {
  try {
    const {
      date, food_item, started_with, quantity,
      cook_name, students_fed, meal_type, notes, cook_signature, remaining,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO release_records
        (date, food_item, started_with, quantity, cook_name,
         students_fed, meal_type, notes, cook_signature, remaining)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [date, food_item, started_with, quantity, cook_name,
       students_fed, meal_type, notes, cook_signature, remaining ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /api/stock/releases error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/stock/releases/:id
stockRouter.delete("/releases/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM release_records WHERE id=$1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/stock/releases/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── School Info ──────────────────────────────────────────────────────────────

// GET /api/stock/school
stockRouter.get("/school", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM school_info LIMIT 1");
    if (result.rows.length === 0) {
      return res.json({
        name: "GS NKUBI", category: "Day School",
        number: "GS-2024-0417", district: "Huye", academic_year: "2025-2026",
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/stock/school error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/stock/school
stockRouter.put("/school", async (req, res) => {
  try {
    const { name, category, number, district, academic_year } = req.body;
    await pool.query("DELETE FROM school_info");
    const result = await pool.query(
      `INSERT INTO school_info (name, category, number, district, academic_year)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, category, number, district, academic_year]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /api/stock/school error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Food Items ───────────────────────────────────────────────────────────────

// GET /api/stock/food-items
stockRouter.get("/food-items", async (_req, res) => {
  try {
    const result = await pool.query("SELECT name FROM food_items ORDER BY name");
    const defaultItems = ["Rice", "Beans", "Maize Flour", "Cooking Oil", "Salt", "Sugar", "Vegetables"];
    const dbItems = result.rows.map((r: { name: string }) => r.name);
    const allItems = Array.from(new Set([...defaultItems, ...dbItems])).sort();
    res.json(allItems);
  } catch (err) {
    console.error("GET /api/stock/food-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/stock/food-items
stockRouter.post("/food-items", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Name required" });
    await pool.query(
      "INSERT INTO food_items (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      [name.trim()]
    );
    res.status(201).json({ name: name.trim() });
  } catch (err) {
    console.error("POST /api/stock/food-items error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Public Stats (no auth required) ─────────────────────────────────────────

// GET /api/stock/public-stats
stockRouter.get("/public-stats", async (_req, res) => {
  try {
    const [itemsResult, releasesResult, recordsResult] = await Promise.all([
      pool.query("SELECT name FROM food_items"),
      pool.query("SELECT COALESCE(SUM(students_fed), 0) AS total_students FROM release_records"),
      pool.query("SELECT COUNT(*) FROM records"),
    ]);

    const defaultItems = ["Rice", "Beans", "Maize Flour", "Cooking Oil", "Salt", "Sugar", "Vegetables"];
    const dbItems = itemsResult.rows.map((r: { name: string }) => r.name);
    const uniqueItemsCount = new Set([...defaultItems, ...dbItems]).size;

    res.json({
      foodItems: uniqueItemsCount,
      studentsFed: parseInt(releasesResult.rows[0].total_students) || 0,
      totalRecords: parseInt(recordsResult.rows[0].count) || 0,
    });
  } catch (err) {
    console.error("GET /api/stock/public-stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
