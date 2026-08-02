import { useCallback, useEffect, useState } from "react";
import { API_URL } from "./api";

export type StockRecord = {
  id: string;
  date: string;
  foodItem: string;
  unit: string;
  startedWith: number;
  received: number;
  supplierName: string;
  supplierSignature: string;
  provided: number;
  cookName: string;
  cookSignature: string;
  destroyed: number;
  thrownAway: number;
  explanation: string;
};

export type ReleaseRecord = {
  id: string;
  date: string;
  foodItem: string;
  startedWith: number;
  quantity: number;
  cookName: string;
  studentsFed: number;
  mealType: string;
  notes: string;
  cookSignature: string;
  remaining?: number;
};

export type SchoolInfo = {
  name: string;
  category: string;
  number: string;
  district: string;
  academicYear: string;
};

export const FOOD_ITEMS = ["Rice", "Beans", "Maize Flour", "Cooking Oil", "Salt", "Sugar"];
export const NEW_ITEM_VALUE = "__new_item__";
export const UNITS = ["Kg", "Litre", "Bag", "Carton"];
export const totalUsed = (r: StockRecord) => r.provided + r.destroyed + r.thrownAway;
export const remaining = (r: StockRecord) => r.startedWith + r.received - totalUsed(r);
export const LOW_STOCK_THRESHOLD = 40;

// ─── Snake ↔ Camel conversion ─────────────────────────────────────────────────

function toStockRecord(row: Record<string, unknown>): StockRecord {
  return {
    id: String(row.id),
    date: String(row.date).slice(0, 10),
    foodItem: String(row.food_item),
    unit: String(row.unit),
    startedWith: Number(row.started_with),
    received: Number(row.received),
    supplierName: String(row.supplier_name ?? ""),
    supplierSignature: String(row.supplier_signature ?? ""),
    provided: Number(row.provided),
    cookName: String(row.cook_name ?? ""),
    cookSignature: String(row.cook_signature ?? ""),
    destroyed: Number(row.destroyed),
    thrownAway: Number(row.thrown_away),
    explanation: String(row.explanation ?? ""),
  };
}

function toReleaseRecord(row: Record<string, unknown>): ReleaseRecord {
  return {
    id: String(row.id),
    date: String(row.date).slice(0, 10),
    foodItem: String(row.food_item),
    startedWith: Number(row.started_with),
    quantity: Number(row.quantity),
    cookName: String(row.cook_name ?? ""),
    studentsFed: Number(row.students_fed ?? 0),
    mealType: String(row.meal_type ?? ""),
    notes: String(row.notes ?? ""),
    cookSignature: String(row.cook_signature ?? ""),
    remaining: row.remaining !== null && row.remaining !== undefined ? Number(row.remaining) : undefined,
  };
}

function stockToBody(r: Omit<StockRecord, "id">) {
  return {
    date: r.date,
    food_item: r.foodItem,
    unit: r.unit,
    started_with: r.startedWith,
    received: r.received,
    supplier_name: r.supplierName,
    supplier_signature: r.supplierSignature,
    provided: r.provided,
    cook_name: r.cookName,
    cook_signature: r.cookSignature,
    destroyed: r.destroyed,
    thrown_away: r.thrownAway,
    explanation: r.explanation,
  };
}

function releaseToBody(r: Omit<ReleaseRecord, "id">) {
  return {
    date: r.date,
    food_item: r.foodItem,
    started_with: r.startedWith,
    quantity: r.quantity,
    cook_name: r.cookName,
    students_fed: r.studentsFed,
    meal_type: r.mealType,
    notes: r.notes,
    cook_signature: r.cookSignature,
    remaining: r.remaining,
  };
}

// ─── Stock Records ────────────────────────────────────────────────────────────

