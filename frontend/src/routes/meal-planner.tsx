import React, { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer, Settings2, CheckSquare, Square, PlusCircle, X, BarChart3, Download, CalendarRange } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchoolInfo } from "@/lib/stock-store";

export const Route = createFileRoute("/meal-planner")({
  head: () => ({
    meta: [
      { title: "Meal Planner — GS NKUBI Food Stock Management" },
      { name: "description", content: "Generate and print the daily meal quantities poster." },
    ],
  }),
  component: MealPlanner,
});

type FoodItem = {
  name: string;
  nursery: number;
  primary: number;
  secondary: number;
  unit?: string;
  custom?: boolean;
};

type Category = {
  name: string;
  items: FoodItem[];
};

const INITIAL_FOOD_DICTIONARY: Category[] = [
  {
    name: "Cereals (Ibiritwa by'ibanze)",
    items: [
      { name: "Maize flour / Ifu y'ibigori", nursery: 50, primary: 100, secondary: 130 },
      { name: "Rice / Umuceri", nursery: 55, primary: 110, secondary: 140 },
      { name: "Wheat flour / Ifu y'ingano", nursery: 140, primary: 280, secondary: 350 },
      { name: "Sorghum / Uburo (Ibijumba)", nursery: 225, primary: 450, secondary: 550 },
      { name: "Bread / Imikate", nursery: 50, primary: 100, secondary: 130 },
      { name: "Biscuits / Amakwavu", nursery: 235, primary: 470, secondary: 580 },
    ]
  },
  {
    name: "Roots & Tubers (Imbiribwa y'ubutaka)",
    items: [
      { name: "Sweet potatoes / Ibikoro", nursery: 175, primary: 350, secondary: 450 },
      { name: "Cassava / Ibirayi byo",  nursery: 235, primary: 470, secondary: 560 },
    ]
  },
  {
    name: "Legumes (Ibinyamisogwe n'ubunyobwa)",
    items: [
      { name: "Beans / Ibishyimbo biganje", nursery: 20, primary: 40, secondary: 40 },
      { name: "Peas / Ibishyimbo bita bisi", nursery: 50, primary: 100, secondary: 100 },
      { name: "Soybeans / Ibishyimbo bibisi", nursery: 50, primary: 100, secondary: 100 },
      { name: "Mixed protein veg / Ubunyobwa zunye", nursery: 20, primary: 40, secondary: 40 },
      { name: "Soya products / Ubunyobwa bw'isoya", nursery: 15, primary: 30, secondary: 30 },
      { name: "Peas (fresh) / Amashaza yunge", nursery: 20, primary: 40, secondary: 40 },
    ]
  },
  {
    name: "Fresh Vegetables / Imboga (raw weight)",
    items: [
      { name: "Spinach / Dodo", nursery: 100, primary: 100, secondary: 100 },
      { name: "Spinach / Sipinase", nursery: 100, primary: 100, secondary: 100 },
      { name: "Mushrooms / Amashu", nursery: 150, primary: 150, secondary: 150 },
      { name: "Cassava leaves / Isombe", nursery: 150, primary: 150, secondary: 150 },
      { name: "Ibibara", nursery: 150, primary: 150, secondary: 150 },
      { name: "Eggplant / Intoryi", nursery: 160, primary: 160, secondary: 160 },
      { name: "Carrot / Karoti", nursery: 100, primary: 100, secondary: 100 },
      { name: "Inzayna", nursery: 160, primary: 160, secondary: 160 },
    ]
  },
  {
    name: "Fruits / Imbuto",
    items: [
      { name: "Avocado / Avoka", nursery: 80, primary: 80, secondary: 80 },
      { name: "Pineapple / Inanasi", nursery: 250, primary: 250, secondary: 250 },
      { name: "Banana / Imineke", nursery: 150, primary: 150, secondary: 150 },
      { name: "Mango / Inyembe", nursery: 150, primary: 150, secondary: 150 },
      { name: "Papaya / Ipapayi", nursery: 250, primary: 250, secondary: 250 },
      { name: "Jackfruit / Ironi", nursery: 250, primary: 250, secondary: 250 },
    ]
  },
  {
    name: "Animal Products / Ibiribwa bikomoka ku matungo",
    items: [
      { name: "Milk / Amata", nursery: 60, primary: 60, secondary: 60, unit: "L" },
      { name: "Cheese / Amafi (fromage)", nursery: 15, primary: 15, secondary: 15 },
      { name: "Eggs / Amagi", nursery: 25, primary: 25, secondary: 25 },
      { name: "Beef / Inyama y'inka", nursery: 25, primary: 25, secondary: 25 },
      { name: "Goat meat / Inyama y'isene", nursery: 25, primary: 25, secondary: 25 },
      { name: "Chicken / Inyama y'inkoko", nursery: 25, primary: 25, secondary: 25 },
    ]
  },
  {
    name: "Fats & Oils / Amavuta",
    items: [
      { name: "Cooking Oil / Amavuta yo guteka", nursery: 5, primary: 10, secondary: 15, unit: "L" },
      { name: "Butter / Amavuta y'inzoga", nursery: 15, primary: 15, secondary: 15 },
    ]
  },
  {
    name: "Seasonings / Imyunyu",
    items: [
      { name: "Iodized Salt / Umunyu w'iyode", nursery: 3, primary: 3, secondary: 3 },
    ]
  }
];

