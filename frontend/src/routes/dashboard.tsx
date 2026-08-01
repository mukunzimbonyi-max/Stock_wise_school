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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  byFoodItem,
  LOW_STOCK_THRESHOLD,
  remaining,
  summarize,
  useStockRecords,
  useReleases,
} from "@/lib/stock-store";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GS NKUBI Food Stock Management" },
      {
        name: "description",
        content:
          "Overview of food received, released, destroyed and remaining stock for GS NKUBI school kitchen.",
      },
      { property: "og:title", content: "Dashboard — GS NKUBI Food Stock Management" },
      {
        property: "og:description",
        content:
          "Live stock statistics, activity and low-stock warnings for GS NKUBI school feeding.",
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
  const { releases } = useReleases();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<"annual" | "monthly" | "daily">("annual");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [date, setDate] = useState("");

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(records.map((r) => r.date.slice(0, 4)))).sort();
    return years;
  }, [records]);

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of records) {
      if (year !== "all" && r.date.slice(0, 4) !== year) continue;
      const key = r.date.slice(0, 7);
      if (!map.has(key)) {
        map.set(key, new Date(r.date).toLocaleString("en", { month: "long", year: "numeric" }));
      }
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [records, year]);

  const changePeriod = (p: "annual" | "monthly" | "daily") => {
    setPeriod(p);
    if (p === "annual") {
      setMonth("all");
      setDate("");
    } else if (p === "monthly") {
      setDate("");
    } else {
      setMonth("all");
    }
  };

  const changeYear = (y: string) => {
    setYear(y);
    setMonth("all");
    setDate("");
  };

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (year !== "all" && r.date.slice(0, 4) !== year) return false;
        if (month !== "all" && r.date.slice(0, 7) !== month) return false;
        if (date && r.date !== date) return false;
        return true;
      }),
    [records, year, month, date],
  );

  const filteredReleases = useMemo(
    () =>
      releases.filter((r) => {
        if (year !== "all" && r.date.slice(0, 4) !== year) return false;
        if (month !== "all" && r.date.slice(0, 7) !== month) return false;
        if (date && r.date !== date) return false;
        return true;
      }),
    [releases, year, month, date],
  );

  const stats = useMemo(() => summarize(filtered, filteredReleases), [filtered, filteredReleases]);
  const perItem = useMemo(() => byFoodItem(filtered, filteredReleases), [filtered, filteredReleases]);
  const low = perItem.filter((i) => i.remaining < LOW_STOCK_THRESHOLD);

  const movement = useMemo(() => {
    const map = new Map<string, { label: string; received: number; released: number }>();
    const all = [
      ...filtered.map(r => ({ date: r.date, type: 'stock', received: r.received, released: r.provided })),
      ...filteredReleases.map(r => ({ date: r.date, type: 'release', received: 0, released: r.quantity }))
    ].sort((a, b) => a.date.localeCompare(b.date));

    for (const r of all) {
      let key: string;
      let label: string;
      if (period === "daily") {
        key = r.date;
        label = r.date.slice(5);
      } else if (period === "monthly") {
        key = r.date.slice(0, 7);
        label = new Date(r.date).toLocaleString("en", { month: "short" });
      } else if (year === "all") {
        key = r.date.slice(0, 4);
        label = key;
      } else {
        key = r.date.slice(0, 7);
        label = new Date(r.date).toLocaleString("en", { month: "short" });
      }
      const cur = map.get(key) ?? { label, received: 0, released: 0 };
      cur.received += r.received;
      cur.released += r.released;
      map.set(key, cur);
    }
    return [...map.values()];
  }, [filtered, filteredReleases, period, year]);

  const recent = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [filtered],
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
        {/* School letterhead */}
        <div className="card-surface flex items-center justify-center gap-6 px-6 py-5 text-left">
          <img
            src="/j.png"
            alt="GS NKUBI Logo"
            className="h-20 w-20 shrink-0 rounded-full bg-white object-contain p-1 shadow-sm"
          />
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Huye District · Mukura Sector
            </p>
            <p className="text-xl font-extrabold uppercase tracking-widest text-primary">
              Groupe Scolaire NKUBI
            </p>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Record Period</Label>
              <div className="flex overflow-hidden rounded-lg border border-border">
                {(["annual", "monthly", "daily"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => changePeriod(p)}
                    className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                      period === p
                        ? "gradient-primary text-primary-foreground"
                        : "bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Select value={year} onValueChange={changeYear}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {yearOptions.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {period === "monthly" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Month</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All months</SelectItem>
                    {monthOptions.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {period === "daily" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Day</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            )}

            <div className="ml-auto rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              {filtered.length} record{filtered.length === 1 ? "" : "s"} in view
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Food Received"
            value={stats.received}
            unit="units"
            icon={PackageCheck}
            tone="primary"
            trend={{ value: "+12.4%", up: true, note: "vs last month" }}
          />
          <StatCard
            label="Total Food Released"
            value={stats.released}
            unit="units"
            icon={Soup}
            tone="success"
            trend={{ value: "+8.1%", up: true, note: "student feeding" }}
          />
          <StatCard
            label="Total Food Destroyed"
            value={stats.destroyed}
            unit="units"
            icon={Trash2}
            tone="destructive"
            trend={{ value: "-2.6%", up: false, note: "loss reduced" }}
          />
          <StatCard
            label="Remaining Stock"
            value={stats.stock}
            unit="units"
            icon={Warehouse}
            tone="warning"
            trend={{ value: `${low.length} low`, up: low.length === 0, note: "items to restock" }}
          />
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
            <p className="text-xs text-muted-foreground">
              Received, released and remaining by item
            </p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perItem}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="item" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
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
                  <Pie
                    data={perItem}
                    dataKey="remaining"
                    nameKey="item"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {perItem.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length] ?? "var(--chart-1)"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card-surface p-5 lg:col-span-2">
            <h2 className="text-base font-bold capitalize">{period} Stock Movement</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={movement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="received"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="released"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
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
                <p className="text-sm text-muted-foreground">
                  All items are above the minimum level.
                </p>
              )}
              {low.map((i) => (
                <div key={i.item} className="rounded-xl border border-warning/40 bg-warning/10 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{i.item}</span>
                    <span className="shrink-0 text-sm font-bold text-warning">
                      {i.remaining} left
                    </span>
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
                  <tr
                    key={r.id}
                    className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-3 pr-4 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 pr-4 font-medium">{r.foodItem}</td>
                    <td className="py-3 pr-4">
                      {r.received} {r.unit}
                    </td>
                    <td className="py-3 pr-4">
                      {r.provided} {r.unit}
                    </td>
                    <td className="py-3 pr-4">{r.cookName}</td>
                    <td className="py-3 font-semibold text-primary">
                      {remaining(r)} {r.unit}
                    </td>
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
