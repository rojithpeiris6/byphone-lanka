import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Store, Loader as Loader2 } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/admin" });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="size-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password);

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigate({ to: "/admin" });
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-10 flex-col justify-between">
        <div>
          <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Store className="size-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            byphone.lk<br />Admin Panel
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-md">
            Manage your store, products, orders, and customers from one powerful dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3 text-blue-200 text-sm">
          <Lock className="size-4" />
          <span>Secure admin access • 256-bit encryption</span>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="size-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto">
              <Store className="size-7 text-blue-600" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-white">byphone.lk</h1>
            <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="hidden lg:block mb-6">
              <h2 className="text-xl font-extrabold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@byphone.lk"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6">
              Protected by Supabase Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
