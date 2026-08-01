import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Table2,
  PlusCircle,
  Soup,
  FileBarChart,
  School,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Sprout,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stock-records", label: "Stock Records", icon: Table2 },
  { to: "/add-stock", label: "Add Stock", icon: PlusCircle },
  { to: "/food-released", label: "Food Released", icon: Soup },
  { to: "/reports", label: "Stock Reports", icon: FileBarChart },
  { to: "/school-information", label: "School Information", icon: School },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
  search,
  onSearchChange,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  search?: string;
  onSearchChange?: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  const logout = () => {
    try {
      localStorage.removeItem("sfsms.session");
    } catch {
      /* ignore */
    }
    toast.success("You have been logged out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">School Food Stock</p>
            <p className="truncate text-xs text-sidebar-foreground/70">Management System</p>
          </div>
          <button
            className="ml-auto rounded-md p-1 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/20 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search ?? ""}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  placeholder="Search records..."
                  className="w-56 pl-9"
                  disabled={!onSearchChange}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
                onClick={() => toast.info("3 items are running low on stock")}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  AN
                </div>
                <div className="hidden leading-tight sm:block">
                  <p className="text-sm font-semibold">Aline Niyonkuru</p>
                  <p className="text-xs text-muted-foreground">Stock Manager</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
