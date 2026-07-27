"use client";
import { useEffect, useState } from "react";
import { api, getParams, navigate, useAuth, useCart, useUI, type CartLine } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function CartView() {
  const { user } = useAuth();
  const { items, fetchCart, updateQty, remove, guestCart } = useCart();
  const { openAuth, toast } = useUI();
  const [guestItems, setGuestItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // For guest cart, fetch product details
  useEffect(() => {
    if (user) { setLoading(false); return; }
    if (guestCart.length === 0) { setGuestItems([]); setLoading(false); return; }
    setLoading(true);
    Promise.all(guestCart.map((g) => api<{ product: any }>(`/api/products/${g.productId}`).catch(() => null)))
      .then((results) => {
        const valid = results.filter(Boolean).map((r, i) => ({ id: `guest-${i}`, productId: r.product.id, quantity: guestCart[i].quantity, product: r.product }));
        setGuestItems(valid);
      })
      .finally(() => setLoading(false));
  }, [user, guestCart]);

  const lines: CartLine[] = user ? items : guestItems;
  const subtotal = lines.reduce((s, l) => s + (l.product?.price || 0) * l.quantity, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  function checkout() {
    if (!user) { openAuth("login", "Please login to checkout"); return; }
    navigate({ view: "checkout" });
  }

  function guestRemove(productId: string) {
    const items = JSON.parse(localStorage.getItem("ft_guest_cart") || "[]").filter((i: any) => i.productId !== productId);
    localStorage.setItem("ft_guest_cart", JSON.stringify(items));
    useCart.setState({ guestCart: items });
    toast("Removed from cart");
  }

  function guestUpdateQty(productId: string, qty: number) {
    const items = JSON.parse(localStorage.getItem("ft_guest_cart") || "[]");
    const it = items.find((i: any) => i.productId === productId);
    if (it) it.quantity = Math.max(1, qty);
    localStorage.setItem("ft_guest_cart", JSON.stringify(items));
    useCart.setState({ guestCart: items });
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading cart...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground mt-1">Add some products to get started.</p>
        <Button className="mt-4" onClick={() => navigate({ view: "products" })}><ShoppingBag className="h-4 w-4 mr-2" /> Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart ({lines.length})</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {lines.map((line) => {
            const p = line.product!;
            const img = p.images?.[0]?.url || "/placeholder.svg";
            return (
              <Card key={line.id} className="p-3 flex gap-3">
                <img src={img} alt={p.name} className="h-20 w-20 sm:h-24 sm:w-24 rounded-md object-cover bg-muted cursor-pointer" onClick={() => navigate({ view: "product", id: p.slug })} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary" onClick={() => navigate({ view: "product", id: p.slug })}>{p.name}</h3>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand.name}</p>}
                  <p className="text-primary font-bold mt-1">{formatINR(p.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-md">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => user ? updateQty(line.id, line.quantity - 1) : guestUpdateQty(p.id, line.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-sm">{line.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => user ? updateQty(line.id, line.quantity + 1) : guestUpdateQty(p.id, line.quantity + 1)} disabled={line.quantity >= p.stock}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => user ? remove(line.id) : guestRemove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{formatINR(p.price * line.quantity)}</p>
                </div>
              </Card>
            );
          })}
          <Button variant="outline" size="sm" onClick={() => navigate({ view: "products" })}><ShoppingBag className="h-4 w-4 mr-2" /> Continue Shopping</Button>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-5 sticky top-28">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
              {shipping > 0 && <p className="text-xs text-muted-foreground">Add {formatINR(999 - subtotal)} more for free shipping</p>}
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatINR(total)}</span></div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={checkout}>Checkout <ArrowRight className="h-4 w-4 ml-2" /></Button>
            {!user && <p className="text-xs text-center text-muted-foreground mt-2">Login required to checkout</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}

