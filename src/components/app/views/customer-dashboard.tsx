"use client";
import { useEffect, useState } from "react";
import { api, getParams, navigate, useAuth, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingBag, Trash2, Plus, Check } from "lucide-react";
import { formatINR } from "../product-card";

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { openAuth, toast } = useUI();
  const [tab, setTab] = useState(getParams().sub || "profile");

  useEffect(() => {
    if (!user) { openAuth("login", "Please login to access your account"); return; }
    if (user.role !== "CUSTOMER") {
      if (user.role === "OWNER") navigate({ view: "owner-dash" });
      else navigate({ view: "admin" });
    }
  }, [user]);

  useEffect(() => { setTab(getParams().sub || "profile"); }, [getParams().sub]);

  if (!user) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading...</div>;

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        <Button variant="outline" size="sm" onClick={async () => { await logout(); navigate({ view: "home" }); }}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="p-2">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => navigate({ view: "account", sub: t.id })} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap ${tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        <div className="lg:col-span-3">
          {tab === "profile" && <ProfileTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, fetchUser } = useAuth();
  const { toast } = useUI();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");

  async function save() {
    try {
      await api("/api/user/profile", { method: "PUT", body: JSON.stringify({ name, phone }) });
      await fetchUser();
      toast("Profile updated");
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <Card className="p-6">
      <h2 className="font-bold text-lg mb-4">Profile Information</h2>
      <div className="space-y-4 max-w-md">
        <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div><Label>Email</Label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
        <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Add phone number" /></div>
        <Button onClick={save}>Save Changes</Button>
      </div>
    </Card>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ orders: any[] }>("/api/orders/my").then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (orders.length === 0) return (
    <Card className="p-8 text-center">
      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">No orders yet.</p>
      <Button className="mt-3" onClick={() => navigate({ view: "products" })}>Start Shopping</Button>
    </Card>
  );

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ view: "order", id: o.id })}>
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <div>
              <span className="font-semibold">#{o.orderNumber}</span>
              <span className="text-xs text-muted-foreground ml-2">{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
            <Badge className={o.status === "DELIVERED" ? "bg-green-500" : o.status === "CANCELLED" ? "bg-red-500" : "bg-primary"}>{o.status}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{o.items.length} item(s)</span>
            <span className="font-bold text-primary">{formatINR(o.total)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function WishlistTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const { toast } = useUI();
  useEffect(() => {
    api<{ items: any[] }>("/api/wishlist").then((d) => setItems(d.items)).finally(() => setLoading(false));
  }, []);

  async function addToCart(item: any) {
    try { await add(item.productId, 1); toast("Added to cart"); } catch (e: any) { toast(e.message, "error"); }
  }
  async function remove(id: string) {
    await api(`/api/wishlist/${id}`, { method: "DELETE" });
    setItems((p) => p.filter((i) => i.id !== id));
  }

  if (loading) return <Skeleton className="h-40 w-full" />;
  if (items.length === 0) return <Card className="p-8 text-center"><Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">Your wishlist is empty.</p></Card>;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((it) => {
        const p = it.product;
        if (!p) return null;
        return (
          <Card key={it.id} className="p-3 flex gap-3">
            <img src={p.images?.[0]?.url || "/placeholder.svg"} alt={p.name} className="h-20 w-20 rounded object-cover cursor-pointer" onClick={() => navigate({ view: "product", id: p.slug })} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-2">{p.name}</p>
              <p className="text-primary font-bold">{formatINR(p.price)}</p>
              <div className="flex gap-1 mt-1">
                <Button size="sm" onClick={() => addToCart(it)} disabled={p.stock === 0}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
  const { toast } = useUI();

  useEffect(() => { load(); }, []);
  function load() { api<{ addresses: any[] }>("/api/user/addresses").then((d) => setAddresses(d.addresses)); }

  async function save() {
    if (!form.line1 || !form.city || !form.state || !form.pincode) { toast("Fill all required fields", "error"); return; }
    try {
      if (editing) {
        await api(`/api/user/addresses/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await api("/api/user/addresses", { method: "POST", body: JSON.stringify(form) });
      }
      load();
      setShowForm(false); setEditing(null);
      setForm({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
      toast("Address saved");
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function remove(id: string) {
    await api(`/api/user/addresses/${id}`, { method: "DELETE" });
    load();
    toast("Address deleted");
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">My Addresses</h2>
        <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); setForm({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", country: "India", isDefault: false }); }}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      {showForm && (
        <div className="grid sm:grid-cols-2 gap-3 mb-4 p-4 border rounded-lg bg-muted/30">
          <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Address Line 1 *</Label><Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>Address Line 2</Label><Input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></div>
          <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div><Label>State *</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
          <div><Label>Pincode *</Label><Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></div>
          <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} id="def" /><Label htmlFor="def">Set as default</Label></div>
          <div className="sm:col-span-2 flex gap-2"><Button onClick={save}>Save</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
        </div>
      )}
      <div className="space-y-2">
        {addresses.length === 0 ? <p className="text-muted-foreground text-sm">No addresses yet.</p> : addresses.map((a) => (
          <div key={a.id} className="border rounded-lg p-3 flex justify-between gap-2">
            <div className="text-sm">
              <span className="font-medium">{a.label}</span> {a.isDefault && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}
              <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => { setEditing(a); setForm({ label: a.label, line1: a.line1, line2: a.line2 || "", city: a.city, state: a.state, pincode: a.pincode, country: a.country, isDefault: a.isDefault }); setShowForm(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsTab() {
  const { user } = useAuth();
  return (
    <Card className="p-6">
      <h2 className="font-bold text-lg mb-4">Account Settings</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Email</span><span>{user?.email}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Verified</span><span>{user?.isVerified ? <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Yes</Badge> : <Badge variant="destructive">No</Badge>}</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Role</span><Badge variant="secondary" className="capitalize">{user?.role.toLowerCase()}</Badge></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Member since</span><span>{user && new Date().toLocaleDateString("en-IN")}</span></div>
      </div>
      <p className="text-xs text-muted-foreground mt-4">For account deletion or data export, contact support.</p>
    </Card>
  );
}
