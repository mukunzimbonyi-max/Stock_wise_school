import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer, Settings2, CheckSquare, Square } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
};

type Category = {
  name: string;
  items: FoodItem[];
};

const FOOD_DICTIONARY: Category[] = [
  {
    name: "Cereals",
    items: [
      { name: "Maize flour", nursery: 50, primary: 100, secondary: 130 },
      { name: "Rice", nursery: 55, primary: 110, secondary: 140 },
      { name: "Wheat flour", nursery: 140, primary: 280, secondary: 350 },
      { name: "Sorghum", nursery: 225, primary: 450, secondary: 550 },
      { name: "Bread", nursery: 50, primary: 100, secondary: 130 },
      { name: "Biscuits", nursery: 235, primary: 470, secondary: 580 },
    ]
  },
  {
    name: "Roots and Tubers",
    items: [
      { name: "Sweet potatoes", nursery: 175, primary: 350, secondary: 450 },
      { name: "Cassava", nursery: 235, primary: 470, secondary: 560 },
    ]
  },
  {
    name: "Legumes",
    items: [
      { name: "Beans", nursery: 20, primary: 40, secondary: 40 },
      { name: "Peas", nursery: 50, primary: 100, secondary: 100 },
      { name: "Soybeans", nursery: 50, primary: 100, secondary: 100 },
    ]
  },
  {
    name: "Vegetables",
    items: [
      { name: "Green vegetables", nursery: 20, primary: 40, secondary: 40 },
      { name: "Cabbage", nursery: 20, primary: 40, secondary: 40 },
      { name: "Tomatoes", nursery: 15, primary: 30, secondary: 30 },
      { name: "Eggplant", nursery: 20, primary: 40, secondary: 40 },
    ]
  },
  {
    name: "Fruits",
    items: [
      { name: "Orange", nursery: 100, primary: 100, secondary: 100 },
      { name: "Pineapple", nursery: 100, primary: 100, secondary: 100 },
      { name: "Mango", nursery: 150, primary: 150, secondary: 150 },
      { name: "Guava", nursery: 100, primary: 100, secondary: 100 },
      { name: "Papaya", nursery: 150, primary: 150, secondary: 150 },
      { name: "Passion fruit", nursery: 160, primary: 160, secondary: 160 },
      { name: "Avocado", nursery: 100, primary: 100, secondary: 100 },
      { name: "Jackfruit", nursery: 160, primary: 160, secondary: 160 },
    ]
  },
  {
    name: "Animal Products",
    items: [
      { name: "Eggs", nursery: 80, primary: 80, secondary: 80 },
      { name: "Milk", nursery: 250, primary: 250, secondary: 250, unit: "L" },
      { name: "Fish", nursery: 150, primary: 150, secondary: 150 },
      { name: "Meat", nursery: 150, primary: 150, secondary: 150 },
      { name: "Chicken", nursery: 250, primary: 250, secondary: 250 },
      { name: "Liver", nursery: 250, primary: 250, secondary: 250 },
    ]
  },
  {
    name: "Fats and Oils",
    items: [
      { name: "Cooking Oil", nursery: 60, primary: 60, secondary: 60, unit: "L" },
      { name: "Butter", nursery: 15, primary: 15, secondary: 15 },
    ]
  },
  {
    name: "Seasonings",
    items: [
      { name: "Iodized Salt", nursery: 5, primary: 10, secondary: 15 },
      { name: "Spices", nursery: 3, primary: 3, secondary: 3 },
    ]
  }
];

