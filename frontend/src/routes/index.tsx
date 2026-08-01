import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, PhoneCall, User } from "lucide-react";
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
        content:
          "Sign in to the School Food Stock Management System to record food received, released, used and remaining.",
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
  const [flipped, setFlipped] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const scrollToLogin = () => {
    document.getElementById("signin")?.scrollIntoView({ behavior: "smooth" });
  };

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

  const signup = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof signupErrors = {};
    if (!name.trim()) next.name = "Full name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";
    setSignupErrors(next);
    if (Object.keys(next).length) return;

    try {
      const users = JSON.parse(localStorage.getItem("sfsms.users") || "[]") as Array<{
        name: string;
        email: string;
        password: string;
      }>;
      users.push({ name: name.trim(), email, password });
      localStorage.setItem("sfsms.users", JSON.stringify(users));
      localStorage.setItem("sfsms.session", JSON.stringify({ email, remember }));
    } catch {
      /* ignore */
    }
    toast.success("Account created!", {
      description: "Welcome to GS NKUBI Food Stock Management.",
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="GS NKUBI — Food Stock Management home"
          >
            <img
              src="/j.png"
              alt="GS NKUBI Logo"
              className="h-10 w-10 rounded-full bg-white object-contain p-0.5 shadow-sm transition-transform group-hover:scale-105"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight">GS NKUBI</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                Food Stock Management
              </span>
            </span>
          </Link>

          <Button onClick={scrollToLogin}>Sign in</Button>
        </div>
      </nav>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between gradient-primary p-12 text-primary-foreground lg:flex">
          <div className="flex w-full max-w-md items-center justify-between">
            <img
              src="/c.png"
              alt="Republic of Rwanda"
              className="h-20 w-20 shrink-0 rounded-full bg-white object-contain p-1 shadow-md"
            />
            <div className="flex-1 px-2 text-center text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-wider">Huye District</p>
              <p className="text-xs font-bold uppercase tracking-wider">Mukura Sector</p>
              <p className="text-sm font-extrabold uppercase tracking-widest">GS NKUBI</p>
            </div>
            <img
              src="/j.png"
              alt="GS NKUBI Logo"
              className="h-20 w-20 shrink-0 rounded-full bg-white object-contain p-1 shadow-md"
            />
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
          <div className="mt-8 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur-md">
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary-foreground">
              Contact Information
            </p>
            <div className="grid grid-cols-2 gap-4 text-primary-foreground">
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-3 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                    Headteacher
                  </p>
                  <p className="text-sm font-bold tracking-wide">0788 479 772</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-3 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">DOS</p>
                  <p className="text-sm font-bold tracking-wide">0788 479 883</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-3 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">DOD</p>
                  <p className="text-sm font-bold tracking-wide">0788 848 395</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-3 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                    Bursary
                  </p>
                  <p className="text-sm font-bold tracking-wide">0787 797 645</p>
                </div>
              </div>
            </div>
            <p className="mt-5 border-t border-primary-foreground/10 pt-4 text-center text-[10px] uppercase tracking-widest text-primary-foreground/50">
              Groupe Scolaire NKUBI · Huye District
            </p>
          </div>
        </div>

        <div
          id="signin"
          className="flex scroll-mt-24 items-center justify-center bg-background px-4 py-12 sm:px-8"
        >
          <div className="w-full max-w-md">
            <div className="mb-8 flex flex-col items-center text-center">
              <img
                src="/j.png"
                alt="GS NKUBI Logo"
                className="mb-6 h-32 w-32 shrink-0 rounded-full bg-white object-contain p-2 shadow-lg"
              />
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                GS NKUBI
                <span className="mt-1 block text-lg font-semibold tracking-wide text-primary sm:text-xl">
                  Food Stock Management
                </span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {flipped
                  ? "Create your school staff account to get started."
                  : "Sign in with your school staff account to continue."}
              </p>
            </div>

            <div className="[perspective:2000px]">
              <div
                className={`grid transition-transform duration-700 [transform-style:preserve-3d] ${
                  flipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <form
                  onSubmit={submit}
                  className={`col-start-1 row-start-1 card-surface space-y-5 p-6 [backface-visibility:hidden] sm:p-8 ${
                    flipped ? "pointer-events-none" : ""
                  }`}
                >
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
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
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
                      onClick={() =>
                        toast.info("Contact the school ICT officer to reset your password.")
                      }
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
                  <p className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFlipped(true)}
                      className="font-semibold text-primary transition-colors hover:text-primary-glow"
                    >
                      Sign up
                    </button>
                  </p>
                </form>

                <form
                  onSubmit={signup}
                  className={`col-start-1 row-start-1 card-surface space-y-5 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8 ${
                    flipped ? "" : "pointer-events-none"
                  }`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Niyogisubizo Jeremie"
                        className="pl-9"
                      />
                    </div>
                    {signupErrors.name && (
                      <p className="text-xs text-destructive">{signupErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@school.rw"
                        className="pl-9"
                      />
                    </div>
                    {signupErrors.email && (
                      <p className="text-xs text-destructive">{signupErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
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
                    {signupErrors.password && (
                      <p className="text-xs text-destructive">{signupErrors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="px-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((s) => !s)}
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {signupErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{signupErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Button type="submit" className="h-11 w-full text-base font-semibold">
                    Create Account
                  </Button>
                  <p className="text-center text-sm">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFlipped(false)}
                      className="font-semibold text-primary transition-colors hover:text-primary-glow"
                    >
                      Log in
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
