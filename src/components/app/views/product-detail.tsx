"use client";
import { useEffect, useState } from "react";
import { api, getParams, navigate, useAuth, useCart, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard, formatINR, type Product } from "../product-card";
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, ShieldCheck, RotateCcw, Check, ChevronRight, Store } from "lucide-react";

export function ProductDetail() {
  const id = getParams().id;
  const { user } = useAuth();
  const { add, addGuest } = useCart();
  const { toast, openAuth } = useUI();
  const [data, setData] = useState<{ product: any; related: Product[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    api<{ product: any; related: Product[] }>(`/api/products/${id}`).then((d) => setData(d)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user && data) {
      api<{ items: any[] }>("/api/wishlist").then((d) => setInWishlist(d.items.some((i) => i.productId === data.product.id))).catch(() => {});
    }
  }, [user, data]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-24 w-full" /><Skeleton className="h-10 w-full" /></div>
        </div>
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Button className="mt-4" onClick={() => navigate({ view: "products" })}>Browse Products</Button>
      </div>
    );
  }

  const p = data.product;
  const images = p.images?.length ? p.images : [{ url: "/placeholder.svg", alt: p.name }];
  const discount = p.mrpPrice && p.mrpPrice > p.price ? Math.round(((p.mrpPrice - p.price) / p.mrpPrice) * 100) : 0;

  async function addToCart() {
    if (!user) { addGuest(p.id, qty); toast("Added to cart (guest). Login to checkout."); return; }
    try { await add(p.id, qty); toast("Added to cart"); } catch (e: any) { toast(e.message, "error"); }
  }

  async function buyNow() {
    if (!user) { openAuth("login", "Please login to checkout"); return; }
    try { await add(p.id, qty); navigate({ view: "checkout" }); } catch (e: any) { toast(e.message, "error"); }
  }

  async function toggleWishlist() {
    if (!user) { openAuth("login", "Please login to save to wishlist"); return; }
    try {
      if (inWishlist) {
        const items = await api<{ items: any[] }>("/api/wishlist");
        const item = items.items.find((i) => i.productId === p.id);
        if (item) await api(`/api/wishlist/${item.id}`, { method: "DELETE" });
        setInWishlist(false);
        toast("Removed from wishlist");
      } else {
        await api("/api/wishlist", { method: "POST", body: JSON.stringify({ productId: p.id }) });
        setInWishlist(true);
        toast("Added to wishlist");
      }
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
        <button className="hover:text-primary" onClick={() => navigate({ view: "home" })}>Home</button>
        <ChevronRight className="h-3 w-3" />
        <button className="hover:text-primary" onClick={() => navigate({ view: "products" })}>Products</button>
        {p.category && (<><ChevronRight className="h-3 w-3" /><button className="hover:text-primary" onClick={() => navigate({ view: "products", cat: p.category.slug })}>{p.category.name}</button></>)}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{p.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-muted border">
            <img src={images[activeImg]?.url} alt={p.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-20 rounded-md overflow-hidden border-2 shrink-0 ${activeImg === i ? "border-primary" : "border-transparent"}`}>
                  <img src={img.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {p.badge && <Badge className="bg-primary text-primary-foreground">{p.badge}</Badge>}
            {discount > 0 && <Badge className="bg-red-500 text-white">{discount}% OFF</Badge>}
            {p.brand && <Badge variant="outline">{p.brand.name}</Badge>}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">{p.name}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= Math.round(p.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />)}
            </div>
            <span className="text-sm">{p.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({p.reviewCount} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatINR(p.price)}</span>
            {p.mrpPrice && p.mrpPrice > p.price && <span className="text-lg text-muted-foreground line-through">{formatINR(p.mrpPrice)}</span>}
            {discount > 0 && <span className="text-sm font-semibold text-green-600">Save {formatINR(p.mrpPrice - p.price)}</span>}
          </div>
          <p className="text-sm">SKU: {p.sku || "N/A"}</p>

          <div className="flex items-center gap-2">
            {p.stock > 0 ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><Check className="h-3 w-3 mr-1" /> In Stock ({p.stock})</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {p.owner && <span className="text-sm text-muted-foreground flex items-center gap-1"><Store className="h-4 w-4" /> {p.owner.storeName}</span>}
          </div>

          <Separator />

          {/* Quantity + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(p.stock, qty + 1))} disabled={qty >= p.stock}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="icon" onClick={toggleWishlist}>
              <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1" onClick={addToCart} disabled={p.stock === 0}><ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart</Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={buyNow} disabled={p.stock === 0}>Buy Now</Button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[{ icon: Truck, label: "Free Shipping" }, { icon: ShieldCheck, label: "Secure" }, { icon: RotateCcw, label: "7-day Returns" }].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50 text-center">
                <t.icon className="h-5 w-5 text-primary" />
                <span className="text-xs">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({p.reviewCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="prose max-w-none">
          <p className="text-muted-foreground whitespace-pre-line">{p.description || "No description available."}</p>
        </TabsContent>
        <TabsContent value="specs">
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
            {p.category && <SpecRow label="Category" value={p.category.name} />}
            {p.brand && <SpecRow label="Brand" value={p.brand.name} />}
            <SpecRow label="SKU" value={p.sku || "N/A"} />
            <SpecRow label="Stock" value={`${p.stock} units`} />
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          {p.reviews?.length ? (
            <div className="space-y-4 max-w-2xl">
              {p.reviews.map((r: any) => (
                <Card key={r.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.user?.name || "Anonymous"}</span>
                    <div className="flex">{[1,2,3,4,5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
                </Card>
              ))}
            </div>
          ) : <p className="text-muted-foreground">No reviews yet.</p>}
        </TabsContent>
      </Tabs>

      {/* Related */}
      {data.related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
