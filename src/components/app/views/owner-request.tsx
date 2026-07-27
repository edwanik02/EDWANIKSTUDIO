"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Store, Loader2, CheckCircle2, Send } from "lucide-react";
import { api, navigate, useUI } from "@/lib/store";

export function OwnerRequest() {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", shopName: "", email: "", phone: "", businessType: "Retail", address: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.shopName || !form.email || !form.phone) { toast("Please fill all required fields", "error"); return; }
    setLoading(true);
    try {
      await api("/api/admin/owner-requests", { method: "POST", body: JSON.stringify(form) });
      setDone(true);
      toast("Request submitted successfully!");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ view: "owner" })} className="flex items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" /> Back</button>
          <span className="font-bold">Request Owner Access</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-background">
        <Card className="w-full max-w-2xl p-6 md:p-8">
          {done ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold">Request Submitted!</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">Thank you for your interest. Our admin team will review your request and create your owner account. You'll receive login credentials by email once approved.</p>
              <div className="flex gap-3 justify-center mt-6">
                <Button onClick={() => navigate({ view: "home" })}>Back to Home</Button>
                <Button variant="outline" onClick={() => navigate({ view: "owner-login" })}>Owner Login</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary mb-3"><Store className="h-7 w-7" /></div>
                <h1 className="text-2xl font-bold">Request Owner Access</h1>
                <p className="text-sm text-muted-foreground mt-1">Fill out the form below to apply as a shop owner</p>
              </div>
              <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>Full Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Shop Name *</Label><Input value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div className="space-y-1.5"><Label>Phone Number *</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="9876543210" /></div>
                <div className="space-y-1.5"><Label>Business Type</Label>
                  <Select value={form.businessType} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                      <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="Online Only">Online Only</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-1.5"><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Business address" /></div>
                <div className="sm:col-span-2 space-y-1.5"><Label>Notes</Label><Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your business..." rows={3} /></div>
                <div className="sm:col-span-2"><Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />} Submit Request</Button></div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
