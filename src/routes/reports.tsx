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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { byFoodItem, FOOD_ITEMS, summarize, useSchoolInfo, useStockRecords } from "@/lib/stock-store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Stock Reports — School Food Stock Management" },
      {
        name: "description",
        content:
          "Generate daily, weekly and monthly food stock reports with charts and export options.",
      },
      { property: "og:title", content: "Stock Reports — School Food Stock Management" },
      {
        property: "og:description",
        content: "Filtered reports on food received, released, lost and remaining.",
      },
    ],
  }),
  component: Reports;
});

function Reports() {
  return null;
}