type ItemSelectionState = {
  selected: boolean;
  days: [boolean, boolean, boolean, boolean, boolean];
};

type SelectedItemState = {
  [categoryIndex: number]: {
    [itemIndex: number]: ItemSelectionState;
  };
};

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS = ["M", "T", "W", "Th", "F"];

function formatDaysString(days: boolean[]): string {
  const selectedDays = days.map((d, i) => d ? DAY_NAMES[i] : null).filter(Boolean) as string[];
  if (selectedDays.length === 5) return "MONDAY TO FRIDAY";
  if (selectedDays.length === 0) return "NONE";
  if (selectedDays.length === 1) return selectedDays[0];
  if (selectedDays.length === 2) return `${selectedDays[0]} AND ${selectedDays[1]}`;
  return selectedDays.slice(0, -1).join(", ") + " AND " + selectedDays[selectedDays.length - 1];
}

function getDaysCount(days: boolean[]): number {
  return days.filter(Boolean).length;
}

function buildDefaultSelection(dict: Category[]): SelectedItemState {
  const s: SelectedItemState = {};
  dict.forEach((cat, cIdx) => {
    s[cIdx] = {};
    cat.items.forEach((item, iIdx) => {
      let isSelected = false;
      let defaultDays: [boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false];
      if (item.name === "Rice") { isSelected = true; defaultDays = [false, true, false, false, true]; }
      if (item.name === "Maize flour") { isSelected = true; defaultDays = [true, false, true, true, false]; }
      if (item.name === "Beans") { isSelected = true; defaultDays = [true, true, true, true, true]; }
      if (item.name === "Cooking Oil") { isSelected = true; defaultDays = [true, true, true, true, true]; }
      if (item.name === "Iodized Salt") { isSelected = true; defaultDays = [true, true, true, true, true]; }
      if (item.name === "Green vegetables") { isSelected = true; defaultDays = [true, true, true, true, true]; }
      if (item.name === "Fish") { isSelected = true; defaultDays = [true, true, true, true, true]; }
      s[cIdx][iIdx] = { selected: isSelected, days: defaultDays };
    });
  });
  return s;
}

type NewItemForm = {
  name: string;
  nursery: string;
  primary: string;
  secondary: string;
};

type PersistedMealPlanner = {
  prePrimary: number;
  primary: number;
  secondary: number;
  dictionary: Category[];
  selection: SelectedItemState;
};

const MEAL_PLANNER_STORAGE_KEY = "sfsms.mealPlanner";

