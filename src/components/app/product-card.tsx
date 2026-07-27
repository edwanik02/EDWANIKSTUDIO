"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useAuth, useCart, useUI, api, navigate } from "@/lib/store";

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrpPrice: number | null;
  badge: string | null;
  stock: number;
  rating: number;
  reviewCount: number;
  images?: { url: string; alt?: string | null; isPrimary?: boolean }[];
  category?: { name: string; slug: string } | null;
  brand?: { name: string; slug: string } | null;
  owner?: { storeName: string } | null;
}

const badgeColors: Record<string, string> = {
  NEW: "bg-green-500 text-white",
  SALE: "bg-red-500 text-white",
  HOT: "bg-orange-500 text-white",
  LIMITED: "bg-purple-500 text-white",
  BESTSELLER: "bg-amber-500 text-white",
};

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { add, addGuest } = useCart();
  const { toast, openAuth } = useUI();
  const img = product.images?.[0]?.url || "/placeholder.svg";
  const discount = product.mrpPrice && product.mrpPrice > product.price ? Math.round(((product.mrpPrice - product.price) / product.mrpPrice) * 100) : 0;

  async function addToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      addGuest(product.id, 1);
      toast("Added to cart (guest). Login to checkout.");
      return;
    }
    try {
      await add(product.id, 1);
      toast("Added to cart");
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  async function addToWishlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      openAuth("login", "Please login to save to wishlist");
      return;
    }
    try {
      await api("/api/wishlist", { method: "POST", body: JSON.stringify({ productId: product.id }) });
      toast("Added to wishlist");
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  return (
    <Card
      className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 p-0 gap-0"
      onClick={() => navigate({ view: "product", id: product.slug })}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {product.badge && (
          <span className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded ${badgeColors[product.badge] || "bg-primary text-primary-foreground"}`}>
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded bg-red-600 text-white">-{discount}%</span>
        )}
        <button
          onClick={addToWishlist}
          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-red-500" />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        {product.category && <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.category.name}</p>}
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{product.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-primary">{formatINR(product.price)}</span>
          {product.mrpPrice && product.mrpPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(product.mrpPrice)}</span>
          )}
        </div>
        <Button size="sm" className="w-full mt-1" onClick={addToCart} disabled={product.stock === 0}>
          <ShoppingCart className="h-4 w-4 mr-1" /> Add to Cart
        </Button>
      </div>
    </Card>
  );
}
