# Production Deployment Guide: Next.js + Supabase Auth + Vercel

This guide explains how to connect and deploy your Next.js application with Supabase Auth (Email/Password & Google OAuth) on Vercel.

---

## 1. Environment Variables Setup

In your project root `.env.local` (local development) and in **Vercel Project Settings > Environment Variables**:

```env
# Supabase Project Credentials
NEXT_PUBLIC_SUPABASE_URL=https://kmmrshhclmcgtofrmzxl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Supabase PostgreSQL Database Connection String
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.kmmrshhclmcgtofrmzxl.supabase.co:5432/postgres"
```

### Where to find these values:
1. **Supabase URL & Anon Key**:
   - Open [Supabase Dashboard](https://supabase.com/dashboard) -> Select your Project.
   - Go to **Project Settings** -> **API**.
   - Copy `URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon` `public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`

2. **Database Connection String**:
   - Go to **Project Settings** -> **Database**.
   - Copy the Connection String (URI / Session Pooler or Direct 5432).
   - Replace `[YOUR-PASSWORD]` with your database password.

---

## 2. Google OAuth Configuration in Supabase & Google Cloud

To enable **Google Login**:

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project or select an existing one.
   - Navigate to **APIs & Services** -> **OAuth consent screen**.
   - Configure User Type (External) and fill required app details.
   - Navigate to **APIs & Services** -> **Credentials** -> **Create Credentials** -> **OAuth client ID**.
   - Select **Web application**.
   - In **Authorized redirect URIs**, add:
     ```
     https://kmmrshhclmcgtofrmzxl.supabase.co/auth/v1/callback
     ```
   - Click **Create** and copy your **Client ID** and **Client Secret**.

2. **Supabase Dashboard**:
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Toggle **Enable Google provider**.
   - Paste your **Client ID** and **Client Secret**.
   - Save changes.

---

## 3. Configuring Redirect URLs in Supabase for Vercel

When users sign in or complete OAuth on Vercel, Supabase redirects them back to your Vercel deployment URL.

1. Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. **Site URL**: Set to your production Vercel domain:
   ```
   https://your-app.vercel.app
   ```
3. **Redirect URLs**: Add all wildcards and callback endpoints:
   ```
   https://your-app.vercel.app/api/auth/callback
   https://*.vercel.app/api/auth/callback
   http://localhost:3000/api/auth/callback
   ```

---

## 4. Project Structure Created

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts         # Handles OAuth & Magic Link callback
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx             # Email/Password + Google Login page
│   │   ├── signup/
│   │   │   └── page.tsx             # Signup page
│   │   └── logout/
│   │       └── route.ts             # Server logout endpoint
│   └── dashboard/
│       └── page.tsx                 # Protected user dashboard
├── lib/
│   └── supabase/
│       ├── client.ts                # Client-side Supabase client (@supabase/ssr)
│       ├── server.ts                # Server-side Supabase client (@supabase/ssr)
│       └── middleware.ts            # Middleware session refresh & route protection
└── middleware.ts                    # Root Next.js middleware
```

---

## 5. Vercel Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Supabase Auth and Vercel integration"
   git push origin main
   ```

2. **Deploy via Vercel CLI or Dashboard**:
   - **Dashboard**: Import repository at [vercel.com/new](https://vercel.com/new).
   - **Vercel CLI**:
     ```bash
     npx vercel
     ```

3. **Set Environment Variables in Vercel**:
   - Go to Vercel Project Settings -> Environment Variables.
   - Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `DATABASE_URL`.

4. **Deploy to Production**:
   ```bash
   npx vercel --prod
   ```
