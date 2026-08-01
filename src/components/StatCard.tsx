import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  tone = "primary",
}: {
  label: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  trend?: { value: string; up: boolean; note?: string };
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  } as const;

  return (
    <div className="card-surface hover-lift p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString() : value}
            {unit && (
              <span className="ml-1 text-base font-semibold text-muted-foreground">{unit}</span>
            )}
          </p>
        </div>
        <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
              trend.up ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
          {trend.note && <span className="truncate text-muted-foreground">{trend.note}</span>}
        </div>
      )}
    </div>
  );
}