export function useStockRecords() {
  const [records, setRecords] = useState<StockRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/stock/records`);
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setRecords(rows.map(toStockRecord));
    } catch (err) {
      console.error("Failed to load stock records:", err);
      setError("Failed to load stock records");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const add = useCallback(async (r: Omit<StockRecord, "id">) => {
    const res = await fetch(`${API_URL}/api/stock/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockToBody(r)),
    });
    if (!res.ok) throw new Error(await res.text());
    const row = await res.json();
    setRecords((p) => [toStockRecord(row), ...p]);
  }, []);

  const update = useCallback(async (id: string, r: Partial<StockRecord>) => {
    const existing = records.find((x) => x.id === id);
    if (!existing) return;
    const merged = { ...existing, ...r };
    const res = await fetch(`${API_URL}/api/stock/records/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stockToBody(merged)),
    });
    if (!res.ok) throw new Error(await res.text());
    const row = await res.json();
    setRecords((p) => p.map((x) => (x.id === id ? toStockRecord(row) : x)));
  }, [records]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/api/stock/records/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setRecords((p) => p.filter((x) => x.id !== id));
  }, []);

  return { records, setRecords, add, update, remove, loaded, error, refetch: fetchRecords };
}

// ─── Release Records ──────────────────────────────────────────────────────────

export function useReleases() {
  const [releases, setReleases] = useState<ReleaseRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/stock/releases`);
      if (!res.ok) throw new Error(await res.text());
      const rows = await res.json();
      setReleases(rows.map(toReleaseRecord));
    } catch (err) {
      console.error("Failed to load releases:", err);
      setError("Failed to load releases");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  const add = useCallback(async (r: Omit<ReleaseRecord, "id">) => {
    const res = await fetch(`${API_URL}/api/stock/releases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(releaseToBody(r)),
    });
    if (!res.ok) throw new Error(await res.text());
    const row = await res.json();
    setReleases((p) => [toReleaseRecord(row), ...p]);
  }, []);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/api/stock/releases/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    setReleases((p) => p.filter((x) => x.id !== id));
  }, []);

  return { releases, add, remove, loaded, error, refetch: fetchReleases };
}

// ─── School Info ──────────────────────────────────────────────────────────────

export function useSchoolInfo() {
  const [school, setSchoolState] = useState<SchoolInfo>({
    name: "GS NKUBI",
    category: "Day School",
    number: "GS-2024-0417",
    district: "Huye",
    academicYear: "2025-2026",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/stock/school`)
      .then((r) => r.json())
      .then((row) => {
        setSchoolState({
          name: row.name ?? "",
          category: row.category ?? "",
          number: row.number ?? "",
          district: row.district ?? "",
          academicYear: row.academic_year ?? "",
        });
      })
      .catch((err) => console.error("Failed to load school info:", err))
      .finally(() => setLoaded(true));
  }, []);

  const setSchool = useCallback(async (info: SchoolInfo) => {
    const res = await fetch(`${API_URL}/api/stock/school`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: info.name,
        category: info.category,
        number: info.number,
        district: info.district,
        academic_year: info.academicYear,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    setSchoolState(info);
  }, []);

  return { school, setSchool, loaded };
}

// ─── Food Items ───────────────────────────────────────────────────────────────

export function useFoodItems() {
  const [foodItems, setFoodItems] = useState<string[]>(FOOD_ITEMS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/stock/food-items`)
      .then((r) => r.json())
      .then((items: string[]) => setFoodItems(items))
      .catch((err) => console.error("Failed to load food items:", err))
      .finally(() => setLoaded(true));
  }, []);

  const addFoodItem = useCallback(async (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    const res = await fetch(`${API_URL}/api/stock/food-items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clean }),
    });
    if (!res.ok) throw new Error(await res.text());
    setFoodItems((p) =>
      p.some((x) => x.toLowerCase() === clean.toLowerCase()) ? p : [...p, clean]
    );
  }, []);

  return { foodItems, addFoodItem, loaded };
}

// ─── Aggregation helpers (unchanged) ─────────────────────────────────────────

export function summarize(records: StockRecord[], releases: ReleaseRecord[] = []) {
  const perItem = byFoodItem(records, releases);
  const received = perItem.reduce((s, r) => s + r.received, 0);
  const released = perItem.reduce((s, r) => s + r.released, 0);
  const destroyed = records.reduce((s, r) => s + r.destroyed + r.thrownAway, 0);
  const stock = perItem.reduce((s, r) => s + r.remaining, 0);
  return { received, released, destroyed, stock };
}

export function byFoodItem(records: StockRecord[], releases: ReleaseRecord[] = []) {
  const items = Array.from(new Set([
    ...FOOD_ITEMS,
    ...records.map((r) => r.foodItem),
    ...releases.map((r) => r.foodItem),
  ]));

  return items.map((item) => {
    const itemRecords = records.filter((r) => r.foodItem === item);
    const itemReleases = releases.filter((r) => r.foodItem === item);

    const received = itemRecords.reduce((s, r) => s + r.received, 0);
    const released =
      itemRecords.reduce((s, r) => s + r.provided, 0) +
      itemReleases.reduce((s, r) => s + r.quantity, 0);

    const allEvents = [
      ...itemRecords.map((r) => ({ ...r, type: "stock", time: new Date(r.date).getTime() })),
      ...itemReleases.map((r) => ({ ...r, type: "release", time: new Date(r.date).getTime() })),
    ].sort((a, b) => a.time - b.time);

    let currentStock = 0;
    for (const event of allEvents) {
      if (event.type === "stock") {
        const r = event as StockRecord & { type: string };
        currentStock = r.startedWith + r.received - totalUsed(r);
      } else {
        const r = event as ReleaseRecord & { type: string };
        currentStock -= r.quantity;
      }
    }

    return { item, received, released, remaining: currentStock };
  }).filter((r) => r.received || r.released || r.remaining);
}
