import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, Mail, PhoneCall, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

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
  const loginFn = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [flipped, setFlipped] = useState(false);
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupErrors, setSignupErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Forgot password modal
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const [stats, setStats] = useState({ 
    studentsPrimary: 0, 
    studentsOLevel: 0, 
    studentsALevel: 0, 
    numberOfStaff: 0 
  });

  useEffect(() => {
    fetch(`${API_URL}/api/stock/public-stats`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch stats");
        return r.json();
      })
      .then((data) => {
        if (data && typeof data.studentsPrimary === "number") {
          setStats(data);
        }
      })
      .catch(() => {/* silently ignore – show 0s */});
  }, []);
  const scrollToLogin = () => {
    document.getElementById("signin")?.scrollIntoView({ behavior: "smooth" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Login failed", { description: data.error || "Invalid credentials" });
        setIsLoading(false);
        return;
      }

      loginFn(data.user, data.token);
      toast.success("Welcome back!", { description: "Signed in successfully." });
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Login failed", { description: "Could not connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof signupErrors = {};
    if (!name.trim()) next.name = "Full name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    if (confirmPassword !== password) next.confirmPassword = "Passwords do not match";
    setSignupErrors(next);
    if (Object.keys(next).length) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        toast.error("Signup failed", { description: data.error || "Could not create account" });
        setIsLoading(false);
        return;
      }

      loginFn(data.user, data.token);
      toast.success("Account created!", { description: "Welcome to GS NKUBI Food Stock Management." });
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error("Signup failed", { description: "Could not connect to the server." });
    } finally {
      setIsLoading(false);
    }
  };

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
      toast.error("Enter a valid email address");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send reset email");
        return;
      }
      setForgotDone(true);
    } catch {
      toast.error("Could not connect to the server.");
    } finally {
      setForgotLoading(false);
    }
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
        <div className="relative hidden flex-col justify-between overflow-hidden gradient-primary p-8 text-primary-foreground lg:flex xl:p-10">
          <div className="flex w-full max-w-md items-center justify-between">
            <img
              src="/c.png"
              alt="Republic of Rwanda"
              className="h-16 w-16 shrink-0 rounded-full bg-white object-contain p-1 shadow-md"
            />
            <div className="flex-1 px-2 text-center text-primary-foreground">
              <p className="text-xs font-bold uppercase tracking-wider">Huye District</p>
              <p className="text-xs font-bold uppercase tracking-wider">Mukura Sector</p>
              <p className="text-sm font-extrabold uppercase tracking-widest">GS NKUBI</p>
            </div>
            <img
              src="/j.png"
              alt="GS NKUBI Logo"
              className="h-16 w-16 shrink-0 rounded-full bg-white object-contain p-1 shadow-md"
            />
          </div>
          <div>
            <h2 className="max-w-md text-3xl font-extrabold leading-tight xl:text-4xl">
              Every kilogram accounted for, every meal recorded.
            </h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">
              Track food received, released to cooks, destroyed and remaining — replacing the paper
              stock book with a clear, reliable digital record.
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: stats.studentsPrimary.toString(), v: "Primary" },
                { k: stats.studentsOLevel.toString(), v: "O-Level" },
                { k: stats.studentsALevel.toString(), v: "A-Level" },
                { k: stats.numberOfStaff.toString(), v: "Staff" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl bg-primary-foreground/10 p-4">
                  <p className="text-2xl font-bold">{s.k}</p>
                  <p className="text-xs text-primary-foreground/75">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-5 backdrop-blur-md">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary-foreground">
              Contact Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-primary-foreground">
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-2.5 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">
                    Headteacher
                  </p>
                  <p className="text-sm font-bold tracking-wide">0788 479 772</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-2.5 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">DOS</p>
                  <p className="text-sm font-bold tracking-wide">0788 479 883</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-2.5 transition-colors hover:bg-primary-foreground/15">
                <PhoneCall className="h-5 w-5 shrink-0 opacity-70" />
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-70">DOD</p>
                  <p className="text-sm font-bold tracking-wide">0788 848 395</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-primary-foreground/5 p-2.5 transition-colors hover:bg-primary-foreground/15">
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
                      onClick={() => { setForgotOpen(true); setForgotDone(false); setForgotEmail(""); }}
                      className="text-sm font-semibold text-primary transition-colors hover:text-primary-glow"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={isLoading} className="h-11 w-full text-base font-semibold">
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>

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

                  <div className="flex flex-col gap-3">
                    <Button type="submit" disabled={isLoading} className="h-11 w-full text-base font-semibold">
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
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

      {/* ── Forgot Password Modal ── */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setForgotOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
            {forgotDone ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                  <Mail className="h-7 w-7 text-green-500" />
                </div>
                <h2 className="text-lg font-bold">Check your inbox</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  If <strong>{forgotEmail}</strong> is registered, a password reset link has been sent. Check your inbox (and spam folder).
                </p>
                <button
                  type="button"
                  className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={() => setForgotOpen(false)}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={sendReset} className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold">Forgot your password?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your email and we'll send you a reset link.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email address</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@school.rw"
                      className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
