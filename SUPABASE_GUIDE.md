# Connecting FunziToys to Supabase (PostgreSQL)

This guide provides step-by-step instructions for connecting your FunziToys Next.js application to **Supabase** (or any managed PostgreSQL database) on Vercel or Cloud Run.

---

## Step 1: Obtain Supabase Connection Strings

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create or select your project.
3. Go to **Project Settings** → **Database**.
4. Scroll down to **Connection String**:
   - **Transaction Pooler** (recommended for `DATABASE_URL` in serverless/Vercel): `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Direct Connection** (required for `DIRECT_URL` for migrations/Prisma): `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres`

---

## Step 2: Configure Environment Variables in Vercel / Hosting Platform

Add the following environment variables in your deployment dashboard (e.g., Vercel → Settings → Environment Variables):

| Variable Name | Description | Example Value |
|---|---|---|
| `DATABASE_URL` | Supabase Pooled or Direct Connection String | `postgresql://postgres.ref:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase Direct Connection String (port 5432) | `postgresql://postgres:password@db.ref.supabase.co:5432/postgres` |
| `JWT_SECRET` | Strong secret for user session tokens | `a-very-secure-random-32-character-string` |

---

## Step 3: Update `prisma/schema.prisma` for PostgreSQL

If deploying with PostgreSQL on Supabase, update your `prisma/schema.prisma` datasource block:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

*(Note: During local offline development, you can keep SQLite or switch `.env` to point to your Supabase instance).*

---

## Step 4: Push Schema & Generate Prisma Client

To apply your schema tables directly to your Supabase database, run from your terminal:

```bash
# 1. Set environment variables locally or in .env
export DATABASE_URL="postgresql://postgres:password@db.ref.supabase.co:5432/postgres"

# 2. Push schema to Supabase
npx prisma db push

# 3. Generate the Prisma client
npx prisma generate
```

---

## Step 5: Verify Deployment & Health Check

1. Deploy your app to Vercel or Cloud Run.
2. Visit `/api/debug/env` to verify environment variables are populated:
   ```json
   {
     "hasDatabaseUrl": true,
     "hasJwtSecret": true,
     "nodeEnv": "production"
   }
   ```
3. Test user registration (`/api/auth/register`) and login (`/api/auth/login`) in production.
