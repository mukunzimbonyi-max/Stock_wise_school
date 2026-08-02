import { createFileRoute } from "@tanstack/react-router";
import { Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NEW_ITEM_VALUE,
  useStockRecords,
  useFoodItems,
  useReleases,
  byFoodItem,
  UNITS,
} from "@/lib/stock-store";

export const Route = createFileRoute("/food-destroyed")({
  head: () => ({
    meta: [
      { title: "Food Destroyed / Lost — School Food Stock Management" },
      {
        name: "description",
        content: "View all records of destroyed, spoiled, or otherwise lost food stock.",
      },
      { property: "og:title", content: "Food Destroyed / Lost — School Food Stock Management" },
      {
        property: "og:description",
        content: "View all records of destroyed, spoiled, or otherwise lost food stock.",
      },
    ],
  }),
  component: FoodDestroyed,
});

function FoodDestroyed() {
  const { records, add } = useStockRecords();
  const { foodItems, addFoodItem } = useFoodItems();
  const { releases } = useReleases();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    foodItem: "Rice",
    unit: "Kg",
    startedWith: 0,
    destroyed: 0,
    thrownAway: 0,
    explanation: "",
  });
  const [customMode, setCustomMode] = useState(false);
  const [customItem, setCustomItem] = useState("");

  const effectiveItem = customMode && customItem.trim() ? customItem.trim() : form.foodItem;

  useEffect(() => {
    if (!customMode) {
      const currentStock = byFoodItem(records, releases).find((r) => r.item === form.foodItem)?.remaining || 0;
      setForm((f) => ({ ...f, startedWith: currentStock }));
    } else {
      setForm((f) => ({ ...f, startedWith: 0 }));
    }
  }, [form.foodItem, records, releases, customMode]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMode && !customItem.trim()) {
      toast.error("Enter the name of the new item");
      return;
    }
    if (form.destroyed <= 0 && form.thrownAway <= 0) {
      toast.error("Please enter a destroyed or thrown away quantity");
      return;
    }
    if (!form.explanation.trim()) {
      toast.error("Please provide an explanation for the loss");
      return;
    }

    if (customMode && customItem.trim()) {
      addFoodItem(customItem.trim());
    }

    add({
      ...form,
      foodItem: effectiveItem,
      received: 0,
      supplierName: "N/A",
      supplierSignature: "",
      provided: 0,
      cookName: "",
      cookSignature: "",
    });

    toast.success("Record added", {
      description: `Recorded ${form.destroyed + form.thrownAway} ${form.unit} lost for ${effectiveItem}`,
    });
    setIsOpen(false);
    setCustomMode(false);
    setCustomItem("");
    setForm({ ...form, destroyed: 0, thrownAway: 0, explanation: "" });
  };

  const destroyedRows = records
    .filter((r) => r.destroyed > 0 || r.thrownAway > 0)
    .filter((r) =>
      `${r.foodItem} ${r.explanation}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalDestroyed = records.reduce((s, r) => s + r.destroyed, 0);
  const totalThrown = records.reduce((s, r) => s + r.thrownAway, 0);

  return (
    <AppShell
      title="Food Destroyed / Lost"
      subtitle="Records of food that was destroyed, spoiled, or otherwise lost"
      search={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-5">
        <div className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Food Destroyed Summary</h2>
                <p className="text-xs text-muted-foreground">
                  Destroyed: <span className="font-semibold text-destructive">{totalDestroyed}</span> units &nbsp;·&nbsp;
                  Thrown away: <span className="font-semibold text-warning">{totalThrown}</span> units &nbsp;·&nbsp;
                  Total loss: <span className="font-semibold">{totalDestroyed + totalThrown}</span> units
                </p>
              </div>
            </div>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Destroyed
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {["Date", "Food Item", "Destroyed", "Thrown Away", "Total Lost", "Reason / Explanation"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {destroyedRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-border/70 transition-colors hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3 font-medium">{r.foodItem}</td>
                    <td className="px-4 py-3 font-semibold text-destructive">{r.destroyed}</td>
                    <td className="px-4 py-3 font-semibold text-warning">{r.thrownAway}</td>
                    <td className="px-4 py-3 font-bold">{r.destroyed + r.thrownAway}</td>
                    <td className="max-w-[280px] truncate px-4 py-3 text-muted-foreground">
                      {r.explanation || "—"}
                    </td>
                  </tr>
                ))}
                {destroyedRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      No destroyed or lost food recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Record Food Destroyed / Lost</DialogTitle>
              <DialogDescription>
                Log food that can no longer be used due to spoilage, pests, or accidents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Food Item</Label>
                  <Select
                    value={customMode ? NEW_ITEM_VALUE : form.foodItem}
                    onValueChange={(v) => {
                      if (v === NEW_ITEM_VALUE) {
                        setCustomMode(true);
                      } else {
                        setCustomMode(false);
                        setForm({ ...form, foodItem: v });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {foodItems.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                      <SelectItem value={NEW_ITEM_VALUE}>Other / New item…</SelectItem>
                    </SelectContent>
                  </Select>
                  {customMode && (
                    <Input
                      value={customItem}
                      onChange={(e) => setCustomItem(e.target.value)}
                      placeholder="Enter new item name"
                      autoFocus
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Select
                    value={form.unit}
                    onValueChange={(v) => setForm({ ...form, unit: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Destroyed</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.destroyed}
                    onChange={(e) => setForm({ ...form, destroyed: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Thrown Away</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.thrownAway}
                    onChange={(e) => setForm({ ...form, thrownAway: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Explanation / Reason</Label>
                <Textarea
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Explain why this food was lost..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
