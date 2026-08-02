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
import { useAuthStore } from "@/store/auth";
import { useTranslation, useI18n } from "@/store/i18n";
import { API_URL } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — School Food Stock Management" },
      {
        name: "description",
        content:
          "Manage your profile, password, notifications, theme, language and stock data backups.",
      },
    ],
  }),
  component: SettingsPage,
});

function Card({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
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
  
  // Auth Store
  const { user, updateUser } = useAuthStore();
  
  // I18n
  const { t, lang } = useTranslation();
  const setLanguage = useI18n((s) => s.setLanguage);

  const [dark, setDark] = useState(false);
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: "Stock Manager", // Static for now, as role isn't in db yet
  });
  
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  
  // Persisted notifications
  const [notif, setNotif] = useState(() => {
    const saved = localStorage.getItem("sfsms.notif");
    return saved ? JSON.parse(saved) : { lowStock: true, delivery: true, weekly: false };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

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

  const handleNotifChange = (key: string, v: boolean) => {
    const updated = { ...notif, [key]: v };
    setNotif(updated);
    localStorage.setItem("sfsms.notif", JSON.stringify(updated));
    toast.success(`${v ? "Enabled" : "Disabled"} notification`);
  };

  const saveProfile = async () => {
    if (!user) return toast.error("Not logged in");
    if (!profile.name || !profile.email) return toast.error("Name and email are required");
    
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name: profile.name, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      
      updateUser(data.user);
      toast.success("Profile saved successfully");
    } catch (err: any) {
      toast.error("Failed to save profile", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!user) return toast.error("Not logged in");
    if (!pwd.current) return toast.error("Current password is required");
    if (pwd.next.length < 6) return toast.error("New password must be at least 6 characters");
    if (pwd.next !== pwd.confirm) return toast.error("Passwords do not match");

    setIsChangingPwd(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, currentPassword: pwd.current, newPassword: pwd.next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      setPwd({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error("Failed to change password", { description: err.message });
    } finally {
      setIsChangingPwd(false);
    }
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

  return (
    <AppShell title={t("settings")} subtitle={t("settingsSubtitle")}>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t("profile")} description={t("profileDesc")} icon={User}>
          <div className="space-y-1.5">
            <Label>{t("fullName")}</Label>
            <Input
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("email")}</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("role")}</Label>
            <Input
              value={profile.role}
              onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              disabled
            />
          </div>
          <Button onClick={saveProfile} disabled={isSaving}>{t("saveProfile")}</Button>
        </Card>

        <Card title={t("changePassword")} description={t("changePwdDesc")} icon={KeyRound}>
          <div className="space-y-1.5">
            <Label>{t("currentPwd")}</Label>
            <Input
              type="password"
              value={pwd.current}
              onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("newPwd")}</Label>
            <Input
              type="password"
              value={pwd.next}
              onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("confirmPwd")}</Label>
            <Input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
            />
          </div>
          <Button onClick={changePassword} disabled={isChangingPwd}>{t("updatePwd")}</Button>
        </Card>

        <Card
          title={t("notifications")}
          description={t("notifDesc")}
          icon={Globe}
        >
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">{t("lowStock")}</span>
            <Switch checked={notif.lowStock} onCheckedChange={(v) => handleNotifChange("lowStock", v)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">{t("delivery")}</span>
            <Switch checked={notif.delivery} onCheckedChange={(v) => handleNotifChange("delivery", v)} />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">{t("weekly")}</span>
            <Switch checked={notif.weekly} onCheckedChange={(v) => handleNotifChange("weekly", v)} />
          </div>
        </Card>

        <Card
          title={t("appearance")}
          description={t("appDesc")}
          icon={dark ? Moon : Sun}
        >
          <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
            <span className="text-sm font-medium">{t("darkMode")}</span>
            <Switch checked={dark} onCheckedChange={toggleTheme} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("language")}</Label>
            <Select
              value={lang}
              onValueChange={(v: any) => {
                setLanguage(v);
                toast.success(`Language set to ${v}`);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                <SelectItem value="Français">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card
          title={t("backup")}
          description={t("backupDesc")}
          icon={Database}
        >
          <p className="text-sm text-muted-foreground">
            {records.length} stock records and {releases.length} food releases are currently saved.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={backup}>
              <Download className="mr-2 h-4 w-4" /> {t("downloadBackup")}
            </Button>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" /> {t("restoreBackup")}
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={restore}
                />
              </label>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
