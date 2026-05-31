import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LogOut, User, Mail, Phone, Package, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile and view your orders.</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-4" /> Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 text-center">
            <div className="size-24 rounded-full bg-primary-soft text-primary mx-auto grid place-items-center text-3xl font-bold mb-4">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Links</h3>
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-foreground">
                <User className="size-4 text-primary" /> Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-foreground">
                <Package className="size-4 text-primary" /> My Orders
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors text-foreground">
                <ShoppingBag className="size-4 text-primary" /> Wishlist
              </button>
            </nav>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-6">Profile Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Full Name</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="size-4 text-muted-foreground" /> {profile?.full_name || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Email Address</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-muted-foreground" /> {user.email}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="size-4 text-muted-foreground" /> {profile?.phone || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Member Since</span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShoppingBag className="size-4 text-muted-foreground" /> {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4">Account Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary-soft border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-extrabold mt-1">{profile?.order_count ?? 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary-soft border border-primary/10">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Lifetime Spend</p>
                <p className="text-2xl font-extrabold mt-1">Rs. {(profile?.total_spent ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to }); }, [navigate, to]);
  return null;
}