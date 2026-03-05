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
      <main className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="w-full max-w-sm">
          {/* Lock Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gold/10 blur-xl scale-150" />
              <div className="relative p-5 rounded-full bg-gold/10 border border-gold/30">
                <Lock className="h-10 w-10 text-gold" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Admin <span className="gold-text">Access</span>
            </h1>
            <p className="text-sm font-body text-muted-foreground">
              Enter your password to access the admin panel.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card-dark rounded-xl p-6 space-y-5"
          >
            <div className="space-y-2">
              <Label
                htmlFor="admin-password"
                className="text-xs font-body text-muted-foreground tracking-widest uppercase"
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
                  className="bg-background border-gold/30 focus:border-gold text-foreground placeholder:text-muted-foreground pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
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
                <p className="text-xs text-destructive font-body flex items-center gap-1 mt-1">
                  <Lock className="h-3 w-3" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold-dark text-white font-display tracking-widest uppercase text-xs"
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
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-gold/15 px-4 py-2 flex items-center justify-between shadow-xs">
        <span className="text-xs font-body text-gold/70 tracking-widest uppercase flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          Admin Session Active
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Lock Panel
        </button>
      </div>
      {children}
    </>
  );
}
