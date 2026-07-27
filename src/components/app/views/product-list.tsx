"use client";
import { useEffect, useState } from "react";
import { ProductCard, type Product } from "../product-card";
import { api, getParams, navigate } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Category } from "../app-shell";

export function ProductList({ categories }: { categories: Category[] }) {
  const params = getParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.q || "");
  const [cat, setCat] = useState(params.cat || "all");
  const [brand, setBrand] = useState(params.brand || "all");
  const [sort, setSort] = useState(params.sort || "newest");
  const [priceRange, setPriceRange] = useState<number[]>([0, 5000]);
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    api<{ brands: any[] }>("/api/brands").then((d) => setBrands(d.brands)).catch(() => {});
  }, []);

  useEffect(() => {
    setQ(params.q || "");
    setCat(params.cat || "all");
    setBrand(params.brand || "all");
    setSort(params.sort || "newest");
  }, [params.q, params.cat, params.brand, params.sort]);

  useEffect(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (cat && cat !== "all") sp.set("cat", cat);
    if (brand && brand !== "all") sp.set("brand", brand);
    if (sort) sp.set("sort", sort);
    sp.set("minPrice", String(priceRange[0]));
    sp.set("maxPrice", String(priceRange[1]));
    sp.set("limit", "24");
    if (params.page) sp.set("page", params.page);
    api<{ products: Product[]; total: number; pages: number }>(`/api/products?${sp.toString()}`)
      .then((d) => { setProducts(d.products); setTotal(d.total); setPages(d.pages); })
      .finally(() => setLoading(false));
  }, [q, cat, brand, sort, priceRange, params.page]);

  function applyFilters() {
    navigate({ view: "products", q: q || undefined, cat: cat !== "all" ? cat : undefined, brand: brand !== "all" ? brand : undefined, sort, page: undefined });
  }

  const currentCat = categories.find((c) => c.slug === cat);

  const FilterPanel = (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-semibold">Categories</Label>
        <div className="mt-2 space-y-1">
          <button className={`block w-full text-left px-2 py-1.5 rounded text-sm ${cat === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => { setCat("all"); navigate({ view: "products", cat: undefined, page: undefined }); }}>All Categories</button>
          {categories.map((c) => (
            <button key={c.id} className={`block w-full text-left px-2 py-1.5 rounded text-sm ${cat === c.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => { setCat(c.slug); navigate({ view: "products", cat: c.slug, page: undefined }); }}>{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold">Brands</Label>
        <Select value={brand} onValueChange={(v) => { setBrand(v); }}>
          <SelectTrigger className="mt-2"><SelectValue placeholder="All brands" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.slug}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-semibold">Price Range</Label>
        <div className="mt-3 px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={5000} step={100} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>
      <div>
        <Label className="text-sm font-semibold">Sort By</Label>
        <Select value={sort} onValueChange={(v) => { setSort(v); navigate({ view: "products", sort: v, page: undefined }); }}>
          <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full" onClick={applyFilters}><Filter className="h-4 w-4 mr-2" /> Apply Filters</Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{currentCat ? currentCat.name : q ? `Search: "${q}"` : "All Products"}</h1>
          <p className="text-sm text-muted-foreground">{total} products found</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="lg:hidden"><SlidersHorizontal className="h-4 w-4 mr-2" /> Filters</Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4">{FilterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Card className="p-4 sticky top-28">{FilterPanel}</Card>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-lg" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => navigate({ view: "products" })}>Clear filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }).map((_, i) => (
                <Button key={i} variant={parseInt(params.page || "1") === i + 1 ? "default" : "outline"} size="sm" onClick={() => navigate({ view: "products", page: String(i + 1) })}>{i + 1}</Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

