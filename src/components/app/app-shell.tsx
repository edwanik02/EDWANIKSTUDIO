"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth, useCart, useUI, getParams } from "@/lib/store";
import { Header } from "./header";
import { Footer } from "./footer";
import { AuthModal } from "./auth-modal";
import { Toaster } from "./toaster";
import { ThemeProvider } from "./theme";
import { Loader2 } from "lucide-react";

import { CustomerLanding } from "./views/customer-landing";
import { ProductList } from "./views/product-list";
import { ProductDetail } from "./views/product-detail";
import { CartView } from "./views/cart";
import { WishlistView } from "./views/wishlist";
import { CheckoutView } from "./views/checkout";
import { OrderDetailView } from "./views/order-detail";
import { CustomerDashboard } from "./views/customer-dashboard";
import { OwnerLanding } from "./views/owner-landing";
import { OwnerLogin } from "./views/owner-login";
import { OwnerRequest } from "./views/owner-request";
import { OwnerDashboard } from "./views/owner-dashboard";
import { AdminLogin } from "./views/admin-login";
import { AdminDashboard } from "./views/admin-dashboard";

export interface SiteSettings {
  id: string;
  siteName: string;
  logoUrl?: string | null;
  tagline?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  whatsappNum?: string | null;
  supportEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  footerText?: string | null;
  copyrightText?: string | null;
  buttonStyle?: string | null;
  cardStyle?: string | null;
  customerHeroTitle?: string | null;
  customerHeroSubtitle?: string | null;
  customerHeroImage?: string | null;
  customerAboutTitle?: string | null;
  customerAboutText?: string | null;
  ownerHeroTitle?: string | null;
  ownerHeroSubtitle?: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
}

export function AppShell({ settings, categories, banners }: { settings: SiteSettings; categories: Category[]; banners: any[] }) {
  const { user, loading, fetchUser } = useAuth();
  const { fetchCart } = useCart();
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const update = () => setParams(getParams());
    update();
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [params.view, params.id, params.tab, params.sub]);

  const view = params.view || "home";

  // Full-screen dashboard views (no customer header/footer)
  const isDashView = ["admin", "owner-dash", "admin-login"].includes(view);
  const isOwnerLanding = view === "owner" || view === "owner-login" || view === "owner-request";

  if (loading && !user) {
    return (
      <ThemeProvider settings={settings}>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Toaster />
        <AuthModal />
      </ThemeProvider>
    );
  }

  let content: React.ReactNode = null;

  switch (view) {
    case "home":
      content = <CustomerLanding settings={settings} categories={categories} banners={banners} />;
      break;
    case "products":
      content = <ProductList categories={categories} />;
      break;
    case "product":
      content = <ProductDetail />;
      break;
    case "cart":
      content = <CartView />;
      break;
    case "wishlist":
      content = <WishlistView />;
      break;
    case "checkout":
      content = <CheckoutView />;
      break;
    case "order":
      content = <OrderDetailView />;
      break;
    case "account":
      content = <CustomerDashboard />;
      break;
    case "owner":
      content = <OwnerLanding settings={settings} />;
      break;
    case "owner-login":
      content = <OwnerLogin settings={settings} />;
      break;
    case "owner-request":
      content = <OwnerRequest />;
      break;
    case "owner-dash":
      content = <OwnerDashboard settings={settings} />;
      break;
    case "admin-login":
      content = <AdminLogin settings={settings} />;
      break;
    case "admin":
      content = <AdminDashboard settings={settings} />;
      break;
    default:
      content = <CustomerLanding settings={settings} categories={categories} banners={banners} />;
  }

  // Dashboards render full-screen with their own chrome
  if (isDashView) {
    return (
      <ThemeProvider settings={settings}>
        {content}
        <Toaster />
        <AuthModal />
      </ThemeProvider>
    );
  }

  // Owner landing pages have their own minimal header/footer
  if (isOwnerLanding) {
    return (
      <ThemeProvider settings={settings}>
        <div className="min-h-screen flex flex-col">
          {content}
        </div>
        <Toaster />
        <AuthModal />
      </ThemeProvider>
    );
  }

  // Customer-facing pages with shared header + sticky footer
  return (
    <ThemeProvider settings={settings}>
      <div className="min-h-screen flex flex-col">
        <Header settings={settings} categories={categories} />
        <main className="flex-1">{content}</main>
        <Footer settings={settings} categories={categories} />
      </div>
      <Toaster />
      <AuthModal />
    </ThemeProvider>
  );
}
