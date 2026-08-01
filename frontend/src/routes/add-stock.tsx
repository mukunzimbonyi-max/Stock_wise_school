import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calculator, Save, X } from "lucide-react";
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
  NEW_ITEM_VALUE,
  UNITS,
  useFoodItems,
  useSchoolInfo,
  useStockRecords,
  byFoodItem,
  useReleases,
} from "@/lib/stock-store";

export const Route = createFileRoute("/add-stock")({
  head: () => ({
    meta: [
      { title: "Add Stock Record — School Food Stock Management" },
      {
        name: "description",
        content:
          "Record food received, released to cooks and lost, with remaining stock calculated automatically.",
      },
      { property: "og:title", content: "Add Stock Record — School Food Stock Management" },
      {
        property: "og:description",
        content: "A guided form for entering a new school food stock book record.",
      },
    ],
  }),
  component: AddStock,
});

const empty = {
  date: new Date().toISOString().slice(0, 10),
  foodItem: "Rice",
  unit: "Kg",
  startedWith: 0,
  received: 0,
  supplierName: "",
  supplierSignature: "",
  provided: 0,
  cookName: "",
  cookSignature: "",
  destroyed: 0,
  thrownAway: 0,
  explanation: "",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-5 sm:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{description}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function AddStock() {
  const { records, add } = useStockRecords();
  const { releases } = useReleases();
  const { school, setSchool } = useSchoolInfo();
  const { foodItems, addFoodItem } = useFoodItems();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [customMode, setCustomMode] = useState(false);
  const [customItem, setCustomItem] = useState("");
  type Errors = Partial<
    Record<"date" | "supplierName" | "cookName" | "received" | "explanation" | "customItem", string>
  >;
  const [errors, setErrors] = useState<Errors>({});

  const set = (k: keyof typeof empty, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const num = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) =>
    set(k, Number(e.target.value) || 0);

  const remainingQty = form.startedWith + form.received;

  const effectiveItem = customMode && customItem.trim() ? customItem.trim() : form.foodItem;

  useEffect(() => {
    if (!customMode) {
      const currentStock = byFoodItem(records, releases).find((r) => r.item === form.foodItem)?.remaining || 0;
      setForm((f) => ({ ...f, startedWith: currentStock }));
    } else {
      setForm((f) => ({ ...f, startedWith: 0 }));
    }
  }, [form.foodItem, records, releases, customMode]);

  const validate = () => {
    const next: Errors = {};
    if (!form.date) next.date = "Date is required";
    if (!form.supplierName.trim()) next.supplierName = "Supplier name is required";
    if (form.startedWith < 0 || form.received < 0) next.received = "Quantities cannot be negative";
    if (customMode && !customItem.trim()) next.customItem = "Enter the name of the new item";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const save = (again: boolean) => {
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (customMode && customItem.trim()) addFoodItem(customItem.trim());
    add({ ...form, foodItem: effectiveItem });
    toast.success("Stock record saved", {
      description: `${effectiveItem} · remaining ${remainingQty} ${form.unit}`,
    });
    if (again) {
      setForm({ ...empty, date: form.date, supplierName: form.supplierName });
      setCustomMode(false);
      setCustomItem("");
      setErrors({});
    } else {
      navigate({ to: "/stock-records" });
    }
  };

  return (
    <AppShell title="Add Stock Record" subtitle="Enter a new entry into the food stock book">
      <div className="space-y-5 pb-4">
        <Section
          title="School Information"
          description="Applies to this record and is saved with your school profile"
        >
          <div className="space-y-1.5">
            <Label>School Name</Label>
            <Input
              value={school.name}
              onChange={(e) => setSchool({ ...school, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>School Category</Label>
            <Select
              value={school.category}
              onValueChange={(v) => setSchool({ ...school, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Day School">Day School</SelectItem>
                <SelectItem value="Boarding School">Boarding School</SelectItem>
                <SelectItem value="Mixed School">Mixed School</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>School Number</Label>
            <Input
              value={school.number}
              onChange={(e) => setSchool({ ...school, number: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>District</Label>
            <Input
              value={school.district}
              onChange={(e) => setSchool({ ...school, district: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Academic Year</Label>
            <Input
              value={school.academicYear}
              onChange={(e) => setSchool({ ...school, academicYear: e.target.value })}
            />
          </div>
        </Section>

        <Section
          title="Stock Information"
          description="What was in store and what was received today"
        >
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
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
                  set("foodItem", v);
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
              />
            )}
            {errors.customItem && <p className="text-xs text-destructive">{errors.customItem}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Unit of Measurement</Label>
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
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
            <Label>Started With Quantity</Label>
            <Input type="number" min={0} value={form.startedWith} onChange={num("startedWith")} />
          </div>
          <div className="space-y-1.5">
            <Label>Received Quantity</Label>
            <Input type="number" min={0} value={form.received} onChange={num("received")} />
            {errors.received && <p className="text-xs text-destructive">{errors.received}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Supplier Name</Label>
            <Input
              value={form.supplierName}
              onChange={(e) => set("supplierName", e.target.value)}
              placeholder="e.g. Huye Agro Supplies"
            />
            {errors.supplierName && (
              <p className="text-xs text-destructive">{errors.supplierName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Supplier Signature</Label>
            <Input
              value={form.supplierSignature}
              onChange={(e) => set("supplierSignature", e.target.value)}
              placeholder="Initials of supplier"
            />
          </div>
        </Section>



        <div className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Started with + Received
              </p>
              <p
                className={`text-2xl font-bold ${remainingQty < 0 ? "text-destructive" : "text-primary"}`}
              >
                {remainingQty} {form.unit} remaining
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/stock-records" })}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button variant="secondary" onClick={() => save(true)}>
              Save and Add Another
            </Button>
            <Button onClick={() => save(false)}>
              <Save className="mr-2 h-4 w-4" /> Save Record
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
