"use client";

/**
 * @fileoverview Login page.
 *
 * Matches the Figma design: left panel with login form, right panel with
 * Obliq orange wave gradient illustration and UI preview.
 *
 * Security: Token is stored in localStorage + cookie on success.
 * Performance: Form state is local; no query needed until submission.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { apiLogin, setTokens } from "@/lib/api";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      const { accessToken, refreshToken } = res.data;
      setTokens(accessToken, refreshToken);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string })?.message ??
        (err as { error?: string })?.error ??
        "Invalid credentials";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left: Login Form Panel ── */}
      <div className="flex flex-col justify-center items-center w-full lg:w-[45%] px-8 py-12 bg-white">
        {/* Logo */}
        <div className="w-full max-w-sm mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl gradient-obliq flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-bold text-base">O</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">Obliq</span>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-1">Login</h1>
            <p className="text-muted-foreground text-sm">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v: boolean | "indeterminate") => setRemember(v === true)}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-obliq border-0 text-white font-semibold py-2.5 hover:opacity-90 transition-opacity shadow-md shadow-orange-200 group"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <span className="flex items-center gap-2">
                  Log in
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <button className="font-bold text-foreground hover:text-primary transition-colors">
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* ── Right: Wave Illustration Panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden wave-bg">
        {/* Abstract wave blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <svg viewBox="0 0 800 600" className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="g1" cx="30%" cy="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g2" cx="70%" cy="20%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="g3" cx="60%" cy="80%">
                <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#b91c1c" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <ellipse cx="200" cy="300" rx="400" ry="350" fill="url(#g1)"/>
            <ellipse cx="550" cy="100" rx="350" ry="300" fill="url(#g2)"/>
            <ellipse cx="500" cy="500" rx="300" ry="200" fill="url(#g3)"/>
            {/* Wave path */}
            <path d="M0,200 Q200,100 400,200 T800,200 V600 H0Z" fill="#f97316" fillOpacity="0.12"/>
            <path d="M0,280 Q200,160 400,260 T800,240 V600 H0Z" fill="#ef4444" fillOpacity="0.10"/>
            <path d="M0,350 Q200,250 400,330 T800,310 V600 H0Z" fill="#b91c1c" fillOpacity="0.09"/>
          </svg>
        </div>

        {/* Floating UI preview card */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-12">
          {/* Mini app preview */}
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl animate-fade-in">
            {/* Header row */}
            <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-white/20">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">O</span>
              </div>
              <span className="text-white font-semibold text-sm">Obliq</span>
            </div>
            {/* Mock nav */}
            {["Dashboard", "Leads", "Tasks", "Reports"].map((item, i) => (
              <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1 ${i === 2 ? "bg-[#f97316]/30" : "hover:bg-white/10"}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${i === 2 ? "bg-[#f97316]" : "bg-white/40"}`}/>
                <span className={`text-xs font-medium ${i === 2 ? "text-white" : "text-white/60"}`}>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Manage your team with ease
            </h2>
            <p className="text-white/70 text-sm max-w-xs leading-relaxed">
              Role-based access control, audit logs, and real-time permission management — all in one place.
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
