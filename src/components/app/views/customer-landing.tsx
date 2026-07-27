"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard, formatINR, type Product } from "../product-card";
import { api, navigate, useUI } from "@/lib/store";
import { ShoppingBag, Truck, ShieldCheck, RotateCcw, Star, ArrowRight, Store, Sparkles } from "lucide-react";
import type { SiteSettings, Category } from "../app-shell";

export function CustomerLanding({ settings, categories, banners }: { settings: SiteSettings; categories: Category[]; banners: any[] }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { openAuth } = useUI();

  useEffect(() => {
    api<{ products: Product[] }>("/api/products?limit=8&sort=popular").then((d) => setProducts(d.products)).finally(() => setLoading(false));
  }, []);

  const activeBanners = banners.filter((b: any) => b.isActive).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
  const featured = products.slice(0, 4);
  const bestsellers = products.slice(4, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> {settings.tagline || "Where Fun Meets Imagination"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                {settings.customerHeroTitle || "Bring Home the Magic of Play"}
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {settings.customerHeroSubtitle || "Discover thousands of premium toys that spark imagination, creativity, and joy."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => navigate({ view: "products" })}>
                  <ShoppingBag className="h-5 w-5 mr-2" /> Shop Now
                </Button>
                <Button size="lg" variant="outline" onClick={() => openAuth("register")}>
                  Create Account
                </Button>
              </div>
              <div className="flex gap-6 pt-4">
                <div>
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Kids</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">4.8★</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              {settings.customerHeroImage ? (
                <img src={settings.customerHeroImage} alt="Hero" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-4 p-8">
                    {["🧸", "🚂", "🪀", "🧩"].map((e, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-white/80 shadow-lg flex items-center justify-center text-5xl">{e}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y bg-muted/20">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
              { icon: ShieldCheck, title: "Safe & Secure", desc: "100% safe toys" },
              { icon: RotateCcw, title: "Easy Returns", desc: "7-day return policy" },
              { icon: Star, title: "Top Quality", desc: "Premium brands" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-muted-foreground">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo banners */}
      {activeBanners.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-4">
            {activeBanners.slice(0, 3).map((b: any) => (
              <Card key={b.id} className="overflow-hidden p-0 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ view: "products" })}>
                <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/10">
                  {b.eyebrow && <Badge className="mb-2 bg-primary text-primary-foreground">{b.eyebrow}</Badge>}
                  <h3 className="font-bold text-lg">{b.title}</h3>
                  {b.subtitle && <p className="text-sm text-muted-foreground mt-1">{b.subtitle}</p>}
                  {b.ctaText && (
                    <Button size="sm" variant="link" className="px-0 text-primary mt-2">
                      {b.ctaText} <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate({ view: "products" })}>View all <ArrowRight className="h-4 w-4 ml-1" /></Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Card key={c.id} className="p-4 text-center cursor-pointer hover:shadow-md hover:border-primary/50 transition-all" onClick={() => navigate({ view: "products", cat: c.slug })}>
              <div className="aspect-square mb-2 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
                {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🎁</span>}
              </div>
              <p className="font-medium text-sm line-clamp-1">{c.name}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate({ view: "products", sort: "popular" })}>View all <ArrowRight className="h-4 w-4 ml-1" /></Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* About */}
      <section className="bg-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold mb-3">{settings.customerAboutTitle || "About FunziToys"}</h2>
          <p className="text-muted-foreground">{settings.customerAboutText || "For over a decade, FunziToys has been delighting children and parents with carefully curated, safe, and educational toys."}</p>
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold">Best Sellers</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate({ view: "products", sort: "popular" })}>View all <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Owner CTA */}
      <section className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden p-0 border-0 bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Are you a toy seller?</h2>
              <p className="opacity-90 mt-2 max-w-md">Join FunziToys and reach thousands of customers. Manage your store, products, and orders easily.</p>
            </div>
            <Button size="lg" variant="secondary" onClick={() => navigate({ view: "owner" })}>
              <Store className="h-5 w-5 mr-2" /> Become a Seller
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
