import { createFileRoute } from "@tanstack/react-router";
import { Building2, MapPin, Pencil, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
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
import { useSchoolInfo, type SchoolInfo } from "@/lib/stock-store";

export const Route = createFileRoute("/school-information")({
  head: () => ({
    meta: [
      { title: "School Information — School Food Stock Management" },
      {
        name: "description",
        content:
          "View and update the school name, category, number, district and academic year used on stock records.",
      },
      { property: "og:title", content: "School Information — School Food Stock Management" },
      {
        property: "og:description",
        content: "School profile details attached to every food stock book entry.",
      },
    ],
  }),
  component: SchoolInformation,
});

function SchoolInformation() {
  const { school, setSchool, loaded } = useSchoolInfo();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<SchoolInfo>(school);

  useEffect(() => {
    if (loaded) setDraft(school);
  }, [loaded, school]);

  const save = () => {
    if (!draft.name.trim() || !draft.number.trim()) {
      toast.error("School name and number are required");
      return;
    }
    setSchool(draft);
    setEditing(false);
    toast.success("School information updated");
  };

  const fields: Array<[keyof SchoolInfo, string]> = [
    ["name", "School Name"],
    ["number", "School Number"],
    ["district", "District"],
    ["academicYear", "Academic Year"],
  ];

  const demographicFields: Array<[keyof SchoolInfo, string]> = [
    ["studentsPrimary", "Primary Students"],
    ["studentsOLevel", "O-Level Students"],
    ["studentsALevel", "A-Level Students"],
    ["numberOfStaff", "Total Staff"],
  ];

  return (
    <AppShell title="School Information" subtitle="Details printed on every stock report">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-surface overflow-hidden lg:col-span-1">
          <div className="gradient-primary p-8 text-center text-primary-foreground">
            <img
              src="/j.png"
              alt="GS NKUBI Logo"
              className="mx-auto h-24 w-24 rounded-full bg-white object-contain p-1 shadow-md"
            />
            <h2 className="mt-4 text-lg font-bold">{school.name}</h2>
            <p className="text-sm text-primary-foreground/80">{school.category}</p>
          </div>
          <div className="space-y-3 p-5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">Code {school.number}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">{school.district} District</span>
            </div>
            <div className="rounded-xl bg-muted/70 p-3">
              <p className="text-xs text-muted-foreground">Academic Year</p>
              <p className="font-semibold">{school.academicYear}</p>
            </div>
          </div>
        </div>

        <div className="card-surface p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">School Profile</h2>
              <p className="text-xs text-muted-foreground">
                {editing ? "Update the details and save." : "Click edit to change these details."}
              </p>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraft(school);
                    setEditing(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button onClick={save}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {fields.map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  value={draft[key] as string | number}
                  disabled={!editing}
                  onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>School Category</Label>
              <Select
                value={draft.category}
                disabled={!editing}
                onValueChange={(v) => setDraft({ ...draft, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day School">Day School</SelectItem>
                  <SelectItem value="Boarding School">Boarding School</SelectItem>
                  <SelectItem value="Mixed School">Mixed School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>School Logo</Label>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3">
                <img
                  src="/j.png"
                  alt="GS NKUBI Logo"
                  className="h-11 w-11 shrink-0 rounded-full bg-white object-contain p-0.5"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!editing}
                  onClick={() => toast.info("Logo upload will be available soon")}
                >
                  Upload logo
                </Button>
              </div>
            </div>

            <div className="col-span-1 sm:col-span-2">
              <h3 className="mt-4 text-base font-semibold">Demographics</h3>
            </div>
            
            {demographicFields.map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input
                  type="number"
                  min="0"
                  value={draft[key] as number}
                  disabled={!editing}
                  onChange={(e) => setDraft({ ...draft, [key]: parseInt(e.target.value) || 0 })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
