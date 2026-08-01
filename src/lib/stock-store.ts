import { useCallback, useEffect, useState } from "react";

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
  quantity: number;
  cookName: string;
  studentsFed: number;
  mealType: string;
  notes: string;
  cookSignature: string;
};

export type SchoolInfo = {
  name: string;
  category: string;
  number: string;
  district: string;
  academicYear: string;
};

export const FOOD_ITEMS = [
  "Rice",
  "Beans",
  "Maize Flour",
  "Cooking Oil",
  "Salt",
  "Sugar",
];

export const UNITS = ["Kg", "Litre", "Bag", "Carton"];

export const totalUsed = (r: StockRecord) => r.provided + r.destroyed + r.thrownAway;
export const remaining = (r: StockRecord) => r.startedWith + r.received - totalUsed(r);

export const LOW_STOCK_THRESHOLD = 40;

const uid = () => Math.random().toString(36).slice(2, 10);

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export const sampleStockData: StockRecord[] = [
  {
    id: uid(), date: day(1), foodItem: "Rice", unit: "Kg", startedWith: 320, received: 200,
    supplierName: "Huye Agro Supplies", supplierSignature: "J. Mukama", provided: 180,
    cookName: "Alice Uwase", cookSignature: "A. Uwase", destroyed: 0, thrownAway: 4,
    explanation: "Normal daily feeding for 480 students.",
  },
  {
    id: uid(), date: day(2), foodItem: "Beans", unit: "Kg", startedWith: 260, received: 120,
    supplierName: "Ngoma Farmers Coop", supplierSignature: "P. Habimana", provided: 150,
    cookName: "Jean Bosco", cookSignature: "J. Bosco", destroyed: 6, thrownAway: 2,
    explanation: "6kg destroyed due to weevils in old sack.",
  },
  {
    id: uid(), date: day(3), foodItem: "Maize Flour", unit: "Kg", startedWith: 180, received: 90,
    supplierName: "Rwabuye Milling", supplierSignature: "C. Niyonsaba", provided: 210,
    cookName: "Alice Uwase", cookSignature: "A. Uwase", destroyed: 0, thrownAway: 0,
    explanation: "Porridge for morning break.",
  },
  {
    id: uid(), date: day(4), foodItem: "Cooking Oil", unit: "Litre", startedWith: 60, received: 40,
    supplierName: "Huye Agro Supplies", supplierSignature: "J. Mukama", provided: 55,
    cookName: "Marie Claire", cookSignature: "M. Claire", destroyed: 0, thrownAway: 1,
    explanation: "1L spilled during transfer.",
  },
  {
    id: uid(), date: day(6), foodItem: "Salt", unit: "Kg", startedWith: 30, received: 10,
    supplierName: "Kigali Wholesale", supplierSignature: "E. Nkusi", provided: 8,
    cookName: "Jean Bosco", cookSignature: "J. Bosco", destroyed: 0, thrownAway: 0,
    explanation: "Routine usage.",
  },
  {
    id: uid(), date: day(8), foodItem: "Sugar", unit: "Kg", startedWith: 75, received: 25,
    supplierName: "Kigali Wholesale", supplierSignature: "E. Nkusi", provided: 62,
    cookName: "Marie Claire", cookSignature: "M. Claire", destroyed: 2, thrownAway: 0,
    explanation: "2kg wet and destroyed after rain leak.",
  },
];

export const sampleReleases: ReleaseRecord[] = [
  { id: uid(), date: day(1), foodItem: "Rice", quantity: 180, cookName: "Alice Uwase", studentsFed: 480, mealType: "Lunch", notes: "Served with beans", cookSignature: "A. Uwase" },
  { id: uid(), date: day(2), foodItem: "Maize Flour", quantity: 90, cookName: "Jean Bosco", studentsFed: 460, mealType: "Breakfast", notes: "Porridge", cookSignature: "J. Bosco" },
  { id: uid(), date: day(3), foodItem: "Beans", quantity: 150, cookName: "Marie Claire", studentsFed: 475, mealType: "Lunch", notes: "", cookSignature: "M. Claire" },
];

export const defaultSchool: SchoolInfo = {
  name: "Groupe Scolaire Huye",
  category: "Day School",
  number: "GS-2024-0417",
  district: "Huye",
  academicYear: "2025-2026",
};

function usePersistent<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, loaded]);

  return [value, setValue, loaded] as const;
}

export function useStockRecords() {
  const [records, setRecords, loaded] = usePersistent<StockRecord[]>("sfsms.stock", sampleStockData);

  const add = useCallback(
    (r: Omit<StockRecord, "id">) => setRecords((p) => [{ ...r, id: uid() }, ...p]),
    [setRecords],
  );
  const update = useCallback(
    (id: string, r: Partial<StockRecord>) =>
      setRecords((p) => p.map((x) => (x.id === id ? { ...x, ...r } : x))),
    [setRecords],
  );
  const remove = useCallback(
    (id: string) => setRecords((p) => p.filter((x) => x.id !== id)),
    [setRecords],
  );

  return { records, setRecords, add, update, remove, loaded };
}

export function useReleases() {
  const [releases, setReleases, loaded] = usePersistent<ReleaseRecord[]>("sfsms.releases", sampleReleases);
  const add = useCallback(
    (r: Omit<ReleaseRecord, "id">) => setReleases((p) => [{ ...r, id: uid() }, ...p]),
    [setReleases],
  );
  const remove = useCallback(
    (id: string) => setReleases((p) => p.filter((x) => x.id !== id)),
    [setReleases],
  );
  return { releases, add, remove, loaded };
}

export function useSchoolInfo() {
  const [school, setSchool, loaded] = usePersistent<SchoolInfo>("sfsms.school", defaultSchool);
  return { school, setSchool, loaded };
}

export function summarize(records: StockRecord[]) {
  const received = records.reduce((s, r) => s + r.received, 0);
  const released = records.reduce((s, r) => s + r.provided, 0);
  const destroyed = records.reduce((s, r) => s + r.destroyed + r.thrownAway, 0);
  const stock = records.reduce((s, r) => s + remaining(r), 0);
  return { received, released, destroyed, stock };
}

export function byFoodItem(records: StockRecord[]) {
  return FOOD_ITEMS.map((item) => {
    const rows = records.filter((r) => r.foodItem === item);
    return {
      item,
      received: rows.reduce((s, r) => s + r.received, 0),
      released: rows.reduce((s, r) => s + r.provided, 0),
      remaining: rows.reduce((s, r) => s + remaining(r), 0),
    };
  }).filter((r) => r.received || r.released || r.remaining);
}
