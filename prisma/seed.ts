import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Super Admin
  const adminPass = await bcrypt.hash("admin123", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@funzitoys.com" },
    update: {},
    create: {
      email: "admin@funzitoys.com",
      name: "Super Admin",
      passwordHash: adminPass,
      role: "SUPER_ADMIN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("Admin created:", admin.email);

  // Owner
  const ownerPass = await bcrypt.hash("owner123", 10);
  const ownerUser = await db.user.upsert({
    where: { email: "owner@funzitoys.com" },
    update: {},
    create: {
      email: "owner@funzitoys.com",
      name: "Demo Owner",
      passwordHash: ownerPass,
      role: "OWNER",
      isVerified: true,
      isActive: true,
    },
  });
  const owner = await db.owner.upsert({
    where: { storeSlug: "demo-store" },
    update: {},
    create: {
      userId: ownerUser.id,
      storeName: "Demo Store",
      storeSlug: "demo-store",
      logoUrl: null,
      isApproved: true,
      approvedAt: new Date(),
      permission: {
        create: {
          canManageProducts: true,
          canManageOrders: true,
          canViewCustomers: true,
          canManageSettings: true,
          canUploadImages: true,
          canViewAnalytics: true,
        },
      },
      storeSetting: { create: { primaryColor: "#FF6B35", tagline: "Quality toys for happy kids" } },
    },
  });
  console.log("Owner created:", owner.storeName);

  // Customer
  const custPass = await bcrypt.hash("customer123", 10);
  const custUser = await db.user.upsert({
    where: { email: "customer@funzitoys.com" },
    update: {},
    create: {
      email: "customer@funzitoys.com",
      name: "Demo Customer",
      passwordHash: custPass,
      role: "CUSTOMER",
      isVerified: true,
      isActive: true,
      phone: "9876543210",
    },
  });
  await db.customer.upsert({
    where: { userId: custUser.id },
    update: {},
    create: { userId: custUser.id },
  });
  console.log("Customer created:", custUser.email);

  // Categories
  const categories = [
    { name: "Action Figures", slug: "action-figures", sortOrder: 1, description: "Heroic action figures and collectibles" },
    { name: "Building Blocks", slug: "building-blocks", sortOrder: 2, description: "Creative building block sets" },
    { name: "Dolls & Plush", slug: "dolls-plush", sortOrder: 3, description: "Soft plush toys and dolls" },
    { name: "Educational", slug: "educational", sortOrder: 4, description: "STEM and learning toys" },
    { name: "Remote Control", slug: "remote-control", sortOrder: 5, description: "RC cars, drones and more" },
    { name: "Board Games", slug: "board-games", sortOrder: 6, description: "Family board games and puzzles" },
  ];
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log("Categories created:", categories.length);

  // Brands
  const brands = [
    { name: "PlayMax", slug: "playmax", sortOrder: 1, description: "Premium play experiences" },
    { name: "BuildRight", slug: "buildright", sortOrder: 2, description: "Construction toy experts" },
    { name: "TinyTots", slug: "tinytots", sortOrder: 3, description: "Toys for little ones" },
    { name: "TechToys", slug: "techtoys", sortOrder: 4, description: "Tech-enabled toys" },
  ];
  for (const b of brands) {
    await db.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log("Brands created:", brands.length);

  // Products
  const catMap = await db.category.findMany();
  const brandMap = await db.brand.findMany();
  const getCat = (slug: string) => catMap.find((c) => c.slug === slug)?.id;
  const getBrand = (slug: string) => brandMap.find((b) => b.slug === slug)?.id;

  const products = [
    {
      name: "Galaxy Warrior Action Figure",
      slug: "galaxy-warrior-action-figure",
      description: "A premium 12-inch articulated action figure with light-up features and accessories. Perfect for imaginative play and collecting.",
      price: 899, mrpPrice: 1299, sku: "PM-AF-001", badge: "NEW",
      categorySlug: "action-figures", brandSlug: "playmax", stock: 45, rating: 4.5, reviewCount: 12,
    },
    {
      name: "Mega Castle Building Set 500pc",
      slug: "mega-castle-building-set",
      description: "Build a magnificent castle with 500 colorful interlocking blocks. Encourages creativity, spatial skills, and patience.",
      price: 1499, mrpPrice: 1999, sku: "BR-BB-002", badge: "BESTSELLER",
      categorySlug: "building-blocks", brandSlug: "buildright", stock: 30, rating: 4.8, reviewCount: 34,
    },
    {
      name: "Cuddle Bear Plush Toy",
      slug: "cuddle-bear-plush-toy",
      description: "Ultra-soft 30cm plush bear made with hypoallergenic materials. The perfect cuddle companion for kids.",
      price: 599, mrpPrice: 799, sku: "TT-DP-003", badge: "HOT",
      categorySlug: "dolls-plush", brandSlug: "tinytots", stock: 60, rating: 4.7, reviewCount: 28,
    },
    {
      name: "Science Lab Experiment Kit",
      slug: "science-lab-experiment-kit",
      description: "50+ safe and exciting science experiments for curious minds. Includes all materials and a full-color guidebook.",
      price: 1199, mrpPrice: 1599, sku: "PM-ED-004", badge: "SALE",
      categorySlug: "educational", brandSlug: "playmax", stock: 25, rating: 4.6, reviewCount: 19,
    },
    {
      name: "Turbo Speed RC Car",
      slug: "turbo-speed-rc-car",
      description: "High-speed remote control car with 2.4GHz controller, reaches up to 25km/h. Rechargeable battery included.",
      price: 1899, mrpPrice: 2499, sku: "TT-RC-005", badge: "HOT",
      categorySlug: "remote-control", brandSlug: "techtoys", stock: 18, rating: 4.4, reviewCount: 22,
    },
    {
      name: "Family Fun Board Game Pack",
      slug: "family-fun-board-game-pack",
      description: "A collection of 5 classic board games for family game nights. Suitable for 2-6 players, ages 8+.",
      price: 799, mrpPrice: 999, sku: "BR-BG-006", badge: null,
      categorySlug: "board-games", brandSlug: "buildright", stock: 40, rating: 4.3, reviewCount: 15,
    },
    {
      name: "Robot Building STEM Kit",
      slug: "robot-building-stem-kit",
      description: "Build and program your own robot! Teaches electronics, coding, and engineering. No soldering required.",
      price: 2199, mrpPrice: 2899, sku: "TT-ED-007", badge: "NEW",
      categorySlug: "educational", brandSlug: "techtoys", stock: 12, rating: 4.9, reviewCount: 41,
    },
    {
      name: "Super Hero Action Pose Set",
      slug: "super-hero-action-pose-set",
      description: "Set of 4 articulated superhero figures with interchangeable accessories. Great for display and play.",
      price: 1099, mrpPrice: 1399, sku: "PM-AF-008", badge: "LIMITED",
      categorySlug: "action-figures", brandSlug: "playmax", stock: 22, rating: 4.5, reviewCount: 9,
    },
    {
      name: "Rainbow Stacking Blocks 100pc",
      slug: "rainbow-stacking-blocks",
      description: "100 vibrant wooden stacking blocks in a storage bucket. Develops motor skills and color recognition.",
      price: 699, mrpPrice: 899, sku: "BR-BB-009", badge: null,
      categorySlug: "building-blocks", brandSlug: "buildright", stock: 55, rating: 4.6, reviewCount: 23,
    },
    {
      name: "Flying Drone Mini Pro",
      slug: "flying-drone-mini-pro",
      description: "Compact drone with HD camera, one-key return, and 15-minute flight time. Easy to fly for beginners.",
      price: 3499, mrpPrice: 4499, sku: "TT-RC-010", badge: "BESTSELLER",
      categorySlug: "remote-control", brandSlug: "techtoys", stock: 8, rating: 4.7, reviewCount: 31,
    },
    {
      name: "Unicorn Princess Doll",
      slug: "unicorn-princess-doll",
      description: "Magical unicorn princess doll with shimmering dress and accessories. Says 10 enchanting phrases.",
      price: 849, mrpPrice: 1099, sku: "TT-DP-011", badge: "NEW",
      categorySlug: "dolls-plush", brandSlug: "tinytots", stock: 35, rating: 4.8, reviewCount: 17,
    },
    {
      name: "Strategy Chess & Ludo Combo",
      slug: "strategy-chess-ludo-combo",
      description: "Premium wooden chess set combined with classic Ludo. Magnetic pieces and foldable board.",
      price: 999, mrpPrice: 1299, sku: "BR-BG-012", badge: "SALE",
      categorySlug: "board-games", brandSlug: "buildright", stock: 28, rating: 4.5, reviewCount: 11,
    },
  ];

  for (const p of products) {
    const { categorySlug, brandSlug, ...rest } = p;
    const existing = await db.product.findUnique({ where: { slug: rest.slug } });
    if (!existing) {
      await db.product.create({
        data: {
          ...rest,
          categoryId: getCat(categorySlug) || null,
          brandId: getBrand(brandSlug) || null,
          ownerId: owner.id,
          isActive: true,
          isApproved: true,
        },
      });
    }
  }
  console.log("Products created:", products.length);

  // Hero banners
  const banners = [
    { title: "Big Toy Sale 2024", subtitle: "Up to 50% off on premium toys", eyebrow: "Limited Time", ctaText: "Shop Now", ctaLink: "?view=products", sortOrder: 1, isActive: true },
    { title: "New Arrivals", subtitle: "Discover the latest toys & games", eyebrow: "Just In", ctaText: "Explore", ctaLink: "?view=products", sortOrder: 2, isActive: true },
    { title: "STEM Learning", subtitle: "Smart toys for curious minds", eyebrow: "Educational", ctaText: "Learn More", ctaLink: "?view=products&cat=educational", sortOrder: 3, isActive: true },
  ];
  for (const b of banners) {
    const existing = await db.heroBanner.findFirst({ where: { title: b.title } });
    if (!existing) {
      await db.heroBanner.create({ data: b });
    }
  }
  console.log("Banners created:", banners.length);

  // Site settings
  await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "FunziToys",
      tagline: "Where Fun Meets Imagination",
      primaryColor: "#FF6B35",
      accentColor: "#FFA500",
      whatsappNum: "919876543210",
      supportEmail: "support@funzitoys.com",
      phone: "+91 98765 43210",
      address: "123 Toy Street, Play City, India 560001",
      facebook: "https://facebook.com/funzitoys",
      instagram: "https://instagram.com/funzitoys",
      twitter: "https://twitter.com/funzitoys",
      footerText: "FunziToys brings joy to children with premium, safe, and educational toys.",
      copyrightText: "© 2024 FunziToys. All rights reserved.",
      metaTitle: "FunziToys - Premium Toys & Games for Kids | Shop Online",
      metaDesc: "Shop premium toys, action figures, building blocks, educational games and more at FunziToys. Fast delivery, best prices, quality guaranteed.",
      metaKeywords: "toys, kids toys, action figures, building blocks, educational toys, board games, remote control toys",
      customerHeroTitle: "Bring Home the Magic of Play",
      customerHeroSubtitle: "Discover thousands of premium toys that spark imagination, creativity, and joy.",
      customerAboutTitle: "About FunziToys",
      customerAboutText: "For over a decade, FunziToys has been delighting children and parents with carefully curated, safe, and educational toys. Every product is tested for quality and safety.",
      ownerHeroTitle: "Grow Your Toy Business With Us",
      ownerHeroSubtitle: "Join hundreds of shop owners selling on FunziToys. Reach more customers, manage inventory easily.",
      ownerAboutTitle: "Why Sell on FunziToys",
      ownerAboutText: "Our platform gives shop owners powerful tools to manage products, track orders, and grow sales. You focus on great toys, we handle the rest.",
    },
  });
  console.log("Site settings created");

  console.log("\n✅ Seed complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:    admin@funzitoys.com / admin123");
  console.log("  Owner:    owner@funzitoys.com / owner123");
  console.log("  Customer: customer@funzitoys.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
