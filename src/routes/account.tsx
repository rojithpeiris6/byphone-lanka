import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { 
  LogOut, User, Mail, Phone, Package, Heart, 
  Save, X, ArrowRight, MapPin, Settings, 
  CreditCard, Bell, ShoppingBag, ChevronRight 
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { formatLKR, useCart } from "@/lib/shop";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type AccountTab = 'profile' | 'orders' | 'wishlist' | 'dashboard';

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
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

  async function handleUpdateProfile() {
    if (!profile) return;
    const { error } = await supabase
      .from("customers")
      .update(editForm)
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["customer-profile"] });
    }
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-6 sm:p-10 text-primary-foreground shadow-xl mb-10">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="size-24 rounded-full bg-white/20 backdrop-blur-md border-4 border-white/30 grid place-items-center text-3xl font-bold shadow-inner">
            {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {profile?.full_name || "Customer"}!</h1>
            <p className="text-primary-foreground/80 text-sm mt-1 font-medium">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-3">
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold border border-white/20">
                Member since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2024'}
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-bold border border-white/20">
                Gold Tier
              </div>
            </div>
          </div>
          <div className="sm:ml-auto">
            <button 
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors text-sm font-bold border border-white/20"
            >
              <LogOut className="size-4" /> Sign Out
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column: Navigation/Quick Links */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-3xl p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-3 mb-4">Account Menu</h3>
            <nav className="flex flex-col gap-1">
              <NavButton 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')} 
                icon={ShoppingBag} 
                label="Overview" 
              />
              <NavButton 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')} 
                icon={Package} 
                label="My Orders" 
              />
              <NavButton 
                active={activeTab === 'wishlist'} 
                onClick={() => setActiveTab('wishlist')} 
                icon={Heart} 
                label="My Wishlist" 
              />
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')} 
                icon={User} 
                label="Profile Settings" 
              />
              <div className="my-2 border-t border-border" />
              <NavButton 
                active={false} 
                onClick={() => {}} 
                icon={CreditCard} 
                label="Payment Methods" 
              />
              <NavButton 
                active={false} 
                onClick={() => {}} 
                icon={Bell} 
                label="Notifications" 
              />
            </nav>
          </div>
        </div>

        {/* Right Column: Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'dashboard' && (
            <DashboardView 
              profile={profile}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileView 
              profile={profile} 
              isLoading={loadingProfile}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleUpdateProfile}
            />
          )}
          {activeTab === 'orders' && <OrdersView userId={user.id} userEmail={user.email ?? ""} />}
          {activeTab === 'wishlist' && <WishlistView userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary" 
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" /> {label}
    </button>
  );
}

function DashboardView({ profile, setActiveTab }: any) {
  const quickLinks = [
    { id: 'orders', label: 'Track Orders', Icon: Package, desc: 'Check delivery status', color: 'bg-blue-500/10 text-blue-600' },
    { id: 'wishlist', label: 'My Wishlist', Icon: Heart, desc: 'Saved favorites', color: 'bg-rose-500/10 text-rose-600' },
    { id: 'profile', label: 'Edit Profile', Icon: User, desc: 'Update your info', color: 'bg-amber-500/10 text-amber-600' },
    { id: 'payment', label: 'Payments', Icon: CreditCard, desc: 'Manage cards', color: 'bg-emerald-500/10 text-emerald-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickLinks.map((link) => (
          <button 
            key={link.id}
            onClick={() => link.id !== 'payment' && setActiveTab(link.id)}
            className="group p-6 rounded-3xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all text-left"
          >
            <div className={cn("size-12 rounded-2xl grid place-items-center mb-4 transition-transform group-hover:scale-110", link.color)}>
              <link.Icon className="size-6" />
            </div>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{link.label}</h3>
            <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
            <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View Details <ChevronRight className="size-3 ml-1" />
            </div>
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent transition-colors border border-transparent hover:border-border">
            <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center"><Package className="size-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Your order #BP-49201 was shipped</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent transition-colors border border-transparent hover:border-border">
            <div className="size-10 rounded-full bg-rose-500/10 text-rose-600 grid place-items-center"><Heart className="size-5" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold">iPhone 15 Pro is now on sale!</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ profile, isLoading, isEditing, setIsEditing, editForm, setEditForm, onSave }: any) {
  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading profile...</div>;
  if (!profile) return <div className="p-12 text-center text-muted-foreground">Profile not found.</div>;

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="text-lg font-bold">Profile Settings</h3>
        <button 
          onClick={() => {
            setEditForm({
              full_name: profile.full_name,
              phone: profile.phone || "",
              address: profile.address || "",
              city: profile.city || "",
              district: profile.district || "",
            });
            setIsEditing(true);
          }}
          className="text-sm font-bold text-primary hover:underline px-3 py-1 rounded-lg hover:bg-primary/10 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {!isEditing ? (
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            <InfoGroup label="Personal Information">
              <InfoField label="Full Name" value={profile.full_name} icon={User} />
              <InfoField label="Email Address" value={profile.email} icon={Mail} />
              <InfoField label="Phone Number" value={profile.phone} icon={Phone} />
            </InfoGroup>
            <InfoGroup label="Shipping Address">
              <InfoField label="District" value={profile.district} icon={MapPin} />
              <InfoField label="City" value={profile.city} icon={MapPin} />
              <InfoField label="Full Address" value={profile.address} icon={Package} />
            </InfoGroup>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={editForm.full_name} onChange={(v) => setEditForm(f => ({ ...f, full_name: v }))} />
              <Input label="Phone" value={editForm.phone} onChange={(v) => setEditForm(f => ({ ...f, phone: v }))} />
              <Input label="City" value={editForm.city} onChange={(v) => setEditForm(f => ({ ...f, city: v }))} />
              <Input label="District" value={editForm.district} onChange={(v) => setEditForm(f => ({ ...f, district: v }))} />
              <div className="sm:col-span-2">
                <Input label="Address" value={editForm.address} onChange={(v) => setEditForm(f => ({ ...f, address: v }))} full />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={onSave} className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                <Save className="size-4" /> Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoGroup({ label, children }: any) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function OrdersView({ userId, userEmail }: { userId: string; userEmail: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders", userId],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (userId) {
        query = query.or(`user_id.eq.${userId},customer_email.eq.${userEmail}`);
      } else {
        query = query.eq("customer_email", userEmail);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading orders...</div>;

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
        <h3 className="text-lg font-bold">Order History</h3>
        <span className="text-xs font-medium text-muted-foreground">{orders?.length ?? 0} total orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase font-bold text-muted-foreground">
            <tr>
              <th className="text-left px-6 py-4">Order #</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-right px-6 py-4">Total</th>
              <th className="text-left px-6 py-4">Status</th>
              <th className="text-right px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders?.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="size-10 opacity-20" />
                  <p>You haven't placed any orders yet.</p>
                </div>
              </td></tr>
            ) : (
              orders?.map((o) => (
                <tr key={o.id} className="hover:bg-accent/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{o.order_number}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-bold">{formatLKR(o.total)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-colors",
                      o.status === 'delivered' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      o.status === 'pending' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                      "bg-muted text-muted-foreground border-border"
                    )}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <ArrowRight className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WishlistView({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const add = useCart((s) => s.add);

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["customer-wishlist", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*, products(*, product_images(url))")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) return toast.error("Could not remove item");
    toast.success("Removed from wishlist");
    qc.invalidateQueries({ queryKey: ["customer-wishlist"] });
  }

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading favorites...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">My Wishlist</h3>
        <span className="text-xs font-medium text-muted-foreground">{wishlist?.length ?? 0} items saved</span>
      </div>
      {wishlist?.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center">
          <Heart className="size-12 text-muted-foreground/30 mx-auto mb-4" />
          <h4 className="font-bold">Your wishlist is empty</h4>
          <p className="text-sm text-muted-foreground mt-1">Save your favorite products to find them easily later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist?.map((item) => {
            const p = item.products;
            return (
              <div key={item.id} className="group relative bg-card rounded-3xl border border-border p-4 flex flex-col transition-all hover:shadow-lg hover:border-primary/50">
                <button 
                  onClick={() => remove(item.id)}
                  className="absolute top-3 right-3 z-10 size-8 rounded-full bg-white/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-destructive transition-colors shadow-sm"
                >
                  <X className="size-4 mx-auto" />
                </button>
                <div className="aspect-square rounded-2xl bg-muted/50 overflow-hidden mb-4 grid place-items-center">
                  <img src={p.product_images?.[0]?.url || ""} alt={p.name} className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-base font-extrabold text-primary mt-1">{formatLKR(p.discount_price || p.price)}</p>
                </div>
                <button 
                  onClick={() => {
                    add(p.id);
                    toast.success("Added to cart");
                  }}
                  className="mt-4 w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm"
                >
                  ADD TO CART
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-muted grid place-items-center text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold text-foreground">{value || "—"}</span>
    </div>
  );
}

function Input({ label, value, onChange, full }: any) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all" 
      />
    </div>
  );
}

function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to }); }, [navigate, to]);
  return null;
}