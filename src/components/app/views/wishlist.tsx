"use client";
import { useEffect, useState } from "react";
import { api, navigate, useAuth, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { formatINR } from "../product-card";
import { useCart } from "@/lib/store";

export function WishlistView() {
  const { user } = useAuth();
  const { openAuth } = useUI();
  const { add } = useCart();
  const { toast } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api<{ items: any[] }>("/api/wishlist").then((d) => setItems(d.items)).finally(() => setLoading(false));
  }, [user]);

  async function removeItem(id: string) {
    try {
      await api(`/api/wishlist/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("Removed from wishlist");
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function addToCart(item: any) {
    try { await add(item.productId, 1); toast("Added to cart"); } catch (e: any) { toast(e.message, "error"); }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Login to view your wishlist</h2>
        <Button className="mt-4" onClick={() => openAuth("login")}>Login</Button>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Your wishlist is empty</h2>
        <p className="text-muted-foreground mt-1">Save items you love for later.</p>
        <Button className="mt-4" onClick={() => navigate({ view: "products" })}><ShoppingBag className="h-4 w-4 mr-2" /> Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">My Wishlist ({items.length})</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const p = item.product;
          if (!p) return null;
          const img = p.images?.[0]?.url || "/placeholder.svg";
          return (
            <Card key={item.id} className="overflow-hidden p-0 gap-0">
              <div className="relative aspect-square bg-muted cursor-pointer" onClick={() => navigate({ view: "product", id: p.slug })}>
                <img src={img} alt={p.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm line-clamp-2">{p.name}</h3>
                <p className="text-primary font-bold">{formatINR(p.price)}</p>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => addToCart(item)} disabled={p.stock === 0}><ShoppingBag className="h-4 w-4 mr-1" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
