"use client";
import { navigate } from "@/lib/store";
import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export interface SiteSettings {
  siteName: string;
  tagline?: string | null;
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
}

export function Footer({ settings, categories }: { settings: SiteSettings; categories: { id: string; name: string; slug: string }[] }) {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-8 object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">{settings.siteName.charAt(0)}</div>
              )}
              <span className="font-bold text-lg">{settings.siteName}</span>
            </div>
            <p className="text-sm text-muted-foreground">{settings.tagline || settings.footerText || "Your one-stop toy shop."}</p>
            <div className="flex gap-2">
              {settings.facebook && <a href={settings.facebook} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></a>}
              {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></a>}
              {settings.twitter && <a href={settings.twitter} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>}
              {settings.youtube && <a href={settings.youtube} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary"><Youtube className="h-5 w-5" /></a>}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-primary" onClick={() => navigate({ view: "products" })}>All Products</button></li>
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}><button className="hover:text-primary" onClick={() => navigate({ view: "products", cat: c.slug })}>{c.name}</button></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-primary" onClick={() => navigate({ view: "account" })}>My Account</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate({ view: "cart" })}>Cart</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate({ view: "wishlist" })}>Wishlist</button></li>
              <li><button className="hover:text-primary" onClick={() => navigate({ view: "owner" })}><Store className="h-4 w-4 inline mr-1" />For Shop Owners</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.supportEmail && <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" /> {settings.supportEmail}</li>}
              {settings.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" /> {settings.phone}</li>}
              {settings.address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 shrink-0 mt-0.5" /> {settings.address}</li>}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-muted-foreground">
          <p>{settings.copyrightText || `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`}</p>
          <p className="text-xs">Built with Next.js · Secure payments · Fast delivery</p>
        </div>
      </div>
    </footer>
  );
}
