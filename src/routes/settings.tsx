import { createFileRoute } from "@tanstack/react-router";
import { Database, Download, Globe, KeyRound, Moon, Sun, Upload, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReleases, useSchoolInfo, useStockRecords } from "@/lib/stock-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — School Food Stock Management" },
      {
        name: "description",
        content:
          "Manage your profile, password, notifications, theme, language and stock data backups.",
      },
      { property: "og:title", content: "Settings — School Food Stock Management" },
      {
        property: "og:description",
        content: "Personalise the school food stock system and back up your records.",
      },
    ],
  }),
  component: SettingsPage,
});

function Card({ title, description, icon: Icon, children }: { title: string; description: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function SettingsPage() {
  const { records, setRecords } = useStockRecords();
  const { releases } = useReleases();
  const { school } = useSchoolInfo();
  const [dark, setDark] = useState(false);
  const [profile, setProfile] = useState({ name: "Aline Niyonkuru", email: "stockmanager@gshuye.rw", role: "Stock Manager" });
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [notif, setNotif] = useState({ lowStock: true, delivery: true, weekly: false });
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const saved = localStorage.getItem("sfsms.theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleTheme = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("sfsms.theme", v ? "dark" : "light");
    toast.success(`${v ? "Dark" : "Light"} mode enabled`);
  };

  const backup = () => {
    const data = JSON.stringify({ records, releases, school }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "school-food-stock-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const restore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (Array.isArray(parsed.records)) {
          setRecords(parsed.records);
          toast.success("Backup restored successfully");
        } else {
          toast.error("This file does not contain stock records");
        }
      } catch {
        toast.error("Could not read the backup file");
      }
    };
    reader.readAsText(file);
  };

  const changePassword = () => {
    if (pwd.next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (pwd.next !== pwd.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    toast.success("Password changed successfully");
  };

  return (
    <AppShell title="Settings" subtitle="Personalise the system and manage your data">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Profile Settings" description="Your account details" icon={User}>
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
          </div>
          <Button onClick={() => toast.success("Profile saved")}>Save profile</Button>
        </Card>

        <Card title="Change Password" description="Keep your account secure" icon={KeyRound}>
          <div className="space-y-1.5">
            <Label>Current password</Label>
            <Input type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>New password</Label>
            <Input type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm new password</Label>
            <Input type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          </div>
          <Button onClick={changePassword}>Update password</Button>
        </Card>

        <Card title="Notifications" description="Choose what the system alerts you about" icon={Globe}>
          {([
            ["lowStock", "Low stock warnings"],
            ["delivery", "New delivery recorded"],
            ["weekly", "Weekly summary email"],
          ] as const).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
              <span className="text-sm font-medium">{label}</span>
              <Switch
                checked={notif[key]}
                onCheckedChange={(v) => {
                  setNotif({ ...notif, [key]: v });
                  toast.success(`${label} ${v ? "enabled" : "disabled"}`);
                }}
              />
            </div>
          ))}
        </Card>

        <Card title="Appearance & Language" description="Theme and interface language" icon={dark ? Moon : Sun}>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">Dark mode</span>
            <Switch checked={dark} onCheckedChange={toggleTheme} />
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={(v) => { setLanguage(v); toast.success(`Language set to ${v}`); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                <SelectItem value="Français">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card title="Data Backup & Restore" description="Your records are stored in this browser" icon={Database}>
          <p className="text-sm text-muted-foreground">
            {records.length} stock records and {releases.length} food releases are currently saved.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={backup}>
              <Download className="mr-2 h-4 w-4" /> Download backup
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> Restore backup
                <input type="file" accept="application/json" className="hidden" onChange={restore} />
              </label>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
