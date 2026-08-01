import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileBarChart,
  PackageCheck,
  PackageMinus,
  PlusCircle,
  Soup,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  byFoodItem,
  LOW_STOCK_THRESHOLD,
  remaining,
  summarize,
  useStockRecords,
} from "@/lib/stock-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — School Food Stock Management" },
      {
        name: "description",
        content:
          "Overview of food received, released, destroyed and remaining stock for the school kitchen.",
      },
      { property: "og:title", content: "Dashboard — School Food Stock Management" },
      {
        property: "og:description",
        content: "Live stock statistics, activity and low-stock warnings for school feeding.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary-glow)",
];

function Dashboard() {
  const { records } = useStockRecords();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => summarize(records), [records]);
  const perItem = useMemo(() => byFoodItem(records), [records]);
  const low = perItem.filter((i) => i.remaining < LOW_STOCK_THRESHOLD);

  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; received: number; released: number }>();
    for (const r of [...records].sort((a, b) => a.date.localeCompare(b.date))) {
      const key = r.date.slice(0, 7);
      const month = new Date(r.date).toLocaleString("en", { month: "short" });
      const cur = map.get(key) ?? { month, received: 0, released: 0 };
      cur.received += r.received;
      cur.released += r.provided;
      map.set(key, cur);
    }
    return [...map.values()];
  }, [records]);

  const recent = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [records],
  );

  const filteredRecent = recent.filter((r) =>
    `${r.foodItem} ${r.supplierName} ${r.cookName}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell
      title="Dashboard"
      subtitle="Food stock overview for the current academic year"
      search={search}
      onSearchChange={setSearch}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Food Received" value={stats.received} unit="units" icon={PackageCheck} tone="primary" trend={{ value: "+12.4%", up: true, note: "vs last month" }} />
          <StatCard label="Total Food Released" value={stats.released} unit="units" icon={Soup} tone="success" trend={{ value: "+8.1%", up: true, note: "student feeding" }} />
          <StatCard label="Total Food Destroyed" value={stats.destroyed} unit="units" icon={Trash2} tone="destructive" trend={{ value: "-2.6%", up: false, note: "loss reduced" }} />
          <StatCard label="Remaining Stock" value={stats.stock} unit="units" icon={Warehouse} tone="warning" trend={{ value: `${low.length} low`, up: low.length === 0, note: "items to restock" }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Button asChild className="h-12 justify-start gap-2 text-base">
            <Link to="/add-stock">
              <PlusCircle className="h-5 w-5" /> Add New Stock
            </Link>
          </Button>
          <Button asChild variant="secondary" className="h-12 justify-start gap-2 text-base">
            <Link to="/food-released">
              <Soup className="h-5 w-5" /> Record Food Release
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 justify-start gap-2 text-base">
            <Link to="/reports">
              <FileBarChart className="h-5 w-5" /> Generate Report
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card-surface p-5 lg:col-span-2">
            <h2 className="text-base font-bold">Food Stock Summary</h2>
            <p className="text-xs text-muted-foreground">Received, released and remaining by item</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perItem}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="item" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="received" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="released" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="remaining" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-5">
            <h2 className="text-base font-bold">Stock Distribution</h2>
            <p className="text-xs text-muted-foreground">Remaining stock share</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={perItem} dataKey="remaining" nameKey="item" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {perItem.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length] ?? "var(--chart-1)"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card-surface p-5 lg:col-span-2">
            <h2 className="text-base font-bold">Monthly Stock Movement</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="received" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="released" stroke="var(--chart-2)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="text-base font-bold">Low Stock Warnings</h2>
            </div>
            <div className="mt-4 space-y-3">
              {low.length === 0 && (
                <p className="text-sm text-muted-foreground">All items are above the minimum level.</p>
              )}
              {low.map((i) => (
                <div key={i.item} className="rounded-xl border border-warning/40 bg-warning/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{i.item}</span>
                    <span className="shrink-0 text-sm font-bold text-warning">{i.remaining} left</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Below the {LOW_STOCK_THRESHOLD}-unit minimum. Order from supplier soon.
                  </p>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link to="/add-stock">
                  <PackageMinus className="mr-2 h-4 w-4" /> Restock now
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-bold">Recent Stock Activity</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Food Item</th>
                  <th className="pb-3 pr-4 font-semibold">Received</th>
                  <th className="pb-3 pr-4 font-semibold">Provided</th>
                  <th className="pb-3 pr-4 font-semibold">Cook</th>
                  <th className="pb-3 font-semibold">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((r) => (
                  <tr key={r.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                    <td className="py-3 pr-4 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 pr-4 font-medium">{r.foodItem}</td>
                    <td className="py-3 pr-4">{r.received} {r.unit}</td>
                    <td className="py-3 pr-4">{r.provided} {r.unit}</td>
                    <td className="py-3 pr-4">{r.cookName}</td>
                    <td className="py-3 font-semibold text-primary">{remaining(r)} {r.unit}</td>
                  </tr>
                ))}
                {filteredRecent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      No matching activity.
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
