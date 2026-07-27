"use client";
import { useEffect, useState } from "react";
import { api, navigate, useAuth, useCart, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, CreditCard, Truck, Banknote, Smartphone, CheckCircle2 } from "lucide-react";
import { formatINR } from "../product-card";

export function CheckoutView() {
  const { user } = useAuth();
  const { items, fetchCart } = useCart();
  const { toast, openAuth } = useUI();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  // New address form
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addr, setAddr] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India" });

  useEffect(() => {
    if (!user) { openAuth("login", "Please login to checkout"); navigate({ view: "cart" }); return; }
    fetchCart();
    api<{ addresses: any[] }>("/api/user/addresses").then((d) => {
      setAddresses(d.addresses);
      const def = d.addresses.find((a) => a.isDefault) || d.addresses[0];
      if (def) setSelectedAddress(def.id);
    }).catch(() => {});
  }, [user]);

  const subtotal = items.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  async function addAddress() {
    if (!addr.line1 || !addr.city || !addr.state || !addr.pincode) { toast("Please fill all required fields", "error"); return; }
    try {
      const data = await api("/api/user/addresses", { method: "POST", body: JSON.stringify(addr) });
      setAddresses((prev) => [...prev, data.address]);
      setSelectedAddress(data.address.id);
      setShowAddrForm(false);
      setAddr({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India" });
      toast("Address added");
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function placeOrder() {
    if (!selectedAddress) { toast("Please select a delivery address", "error"); return; }
    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
      const data = await api("/api/orders", { method: "POST", body: JSON.stringify({ items: orderItems, addressId: selectedAddress, paymentMethod, notes }) });
      setSuccess(data.order);
      await fetchCart();
      toast("Order placed successfully!");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setPlacing(false); }
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-2xl font-bold">Order Placed!</h2>
        <p className="text-muted-foreground mt-2">Order #{success.orderNumber}</p>
        <p className="text-lg font-bold text-primary mt-2">{formatINR(success.total)}</p>
        <p className="text-sm text-muted-foreground mt-2">We'll deliver your order soon. Track it from your account.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={() => navigate({ view: "order", id: success.id })}>Track Order</Button>
          <Button variant="outline" onClick={() => navigate({ view: "home" })}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => navigate({ view: "products" })}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Address */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Delivery Address</h2>
              <Button variant="outline" size="sm" onClick={() => setShowAddrForm(!showAddrForm)}>+ Add New</Button>
            </div>
            {showAddrForm && (
              <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 border rounded-lg bg-muted/30">
                <div><Label>Label</Label><Input value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Address Line 1 *</Label><Input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} /></div>
                <div><Label>City *</Label><Input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></div>
                <div><Label>State *</Label><Input value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} /></div>
                <div><Label>Pincode *</Label><Input value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} /></div>
                <div><Label>Country</Label><Input value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} /></div>
                <div className="sm:col-span-2"><Button onClick={addAddress}>Save Address</Button></div>
              </div>
            )}
            {addresses.length === 0 && !showAddrForm ? (
              <p className="text-sm text-muted-foreground">No addresses yet. Add one to continue.</p>
            ) : (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-2">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${selectedAddress === a.id ? "border-primary bg-primary/5" : ""}`}>
                    <RadioGroupItem value={a.id} id={`addr-${a.id}`} className="mt-1" />
                    <div className="text-sm">
                      <div className="font-medium flex items-center gap-2">{a.label} {a.isDefault && <span className="text-xs text-primary">(Default)</span>}</div>
                      <div className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</div>
                      <div className="text-muted-foreground">{a.country}</div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            )}
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="font-bold flex items-center gap-2 mb-3"><CreditCard className="h-5 w-5 text-primary" /> Payment Method</h2>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {[
                { v: "COD", label: "Cash on Delivery", icon: Banknote, desc: "Pay when you receive" },
                { v: "UPI", label: "UPI Payment", icon: Smartphone, desc: "Pay via UPI app" },
                { v: "CARD", label: "Credit/Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
              ].map((m) => (
                <label key={m.v} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${paymentMethod === m.v ? "border-primary bg-primary/5" : ""}`}>
                  <RadioGroupItem value={m.v} id={`pay-${m.v}`} />
                  <m.icon className="h-5 w-5 text-primary" />
                  <div><div className="font-medium text-sm">{m.label}</div><div className="text-xs text-muted-foreground">{m.desc}</div></div>
                </label>
              ))}
            </RadioGroup>
            <div className="mt-3">
              <Label>Order Notes (optional)</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
            </div>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="p-5 sticky top-28">
            <h2 className="font-bold text-lg mb-3">Order Summary</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
              {items.map((line) => {
                const p = line.product!;
                return (
                  <div key={line.id} className="flex gap-2 text-sm">
                    <img src={p.images?.[0]?.url || "/placeholder.svg"} alt={p.name} className="h-12 w-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                    </div>
                    <span className="font-medium">{formatINR(p.price * line.quantity)}</span>
                  </div>
                );
              })}
            </div>
            <Separator className="my-2" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
              <Separator className="my-1" />
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{formatINR(total)}</span></div>
            </div>
            <Button className="w-full mt-4" size="lg" onClick={placeOrder} disabled={placing || !selectedAddress}>
              {placing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Place Order
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
