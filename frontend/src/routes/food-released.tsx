import { createFileRoute } from "@tanstack/react-router";
import { Soup, Trash2, Users, Utensils } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
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
import { useFoodItems, useReleases, type ReleaseRecord, useStockRecords, byFoodItem } from "@/lib/stock-store";

export const Route = createFileRoute("/food-released")({
  head: () => ({
    meta: [
      { title: "Food Released — School Food Stock Management" },
      {
        name: "description",
        content:
          "Record food released from store to the kitchen for student feeding, with cook and meal details.",
      },
      { property: "og:title", content: "Food Released — School Food Stock Management" },
      {
        property: "og:description",
        content: "Log daily food releases, students fed and meal type for the school kitchen.",
      },
    ],
  }),
  component: FoodReleased,
});

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];

function FoodReleased() {
  const { releases, add, remove } = useReleases();
  const { foodItems } = useFoodItems();
  const { records } = useStockRecords();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<ReleaseRecord | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    foodItem: "Rice",
    startedWith: 0,
    quantity: 0,
    cookName: "",
    studentsFed: 0,
    mealType: "Lunch",
    notes: "",
    cookSignature: "",
  });

  useEffect(() => {
    const currentStock = byFoodItem(records, releases).find((r) => r.item === form.foodItem)?.remaining || 0;
    setForm((f) => ({ ...f, startedWith: currentStock }));
  }, [form.foodItem, records, releases]);

  const rows = releases.filter((r) =>
    `${r.foodItem} ${r.cookName} ${r.mealType}`.toLowerCase().includes(search.toLowerCase()),
  );

  const totalQty = releases.reduce((s, r) => s + r.quantity, 0);
  const totalStudents = releases.reduce((s, r) => s + r.studentsFed, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cookName.trim()) {
      toast.error("Cook name is required");
      return;
    }
    if (form.quantity <= 0) {
      toast.error("Quantity released must be greater than zero");
      return;
    }
    
    const remainingStock = form.startedWith - form.quantity;
    if (remainingStock < 0) {
      toast.error(`Cannot release ${form.quantity}. Only ${form.startedWith} in stock.`);
      return;
    }

    add({ ...form, remaining: remainingStock });
    toast.success("Food release recorded", {
      description: `${form.quantity} of ${form.foodItem} for ${form.studentsFed} students`,
    });
    setForm({ ...form, quantity: 0, studentsFed: 0, notes: "", cookSignature: "" });
  };

  return (
    <AppShell
      title="Food Released"
      subtitle="Food handed to cooks for student feeding"
      search={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Quantity Released"
            value={totalQty}
            unit="units"
            icon={Soup}
            tone="primary"
          />
          <StatCard label="Total Students Fed" value={totalStudents} icon={Users} tone="success" />
          <StatCard
            label="Release Entries"
            value={releases.length}
            icon={Utensils}
            tone="warning"
          />
        </div>

        <form onSubmit={submit} className="card-surface p-5 sm:p-6">
          <h2 className="text-base font-bold">Record a Food Release</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            All fields are saved to this browser.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                value={form.foodItem}
                onValueChange={(v) => setForm({ ...form, foodItem: v })}
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Started With</Label>
              <Input
                type="number"
                min={0}
                value={form.startedWith}
                onChange={(e) => setForm({ ...form, startedWith: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantity Released</Label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Remaining</Label>
              <Input
                type="number"
                value={form.startedWith - form.quantity}
                readOnly
                className="bg-muted font-bold text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cook Name</Label>
              <Input
                value={form.cookName}
                onChange={(e) => setForm({ ...form, cookName: e.target.value })}
                placeholder="Niyogisubizo Jeremie"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Number of Students Fed</Label>
              <Input
                type="number"
                min={0}
                value={form.studentsFed}
                onChange={(e) => setForm({ ...form, studentsFed: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meal Type</Label>
              <Select
                value={form.mealType}
                onValueChange={(v) => setForm({ ...form, mealType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cook Signature</Label>
              <Input
                value={form.cookSignature}
                onChange={(e) => setForm({ ...form, cookSignature: e.target.value })}
                placeholder="Initials"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label>Notes</Label>
              <Textarea
                rows={1}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button type="submit">Record Release</Button>
          </div>
        </form>

        <div className="card-surface overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-bold">Recent Food Releases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {[
                    "Date",
                    "Food Item",
                    "Started With",
                    "Quantity",
                    "Remaining",
                    "Cook Name",
                    "Students Fed",
                    "Meal Type",
                    "Signature",
                    "Notes",
                    "",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-border/70 transition-colors hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                    <td className="px-4 py-3 font-medium">{r.foodItem}</td>
                    <td className="px-4 py-3">{r.startedWith ?? "—"}</td>
                    <td className="px-4 py-3">{r.quantity}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{r.remaining ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3">{r.cookName}</td>
                    <td className="px-4 py-3">{r.studentsFed}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        {r.mealType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 italic text-muted-foreground">
                      {r.cookSignature || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">
                      {r.notes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Delete"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleting(r)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                      No releases recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this release?</DialogTitle>
            <DialogDescription>
              The {deleting?.foodItem} release from {deleting?.date} will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleting) remove(deleting.id);
                setDeleting(null);
                toast.success("Release deleted");
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