type SelectedItemState = {
  [categoryIndex: number]: {
    [itemIndex: number]: {
      selected: boolean;
      days: [boolean, boolean, boolean, boolean, boolean]; // M, T, W, Th, F
    };
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

function MealPlanner() {
  const { school, loaded } = useSchoolInfo();

  const [prePrimary, setPrePrimary] = useState(0);
  const [primary, setPrimary] = useState(0);
  const [secondary, setSecondary] = useState(0);

  // Initialize selected items (defaults to Rice, Maize Flour, Beans, Oil, Salt, Veg, Fish)
  const [selection, setSelection] = useState<SelectedItemState>(() => {
    const s: SelectedItemState = {};
    FOOD_DICTIONARY.forEach((cat, cIdx) => {
      s[cIdx] = {};
      cat.items.forEach((item, iIdx) => {
        let isSelected = false;
        let defaultDays: [boolean, boolean, boolean, boolean, boolean] = [false, false, false, false, false];
        
        if (item.name === "Rice") { isSelected = true; defaultDays = [false, true, false, false, true]; } // TUE, FRI
        if (item.name === "Maize flour") { isSelected = true; defaultDays = [true, false, true, true, false]; } // MON, WED, THU
        if (item.name === "Beans") { isSelected = true; defaultDays = [true, true, true, true, true]; }
        if (item.name === "Cooking Oil") { isSelected = true; defaultDays = [true, true, true, true, true]; }
        if (item.name === "Iodized Salt") { isSelected = true; defaultDays = [true, true, true, true, true]; }
        if (item.name === "Green vegetables") { isSelected = true; defaultDays = [true, true, true, true, true]; }
        if (item.name === "Fish") { isSelected = true; defaultDays = [true, true, true, true, true]; }

        s[cIdx][iIdx] = { selected: isSelected, days: defaultDays };
      });
    });
    return s;
  });

  useEffect(() => {
    if (loaded) {
      setPrePrimary(school.studentsPrePrimary);
      setPrimary(school.studentsPrimary);
      setSecondary(school.studentsSecondary);
    }
  }, [loaded, school]);

  const toggleItem = (cIdx: number, iIdx: number) => {
    setSelection(prev => ({
      ...prev,
      [cIdx]: {
        ...prev[cIdx],
        [iIdx]: {
          ...prev[cIdx][iIdx],
          selected: !prev[cIdx][iIdx].selected
        }
      }
    }));
  };

  const toggleDay = (cIdx: number, iIdx: number, dayIdx: number) => {
    setSelection(prev => {
      const newDays = [...prev[cIdx][iIdx].days] as [boolean, boolean, boolean, boolean, boolean];
      newDays[dayIdx] = !newDays[dayIdx];
      return {
        ...prev,
        [cIdx]: {
          ...prev[cIdx],
          [iIdx]: {
            ...prev[cIdx][iIdx],
            days: newDays
          }
        }
      };
    });
  };

  // Calculates total daily grams across all students for a specific item, returns in KG
  const calculateDailyQuantity = (item: FoodItem) => {
    const totalGrams = (prePrimary * item.nursery) + (primary * item.primary) + (secondary * item.secondary);
    return totalGrams / 1000;
  };

  // Collect all currently selected items for rendering
  const allSelectedItems = FOOD_DICTIONARY.flatMap((cat, cIdx) => 
    cat.items.map((item, iIdx) => ({ cat, item, cIdx, iIdx, sel: selection[cIdx][iIdx] })).filter(x => x.sel.selected)
  );

  return (
    <AppShell title="Meal Planner Poster" subtitle="Print the daily food allocation table">
      <div className="mx-auto max-w-7xl space-y-6 pb-20">
        
        {/* Controls - Hidden when printing */}
        <div className="card-surface p-5 sm:p-6 print:hidden">
          <div className="flex items-center gap-2 mb-4 font-semibold text-primary">
            <Settings2 className="h-5 w-5" />
            <h3>Step 1: Configure Student Demographics</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="space-y-1.5">
              <Label>Pre-primary / Nursery</Label>
              <Input type="number" min="0" value={prePrimary} onChange={(e) => setPrePrimary(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label>Primary</Label>
              <Input type="number" min="0" value={primary} onChange={(e) => setPrimary(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5">
              <Label>Secondary</Label>
              <Input type="number" min="0" value={secondary} onChange={(e) => setSecondary(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 font-semibold text-primary">
            <Settings2 className="h-5 w-5" />
            <h3>Step 2: Select Food Items & Schedule</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {FOOD_DICTIONARY.map((cat, cIdx) => (
              <div key={cat.name} className="border rounded-lg p-3 bg-muted/20">
                <h4 className="font-bold text-sm mb-3 uppercase text-primary border-b pb-1">{cat.name}</h4>
                <div className="space-y-3">
                  {cat.items.map((item, iIdx) => {
                    const sel = selection[cIdx][iIdx];
                    return (
                      <div key={item.name} className="flex flex-col gap-1.5">
                        <button 
                          type="button" 
                          onClick={() => toggleItem(cIdx, iIdx)}
                          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors text-left"
                        >
                          {sel.selected ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}
                          {item.name}
                        </button>
                        {sel.selected && (
                          <div className="pl-6 flex gap-1">
                            {DAY_LABELS.map((label, dayIdx) => (
                              <button
                                key={dayIdx}
                                type="button"
                                onClick={() => toggleDay(cIdx, iIdx, dayIdx)}
                                className={`w-6 h-6 text-[10px] font-bold rounded-sm border ${sel.days[dayIdx] ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-muted'}`}
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
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={() => window.print()} className="h-11 shadow-lg shadow-primary/20">
              <Printer className="mr-2 h-4 w-4" /> Print Poster (A4)
            </Button>
          </div>
        </div>

        {/* Poster Wrapper - Scaled down for screen, full A4 size for print */}
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
                          <th className="border border-black p-0.5">NURSERY<br/>(Daily / Wkly)</th>
                          <th className="border border-black p-0.5">PRIMARY<br/>(Daily / Wkly)</th>
                          <th className="border border-black p-0.5">SECONDARY<br/>(Daily / Wkly)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allSelectedItems.map(({ item, sel }) => {
                          const days = getDaysCount(sel.days);
                          const unit = item.unit === "L" ? "ml" : "g";
                          return (
                            <tr key={item.name}>
                              <td className="border border-black p-0.5 text-left">{item.name}</td>
                              <td className="border border-black p-0.5">{days}</td>
                              <td className="border border-black p-0.5">{item.nursery}{unit} / {(item.nursery * days)}{unit}</td>
                              <td className="border border-black p-0.5">{item.primary}{unit} / {(item.primary * days)}{unit}</td>
                              <td className="border border-black p-0.5">{item.secondary}{unit} / {(item.secondary * days)}{unit}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="text-[10px] font-bold bg-yellow-100 border border-black p-0.5 text-center mt-1">
                      FORMULA USED FOR TOTAL QUANTITY (KG): (Total Students × Daily Grams × Days/Week) ÷ 1000
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
                    {FOOD_DICTIONARY.map((cat, cIdx) => {
                      const selectedItems = cat.items.map((item, iIdx) => ({ item, sel: selection[cIdx][iIdx] })).filter(x => x.sel.selected);
                      
                      if (selectedItems.length === 0) return null;

                      return (
                        <React.Fragment key={cat.name}>
                          {/* Category Header Row */}
                          <tr className="bg-gray-100">
                            <td colSpan={3} className="border-4 border-black p-1.5 text-center text-gray-500 font-extrabold tracking-widest text-[11px]">
                              {cat.name}
                            </td>
                          </tr>
                          
                          {/* Items */}
                          {selectedItems.map(({ item, sel }) => {
                            const daysCount = getDaysCount(sel.days);
                            const dailyQty = calculateDailyQuantity(item);
                            const weeklyQty = dailyQty * daysCount;
                            const unit = item.unit || "KG";
                            const daysString = formatDaysString(sel.days);

                            return (
                              <tr key={item.name}>
                                <td className="border-4 border-black p-1.5">{item.name}</td>
                                <td className="border-4 border-black p-1.5 text-[15px]">{weeklyQty > 0 ? `${weeklyQty.toLocaleString()}${unit}` : `0${unit}`}</td>
                                <td className="border-4 border-black p-1.5 text-[11px]">{daysString}</td>
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

        {/* Global Print Styles to ensure exact A4 formatting */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .poster-container {
                box-shadow: none !important;
                width: 100% !important;
                height: 100vh !important;
                margin: 0 !important;
                border: none !important;
                overflow: hidden !important;
              }
            }
          `
        }} />
      </div>
    </AppShell>
  );
}
