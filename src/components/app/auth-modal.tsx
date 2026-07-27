"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useUI, api, navigate } from "@/lib/store";
import { Loader2, Mail, Lock, User, Phone, KeyRound } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function AuthModal() {
  const { authModal, closeAuth, requireAuthMsg, toast } = useUI();
  const { fetchUser } = useAuth();
  const [mode, setMode] = useState<"login" | "register" | "otp" | "forgot" | "reset">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  React.useEffect(() => {
    if (authModal) setMode(authModal === "register" ? "register" : "login");
  }, [authModal]);

  const open = !!authModal;

  async function handleLogin() {
    setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      await fetchUser();
      toast(`Welcome back, ${data.user.name}!`);
      closeAuth();
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN") navigate({ view: "admin", tab: "dashboard" });
      else if (data.user.role === "OWNER") navigate({ view: "owner-dash", tab: "overview" });
      else navigate({ view: "home" });
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    try {
      await api("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, name, phone }) });
      await fetchUser();
      toast("Account created! Check the server log for your OTP.");
      setMode("otp");
      setOtp("");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setLoading(true);
    try {
      const data = await api("/api/auth/otp", { method: "PUT", body: JSON.stringify({ code: otp }) });
      await fetchUser();
      toast("Email verified successfully!");
      closeAuth();
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    try {
      await api("/api/auth/otp/send", { method: "POST", body: JSON.stringify({}) });
      toast("New OTP sent. Check the server log.");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    setLoading(true);
    try {
      await api("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email: resetEmail }) });
      toast("Reset OTP sent. Check the server log.");
      setMode("reset");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await api("/api/auth/reset", { method: "POST", body: JSON.stringify({ email: resetEmail, code: otp, password: newPassword }) });
      toast("Password reset! Please login.");
      setMode("login");
      setPassword("");
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeAuth()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" && "Customer Login"}
            {mode === "register" && "Create Account"}
            {mode === "otp" && "Verify Your Email"}
            {mode === "forgot" && "Reset Password"}
            {mode === "reset" && "Set New Password"}
          </DialogTitle>
          <DialogDescription>
            {requireAuthMsg && <span className="text-primary font-medium block mb-1">{requireAuthMsg}</span>}
            {mode === "login" && "Enter your credentials to access your account."}
            {mode === "register" && "Sign up to start shopping and track orders."}
            {mode === "otp" && "Enter the 6-digit code sent to your email (see server log)."}
            {mode === "forgot" && "We'll send a reset code to your email."}
            {mode === "reset" && "Enter the code and your new password."}
          </DialogDescription>
        </DialogHeader>

        {mode === "login" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" className="pl-9" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              </div>
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Login
            </Button>
            <div className="flex justify-between text-xs">
              <button className="text-primary hover:underline" onClick={() => setMode("forgot")}>Forgot password?</button>
              <button className="text-primary hover:underline" onClick={() => setMode("register")}>Create account</button>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2 border-t">
              Demo: customer@funzitoys.com / customer123
            </p>
          </div>
        )}

        {mode === "register" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="pl-9" />
              </div>
            </div>
            <Button className="w-full" onClick={handleRegister} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Create Account
            </Button>
            <button className="text-xs text-primary hover:underline w-full text-center" onClick={() => setMode("login")}>Already have an account? Login</button>
          </div>
        )}

        {mode === "otp" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Verification Code</Label>
              <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button className="w-full" onClick={handleVerifyOtp} disabled={loading || otp.length < 6}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Verify
            </Button>
            <button className="text-xs text-primary hover:underline w-full text-center" onClick={handleResendOtp} disabled={loading}>
              Resend code
            </button>
          </div>
        )}

        {mode === "forgot" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button className="w-full" onClick={handleForgot} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send Reset Code
            </Button>
            <button className="text-xs text-primary hover:underline w-full text-center" onClick={() => setMode("login")}>Back to login</button>
          </div>
        )}

        {mode === "reset" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Reset Code</Label>
              <InputOTP maxLength={6} value={otp} onChange={(v) => setOtp(v)}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="pl-9" />
              </div>
            </div>
            <Button className="w-full" onClick={handleReset} disabled={loading || otp.length < 6 || newPassword.length < 6}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Reset Password
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

