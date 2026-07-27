"use client";
import { useEffect, useState } from "react";
import { api, getParams, navigate, useAuth, useUI, apiUpload } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Menu, Plus, Pencil, Trash2, Upload, Store, TrendingUp, DollarSign, AlertTriangle, X } from "lucide-react";
import { formatINR } from "../product-card";
import type { SiteSettings } from "../app-shell";

export function OwnerDashboard({ settings }: { settings: SiteSettings }) {
  const { user, logout } = useAuth();
  const { toast } = useUI();
  const [tab, setTab] = useState(getParams().tab || "overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate({ view: "owner-login" }); return; }
    if (user.role !== "OWNER") {
      if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") navigate({ view: "admin" });
      else navigate({ view: "home" });
    }
  }, [user]);

  useEffect(() => { setTab(getParams().tab || "overview"); }, [getParams().tab]);

  if (!user || user.role !== "OWNER") return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-40 w-full max-w-md" /></div>;

  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Store Settings", icon: Settings },
  ];

  function go(t: string) { navigate({ view: "owner-dash", tab: t }); setSidebarOpen(false); }

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-background border-r flex flex-col transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          {settings.logoUrl ? <img src={settings.logoUrl} alt="" className="h-8 w-8 object-contain" /> : <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">{settings.siteName.charAt(0)}</div>}
          <div><p className="font-bold text-sm leading-tight">{settings.siteName}</p><p className="text-xs text-muted-foreground">Owner Panel</p></div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm ${tab === n.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-3 py-2 text-xs">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate({ view: "home" })}><Store className="h-4 w-4 mr-2" /> View Store</Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-red-600" onClick={async () => { await logout(); navigate({ view: "home" }); }}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></Button>
            <h1 className="font-bold capitalize">{tab}</h1>
          </div>
          <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {tab === "overview" && <OwnerOverview />}
          {tab === "products" && <OwnerProducts />}
          {tab === "orders" && <OwnerOrders />}
          {tab === "customers" && <OwnerCustomers />}
          {tab === "settings" && <OwnerSettings />}
        </main>
      </div>
    </div>
  );
}

