import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getSettings, DEFAULT_SETTINGS } from "@/lib/api";
import { AppShell } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    const [settings, categories, banners] = await Promise.all([
      getSettings(),
      db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
      db.heroBanner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    ]);
    return {
      settings: settings || DEFAULT_SETTINGS,
      categories: categories || [],
      banners: banners || [],
    };
  } catch (error) {
    console.error("Error fetching page data from database:", error);
    return {
      settings: DEFAULT_SETTINGS,
      categories: [],
      banners: [],
    };
  }
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  try {
    const sp = await searchParams;
    const view = (sp?.view as string) || "home";
    const settings = (await getSettings()) || DEFAULT_SETTINGS;

    const siteName = settings.siteName || "FunziToys";
    const baseTitle = settings.metaTitle || `${siteName} - Premium Toys & Games for Kids`;
    const baseDesc = settings.metaDesc || "Shop premium toys, action figures, building blocks, educational games and more. Fast delivery, best prices, quality guaranteed.";

    let title = baseTitle;
    let description = baseDesc;

    if (view === "products") {
      title = `Shop Products | ${siteName}`;
      description = `Browse our full collection of toys and games at ${siteName}.`;
    } else if (view === "product") {
      title = `Product | ${siteName}`;
      description = `Product details at ${siteName}.`;
    } else if (view === "owner") {
      title = `Become a Seller | ${siteName}`;
      description = settings.ownerHeroSubtitle || `Grow your toy business with ${siteName}. Reach more customers, manage your store easily.`;
    } else if (view === "cart") {
      title = `Shopping Cart | ${siteName}`;
    } else if (view === "checkout") {
      title = `Checkout | ${siteName}`;
    } else if (view === "account") {
      title = `My Account | ${siteName}`;
    } else if (view === "wishlist") {
      title = `My Wishlist | ${siteName}`;
    }

    return {
      title,
      description,
      keywords: settings.metaKeywords?.split(",").map((k) => k.trim()) || ["toys", "kids toys", "online toy store"],
      openGraph: {
        title,
        description,
        siteName,
        type: "website",
        images: settings.logoUrl ? [{ url: settings.logoUrl }] : undefined,
      },
      twitter: { card: "summary_large_image", title, description },
    };
  } catch (error) {
    console.error("Error generating page metadata:", error);
    return {
      title: "FunziToys - Premium Toys & Games for Kids",
      description: "Shop premium toys, action figures, building blocks, educational games and more at FunziToys.",
    };
  }
}

export default async function Page() {
  const { settings, categories, banners } = await getData();
  return <AppShell settings={JSON.parse(JSON.stringify(settings))} categories={JSON.parse(JSON.stringify(categories))} banners={JSON.parse(JSON.stringify(banners))} />;
}
