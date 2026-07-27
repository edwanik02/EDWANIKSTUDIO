"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft, Store, Loader2 } from "lucide-react";
import { api, navigate, useAuth, useUI } from "@/lib/store";
import type { SiteSettings } from "../app-shell";

export function OwnerLogin({ settings }: { settings: SiteSettings }) {
  const { fetchUser } = useAuth();
  const { toast } = useUI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (data.user.role !== "OWNER") { toast("This login is for shop owners only", "error"); return; }
      await fetchUser();
      toast(`Welcome, ${data.user.name}!`);
      navigate({ view: "owner-dash", tab: "overview" });
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ view: "owner" })} className="flex items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" /> Back</button>
          <span className="font-bold">{settings.siteName} · Owner</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary mb-3"><Store className="h-7 w-7" /></div>
            <h1 className="text-2xl font-bold">Owner Login</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your shop owner dashboard</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9" placeholder="owner@example.com" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" placeholder="••••••" /></div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Login to Dashboard</Button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground text-center">
            <p className="font-medium text-foreground mb-1">Demo Owner Account</p>
            owner@funzitoys.com / owner123
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account? <button className="text-primary hover:underline" onClick={() => navigate({ view: "owner-request" })}>Request Access</button>
          </p>
        </Card>
      </div>
    </div>
  );
}
