import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Calendar, LogOut, User, ArrowLeft, Key, Database } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-sm">
                FT
              </div>
              <span className="font-bold text-slate-900 text-lg">Protected Dashboard</span>
            </div>
          </div>

          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-2xs"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-6 sm:p-8 text-white shadow-md">
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            Supabase Authenticated Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.user_metadata?.full_name || user.email?.split("@")[0]}!
          </h1>
          <p className="mt-2 text-orange-100 text-sm sm:text-base max-w-2xl">
            You are securely logged in with Supabase Auth. This route is guarded by Next.js Server Components and Middleware.
          </p>
        </div>

        {/* User Profile Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-2xl">
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User avatar"
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  (user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  {user.user_metadata?.full_name || "User Profile"}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Active Session
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Key className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-mono text-xs truncate">UID: {user.id}</span>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  Joined: {new Date(user.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Integration Status & Quick Actions */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                Connected Infrastructure
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Overview of your current auth provider and server connection status.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Auth Method
                </div>
                <div className="text-base font-bold text-slate-900 mt-1 capitalize">
                  {user.app_metadata?.provider || "Email/Password"}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Provider: {user.app_metadata?.provider || "email"}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Verification
                </div>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {user.email_confirmed_at ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      Verified
                    </span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Confirmed: {user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString() : "No"}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-xl text-sm hover:bg-orange-700 transition-colors shadow-2xs"
              >
                Go to Main App
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