function loadSavedPlanner(): PersistedMealPlanner | null {
  try {
    const raw = localStorage.getItem(MEAL_PLANNER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedMealPlanner;
    if (!parsed || !Array.isArray(parsed.dictionary) || !parsed.selection) return null;
    return parsed;
  } catch {
    return null;
  }
}

function MealPlanner() {
  const { school, loaded } = useSchoolInfo();

  const [saved] = useState(() => loadSavedPlanner());

  const [prePrimary, setPrePrimary] = useState(saved?.prePrimary ?? 0);
  const [primary, setPrimary] = useState(saved?.primary ?? 0);
  const [secondary, setSecondary] = useState(saved?.secondary ?? 0);

  // Dynamic dictionary - initialized from static list (or restored from saved plan)
  const [dictionary, setDictionary] = useState<Category[]>(saved?.dictionary ?? INITIAL_FOOD_DICTIONARY);
  const [selection, setSelection] = useState<SelectedItemState>(saved?.selection ?? buildDefaultSelection(INITIAL_FOOD_DICTIONARY));

  // State for the "Add New Item" inline forms per category
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [newItemForm, setNewItemForm] = useState<NewItemForm>({ name: "", nursery: "", primary: "", secondary: "" });
  const [formError, setFormError] = useState("");

  // State for the "Set Item Grams" card (category → item → grams per level)
  const [configCat, setConfigCat] = useState<number | "">("");
  const [configItem, setConfigItem] = useState<number | "">("");
  const [configGrams, setConfigGrams] = useState<{ nursery: string; primary: string; secondary: string }>({ nursery: "", primary: "", secondary: "" });
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (loaded && !saved) {
      setPrePrimary(school.studentsPrePrimary);
      setPrimary(school.studentsPrimary);
      setSecondary(school.studentsSecondary);
    }
  }, [loaded, school, saved]);

  // Persist the plan so the page restores where you left off
  useEffect(() => {
    const data: PersistedMealPlanner = { prePrimary, primary, secondary, dictionary, selection };
    localStorage.setItem(MEAL_PLANNER_STORAGE_KEY, JSON.stringify(data));
  }, [prePrimary, primary, secondary, dictionary, selection]);

  const toggleItem = (cIdx: number, iIdx: number) => {
    setSelection(prev => ({
      ...prev,
      [cIdx]: {
        ...prev[cIdx],
        [iIdx]: { ...prev[cIdx][iIdx], selected: !prev[cIdx][iIdx].selected }
      }
    }));
  };

  const toggleDay = (cIdx: number, iIdx: number, dayIdx: number) => {
    setSelection(prev => {
      const newDays = [...prev[cIdx][iIdx].days] as [boolean, boolean, boolean, boolean, boolean];
      newDays[dayIdx] = !newDays[dayIdx];
      return { ...prev, [cIdx]: { ...prev[cIdx], [iIdx]: { ...prev[cIdx][iIdx], days: newDays } } };
    });
  };

  const openAddForm = (cIdx: number) => {
    setAddingTo(cIdx);
    setNewItemForm({ name: "", nursery: "", primary: "", secondary: "" });
    setFormError("");
  };

  const cancelAddForm = () => {
    setAddingTo(null);
    setFormError("");
  };

  const submitNewItem = (cIdx: number) => {
    if (!newItemForm.name.trim()) { setFormError("Name is required."); return; }
    const nursery = parseFloat(newItemForm.nursery);
    const prim = parseFloat(newItemForm.primary);
    const sec = parseFloat(newItemForm.secondary);
    if (isNaN(nursery) || isNaN(prim) || isNaN(sec) || nursery < 0 || prim < 0 || sec < 0) {
      setFormError("All gram values must be valid numbers ≥ 0.");
      return;
    }

    const newItem: FoodItem = { name: newItemForm.name.trim(), nursery, primary: prim, secondary: sec, custom: true };

    setDictionary(prev => {
      const updated = prev.map((cat, i) => {
        if (i !== cIdx) return cat;
        return { ...cat, items: [...cat.items, newItem] };
      });
      return updated;
    });

    // Add to selection: auto-selected, all 5 days checked
    setSelection(prev => {
      const existingItems = prev[cIdx] || {};
      const newIdx = Object.keys(existingItems).length;
      return {
        ...prev,
        [cIdx]: {
          ...existingItems,
          [newIdx]: { selected: true, days: [true, true, true, true, true] }
        }
      };
    });

    setAddingTo(null);
    setFormError("");
  };

  const removeCustomItem = (cIdx: number, iIdx: number) => {
    setDictionary(prev => {
      const updated = prev.map((cat, i) => {
        if (i !== cIdx) return cat;
        return { ...cat, items: cat.items.filter((_, j) => j !== iIdx) };
      });
      return updated;
    });
    setSelection(prev => {
      const catSel = { ...prev[cIdx] };
      delete catSel[iIdx];
      // Re-index remaining keys
      const reIndexed: { [key: number]: ItemSelectionState } = {};
      Object.keys(catSel).forEach((k, newI) => { reIndexed[newI] = catSel[Number(k)]; });
      return { ...prev, [cIdx]: reIndexed };
    });
  };

  const selectConfigCategory = (cIdx: number) => {
    setConfigCat(cIdx);
    setConfigItem("");
    setConfigGrams({ nursery: "", primary: "", secondary: "" });
    setConfigError("");
  };

  const selectConfigItem = (iIdx: number) => {
    if (configCat === "") return;
    const cat = dictionary[configCat];
    const item = cat?.items[iIdx];
    if (!cat || !item) return;
    setConfigItem(iIdx);
    setConfigGrams({
      nursery: String(item.nursery),
      primary: String(item.primary),
      secondary: String(item.secondary),
    });
    setConfigError("");
  };

  const submitConfig = () => {
    if (configCat === "" || configItem === "") { setConfigError("Choose a category and an item."); return; }
    const nursery = parseFloat(configGrams.nursery);
    const prim = parseFloat(configGrams.primary);
    const sec = parseFloat(configGrams.secondary);
    if (isNaN(nursery) || isNaN(prim) || isNaN(sec) || nursery < 0 || prim < 0 || sec < 0) {
      setConfigError("All gram values must be valid numbers ≥ 0.");
      return;
    }
    const cIdx = configCat;
    const iIdx = configItem;

    // Update grams for the chosen item in place
    setDictionary(prev => prev.map((cat, i) =>
      i !== cIdx ? cat : { ...cat, items: cat.items.map((it, j) => j !== iIdx ? it : { ...it, nursery, primary: prim, secondary: sec }) }
    ));

    // Add to plan (keep existing day schedule if already selected)
    setSelection(prev => {
      const catSel = prev[cIdx] || {};
      const existing = catSel[iIdx];
      return {
        ...prev,
        [cIdx]: {
          ...catSel,
          [iIdx]: existing
            ? { ...existing, selected: true }
            : { selected: true, days: [true, true, true, true, true] },
        },
      };
    });

    setConfigError("");
  };

  const calculateDailyQuantity = (item: FoodItem) => {
    const totalGrams = (prePrimary * item.nursery) + (primary * item.primary) + (secondary * item.secondary);
    return totalGrams / 1000;
  };

  const allSelectedItems = dictionary.flatMap((cat, cIdx) =>
    cat.items.map((item, iIdx) => ({ cat, item, cIdx, iIdx, sel: selection[cIdx]?.[iIdx] })).filter(x => x.sel?.selected)
  );

  // Weekly quantity per selected item broken down by level (in KG)
  const levelBreakdown = allSelectedItems.flatMap(({ item, sel }) => {
    if (!sel) return [];
    const days = getDaysCount(sel.days);
    return [{
      name: item.name,
      custom: item.custom,
      days,
      nursery: (prePrimary * item.nursery * days) / 1000,
      primary: (primary * item.primary * days) / 1000,
      secondary: (secondary * item.secondary * days) / 1000,
    }];
  });

  const levelTotals = levelBreakdown.reduce(
    (acc, r) => ({ nursery: acc.nursery + r.nursery, primary: acc.primary + r.primary, secondary: acc.secondary + r.secondary }),
    { nursery: 0, primary: 0, secondary: 0 }
  );
  const grandTotal = levelTotals.nursery + levelTotals.primary + levelTotals.secondary;
  const fmtKg = (n: number) => (n > 0 ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "0");

  const dailySchedule = DAY_LABELS.map((label, dayIdx) => {
    const itemsForDay = allSelectedItems.filter(x => x.sel.days[dayIdx]);
    return { label, items: itemsForDay };
  });

  const handleDownloadDailyPlanner = async () => {
    const element = document.getElementById('daily-planner-container');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      const yOffset = imgH < pageH ? (pageH - imgH) / 2 : 0;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgW, Math.min(imgH, pageH));
      pdf.save(`daily_planner_${school.name || 'school'}.pdf`);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  // Color palette for each category card (top accent border + shadow)  
  const CATEGORY_COLORS = [
    { border: "#f59e0b", shadow: "#f59e0b40", bg: "#fffbeb", text: "#92400e" },   // Cereals – amber
    { border: "#a16207", shadow: "#a1620740", bg: "#fefce8", text: "#713f12" },   // Roots – dark amber
    { border: "#16a34a", shadow: "#16a34a40", bg: "#f0fdf4", text: "#14532d" },   // Legumes – green
    { border: "#22c55e", shadow: "#22c55e40", bg: "#f0fdf4", text: "#166534" },   // Fresh Veg – light green
    { border: "#f97316", shadow: "#f9731640", bg: "#fff7ed", text: "#7c2d12" },   // Fruits – orange
    { border: "#ef4444", shadow: "#ef444440", bg: "#fef2f2", text: "#7f1d1d" },   // Animal – red
    { border: "#8b5cf6", shadow: "#8b5cf640", bg: "#faf5ff", text: "#4c1d95" },   // Fats – violet
    { border: "#0ea5e9", shadow: "#0ea5e940", bg: "#f0f9ff", text: "#0c4a6e" },   // Salt – sky
  ];

  return (
    <AppShell title="Meal Planner Poster" subtitle="Print the daily food allocation table">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">

        {/* ─── CONTROLS CARD ─────────────────────────────────────── */}
        <div className="card-surface overflow-hidden print:hidden">

          {/* ── SECTION 1: Student Demographics ── */}
          <div className="px-6 pt-7 pb-6">
            <div className="flex items-center gap-4 mb-1">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-black shadow-md">1</span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">Student Demographics</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Enter the number of students for each education level</p>
              </div>
            </div>
            {/* Gradient divider */}
            <div className="my-4 h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent rounded-full" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Pre-primary / Nursery (Incuke)</Label>
                <Input type="number" min="0" value={prePrimary} onChange={(e) => setPrePrimary(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Primary (Abanza)</Label>
                <Input type="number" min="0" value={primary} onChange={(e) => setPrimary(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Secondary (Ayisumbuye)</Label>
                <Input type="number" min="0" value={secondary} onChange={(e) => setSecondary(Number(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          {/* Full-width divider between sections */}
          <div className="border-t border-dashed border-border" />

          {/* ── SECTION 2: Edit Standard Grams ── */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-4 mb-1">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-violet-400 text-white text-sm font-black shadow-md">2</span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">Edit Standard Grams</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Override the daily gram allocation for any food item per level</p>
              </div>
            </div>
            <div className="my-4 h-px bg-gradient-to-r from-violet-500/60 via-violet-300/20 to-transparent rounded-full" />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Category</Label>
                <Select value={configCat === "" ? "" : String(configCat)} onValueChange={(v) => selectConfigCategory(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                  <SelectContent>
                    {dictionary.map((cat, i) => (
                      <SelectItem key={cat.name} value={String(i)}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Item</Label>
                <Select
                  value={configItem === "" ? "" : String(configItem)}
                  onValueChange={(v) => selectConfigItem(Number(v))}
                  disabled={configCat === ""}
                >
                  <SelectTrigger><SelectValue placeholder={configCat === "" ? "Choose a category first" : "Choose an item"} /></SelectTrigger>
                  <SelectContent>
                    {configCat !== "" && dictionary[configCat]?.items.map((item, j) => (
                      <SelectItem key={`${item.name}-${j}`} value={String(j)}>{item.name}{item.custom ? " *" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {configItem !== "" && (
              <>
                <div className="grid gap-3 sm:grid-cols-3 mt-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Nursery (g/day)</Label>
                    <Input type="number" min="0" value={configGrams.nursery} onChange={e => setConfigGrams(g => ({ ...g, nursery: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Primary (g/day)</Label>
                    <Input type="number" min="0" value={configGrams.primary} onChange={e => setConfigGrams(g => ({ ...g, primary: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Secondary (g/day)</Label>
                    <Input type="number" min="0" value={configGrams.secondary} onChange={e => setConfigGrams(g => ({ ...g, secondary: e.target.value }))} />
                  </div>
                </div>
                {configError && <p className="text-xs text-destructive font-semibold mt-3">{configError}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <Button onClick={submitConfig}>
                    <CheckSquare className="mr-2 h-4 w-4" /> Add to Plan / Update Grams
                  </Button>
                  <p className="text-xs text-muted-foreground">Adds the item to the plan with these grams per level.</p>
                </div>
              </>
            )}
          </div>

          {/* Full-width divider between sections */}
          <div className="border-t border-dashed border-border" />

          {/* ── SECTION 3: Select Food Items & Schedule ── */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-4 mb-1">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-400 text-white text-sm font-black shadow-md">3</span>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight text-foreground">Select Food Items &amp; Schedule</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Check items to include, then click the day pills (M T W Th F) to choose which days they are served</p>
              </div>
            </div>
            <div className="my-4 h-px bg-gradient-to-r from-emerald-500/60 via-emerald-300/20 to-transparent rounded-full" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {dictionary.map((cat, cIdx) => {
              const color = CATEGORY_COLORS[cIdx] || CATEGORY_COLORS[0];
              return (
              <div
                key={cat.name}
                className="rounded-2xl flex flex-col overflow-hidden"
                style={{
                  background: color.bg,
                  border: `2px solid ${color.border}`,
                  boxShadow: `4px 4px 0px 0px ${color.border}, 0 8px 24px ${color.shadow}`,
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `6px 6px 0px 0px ${color.border}, 0 12px 32px ${color.shadow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = `4px 4px 0px 0px ${color.border}, 0 8px 24px ${color.shadow}`; }}
              >
                {/* Category header */}
                <div className="px-3 py-2.5" style={{ background: color.border }}>
                  <h4 className="font-extrabold text-[11px] uppercase tracking-widest text-white leading-tight">{cat.name}</h4>
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="space-y-2.5 flex-1">
                    {cat.items.map((item, iIdx) => {
                      const sel = selection[cIdx]?.[iIdx];
                      if (!sel) return null;
                      return (
                        <div key={`${item.name}-${iIdx}`} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => toggleItem(cIdx, iIdx)}
                              className="flex items-center gap-2 text-xs font-semibold transition-colors text-left flex-1 rounded-lg px-2 py-1"
                              style={sel.selected ? { background: color.border + "22", color: color.text } : { color: "#6b7280" }}
                            >
                              {sel.selected
                                ? <CheckSquare className="h-3.5 w-3.5 shrink-0" style={{ color: color.border }} />
                                : <Square className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                              <span className="truncate leading-snug">{item.name}</span>
                            </button>
                            {item.custom && (
                              <button
                                type="button"
                                onClick={() => removeCustomItem(cIdx, iIdx)}
                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-0.5 rounded"
                                title="Remove item"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          {sel.selected && (
                            <div className="pl-5 flex gap-1">
                              {DAY_LABELS.map((label, dayIdx) => (
                                <button
                                  key={dayIdx}
                                  type="button"
                                  onClick={() => toggleDay(cIdx, iIdx, dayIdx)}
                                  className="w-6 h-5 text-[9px] font-black rounded transition-all"
                                  style={sel.days[dayIdx]
                                    ? { background: color.border, color: "#fff", boxShadow: `0 2px 0 ${color.border}99` }
                                    : { background: "#fff", color: "#9ca3af", border: `1px solid #e5e7eb` }
                                  }
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                {/* Add custom item form or button */}
                <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${color.border}80` }}>
                  {addingTo === cIdx ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Item name"
                        value={newItemForm.name}
                        onChange={e => setNewItemForm(f => ({ ...f, name: e.target.value }))}
                        className="h-7 text-xs"
                        autoFocus
                      />
                      <div className="grid grid-cols-3 gap-1">
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-0.5 font-semibold">Nursery (g)</div>
                          <Input
                            type="number" min="0" placeholder="0"
                            value={newItemForm.nursery}
                            onChange={e => setNewItemForm(f => ({ ...f, nursery: e.target.value }))}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-0.5 font-semibold">Primary (g)</div>
                          <Input
                            type="number" min="0" placeholder="0"
                            value={newItemForm.primary}
                            onChange={e => setNewItemForm(f => ({ ...f, primary: e.target.value }))}
                            className="h-7 text-xs"
                          />
                        </div>
                        <div>
                          <div className="text-[9px] text-muted-foreground mb-0.5 font-semibold">Secondary (g)</div>
                          <Input
                            type="number" min="0" placeholder="0"
                            value={newItemForm.secondary}
                            onChange={e => setNewItemForm(f => ({ ...f, secondary: e.target.value }))}
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                      {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-7 text-xs flex-1" style={{ background: color.border }} onClick={() => submitNewItem(cIdx)}>Add</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={cancelAddForm}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAddForm(cIdx)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors w-full rounded-md px-2 py-1 hover:opacity-80"
                      style={{ color: color.border }}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Add new item to {cat.name.split(" ")[0]}
                    </button>
                  )}
                </div>
                </div>
              </div>
            );
            })}
          </div>
          </div>

          {/* Full-width divider */}
          <div className="border-t border-dashed border-border" />

          {/* ── Print button ── */}
          <div className="px-6 py-5 flex justify-end">
            <Button onClick={() => window.print()} className="h-11 px-6 shadow-lg shadow-primary/20 gap-2">
              <Printer className="h-4 w-4" /> Print Poster (A4)
            </Button>
          </div>
        </div>

        {/* ─── DAILY PLANNER CARD ─────────────────────────────────── */}
        <div className="card-surface overflow-hidden print:hidden">

          {/* Section header */}
          <div className="px-6 pt-7 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-400 text-white text-sm font-black shadow-md">
                  <CalendarRange className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-foreground">Daily Schedule Planner</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Poster-style daily release table — click Download to save as PDF</p>
                </div>
              </div>
              <Button
                onClick={handleDownloadDailyPlanner}
                className="gap-2 shrink-0 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/30"
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
            <div className="mt-4 h-px bg-gradient-to-r from-blue-500/60 via-blue-300/20 to-transparent rounded-full" />
          </div>

          {/* A4-style poster replica */}
          <div className="px-6 pb-6 pt-5 overflow-x-auto">
            <div
              id="daily-planner-container"
              className="mx-auto bg-white text-black font-bold"
              style={{ width: "595px", minHeight: "842px", padding: "28px", fontFamily: "Arial, sans-serif" }}
            >
              {/* Ornate border wrapper */}
              <div style={{ border: "10px double black", padding: "24px", minHeight: "786px", display: "flex", flexDirection: "column" }}>

                {/* School Header */}
                <div style={{ fontSize: "14px", fontWeight: "900", lineHeight: "1.8", textTransform: "uppercase", marginBottom: "20px" }}>
                  <div>{school.district || "HUYE"} DISTRICT</div>
                  <div>MUKURA SECTOR</div>
                  <div>{school.name || "G.S NKUBI"}</div>
                </div>

                {/* Green Title */}
                <div style={{ marginBottom: "20px" }}>
                  <span style={{
                    background: "#00ff00",
                    color: "#000",
                    fontWeight: "900",
                    fontSize: "20px",
                    textTransform: "uppercase",
                    padding: "4px 6px",
                    display: "inline",
                    lineHeight: "1.6",
                  }}>
                    THE TABLE OF DAILY MEALS PREPARED AT {school.name || "G.S NKUBI"}
                  </span>
                </div>

                {/* Main Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", border: "4px solid black", fontSize: "13px", fontWeight: "900", textTransform: "uppercase", flex: 1 }}>
                  <thead>
                    <tr>
                      <th style={{ border: "3px solid black", padding: "6px 8px", textAlign: "left", background: "#FFD700", width: "35%" }}>ITEMS</th>
                      <th style={{ border: "3px solid black", padding: "6px 8px", textAlign: "left", background: "#FFD700", width: "20%" }}>QUANTITY</th>
                      <th style={{ border: "3px solid black", padding: "6px 8px", textAlign: "left", background: "#f5f5a0", width: "45%" }}>DAYS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSelectedItems.map(({ item, sel }) => {
                      const dailyQty = calculateDailyQuantity(item);
                      const unit = item.unit || "KG";
                      const daysStr = formatDaysString(sel.days);
                      return (
                        <tr key={item.name}>
                          <td style={{ border: "3px solid black", padding: "6px 8px" }}>{item.name}{item.custom ? " *" : ""}</td>
                          <td style={{ border: "3px solid black", padding: "6px 8px" }}>{dailyQty > 0 ? `${fmtKg(dailyQty)}${unit}` : `0${unit}`}</td>
                          <td style={{ border: "3px solid black", padding: "6px 8px" }}>{daysStr}.</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer */}
                <div style={{ textAlign: "center", fontWeight: "900", fontSize: "16px", marginTop: "auto", paddingTop: "28px" }}>
                  ACADEMIC YEAR: {school.academicYear || "2025-2026"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Poster Wrapper */}
        <div className="flex justify-center print:block print:m-0 print:p-0">
          <div className="poster-container relative bg-[#f4f6f9] text-black w-[210mm] min-h-[297mm] p-[10mm] shadow-xl print:shadow-none print:w-full print:h-full print:p-0">
            <div className="h-full w-full border-[10px] border-double border-black p-8 bg-white relative flex flex-col justify-between overflow-hidden">
              <div className="flex-1">
                {/* Header */}
                <div className="space-y-1 mb-4 uppercase font-bold text-xl leading-snug">
                  <p>{school.district || "HUYE"} DISTRICT</p>
                  <p>MUKURA SECTOR</p>
                  <p>{school.name || "G.S NKUBI"}</p>
                </div>

                {/* Highlighted Title */}
                <div className="mb-6 text-center">
                  <span className="bg-[#00ff00] text-black text-2xl md:text-3xl font-black uppercase px-2 py-1 leading-normal box-decoration-clone inline-block">
                    THE TABLE OF DAILY MEALS PREPARED AT {school.name || "G.S NKUBI"}
                  </span>
                </div>

                {/* Reference Table */}
                {allSelectedItems.length > 0 && (
                  <div className="mb-6 border-2 border-black p-1">
                    <h2 className="text-center bg-gray-200 font-bold uppercase text-[11px] p-1 mb-1 border-b-2 border-black">
                      NUTRITIONAL STANDARDS & WEEKLY ALLOCATION PER STUDENT
                    </h2>
                    <table className="w-full border-collapse text-[10px] font-semibold text-black text-center">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-black p-0.5 text-left">FOOD ITEM</th>
                          <th className="border border-black p-0.5">DAYS/WK</th>
                          <th className="border border-black p-0.5">NURSERY<br />(Daily / Wkly)</th>
                          <th className="border border-black p-0.5">PRIMARY<br />(Daily / Wkly)</th>
                          <th className="border border-black p-0.5">SECONDARY<br />(Daily / Wkly)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSelectedItems.map(({ item, sel }) => {
                          const days = getDaysCount(sel.days);
                          const unit = item.unit === "L" ? "ml" : "g";
                          return (
                            <tr key={`${item.name}-ref`}>
                              <td className="border border-black p-0.5 text-left">{item.name}{item.custom ? " *" : ""}</td>
                              <td className="border border-black p-0.5">{days}</td>
                              <td className="border border-black p-0.5">{item.nursery}{unit} / {item.nursery * days}{unit}</td>
                              <td className="border border-black p-0.5">{item.primary}{unit} / {item.primary * days}{unit}</td>
                              <td className="border border-black p-0.5">{item.secondary}{unit} / {item.secondary * days}{unit}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="text-[10px] font-bold bg-yellow-100 border border-black p-0.5 text-center mt-1">
                      FORMULA: Total Qty (KG) = (Total Students × Daily Grams × Days/Week) ÷ 1000 &nbsp;|&nbsp; * = Custom item
                    </div>
                  </div>
                )}

                {/* Main Table */}
                <table className="w-full border-collapse border-4 border-black text-sm font-bold text-black uppercase mb-4">
                  <thead>
                    <tr>
                      <th className="border-4 border-black p-1.5 text-left bg-yellow-300 w-1/3">ITEMS</th>
                      <th className="border-4 border-black p-1.5 text-left bg-yellow-300 w-1/4">WEEKLY QTY</th>
                      <th className="border-4 border-black p-1.5 text-left bg-yellow-300">DAYS SCHEDULE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dictionary.map((cat, cIdx) => {
                      const selectedItems = cat.items.map((item, iIdx) => ({ item, sel: selection[cIdx]?.[iIdx] })).filter(x => x.sel?.selected);
                      if (selectedItems.length === 0) return null;

                      return (
                        <React.Fragment key={cat.name}>
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="border-4 border-black p-1.5 text-center text-gray-500 font-extrabold tracking-widest text-[11px]">
                              {cat.name}
                            </td>
                          </tr>
                          {selectedItems.map(({ item, sel }) => {
                            const daysCount = getDaysCount(sel.days);
                            const dailyQty = calculateDailyQuantity(item);
                            const weeklyQty = dailyQty * daysCount;
                            const unit = item.unit || "KG";
                            return (
                              <tr key={item.name}>
                                <td className="border-4 border-black p-1.5">{item.name}</td>
                                <td className="border-4 border-black p-1.5 text-[15px]">{weeklyQty > 0 ? `${weeklyQty.toLocaleString()}${unit}` : `0${unit}`}</td>
                                <td className="border-4 border-black p-1.5 text-[11px]">{formatDaysString(sel.days)}</td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="text-center font-bold text-lg pt-2 mt-auto">
                ACADEMIC YEAR: {school.academicYear || "2025-2026"}
              </div>
            </div>
          </div>
        </div>

        {/* Level Breakdown */}
        {allSelectedItems.length > 0 && (
          <div className="card-surface p-5 sm:p-6 print:hidden">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Food Quantities by Level</h3>
                <p className="text-xs text-muted-foreground">
                  Weekly quantity of each item going to Pre-primary, Primary and Secondary, based on grams and student counts
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 mb-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Pre-primary students</p>
                <p className="text-2xl font-bold text-primary">{prePrimary}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Primary students</p>
                <p className="text-2xl font-bold text-primary">{primary}</p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Secondary students</p>
                <p className="text-2xl font-bold text-primary">{secondary}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="border border-border p-2">FOOD ITEM</th>
                    <th className="border border-border p-2 text-center">DAYS</th>
                    <th className="border border-border p-2 text-right">PRE-PRIMARY (KG)</th>
                    <th className="border border-border p-2 text-right">PRIMARY (KG)</th>
                    <th className="border border-border p-2 text-right">SECONDARY (KG)</th>
                    <th className="border border-border p-2 text-right">TOTAL (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  {levelBreakdown.map((r) => (
                    <tr key={r.name} className="hover:bg-muted/30">
                      <td className="border border-border p-2 font-medium">{r.name}{r.custom ? " *" : ""}</td>
                      <td className="border border-border p-2 text-center">{r.days}</td>
                      <td className="border border-border p-2 text-right">{fmtKg(r.nursery)}</td>
                      <td className="border border-border p-2 text-right">{fmtKg(r.primary)}</td>
                      <td className="border border-border p-2 text-right">{fmtKg(r.secondary)}</td>
                      <td className="border border-border p-2 text-right font-semibold">{fmtKg(r.nursery + r.primary + r.secondary)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-primary/10">
                    <td className="border border-border p-2" colSpan={3}>TOTAL ({levelBreakdown.length} items)</td>
                    <td className="border border-border p-2 text-right">{fmtKg(levelTotals.nursery)}</td>
                    <td className="border border-border p-2 text-right">{fmtKg(levelTotals.primary)}</td>
                    <td className="border border-border p-2 text-right">{fmtKg(levelTotals.secondary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-xl bg-primary text-primary-foreground px-4 py-3">
                <p className="text-[11px] font-semibold opacity-80">GRAND TOTAL (all levels)</p>
                <p className="text-2xl font-bold">{fmtKg(grandTotal)} KG</p>
              </div>
              <div className="rounded-xl bg-muted px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground">Total students</p>
                <p className="text-2xl font-bold">{prePrimary + primary + secondary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4 portrait; margin: 0; }
              body { margin: 0; padding: 0; background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important; }
              .poster-container { box-shadow: none !important; width: 100% !important;
                min-height: 100vh !important; height: auto !important;
                margin: 0 !important; border: none !important; overflow: hidden !important; }
            }
          `
        }} />
      </div>
    </AppShell>
  );
}
