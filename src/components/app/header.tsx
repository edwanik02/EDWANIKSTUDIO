"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { ShoppingCart, Heart, User, Menu, Search, Store, LogOut, LayoutDashboard, Package } from "lucide-react";
import { useAuth, useCart, useUI, navigate, getParams } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SiteSettings {
  siteName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  whatsappNum?: string | null;
  supportEmail?: string | null;
}

export function Header({ settings, categories }: { settings: SiteSettings; categories: { id: string; name: string; slug: string }[] }) {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { openAuth } = useUI();
  const [search, setSearch] = useState(getParams().q || "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ view: "products", q: search || undefined, page: undefined });
    setMobileOpen(false);
  }

  function go(v: string) {
    navigate({ view: v });
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-3">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-left">{settings.siteName}</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" onClick={() => go("home")}>Home</Button>
                <Button variant="ghost" className="justify-start" onClick={() => go("products")}>All Products</Button>
                {categories.slice(0, 8).map((c) => (
                  <Button key={c.id} variant="ghost" className="justify-start" onClick={() => { navigate({ view: "products", cat: c.slug, page: undefined }); setMobileOpen(false); }}>
                    {c.name}
                  </Button>
                ))}
                <div className="h-px bg-border my-2" />
                <Button variant="ghost" className="justify-start" onClick={() => go("cart")}>
                  <ShoppingCart className="h-4 w-4 mr-2" /> Cart {cartCount > 0 && `(${cartCount})`}
                </Button>
                {user && (
                  <Button variant="ghost" className="justify-start" onClick={() => go("wishlist")}>
                    <Heart className="h-4 w-4 mr-2" /> Wishlist
                  </Button>
                )}
                <Button variant="ghost" className="justify-start" onClick={() => go("owner")}>
                  <Store className="h-4 w-4 mr-2" /> For Shop Owners
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/?view=home" className="flex items-center gap-2 shrink-0" onClick={(e) => { e.preventDefault(); go("home"); }}>
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-9 w-9 object-contain rounded" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                {settings.siteName.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg hidden sm:block">{settings.siteName}</span>
          </Link>

          {/* Search (desktop) */}
          <form onSubmit={doSearch} className="hidden md:flex flex-1 max-w-xl mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search toys, games, brands..." className="pl-9" />
            </div>
            <Button type="submit" className="ml-2" size="icon"><Search className="h-4 w-4" /></Button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" onClick={() => go("cart")} aria-label="Cart" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">{cartCount}</span>}
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                    <Badge variant="secondary" className="mt-1 text-xs capitalize">{user.role.toLowerCase().replace("_", " ")}</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === "CUSTOMER" && (
                    <>
                      <DropdownMenuItem onClick={() => go("account")}><User className="h-4 w-4 mr-2" /> My Account</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ view: "account", sub: "orders" })}><Package className="h-4 w-4 mr-2" /> My Orders</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => go("wishlist")}><Heart className="h-4 w-4 mr-2" /> Wishlist</DropdownMenuItem>
                    </>
                  )}
                  {(user.role === "OWNER") && (
                    <DropdownMenuItem onClick={() => go("owner-dash")}><LayoutDashboard className="h-4 w-4 mr-2" /> Owner Dashboard</DropdownMenuItem>
                  )}
                  {(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
                    <DropdownMenuItem onClick={() => go("admin")}><LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await logout(); navigate({ view: "home" }); }} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => openAuth("login")} className="hidden sm:flex">Login</Button>
                <Button size="sm" onClick={() => openAuth("register")} className="hidden sm:flex">Sign Up</Button>
                <Button variant="ghost" size="icon" onClick={() => openAuth("login")} className="sm:hidden" aria-label="Login"><User className="h-5 w-5" /></Button>
              </>
            )}
          </div>
        </div>

        {/* Desktop category nav */}
        <nav className="hidden md:flex items-center gap-1 h-10 -mt-1 overflow-x-auto">
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => go("home")}>Home</Button>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => go("products")}>All Products</Button>
          {categories.slice(0, 7).map((c) => (
            <Button key={c.id} variant="ghost" size="sm" className="text-sm whitespace-nowrap" onClick={() => navigate({ view: "products", cat: c.slug, page: undefined })}>
              {c.name}
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="text-sm ml-auto text-primary" onClick={() => go("owner")}>
            <Store className="h-4 w-4 mr-1" /> For Owners
          </Button>
        </nav>
      </div>
    </header>
  );
}
