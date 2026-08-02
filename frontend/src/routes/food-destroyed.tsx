import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStockRecords } from "@/lib/stock-store";

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
  const { records } = useStockRecords();
  const [search, setSearch] = useState("");

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
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
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
    </AppShell>
  );
}
