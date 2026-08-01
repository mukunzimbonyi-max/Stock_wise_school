import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarRange,
  FileSpreadsheet,
  FileText,
  PackageCheck,
  Printer,
  Soup,
  Trash2,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  summarize,
  useFoodItems,
  useSchoolInfo,
  useStockRecords,
} from "@/lib/stock-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Report — School Food Stock Management" },
      {
        name: "description",
        content:
          "Generate daily, weekly and monthly food stock reports with charts and export options.",
      },
      { property: "og:title", content: "Report — School Food Stock Management" },
      {
        property: "og:description",
        content: "Filtered reports on food received, released, lost and remaining.",
      },
    ],
  }),
  component: Reports,
});

const REPORTS = [
  { title: "Daily Stock Report", desc: "Movements recorded for a single day", icon: CalendarDays },
  {
    title: "Weekly Stock Report",
    desc: "Seven-day summary of stock activity",
    icon: CalendarRange,
  },
  {
    title: "Monthly Stock Report",
    desc: "Full month of received and released food",
    icon: CalendarRange,
  },
  {
    title: "Food Received Report",
    desc: "Deliveries grouped by supplier and item",
    icon: PackageCheck,
  },
  { title: "Food Released Report", desc: "Food handed to cooks for feeding", icon: Soup },
  { title: "Food Loss Report", desc: "Destroyed and thrown-away quantities", icon: Trash2 },
  { title: "Remaining Stock Report", desc: "What is currently left in store", icon: Warehouse },
];

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary-glow)",
];

function Reports() {
  const { records } = useStockRecords();
  const { school } = useSchoolInfo();
  const { foodItems } = useFoodItems();
  const [item, setItem] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState("all");

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

  const monthLabel = monthOptions.find(([v]) => v === month)?.[1] ?? "";
  const periodLabel = month !== "all" ? monthLabel : year !== "all" ? year : "All time";

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        if (year !== "all" && r.date.slice(0, 4) !== year) return false;
        if (month !== "all" && r.date.slice(0, 7) !== month) return false;
        if (item !== "all" && r.foodItem !== item) return false;
        return true;
      }),
    [records, year, month, item],
  );

  const stats = useMemo(() => summarize(filtered), [filtered]);
  const perItem = useMemo(() => byFoodItem(filtered), [filtered]);
  const usage = perItem.map((i) => ({ item: i.item, value: i.released }));

  return (
    <AppShell
      title="Report"
      subtitle={`${periodLabel} report · ${filtered.length} records · ${school.academicYear}`}
    >
      <div className="space-y-5">
        <div className="card-surface p-5">
          <h2 className="text-base font-bold">Report Period</h2>
          <p className="text-xs text-muted-foreground">
            Choose a year and month to view the stock report for that time.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Year</Label>
              <Select
                value={year}
                onValueChange={(v) => {
                  setYear(v);
                  setMonth("all");
                }}
              >
                <SelectTrigger>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Month</Label>
              <Select value={month} onValueChange={setMonth} disabled={year === "all"}>
                <SelectTrigger>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Food Item</Label>
              <Select value={item} onValueChange={setItem}>
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
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => toast.success("PDF report generated")}>
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </Button>
            <Button variant="outline" onClick={() => toast.success("Excel report generated")}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Food Received"
            value={stats.received}
            unit="units"
            icon={PackageCheck}
            tone="primary"
          />
          <StatCard
            label="Food Released"
            value={stats.released}
            unit="units"
            icon={Soup}
            tone="success"
          />
          <StatCard
            label="Food Lost"
            value={stats.destroyed}
            unit="units"
            icon={Trash2}
            tone="destructive"
          />
          <StatCard
            label="Remaining Stock"
            value={stats.stock}
            unit="units"
            icon={Warehouse}
            tone="warning"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card-surface p-5 lg:col-span-2">
            <h2 className="text-base font-bold">Received vs Released vs Remaining</h2>
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
            <h2 className="text-base font-bold">Food Usage Share</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={usage}
                    dataKey="value"
                    nameKey="item"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {usage.map((_, i) => (
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {REPORTS.map(({ title, desc, icon: Icon }) => (
            <div key={title} className="card-surface hover-lift flex flex-col gap-3 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => toast.success(`${title} generated`)}
                >
                  Generate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`${title} exported as PDF`)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
