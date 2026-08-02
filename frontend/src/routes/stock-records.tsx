import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Pencil,
  PlusCircle,
  Printer,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LOW_STOCK_THRESHOLD,
  remaining,
  useFoodItems,
  useStockRecords,
  type StockRecord,
  NEW_ITEM_VALUE,
} from "@/lib/stock-store";

export const Route = createFileRoute("/stock-records")({
  head: () => ({
    meta: [
      { title: "Stock Records — School Food Stock Management" },
      {
        name: "description",
        content:
          "Search, filter, edit and export every food stock book entry recorded by the school.",
      },
      { property: "og:title", content: "Stock Records — School Food Stock Management" },
      {
        property: "og:description",
        content: "The complete digital food stock book with filters, sorting and exports.",
      },
    ],
  }),
  component: StockRecords,
});

const PAGE_SIZE = 5;

function StockRecords() {
  const { records, update, remove } = useStockRecords();
  const { foodItems, addFoodItem } = useFoodItems();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [item, setItem] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<StockRecord | null>(null);
  const [editing, setEditing] = useState<StockRecord | null>(null);
  const [editCustomMode, setEditCustomMode] = useState(false);
  const [editCustomItem, setEditCustomItem] = useState("");
  const [deleting, setDeleting] = useState<StockRecord | null>(null);

  const filtered = useMemo(() => {
    let rows = records.filter((r) => {
      const text = `${r.foodItem} ${r.supplierName} ${r.cookName} ${r.explanation}`.toLowerCase();
      if (search && !text.includes(search.toLowerCase())) return false;
      if (date && r.date !== date) return false;
      if (item !== "all" && r.foodItem !== item) return false;
      if (status === "low" && remaining(r) >= LOW_STOCK_THRESHOLD) return false;
      if (status === "ok" && remaining(r) < LOW_STOCK_THRESHOLD) return false;
      if (status === "loss" && r.destroyed + r.thrownAway === 0) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "item":
          return a.foodItem.localeCompare(b.foodItem);
        case "remaining-desc":
          return remaining(b) - remaining(a);
        default:
          return b.date.localeCompare(a.date);
      }
    });
    return rows;
  }, [records, search, date, item, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const exportCsv = () => {
    const header = [
      "Date",
      "Food Item",
      "Started With",
      "Received",
      "Supplier",
      "Supplier Signature",
      "Remaining",
      "Explanation",
    ];
    const body = filtered.map((r) => [
      r.date,
      r.foodItem,
      r.startedWith,
      r.received,
      r.supplierName,
      r.supplierSignature,
      remaining(r),
      `"${r.explanation.replace(/"/g, "'")}"`,
    ]);
    const csv = [header, ...body].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-records.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel (CSV) export downloaded");
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.text("Stock Records - School Food Stock Management", 14, 15);

    const head = [[
      "Date",
      "Food Item",
      "Started With",
      "Received",
      "Supplier",
      "Remaining",
    ]];
    const body = filtered.map((r) => [
      r.date,
      r.foodItem,
      r.startedWith.toString(),
      r.received.toString(),
      r.supplierName || "",
      remaining(r).toString(),
    ]);

    (doc as any).autoTable({
      head,
      body,
      startY: 20,
      theme: "grid",
    });

    doc.save("stock-records.pdf");
    toast.success("PDF export downloaded");
  };

  const print = () => {
    toast.info("Preparing print view...");
    setTimeout(() => window.print(), 200);
  };

  return (
    <AppShell
      title="Stock Records"
      subtitle={`${filtered.length} record(s) in the food stock book`}
      search={search}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(1);
      }}
    >
      <div className="space-y-5">
        <div className="card-surface p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Food, supplier, cook..."
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Filter by date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Food item</Label>
              <Select
                value={item}
                onValueChange={(v) => {
                  setItem(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All items</SelectItem>
                  {foodItems.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Stock status</Label>
              <Select
                value={status}
                onValueChange={(v) => {
                  setStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="ok">Sufficient</SelectItem>
                  <SelectItem value="low">Low stock</SelectItem>
                  <SelectItem value="loss">Has loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort by</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest first</SelectItem>
                  <SelectItem value="date-asc">Oldest first</SelectItem>
                  <SelectItem value="item">Food item (A–Z)</SelectItem>
                  <SelectItem value="remaining-desc">Highest remaining</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/add-stock">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Stock Record
              </Link>
            </Button>
            <Button variant="outline" onClick={exportPdf}>
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" onClick={exportCsv}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={print}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
          </div>
        </div>

        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {[
                    "Date",
                    "Food Item",
                    "Started With",
                    "Received",
                    "Supplier Name",
                    "Supplier Signature",
                    "Remaining Stock",
                    "Explanation",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const rem = remaining(r);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-border/70 transition-colors hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3">{r.date}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">{r.foodItem}</td>
                      <td className="px-4 py-3">{r.startedWith}</td>
                      <td className="px-4 py-3">{r.received}</td>
                      <td className="whitespace-nowrap px-4 py-3">{r.supplierName}</td>
                      <td className="whitespace-nowrap px-4 py-3 italic text-muted-foreground">
                        {r.supplierSignature}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${rem < LOW_STOCK_THRESHOLD ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}
                        >
                          {rem} {r.unit}
                        </span>
                      </td>
                      <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                        {r.explanation}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="View"
                            onClick={() => setViewing(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={() => setEditing({ ...r })}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Delete"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(r)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={15} className="px-4 py-10 text-center text-muted-foreground">
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {rows.length} of {filtered.length} records · Page {current} of {pages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={current === 1}
                onClick={() => setPage(current - 1)}
              >
                Previous
              </Button>
              {Array.from({ length: pages }, (_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={current === i + 1 ? "default" : "outline"}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={current === pages}
                onClick={() => setPage(current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewing?.foodItem} — {viewing?.date}
            </DialogTitle>
            <DialogDescription>Full stock book entry details</DialogDescription>
          </DialogHeader>
          {viewing && (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Started With", `${viewing.startedWith} ${viewing.unit}`],
                ["Received", `${viewing.received} ${viewing.unit}`],
                ["Supplier", viewing.supplierName],
                ["Supplier Signature", viewing.supplierSignature],
                ["Remaining", `${remaining(viewing)} ${viewing.unit}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/60 p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
              <div className="col-span-2 rounded-lg bg-muted/60 p-3">
                <dt className="text-xs text-muted-foreground">Explanation</dt>
                <dd className="font-medium">{viewing.explanation || "—"}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit stock record</DialogTitle>
            <DialogDescription>Remaining stock recalculates automatically.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editing.date}
                  onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Food item</Label>
                <Select
                  value={editCustomMode ? NEW_ITEM_VALUE : editing.foodItem}
                  onValueChange={(v) => {
                    if (v === NEW_ITEM_VALUE) {
                      setEditCustomMode(true);
                    } else {
                      setEditCustomMode(false);
                      setEditing({ ...editing, foodItem: v });
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
                {editCustomMode && (
                  <Input
                    value={editCustomItem}
                    onChange={(e) => setEditCustomItem(e.target.value)}
                    placeholder="Enter new item name"
                    autoFocus
                    className="mt-2"
                  />
                )}
              </div>
              {(
                [
                  ["startedWith", "Started with"],
                  ["received", "Received"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing[key]}
                    onChange={(e) => setEditing({ ...editing, [key]: Number(e.target.value) || 0 })}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label>Supplier name</Label>
                <Input
                  value={editing.supplierName}
                  onChange={(e) => setEditing({ ...editing, supplierName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Explanation</Label>
                <Input
                  value={editing.explanation}
                  onChange={(e) => setEditing({ ...editing, explanation: e.target.value })}
                />
              </div>
              <div className="rounded-lg bg-primary/10 p-3 text-sm font-semibold text-primary sm:col-span-2">
                Remaining stock: {remaining(editing)} {editing.unit}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                if (remaining(editing) < 0) {
                  toast.error("Remaining stock cannot be negative");
                  return;
                }
                
                if (editCustomMode && !editCustomItem.trim()) {
                  toast.error("Enter the name of the new item");
                  return;
                }
                let finalItem = editing.foodItem;
                if (editCustomMode && editCustomItem.trim()) {
                  addFoodItem(editCustomItem.trim());
                  finalItem = editCustomItem.trim();
                }

                update(editing.id, { ...editing, foodItem: finalItem });
                setEditing(null);
                setEditCustomMode(false);
                setEditCustomItem("");
                toast.success("Record updated successfully");
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this record?</DialogTitle>
            <DialogDescription>
              The {deleting?.foodItem} entry from {deleting?.date} will be permanently removed from
              the stock book. This action cannot be undone.
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
                toast.success("Record deleted");
              }}
            >
              Delete record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
