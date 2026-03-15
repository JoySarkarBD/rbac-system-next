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

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { apiLogin, setTokens } from "@/lib/api";
import Image from "next/image";


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
    <div className="lg:flex flex-col lg:flex-row min-h-screen overflow-hidden bg-white lg:bg-transparent">
      {/* LEFT: White Card Form Panel */}
      <div className="w-50 mx-auto lg:absolute lg:top-7.5 lg:flex lg:items-center lg:justify-center pl-10 pt-20 lg:pt-0">
          <Image src="/logo.png" alt="Obliq" width={100} height={100} className="rounded-2xl" />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 lg:w-[45%]">
        <div className="w-full max-w-[500px] bg-white rounded-3xl border-8 border-[#C2C2C21A] p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
          
          </div>

          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-black">Login</h1>
            <p className="text-[#9BA0AB] mt-2">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-[#404857]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`p-5 ${errors.email ? "border-red-500" : ""}`}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-[#404857]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`p-5 pr-12 ${errors.password ? "border-red-500" : ""}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Remember me + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(!!checked)}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="cursor-pointer text-[#404857]">Remember me</Label>
              </div>
              <span className="font-semibold text-[#FD6D3F] hover:underline cursor-pointer">Forgot password?</span>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#FD6D3F] hover:bg-[#FD6D3F] text-white font-semibold text-lg rounded-2xl shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-[#404857]">
            Don&apos;t have an account?{" "}
            <span className="font-bold text-black cursor-pointer hover:underline">Sign up</span>
          </p>
        </div>
      </div>

      {/* RIGHT: Orange Wave + App Preview (exact Figma) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center">

        {/* App Preview Screenshot */}
        <div className="relative w-full max-w-[920px] p-8">
          <div className="rounded-3xl">
            <Image
              src="/login-page-right-bg.png"
              alt="Obliq App Preview"
              width={100}
              height={100}
              className="w-full h-auto object-cover"
              unoptimized
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
