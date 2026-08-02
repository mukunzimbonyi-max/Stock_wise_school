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
  ChevronsLeft,
  ChevronsRight,
  Trash2,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stock-records", label: "Stock Records", icon: Table2 },
  { to: "/add-stock", label: "Add Stock", icon: PlusCircle },
  { to: "/food-released", label: "Food Released", icon: Soup },
  { to: "/food-destroyed", label: "Food Destroyed", icon: Trash2 },
  { to: "/reports", label: "Report", icon: FileBarChart },
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
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuthStore((state) => state.user);
  const logoutFn = useAuthStore((state) => state.logout);

  useEffect(() => setOpen(false), [pathname]);

  const logout = () => {
    logoutFn();
    toast.success("You have been logged out");
    navigate({ to: "/" });
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:translate-x-0",
          collapsed ? "w-20" : "w-72",
          open ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white p-0.5 shadow-sm">
            <img src="/j.png" alt="School Logo" className="h-full w-full object-contain" />
          </div>
          {(!collapsed || open) && (
            <div className="min-w-0 flex-1 transition-opacity duration-300">
              <p className="truncate text-sm font-bold leading-tight">G.S. NKUBI</p>
              <p className="truncate text-[10px] uppercase tracking-wider text-sidebar-foreground/70">
                Food Stock Management
              </p>
            </div>
          )}
          <button
            className="ml-auto hidden rounded-md p-1.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:block"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5" />
            ) : (
              <ChevronsLeft className="h-5 w-5" />
            )}
          </button>
          <button
            className="ml-auto rounded-md p-1.5 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 min-h-0 space-y-1 overflow-y-auto p-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              title={collapsed && !open ? label : undefined}
              className={cn(
                "flex items-center rounded-lg py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground",
                collapsed && !open ? "justify-center px-0" : "gap-3 px-3",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!collapsed || open) && <span className="truncate">{label}</span>}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-2 border-t border-sidebar-border" />

          {/* Logout */}
          <button
            onClick={logout}
            title={collapsed && !open ? "Logout" : undefined}
            className={cn(
              "flex w-full items-center rounded-lg py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/20 hover:text-destructive",
              collapsed && !open ? "justify-center px-0" : "gap-3 px-3",
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(!collapsed || open) && <span>Logout</span>}
          </button>
        </nav>


      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-72")}>
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
              {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="hidden text-left leading-tight sm:block">
                      <p className="text-sm font-semibold">{user?.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">Stock Manager</p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "No email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/settings" })}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
