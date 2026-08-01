import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, Sprout } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Login — School Food Stock Management System" },
      {
        name: "description",
        content:
          "Sign in to the School Food Stock Management System to record food received, released, used and remaining.",
      },
      { property: "og:title", content: "Login — School Food Stock Management System" },
      {
        property: "og:description",
        content: "Secure sign in for school staff managing daily food stock records.",
      },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("stockmanager@gshuye.rw");
  const [password, setPassword] = useState("school2026");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      localStorage.setItem("sfsms.session", JSON.stringify({ email, remember }));
    } catch {
      /* ignore */
    }
    toast.success("Welcome back!", { description: "Signed in successfully." });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between gradient-primary p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-foreground/15">
            <Sprout className="h-7 w-7" />
          </div>
          <span className="text-lg font-bold">School Food Stock</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-tight">
            Every kilogram accounted for, every meal recorded.
          </h2>
          <p className="mt-4 max-w-md text-primary-foreground/80">
            Track food received, released to cooks, destroyed and remaining — replacing the paper
            stock book with a clear, reliable digital record.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "6", v: "Food items" },
              { k: "480", v: "Students fed" },
              { k: "100%", v: "Traceable" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-primary-foreground/10 p-4">
                <p className="text-2xl font-bold">{s.k}</p>
                <p className="text-xs text-primary-foreground/75">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-foreground/70">Groupe Scolaire Huye · Huye District</p>
      </div>

      <div className="flex items-center justify-center bg-background px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground">
              <Sprout className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
              School Food Stock Management System
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with your school staff account to continue.
            </p>
          </div>

          <form onSubmit={submit} className="card-surface space-y-5 p-6 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.rw"
                  className="pl-9"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-9"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(v) => setRemember(Boolean(v))}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast.info("Contact the school ICT officer to reset your password.")}
                className="text-sm font-semibold text-primary transition-colors hover:text-primary-glow"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" className="h-11 w-full text-base font-semibold">
              Login
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo account is pre-filled — just press Login.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
