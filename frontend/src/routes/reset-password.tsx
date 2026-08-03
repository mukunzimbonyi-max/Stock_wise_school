import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — School Food Stock Management" },
      { name: "description", content: "Set a new password for your GS NKUBI Food Stock account." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) ?? "",
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token. Please request a new reset link.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to reset password. The link may have expired.");
        return;
      }

      setDone(true);
      toast.success("Password reset successfully!");
    } catch {
      toast.error("Could not connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card-surface p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <img
              src="/j.png"
              alt="GS NKUBI Logo"
              className="mx-auto mb-4 h-20 w-20 rounded-full bg-white object-contain p-1.5 shadow-md"
            />
            <h1 className="text-2xl font-extrabold tracking-tight">
              {done ? "Password Reset!" : "Set New Password"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {done
                ? "Your password has been updated. You can now log in."
                : "Enter and confirm your new password below."}
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <Button
                className="h-11 w-full text-base font-semibold"
                onClick={() => navigate({ to: "/" })}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {!token && (
                <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm font-medium text-destructive">
                  ⚠️ This reset link is invalid or has expired. Please request a new one.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="px-9"
                    disabled={!token}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="px-9"
                    disabled={!token}
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
              </div>

              <Button
                type="submit"
                disabled={isLoading || !token}
                className="h-11 w-full text-base font-semibold"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <p className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/" })}
                  className="font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  ← Back to Login
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
