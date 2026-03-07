import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "vivek@1870";
const SESSION_KEY = "adminAuthenticated";

interface AdminPasswordGateProps {
  children: React.ReactNode;
}

export default function AdminPasswordGate({
  children,
}: AdminPasswordGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored === "true") {
      setAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setPassword("");
    setError("");
  };

  if (isChecking) return null;

  if (!authenticated) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "oklch(0.98 0.003 60)" }}
      >
        <div className="w-full max-w-sm">
          {/* Lock Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl scale-150"
                style={{ backgroundColor: "oklch(0.93 0.003 60 / 0.6)" }}
              />
              <div
                className="relative p-5 rounded-full border-2 border-black/20"
                style={{ backgroundColor: "oklch(0.95 0.003 60)" }}
              >
                <Lock className="h-10 w-10 text-black" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-black mb-2">
              Admin <span className="gold-text">Access</span>
            </h1>
            <p className="text-sm font-body text-black/60 font-semibold">
              Enter your password to access the admin panel.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-6 space-y-5 bg-white border-2 border-black/15 shadow-sm"
          >
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-xs font-body text-black/60 tracking-widest uppercase font-bold"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  data-ocid="admin.login.input"
                  className="bg-gray-50 border-black/25 focus:border-black/60 text-black placeholder:text-black/35 pr-10 font-semibold"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {error && (
                <p
                  className="text-xs text-destructive font-body flex items-center gap-1 mt-1 font-semibold"
                  data-ocid="admin.login.error_state"
                >
                  <Lock className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-ocid="admin.login.submit_button"
              className={`w-full font-display tracking-widest uppercase text-xs transition-all duration-300 font-bold ${
                password.length > 0
                  ? "bg-black hover:bg-neutral-800 text-white shadow-[0_0_22px_6px_oklch(0.88_0.16_82_/_0.8)] ring-2 ring-black/30 scale-[1.03]"
                  : "text-black/40 cursor-default shadow-none ring-0 scale-100 border-2 border-black/15"
              }`}
              style={
                password.length > 0
                  ? {}
                  : { backgroundColor: "oklch(0.95 0.003 60)" }
              }
            >
              Unlock Admin Panel
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Logout bar */}
      <div
        className="sticky top-0 z-50 backdrop-blur px-4 py-2 flex items-center justify-between shadow-sm"
        style={{
          backgroundColor: "oklch(0.97 0.003 60 / 0.95)",
          borderBottom: "1px solid oklch(0.65 0.13 72 / 0.3)",
        }}
      >
        <span className="text-xs font-body text-black/70 tracking-widest uppercase flex items-center gap-1.5 font-bold">
          <Lock className="h-3 w-3" />
          Admin Session Active
        </span>
        <button
          type="button"
          onClick={handleLogout}
          data-ocid="admin.logout.button"
          className="flex items-center gap-1.5 text-xs font-body text-black/60 hover:text-destructive transition-colors font-bold"
        >
          <LogOut className="h-3.5 w-3.5" />
          Lock Panel
        </button>
      </div>
      {children}
    </>
  );
}
