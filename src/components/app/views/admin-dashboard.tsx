"use client";
import { useEffect, useState, useCallback } from "react";
import { api, apiUpload, navigate, getParams, useAuth, useUI } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard, Package, Tag, Bookmark, ShoppingBag, Users, Store, UserCog,
  Palette, Search, Image as ImageIcon, LogOut, Menu, Plus, Pencil, Trash2, Upload,
  Shield, TrendingUp, DollarSign, AlertTriangle, X, Copy, ExternalLink, CheckCircle2,
  Eye,
} from "lucide-react";
import { formatINR } from "../product-card";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories", icon: Tag },
  { id: "brands", label: "Brands", icon: Bookmark },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users },
  { id: "owners", label: "Owners", icon: Store },
  { id: "users", label: "Users", icon: UserCog },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "media", label: "Media", icon: ImageIcon },
];

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export function AdminDashboard({ settings }: { settings: any }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const tab = getParams().tab || "dashboard";

  // Access guard
  useEffect(() => {
    if (!user) {
      navigate({ view: "admin-login" });
    } else if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      navigate({ view: "home" });
    }
  }, [user]);

  const go = useCallback((t: string) => {
    navigate({ view: "admin", tab: t });
    setSidebarOpen(false);
  }, []);

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <Skeleton className="h-40 w-full max-w-md" />
      </div>
    );
  }

  const currentNav = NAV.find((n) => n.id === tab);

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-64 bg-background border-r flex flex-col transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt="" className="h-8 w-8 object-contain" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              {(settings.siteName || "F").charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">{settings.siteName || "FunziToys"}</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                tab === n.id ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
              }`}
            >
              <n.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t space-y-2">
          <div className="px-3 py-2 text-xs">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate({ view: "home" })}>
            <ExternalLink className="h-4 w-4 mr-2" /> View Site
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600"
            onClick={async () => {
              await logout();
              navigate({ view: "home" });
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            {currentNav && <currentNav.icon className="h-5 w-5 text-muted-foreground hidden sm:block" />}
            <h1 className="font-bold capitalize">{currentNav?.label || "Dashboard"}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              <Shield className="h-3 w-3 mr-1" /> {user.role.toLowerCase().replace("_", " ")}
            </Badge>
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "brands" && <BrandsTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "customers" && <CustomersTab />}
          {tab === "owners" && <OwnersTab />}
          {tab === "users" && <UsersTab />}
          {tab === "appearance" && <AppearanceTab settings={settings} />}
          {tab === "seo" && <SeoTab settings={settings} />}
          {tab === "media" && <MediaTab />}
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} className="h-6" />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmptyState({ icon: Icon = Package, title, hint }: { icon?: any; title: string; hint?: string }) {
  return (
    <Card className="p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1">{hint}</p>}
    </Card>
  );
}

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* Tab: Dashboard                                                      */
/* ------------------------------------------------------------------ */

function DashboardTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/admin/analytics")
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (!data) return <EmptyState title="Unable to load analytics" hint="Try refreshing the page." />;

  const cards = [
    { label: "Revenue", value: formatINR(data.totals.revenue), icon: DollarSign, color: "text-green-600" },
    { label: "Orders", value: data.totals.totalOrders, icon: ShoppingBag, color: "text-primary", sub: `${data.totals.pendingOrders} pending` },
    { label: "Users", value: data.totals.totalUsers, icon: Users, color: "text-purple-600", sub: `${data.totals.totalCustomers} customers` },
    { label: "Products", value: data.totals.totalProducts, icon: Package, color: "text-orange-600", sub: `${data.totals.totalOwners} owners` },
  ];

  const maxSales = Math.max(...(data.salesTrend || []).map((x: any) => x.sales), 1);
  const topCats = data.topCategories || [];
  const statusEntries = Object.entries(data.ordersByStatus || {}).filter(([_k, v]: any) => v > 0);
  const maxStatus = Math.max(...statusEntries.map(([_k, v]: any) => v as number), 1);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
                {c.sub && <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>}
              </div>
              <c.icon className={`h-8 w-8 ${c.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Sales — Last 7 Days</h2>
          </div>
          <div className="flex items-end gap-2 h-56">
            {(data.salesTrend || []).map((d: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors relative"
                    style={{ height: `${(d.sales / maxSales) * 100}%`, minHeight: "4px" }}
                    title={`${formatINR(d.sales)} • ${d.orders} orders`}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatINR(d.sales)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{d.date}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">Orders by Status</h2>
          {statusEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(([k, v]: any) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(v / maxStatus) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-bold mb-4">Top Categories</h2>
        {topCats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topCats.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                  <span className="text-sm font-medium truncate">{c.name}</span>
                </div>
                <Badge variant="secondary">{c.value}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Products                                                       */
/* ------------------------------------------------------------------ */

function ProductsTab() {
  const { toast } = useUI();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchUrl = `/api/products?limit=200${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const load = () => {
    setLoading(true);
    api(fetchUrl)
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api(fetchUrl)
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  async function remove(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api(`/api/products/${id}`, { method: "DELETE" });
      toast("Product deleted");
      load();
    } catch (e: any) {
      toast(e.message, "error");
    }
  }

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" hint="Add your first product to get started." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || "/placeholder.svg"}
                          alt=""
                          className="h-10 w-10 rounded object-cover border"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku || p.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{p.category?.name || "—"}</TableCell>
                    <TableCell className="font-medium">{formatINR(p.price)}</TableCell>
                    <TableCell>
                      <Badge variant={p.stock <= 5 ? "destructive" : "secondary"}>{p.stock}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "outline"}>{p.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(p.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {showForm && (
        <ProductFormDialog
          product={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function ProductFormDialog({ product, onClose, onSaved }: { product: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cats, setCats] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    mrpPrice: product?.mrpPrice ?? "",
    sku: product?.sku || "",
    badge: product?.badge || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    stock: product?.stock ?? "",
    isActive: product?.isActive ?? true,
  });
  const [images, setImages] = useState<any[]>(product?.images || []);

  useEffect(() => {
    api("/api/categories").then((d) => setCats(d.categories || [])).catch(() => {});
    api("/api/brands").then((d) => setBrands(d.brands || [])).catch(() => {});
  }, []);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const data = await apiUpload("/api/upload", fd);
      setImages((prev) => [...prev, ...data.files.map((f: any) => ({ url: f.url, alt: form.name }))]);
      toast(`${data.files.length} image(s) uploaded`);
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.name || form.price === "" || form.price === null) {
      toast("Name and price are required", "error");
      return;
    }
    setLoading(true);
    try {
      const body: any = {
        ...form,
        price: parseFloat(String(form.price)),
        mrpPrice: form.mrpPrice !== "" && form.mrpPrice != null ? parseFloat(String(form.mrpPrice)) : null,
        stock: parseInt(String(form.stock)) || 0,
        images,
      };
      if (product) {
        await api(`/api/products/${product.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("Product updated");
      } else {
        await api("/api/products", { method: "POST", body: JSON.stringify(body) });
        toast("Product created");
      }
      onSaved();
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Price (₹) *</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>MRP Price (₹)</Label>
            <Input type="number" value={form.mrpPrice} onChange={(e) => setForm({ ...form, mrpPrice: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={form.categoryId || "none"} onValueChange={(v) => setForm({ ...form, categoryId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Brand</Label>
            <Select value={form.brandId || "none"} onValueChange={(v) => setForm({ ...form, brandId: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Badge</Label>
            <Select value={form.badge || "none"} onValueChange={(v) => setForm({ ...form, badge: v === "none" ? "" : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {["NEW", "SALE", "HOT", "LIMITED", "BESTSELLER"].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-7">
            <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} id="p-active" />
            <Label htmlFor="p-active">Active</Label>
          </div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Product Images</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded overflow-hidden border group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="h-20 w-20 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted">
                {uploading ? <Upload className="h-5 w-5 animate-pulse" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">First image is the primary image.</p>
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

/* ------------------------------------------------------------------ */
/* Tab: Categories                                                     */
/* ------------------------------------------------------------------ */

function CategoriesTab() {
  const { toast } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/categories")
      .then((d) => setItems(d.categories || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api("/api/categories")
      .then((d) => setItems(d.categories || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this category? Products in it will be uncategorized.")) return;
    try {
      await api(`/api/categories/${id}`, { method: "DELETE" });
      toast("Category deleted");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} categories</p>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Category
        </Button>
      </div>
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Tag} title="No categories yet" hint="Create your first category." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex gap-3">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="h-16 w-16 rounded object-cover border" />
                ) : (
                  <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                    <Tag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.slug}</p>
                    </div>
                    <Badge variant={c.isActive ? "default" : "outline"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description || "—"}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{c._count?.products || 0} products</span>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(c); setShowForm(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(c.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {showForm && (
        <CategoryBrandForm
          kind="category"
          item={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Brands                                                         */
/* ------------------------------------------------------------------ */

function BrandsTab() {
  const { toast } = useUI();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api("/api/brands")
      .then((d) => setItems(d.brands || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api("/api/brands")
      .then((d) => setItems(d.brands || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this brand?")) return;
    try {
      await api(`/api/brands/${id}`, { method: "DELETE" });
      toast("Brand deleted");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} brands</p>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Brand
        </Button>
      </div>
      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : items.length === 0 ? (
        <EmptyState icon={Bookmark} title="No brands yet" hint="Create your first brand." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt="" className="h-10 w-10 rounded object-contain border" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Bookmark className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{b.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{b.description || "—"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.slug}</TableCell>
                    <TableCell>{b._count?.products || 0}</TableCell>
                    <TableCell><Badge variant={b.isActive ? "default" : "outline"}>{b.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(b); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(b.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
      {showForm && (
        <CategoryBrandForm
          kind="brand"
          item={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function CategoryBrandForm({ kind, item, onClose, onSaved }: { kind: "category" | "brand"; item: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: item?.name || "",
    description: item?.description || "",
    imageUrl: item?.imageUrl || item?.logoUrl || "",
    sortOrder: item?.sortOrder ?? 0,
    isActive: item?.isActive ?? true,
  });

  const endpoint = kind === "category" ? "/api/categories" : "/api/brands";
  const imageLabel = kind === "category" ? "Image" : "Logo";

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const data = await apiUpload("/api/upload", fd);
      setForm((f) => ({ ...f, imageUrl: data.files[0].url }));
      toast("Image uploaded");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.name) { toast("Name required", "error"); return; }
    setLoading(true);
    try {
      const body: any = {
        name: form.name,
        description: form.description,
        sortOrder: String(form.sortOrder),
        isActive: form.isActive,
        ...(kind === "category" ? { imageUrl: form.imageUrl } : { logoUrl: form.imageUrl }),
      };

      if (item) {
        await api(`${endpoint}/${item.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast(`${kind === "category" ? "Category" : "Brand"} updated`);
      } else {
        await api(endpoint, { method: "POST", body: JSON.stringify(body) });
        toast(`${kind === "category" ? "Category" : "Brand"} created`);
      }
      onSaved();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${kind}` : `Add ${kind}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} id="cb-active" />
              <Label htmlFor="cb-active">Active</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{imageLabel}</Label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <div className="relative h-20 w-20 rounded overflow-hidden border group">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, imageUrl: "" })} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded bg-muted flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span>
                    <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : `Upload ${imageLabel}`}
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
            <Input
              placeholder="or paste image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="mt-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Orders                                                         */
/* ------------------------------------------------------------------ */

function OrdersTab() {
  const { toast } = useUI();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [detail, setDetail] = useState<any>(null);

  const fetchUrl = filter === "ALL" ? "/api/orders" : `/api/orders?status=${filter}`;
  const load = () => {
    setLoading(true);
    api(fetchUrl)
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api(fetchUrl)
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  async function updateStatus(id: string, status: string) {
    try {
      await api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast("Order status updated");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function updatePayment(id: string, paymentStatus: string) {
    try {
      await api(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify({ paymentStatus }) });
      toast("Payment status updated");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{orders.length} orders</p>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : orders.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="No orders found" hint="Orders will appear here when customers place them." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-sm">#{o.orderNumber}</TableCell>
                    <TableCell>
                      <div className="text-sm">{o.user?.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{o.user?.email}</div>
                    </TableCell>
                    <TableCell className="text-sm">{o.items?.length || 0}</TableCell>
                    <TableCell className="font-medium">{formatINR(o.total)}</TableCell>
                    <TableCell>
                      <Badge variant={o.paymentStatus === "PAID" ? "default" : o.paymentStatus === "FAILED" ? "destructive" : "outline"}>
                        {o.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{o.status}</Badge></TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="h-8 text-xs w-36"><SelectValue /></SelectTrigger>
                        <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => setDetail(o)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {detail && (
        <Dialog open onOpenChange={(o) => !o && setDetail(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order #{detail.orderNumber}</DialogTitle>
              <DialogDescription>Placed on {fmtDate(detail.createdAt)}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{detail.user?.name}</p>
                  <p className="text-xs">{detail.user?.email}</p>
                  <p className="text-xs">{detail.user?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipping Address</p>
                  <p className="text-xs">{detail.address?.line1 || "—"}</p>
                  <p className="text-xs">{detail.address?.city}{detail.address?.state ? `, ${detail.address.state}` : ""}</p>
                  <p className="text-xs">{detail.address?.pincode}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                {detail.items?.map((it: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <img src={it.productImage || "/placeholder.svg"} alt="" className="h-10 w-10 rounded object-cover border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{it.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {it.quantity} × {formatINR(it.price)}</p>
                    </div>
                    <p className="font-medium">{formatINR(it.total)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatINR(detail.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatINR(detail.shippingFee)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{formatINR(detail.total)}</span></div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Order Status</Label>
                  <Select value={detail.status} onValueChange={(v) => { updateStatus(detail.id, v); setDetail({ ...detail, status: v }); }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Status</Label>
                  <Select value={detail.paymentStatus} onValueChange={(v) => { updatePayment(detail.id, v); setDetail({ ...detail, paymentStatus: v }); }}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetail(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Customers                                                      */
/* ------------------------------------------------------------------ */

function CustomersTab() {
  const { toast } = useUI();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = () => {
    setLoading(true);
    api("/api/admin/users?role=CUSTOMER")
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api("/api/admin/users?role=CUSTOMER")
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function toggleActive(u: any) {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PUT", body: JSON.stringify({ isActive: !u.isActive }) });
      toast(u.isActive ? "Customer deactivated" : "Customer activated");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this customer? Their orders will remain.")) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      toast("Customer deleted");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground hidden sm:block">{filtered.length} customers</p>
      </div>
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" hint="Customers will appear here after they register." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {u.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{u.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "default" : "outline"}>{u.isActive ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Switch checked={!!u.isActive} onCheckedChange={() => toggleActive(u)} />
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => remove(u.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Owners + Owner Requests                                        */
/* ------------------------------------------------------------------ */

const PERMISSION_LABELS: { key: string; label: string }[] = [
  { key: "canManageProducts", label: "Manage Products" },
  { key: "canManageOrders", label: "Manage Orders" },
  { key: "canViewCustomers", label: "View Customers" },
  { key: "canManageSettings", label: "Manage Settings" },
  { key: "canUploadImages", label: "Upload Images" },
  { key: "canViewAnalytics", label: "View Analytics" },
  { key: "canEditLanding", label: "Edit Landing" },
];

function OwnersTab() {
  const { toast } = useUI();
  const [owners, setOwners] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reqLoading, setReqLoading] = useState(true);
  const [creds, setCreds] = useState<any>(null);
  const [permOwner, setPermOwner] = useState<any>(null);

  const loadOwners = () => {
    setLoading(true);
    api("/api/admin/owners")
      .then((d) => setOwners(d.owners || []))
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
  };

  const loadRequests = () => {
    setReqLoading(true);
    api("/api/admin/owner-requests")
      .then((d) => setRequests(d.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setReqLoading(false));
  };

  useEffect(() => {
    api("/api/admin/owners")
      .then((d) => setOwners(d.owners || []))
      .catch(() => setOwners([]))
      .finally(() => setLoading(false));
    api("/api/admin/owner-requests")
      .then((d) => setRequests(d.requests || []))
      .catch(() => setRequests([]))
      .finally(() => setReqLoading(false));
  }, []);

  async function toggleApprove(o: any) {
    try {
      await api("/api/admin/owners", { method: "POST", body: JSON.stringify({ id: o.id, isApproved: !o.isApproved }) });
      toast(o.isApproved ? "Owner unapproved" : "Owner approved");
      loadOwners();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function deleteOwner(id: string) {
    if (!confirm("Remove this owner? Their products will remain but become unassigned.")) return;
    try {
      await api(`/api/admin/owners/${id}`, { method: "DELETE" });
      toast("Owner removed");
      loadOwners();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function approveRequest(r: any) {
    const note = prompt("Optional review note:", "");
    try {
      const data = await api(`/api/admin/owner-requests/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "APPROVED", reviewNote: note || "", createAccount: true }),
      });
      if (data.credentials) {
        setCreds(data.credentials);
        toast(`Owner account created for ${data.credentials.email}`);
      } else {
        toast("Request approved (account already exists)");
      }
      loadRequests();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function rejectRequest(r: any) {
    const note = prompt("Reason for rejection (optional):", "");
    try {
      await api(`/api/admin/owner-requests/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "REJECTED", reviewNote: note || "" }),
      });
      toast("Request rejected");
      loadRequests();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function deleteRequest(id: string) {
    if (!confirm("Delete this request?")) return;
    try {
      await api(`/api/admin/owner-requests/${id}`, { method: "DELETE" });
      toast("Request deleted");
      loadRequests();
    } catch (e: any) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-6">
      {/* Owner requests */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Owner Access Requests</h2>
          <Badge variant="secondary">{requests.filter((r) => r.status === "PENDING").length} pending</Badge>
        </div>
        {reqLoading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : requests.length === 0 ? (
          <EmptyState icon={Store} title="No owner requests" hint="New owner applications will appear here." />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.businessType}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{r.shopName}</p>
                        {r.message && <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{r.message}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{r.email}</p>
                        <p className="text-xs text-muted-foreground">{r.phone}</p>
                      </TableCell>
                      <TableCell><Badge variant={r.status === "PENDING" ? "secondary" : r.status === "APPROVED" ? "default" : "destructive"}>{r.status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fmtDate(r.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {r.status === "PENDING" ? (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" onClick={() => approveRequest(r)}>
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rejectRequest(r)}>Reject</Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" onClick={() => deleteRequest(r.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      <Separator />

      {/* Approved owners */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Store className="h-5 w-5" /> Approved Owners</h2>
          <Badge variant="secondary">{owners.length} owners</Badge>
        </div>
        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : owners.length === 0 ? (
          <EmptyState icon={Store} title="No owners yet" hint="Approve an owner request to get started." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {owners.map((o) => (
              <Card key={o.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm">{o.storeName}</p>
                    <p className="text-xs text-muted-foreground">{o.user?.name} • {o.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={o.isApproved ? "default" : "outline"}>{o.isApproved ? "Approved" : "Unapproved"}</Badge>
                      <span className="text-xs text-muted-foreground">{o._count?.products || 0} products</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  <Button size="sm" variant="outline" onClick={() => toggleApprove(o)}>
                    {o.isApproved ? "Unapprove" : "Approve"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPermOwner(o)}>
                    <Shield className="h-3.5 w-3.5 mr-1" /> Permissions
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteOwner(o.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Credentials dialog */}
      {creds && (
        <Dialog open onOpenChange={(o) => !o && setCreds(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Owner Account Created</DialogTitle>
              <DialogDescription>Share these credentials securely with the new owner.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{creds.name}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Email</span><span className="font-medium">{creds.email}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Password</span><span className="font-mono font-bold">{creds.password}</span></div>
              </div>
              <p className="text-xs text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                Copy these credentials now — the password will not be shown again.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard?.writeText(`Email: ${creds.email}\nPassword: ${creds.password}`);
                  toast("Credentials copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Credentials
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setCreds(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Permissions dialog */}
      {permOwner && (
        <PermissionsDialog
          owner={permOwner}
          onClose={() => setPermOwner(null)}
          onSaved={() => { setPermOwner(null); loadOwners(); }}
        />
      )}
    </div>
  );
}

function PermissionsDialog({ owner, onClose, onSaved }: { owner: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [perms, setPerms] = useState<Record<string, boolean>>(
    PERMISSION_LABELS.reduce((acc, p) => ({ ...acc, [p.key]: owner.permission?.[p.key] ?? false }), {})
  );

  async function save() {
    setLoading(true);
    try {
      await api(`/api/admin/owners/${owner.id}`, { method: "PUT", body: JSON.stringify(perms) });
      toast("Permissions updated");
      onSaved();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Permissions — {owner.storeName}</DialogTitle>
          <DialogDescription>Control what this owner can do.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {PERMISSION_LABELS.map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <Label htmlFor={`perm-${p.key}`} className="text-sm font-normal cursor-pointer">{p.label}</Label>
              <Switch
                id={`perm-${p.key}`}
                checked={perms[p.key]}
                onCheckedChange={(c) => setPerms({ ...perms, [p.key]: c })}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Permissions"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Users                                                          */
/* ------------------------------------------------------------------ */

function UsersTab() {
  const { toast } = useUI();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const fetchUrl = roleFilter === "ALL" ? "/api/admin/users" : `/api/admin/users?role=${roleFilter}`;
  const load = () => {
    setLoading(true);
    api(fetchUrl)
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api(fetchUrl)
      .then((d) => setUsers(d.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  async function toggleField(u: any, field: "isActive" | "isVerified") {
    try {
      await api(`/api/admin/users/${u.id}`, { method: "PUT", body: JSON.stringify({ [field]: !u[field] }) });
      toast(`${field === "isActive" ? "Active" : "Verified"} status updated`);
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await api(`/api/admin/users/${id}`, { method: "DELETE" });
      toast("User deleted");
      load();
    } catch (e: any) { toast(e.message, "error"); }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(q.toLowerCase()) || u.email?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={UserCog} title="No users found" />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {u.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "SUPER_ADMIN" ? "default" : u.role === "ADMIN" ? "secondary" : "outline"}>
                        {u.role.replace("_", " ").toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.phone || "—"}</TableCell>
                    <TableCell>
                      <Switch checked={!!u.isActive} onCheckedChange={() => toggleField(u, "isActive")} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={!!u.isVerified} onCheckedChange={() => toggleField(u, "isVerified")} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(u); setShowForm(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(u.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {showForm && (
        <UserFormDialog
          user={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

function UserFormDialog({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    role: user?.role || "CUSTOMER",
    storeName: user?.owner?.storeName || "",
    isActive: user?.isActive ?? true,
    isVerified: user?.isVerified ?? true,
  });

  async function save() {
    if (!form.name || !form.email) { toast("Name and email are required", "error"); return; }
    if (!user && !form.password) { toast("Password is required for new users", "error"); return; }
    setLoading(true);
    try {
      if (user) {
        const body: any = {
          name: form.name, phone: form.phone, role: form.role, isActive: form.isActive, isVerified: form.isVerified,
        };
        if (form.password) body.password = form.password;
        if (form.role === "OWNER") body.storeName = form.storeName;
        await api(`/api/admin/users/${user.id}`, { method: "PUT", body: JSON.stringify(body) });
        toast("User updated");
      } else {
        const body: any = {
          name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role,
        };
        if (form.role === "OWNER") body.storeName = form.storeName;
        await api("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
        toast("User created");
      }
      onSaved();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!user} className={user ? "bg-muted" : ""} />
          </div>
          <div className="space-y-1.5">
            <Label>Password {user ? "(leave blank to keep)" : "*"}</Label>
            <Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={user ? "Unchanged" : "Set password"} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.role === "OWNER" && (
            <div className="space-y-1.5">
              <Label>Store Name</Label>
              <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
            </div>
          )}
          <div className="flex items-center gap-2 pt-7">
            <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} id="u-active" />
            <Label htmlFor="u-active">Active</Label>
          </div>
          <div className="flex items-center gap-2 pt-7">
            <Switch checked={form.isVerified} onCheckedChange={(c) => setForm({ ...form, isVerified: c })} id="u-verified" />
            <Label htmlFor="u-verified">Verified</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Appearance (Theme + Landing + Banners)                         */
/* ------------------------------------------------------------------ */

function AppearanceTab({ settings }: { settings: any }) {
  const { toast } = useUI();
  const [s, setS] = useState<any>(settings || {});
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api("/api/settings")
      .then((d) => { if (d.settings) setS({ ...settings, ...d.settings }); })
      .catch(() => {});
    api("/api/banners")
      .then((d) => setBanners(d.banners || []))
      .catch(() => {})
      .finally(() => setBannersLoading(false));
  }, [settings]);

  function setField(k: string, v: any) {
    setS((prev: any) => ({ ...prev, [k]: v }));
  }

  async function uploadLogo(file: File, field: string) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const data = await apiUpload("/api/upload", fd);
      setField(field, data.files[0].url);
      toast("Image uploaded");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const allowed = [
        "siteName","tagline","logoUrl","faviconUrl","primaryColor","accentColor","whatsappNum","supportEmail",
        "phone","address","facebook","instagram","twitter","youtube","footerText","copyrightText",
        "buttonStyle","cardStyle","headerStyle","footerStyle","fontHeading","fontBody",
        "customerHeroTitle","customerHeroSubtitle","customerHeroImage","customerAboutTitle","customerAboutText",
        "ownerHeroTitle","ownerHeroSubtitle","ownerHeroImage","ownerAboutTitle","ownerAboutText",
      ];
      const body: any = {};
      for (const k of allowed) body[k] = s[k] ?? "";
      await api("/api/settings", { method: "PUT", body: JSON.stringify(body) });
      toast("Settings saved — changes apply site-wide");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  function loadBanners() {
    api("/api/banners")
      .then((d) => setBanners(d.banners || []))
      .catch(() => {});
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Changes apply site-wide</p>
            <p className="text-xs mt-0.5">These settings affect the entire FunziToys storefront and owner portal.</p>
          </div>
        </div>
      </Card>

      {/* Brand identity */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Brand Identity</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Site Name</Label>
            <Input value={s.siteName || ""} onChange={(e) => setField("siteName", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tagline</Label>
            <Input value={s.tagline || ""} onChange={(e) => setField("tagline", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {s.logoUrl ? (
                <div className="relative h-16 w-16 rounded border overflow-hidden group bg-white">
                  <img src={s.logoUrl} alt="" className="w-full h-full object-contain p-1" />
                  <button onClick={() => setField("logoUrl", "")} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "logoUrl")} />
              </label>
              <Input
                placeholder="or paste logo URL"
                value={s.logoUrl || ""}
                onChange={(e) => setField("logoUrl", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <input type="color" value={s.primaryColor || "#7c3aed"} onChange={(e) => setField("primaryColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
              <Input value={s.primaryColor || ""} onChange={(e) => setField("primaryColor", e.target.value)} placeholder="#7c3aed" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <input type="color" value={s.accentColor || "#f59e0b"} onChange={(e) => setField("accentColor", e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
              <Input value={s.accentColor || ""} onChange={(e) => setField("accentColor", e.target.value)} placeholder="#f59e0b" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Button Style</Label>
            <Select value={s.buttonStyle || "rounded"} onValueChange={(v) => setField("buttonStyle", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="pill">Pill</SelectItem>
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="soft">Soft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Card Style</Label>
            <Select value={s.cardStyle || "default"} onValueChange={(v) => setField("cardStyle", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="outlined">Outlined</SelectItem>
                <SelectItem value="elevated">Elevated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Contact + Social */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Contact & Social</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Support Email</Label>
            <Input value={s.supportEmail || ""} onChange={(e) => setField("supportEmail", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={s.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>WhatsApp Number</Label>
            <Input value={s.whatsappNum || ""} onChange={(e) => setField("whatsappNum", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Address</Label>
            <Textarea value={s.address || ""} onChange={(e) => setField("address", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5"><Label>Facebook</Label><Input value={s.facebook || ""} onChange={(e) => setField("facebook", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Instagram</Label><Input value={s.instagram || ""} onChange={(e) => setField("instagram", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Twitter</Label><Input value={s.twitter || ""} onChange={(e) => setField("twitter", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>YouTube</Label><Input value={s.youtube || ""} onChange={(e) => setField("youtube", e.target.value)} /></div>
        </div>
      </Card>

      {/* Footer */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Footer</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Footer Text</Label>
            <Textarea value={s.footerText || ""} onChange={(e) => setField("footerText", e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Copyright Text</Label>
            <Input value={s.copyrightText || ""} onChange={(e) => setField("copyrightText", e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Customer landing */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Customer Landing Page</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Hero Title</Label><Input value={s.customerHeroTitle || ""} onChange={(e) => setField("customerHeroTitle", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hero Subtitle</Label><Input value={s.customerHeroSubtitle || ""} onChange={(e) => setField("customerHeroSubtitle", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Hero Image</Label>
            <div className="flex items-center gap-3">
              {s.customerHeroImage ? (
                <div className="relative h-16 w-24 rounded border overflow-hidden group">
                  <img src={s.customerHeroImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setField("customerHeroImage", "")} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-24 rounded border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "customerHeroImage")} />
              </label>
            </div>
          </div>
          <div className="space-y-1.5"><Label>About Title</Label><Input value={s.customerAboutTitle || ""} onChange={(e) => setField("customerAboutTitle", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>About Text</Label>
            <Textarea value={s.customerAboutText || ""} onChange={(e) => setField("customerAboutText", e.target.value)} rows={3} />
          </div>
        </div>
      </Card>

      {/* Owner landing */}
      <Card className="p-5">
        <h2 className="font-bold mb-4">Owner Landing Page</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Hero Title</Label><Input value={s.ownerHeroTitle || ""} onChange={(e) => setField("ownerHeroTitle", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Hero Subtitle</Label><Input value={s.ownerHeroSubtitle || ""} onChange={(e) => setField("ownerHeroSubtitle", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Hero Image</Label>
            <div className="flex items-center gap-3">
              {s.ownerHeroImage ? (
                <div className="relative h-16 w-24 rounded border overflow-hidden group">
                  <img src={s.ownerHeroImage} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setField("ownerHeroImage", "")} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-24 rounded border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0], "ownerHeroImage")} />
              </label>
            </div>
          </div>
          <div className="space-y-1.5"><Label>About Title</Label><Input value={s.ownerAboutTitle || ""} onChange={(e) => setField("ownerAboutTitle", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>About Text</Label>
            <Textarea value={s.ownerAboutText || ""} onChange={(e) => setField("ownerAboutText", e.target.value)} rows={3} />
          </div>
        </div>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg" className="shadow-lg">
          {saving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>

      {/* Banners */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold">Hero Banners</h2>
            <p className="text-xs text-muted-foreground">Banners displayed in the storefront carousel.</p>
          </div>
          <Button onClick={() => setShowBanner(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Banner
          </Button>
        </div>
        {bannersLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : banners.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No banners yet" hint="Add a hero banner for the storefront." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {banners.map((b) => (
              <Card key={b.id} className="overflow-hidden">
                {b.imageUrl && <img src={b.imageUrl} alt="" className="w-full h-32 object-cover" />}
                <div className="p-3">
                  {b.eyebrow && <p className="text-xs text-primary font-medium uppercase">{b.eyebrow}</p>}
                  <p className="font-medium text-sm">{b.title}</p>
                  {b.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{b.subtitle}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={b.isActive ? "default" : "outline"}>{b.isActive ? "Active" : "Inactive"}</Badge>
                    <span className="text-xs text-muted-foreground">Order: {b.sortOrder}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {showBanner && (
        <BannerFormDialog
          onClose={() => setShowBanner(false)}
          onSaved={() => { setShowBanner(false); loadBanners(); }}
        />
      )}
    </div>
  );
}

function BannerFormDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { toast } = useUI();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "", subtitle: "", eyebrow: "", imageUrl: "", ctaText: "", ctaLink: "",
    isActive: true, sortOrder: 0,
  });

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const data = await apiUpload("/api/upload", fd);
      setForm((f) => ({ ...f, imageUrl: data.files[0].url }));
      toast("Image uploaded");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.title) { toast("Title required", "error"); return; }
    setLoading(true);
    try {
      await api("/api/banners", {
        method: "POST",
        body: JSON.stringify({ ...form, sortOrder: String(form.sortOrder) }),
      });
      toast("Banner created");
      onSaved();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add Banner</DialogTitle></DialogHeader>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="sm:col-span-2 space-y-1.5"><Label>Subtitle</Label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Eyebrow</Label><Input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></div>
          <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} /></div>
          <div className="space-y-1.5"><Label>CTA Text</Label><Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="Shop Now" /></div>
          <div className="space-y-1.5"><Label>CTA Link</Label><Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="?view=products" /></div>
          <div className="sm:col-span-2 space-y-1.5">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              {form.imageUrl ? (
                <div className="relative h-20 w-32 rounded overflow-hidden border group">
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, imageUrl: "" })} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-32 rounded border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <span><Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 pt-2">
            <Switch checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} id="b-active" />
            <Label htmlFor="b-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Create Banner"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: SEO                                                            */
/* ------------------------------------------------------------------ */

function SeoTab({ settings }: { settings: any }) {
  const { toast } = useUI();
  const [form, setForm] = useState({
    metaTitle: settings?.metaTitle || "",
    metaDesc: settings?.metaDesc || "",
    metaKeywords: settings?.metaKeywords || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api("/api/settings")
      .then((d) => {
        if (d.settings) {
          setForm({
            metaTitle: d.settings.metaTitle || "",
            metaDesc: d.settings.metaDesc || "",
            metaKeywords: d.settings.metaKeywords || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    try {
      await api("/api/settings", { method: "PUT", body: JSON.stringify(form) });
      toast("SEO settings saved");
    } catch (e: any) { toast(e.message, "error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="p-5">
        <h2 className="font-bold mb-4">Search Engine Optimization</h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Meta Title</Label>
            <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="FunziToys — Premium Toys & Games" maxLength={70} />
            <p className="text-xs text-muted-foreground">{form.metaTitle.length}/70 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label>Meta Description</Label>
            <Textarea value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} rows={3} maxLength={200} placeholder="Brief description shown in search results" />
            <p className="text-xs text-muted-foreground">{form.metaDesc.length}/200 characters</p>
          </div>
          <div className="space-y-1.5">
            <Label>Meta Keywords</Label>
            <Input value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} placeholder="toys, games, kids, fun" />
            <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save SEO Settings"}</Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tab: Media Library                                                  */
/* ------------------------------------------------------------------ */

function MediaTab() {
  const { toast } = useUI();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const load = () => {
    setLoading(true);
    api("/api/upload")
      .then((d) => setMedia(d.media || []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    api("/api/upload")
      .then((d) => setMedia(d.media || []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, []);

  async function upload(files: FileList) {
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const data = await apiUpload("/api/upload", fd);
      toast(`${data.files.length} file(s) uploaded`);
      load();
    } catch (e: any) { toast(e.message, "error"); }
    finally { setUploading(false); }
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(url);
    toast("URL copied to clipboard");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{media.length} media files</p>
        <label className="cursor-pointer">
          <Button asChild disabled={uploading}>
            <span>
              <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading..." : "Upload Files"}
            </span>
          </Button>
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && e.target.files.length > 0 && upload(e.target.files)} />
        </label>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
        </div>
      ) : media.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media uploaded" hint="Upload images to use across your site." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {media.map((m) => (
            <Card key={m.id} className="overflow-hidden group cursor-pointer" onClick={() => copyUrl(m.url)}>
              <div className="aspect-square bg-muted relative">
                <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); copyUrl(m.url); }}>
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy URL
                  </Button>
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setPreview(m); }}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> Preview
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{m.filename}</p>
                <p className="text-xs text-muted-foreground">{(m.size / 1024).toFixed(1)} KB</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {preview && (
        <Dialog open onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="truncate">{preview.filename}</DialogTitle>
            </DialogHeader>
            <img src={preview.url} alt={preview.filename} className="w-full max-h-[70vh] object-contain rounded" />
            <div className="flex items-center gap-2">
              <Input value={preview.url} readOnly className="flex-1 font-mono text-xs" />
              <Button onClick={() => copyUrl(preview.url)}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