function OwnerOverview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api("/api/owner/analytics").then((d) => setData(d)).catch(() => {}); }, []);
  if (!data) return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;

  const cards = [
    { label: "Total Revenue", value: formatINR(data.totals.revenue), icon: DollarSign, color: "text-green-600" },
    { label: "Orders", value: data.totals.orders, icon: ShoppingBag, color: "text-primary" },
    { label: "Products", value: data.totals.products, icon: Package, color: "text-blue-600" },
    { label: "Units Sold", value: data.totals.totalSold, icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-5">
            <div className="flex justify-between items-start">
              <div><p className="text-sm text-muted-foreground">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
              <c.icon className={`h-8 w-8 ${c.color}`} />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <h2 className="font-bold mb-4">Sales (Last 7 Days)</h2>
        <div className="flex items-end gap-2 h-48">
          {data.salesTrend.map((d: any, i: number) => {
            const max = Math.max(...data.salesTrend.map((x: any) => x.sales), 1);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors" style={{ height: `${(d.sales / max) * 100}%`, minHeight: "4px" }} title={formatINR(d.sales)} />
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
            );
          })}
        </div>
      </Card>
      {data.lowStockProducts.length > 0 && (
        <Card className="p-5 border-amber-200 bg-amber-50">
          <h2 className="font-bold mb-3 flex items-center gap-2 text-amber-700"><AlertTriangle className="h-5 w-5" /> Low Stock Alert</h2>
          <div className="space-y-2">
            {data.lowStockProducts.map((p: any) => (
              <div key={p.id} className="flex justify-between text-sm"><span>{p.name}</span><Badge variant="destructive">{p.stock} left</Badge></div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function OwnerProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useUI();

  function load() { setLoading(true); api("/api/owner/products").then((d) => setProducts(d.products)).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    try { await api(`/api/products/${id}`, { method: "DELETE" }); load(); toast("Product deleted"); }
    catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{products.length} products</p>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>
      {loading ? <Skeleton className="h-64" /> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><div className="flex items-center gap-2"><img src={p.images?.[0]?.url || "/placeholder.svg"} alt="" className="h-10 w-10 rounded object-cover" /><span className="font-medium text-sm line-clamp-1">{p.name}</span></div></TableCell>
                  <TableCell>{formatINR(p.price)}</TableCell>
                  <TableCell><Badge variant={p.stock <= 5 ? "destructive" : "secondary"}>{p.stock}</Badge></TableCell>
                  <TableCell><Badge variant={p.isActive ? "default" : "outline"}>{p.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setEditing(p); setShowForm(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      {showForm && <ProductForm product={editing} categories={[]} brands={[]} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

export function ProductForm({ product, categories, brands, onClose, onSaved }: { product: any; categories: any[]; brands: any[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "", description: product?.description || "", price: product?.price || "", mrpPrice: product?.mrpPrice || "",
    sku: product?.sku || "", badge: product?.badge || "", categoryId: product?.categoryId || "", brandId: product?.brandId || "",
    stock: product?.stock ?? "", isActive: product?.isActive ?? true,
  });
  const [images, setImages] = useState<any[]>(product?.images || []);
  const [allCats, setAllCats] = useState(categories);
  const [allBrands, setAllBrands] = useState(brands);

  useEffect(() => {
    api("/api/categories").then((d) => setAllCats(d.categories)).catch(() => {});
    api("/api/brands").then((d) => setAllBrands(d.brands)).catch(() => {});
  }, []);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const data = await apiUpload("/api/upload", fd);
      setImages((prev) => [...prev, ...data.files.map((f: any) => ({ url: f.url, alt: form.name }))]);
      toast(`${data.files.length} image(s) uploaded`);
    } catch (e: any) { toast(e.message, "error"); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.name || !form.price) { toast("Name and price required", "error"); return; }
    setLoading(true);
    try {
      const body = { ...form, price: parseFloat(form.price), mrpPrice: form.mrpPrice ? parseFloat(form.mrpPrice) : null, stock: parseInt(form.stock) || 0, images };
      if (product) {
        await api(`/api/products/${product.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("Product updated");
      } else {
        await api("/api/products", { method: "POST", body: JSON.stringify(body) });
        toast("Product created");
      }
      onSaved();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1.5"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="space-y-1.5"><Label>Price *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>MRP Price</Label><Input type="number" value={form.mrpPrice} onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Category</Label>
            <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem>{allCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Brand</Label>
            <Select value={form.brandId || "none"} onValueChange={(v) => setForm({ ...form, brandId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem>{allBrands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Badge</Label>
            <Select value={form.badge || "none"} onValueChange={(v) => setForm({ ...form, badge: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">None</SelectItem>{["NEW", "SALE", "HOT", "LIMITED", "BESTSELLER"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-6"><input type="checkbox" id="active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><Label htmlFor="active">Active</Label></div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded overflow-hidden border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
              <label className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted">
                {uploading ? <Upload className="h-5 w-5 animate-pulse" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Upload product images (drag area or click). First image is primary.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Product"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OwnerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useUI();
  function load() { setLoading(true); api("/api/owner/orders").then((d) => setOrders(d.orders)).finally(() => setLoading(false)); }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    try { await api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); load(); toast("Order status updated"); }
    catch (e: any) { toast(e.message, "error"); }
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Update</TableHead></TableRow></TableHeader>
        <TableBody>
          {orders.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow> : orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium text-sm">#{o.orderNumber}</TableCell>
              <TableCell className="text-sm">{o.user?.name}<br /><span className="text-xs text-muted-foreground">{o.user?.email}</span></TableCell>
              <TableCell className="text-sm">{o.items.length}</TableCell>
              <TableCell className="font-medium">{formatINR(o.total)}</TableCell>
              <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
              <TableCell>
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>{["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function OwnerCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/owner/customers").then((d) => setCustomers(d.customers)).finally(() => setLoading(false)); }, []);
  if (loading) return <Skeleton className="h-64" />;
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Orders</TableHead><TableHead>Total Spent</TableHead></TableRow></TableHeader>
        <TableBody>
          {customers.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No customers yet</TableCell></TableRow> : customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></TableCell>
              <TableCell>{c.orders}</TableCell>
              <TableCell className="font-medium">{formatINR(c.spent)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function OwnerSettings() {
  const { user } = useAuth();
  const { toast } = useUI();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");

  async function saveProfile() {
    try { await api("/api/user/profile", { method: "PUT", body: JSON.stringify({ name, phone }) }); toast("Profile updated"); }
    catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-5">
        <h2 className="font-bold mb-4">Owner Profile</h2>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={user?.email || ""} disabled className="bg-muted" /></div>
          <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact number" /></div>
          <Button onClick={saveProfile}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}
