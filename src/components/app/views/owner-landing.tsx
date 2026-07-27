"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, TrendingUp, ShieldCheck, Package, BarChart3, Users, ArrowRight, Check, Star } from "lucide-react";
import { navigate, useAuth } from "@/lib/store";
import type { SiteSettings } from "../app-shell";

export function OwnerLanding({ settings }: { settings: SiteSettings }) {
  const { user } = useAuth();

  const features = [
    { icon: Package, title: "Product Management", desc: "Add, edit, and manage your entire product catalog with images and inventory." },
    { icon: BarChart3, title: "Sales Analytics", desc: "Track revenue, orders, and top products with real-time dashboards." },
    { icon: Users, title: "Customer Insights", desc: "View customer profiles, order history, and spending patterns." },
    { icon: TrendingUp, title: "Grow Revenue", desc: "Reach thousands of active shoppers on FunziToys marketplace." },
    { icon: ShieldCheck, title: "Secure Platform", desc: "Role-based access control and encrypted transactions." },
    { icon: Store, title: "Store Customization", desc: "Personalize your store with branding and settings." },
  ];

  const benefits = [
    "Zero setup fees — start selling today",
    "Manage orders and inventory in one place",
    "Real-time sales and performance analytics",
    "Dedicated owner dashboard with full control",
    "Permission-based access controlled by admin",
    "Upload unlimited product images and brand logos",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate({ view: "home" })} className="flex items-center gap-2">
            {settings.logoUrl ? <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-9 object-contain" /> : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">{settings.siteName.charAt(0)}</div>}
            <span className="font-bold text-lg">{settings.siteName}</span>
            <Badge variant="secondary" className="ml-1">For Owners</Badge>
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate({ view: "home" })}>Customer Site</Button>
            {user?.role === "OWNER" ? (
              <Button onClick={() => navigate({ view: "owner-dash" })}>Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate({ view: "owner-login" })}>Owner Login</Button>
                <Button onClick={() => navigate({ view: "owner-request" })}>Request Access</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Badge className="mb-4 bg-primary/10 text-primary"><Store className="h-3.5 w-3.5 mr-1" /> Seller Program</Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{settings.ownerHeroTitle || "Grow Your Toy Business With Us"}</h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">{settings.ownerHeroSubtitle || "Join hundreds of shop owners selling on FunziToys. Reach more customers, manage inventory easily."}</p>
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <Button size="lg" onClick={() => navigate({ view: "owner-request" })}>Request Owner Access <ArrowRight className="h-5 w-5 ml-2" /></Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ view: "owner-login" })}>Owner Login</Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[{ n: "200+", l: "Active Sellers" }, { n: "50K+", l: "Products Listed" }, { n: "₹2Cr+", l: "Monthly Sales" }, { n: "4.8★", l: "Seller Rating" }].map((s, i) => (
              <div key={i}><div className="text-3xl font-bold text-primary">{s.n}</div><div className="text-sm text-muted-foreground">{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">Everything You Need to Succeed</h2>
        <p className="text-muted-foreground text-center mb-10">Powerful tools to manage and grow your toy business</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4"><f.icon className="h-6 w-6" /></div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/20 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-10">{settings.ownerAboutTitle || "Why Sell on FunziToys"}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3"><div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0"><Check className="h-4 w-4" /></div><p className="text-sm">{b}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Success Stories</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Rajesh Kumar", store: "ToyLand India", text: "FunziToys helped me triple my sales in 6 months. The dashboard makes managing everything so easy." },
            { name: "Priya Sharma", store: "Kids Corner", text: "The analytics are incredibly helpful. I can see exactly what's selling and adjust my inventory." },
            { name: "Amit Patel", store: "PlayZone", text: "Best platform for toy sellers. The support team is responsive and the tools are top-notch." },
          ].map((t, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 mb-3">{[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
              <div><p className="font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.store}</p></div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12">
        <Card className="p-8 md:p-12 text-center bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
          <h2 className="text-3xl font-bold mb-3">Ready to Start Selling?</h2>
          <p className="opacity-90 mb-6">Join FunziToys today and grow your toy business</p>
          <Button size="lg" variant="secondary" onClick={() => navigate({ view: "owner-request" })}>Request Owner Access</Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>{settings.copyrightText || `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`}</p>
          <button className="text-primary hover:underline mt-1" onClick={() => navigate({ view: "home" })}>Back to {settings.siteName}</button>
        </div>
      </footer>
    </div>
  );
}
