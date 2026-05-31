import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LogOut, User, Mail, Phone, Package, ShoppingBag, Heart, Save, X, ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { formatLKR, useCart } from "@/lib/shop";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

type AccountTab = 'profile' | 'orders' | 'wishlist';

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<AccountTab>('profile');
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal info, orders, and favorites.</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-4" /> Sign Out
        </button>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 text-center">
            <div className="size-24 rounded-full bg-primary-soft text-primary mx-auto grid place-items-center text-3xl font-bold mb-4">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <nav className="bg-card border border-border rounded-3xl p-3 flex flex-col gap-1">
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
              icon={User} 
              label="Profile Settings" 
            />
            <TabButton 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')} 
              icon={Package} 
              label="My Orders" 
            />
            <TabButton 
              active={activeTab === 'wishlist'} 
              onClick={() => setActiveTab('wishlist')} 
              icon={Heart} 
              label="My Wishlist" 
            />
          </nav>
        </div>

        <div className="space-y-6">
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
          {activeTab === 'orders' && <OrdersView userEmail={user.email ?? ""} />}
          {activeTab === 'wishlist' && <WishlistView userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
        active ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <Icon className="size-4 shrink-0" /> {label}
    </button>
  );
}

function ProfileView({ profile, isLoading, isEditing, setIsEditing, editForm, setEditForm, onSave }: any) {
  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading profile...</div>;
  if (!profile) return <div className="p-12 text-center text-muted-foreground">Profile not found.</div>;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Profile Information</h3>
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
          className="text-sm font-bold text-primary hover:underline"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {!isEditing ? (
        <div className="grid sm:grid-cols-2 gap-6">
          <InfoField label="Full Name" value={profile.full_name} icon={User} />
          <InfoField label="Email Address" value={profile.email} icon={Mail} />
          <InfoField label="Phone Number" value={profile.phone} icon={Phone} />
          <InfoField label="District" value={profile.district} icon={MapPin} />
          <div className="sm:col-span-2">
            <InfoField label="Shipping Address" value={`${profile.address || ""} ${profile.city || ""}`} icon={Package} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={editForm.full_name} onChange={(v) => setEditForm(f => ({ ...f, full_name: v }))} />
            <Input label="Phone" value={editForm.phone} onChange={(v) => setEditForm(f => ({ ...f, phone: v }))} />
            <Input label="City" value={editForm.city} onChange={(v) => setEditForm(f => ({ ...f, city: v }))} />
            <Input label="District" value={editForm.district} onChange={(v) => setEditForm(f => ({ ...f, district: v }))} />
            <div className="sm:col-span-2">
              <Input label="Address" value={editForm.address} onChange={(v) => setEditForm(f => ({ ...f, address: v }))} full />
            </div>
          </div>
          <button onClick={onSave} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-dark transition-all">
            <Save className="size-4" /> Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

function OrdersView({ userEmail }: { userEmail: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders", userEmail],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", userEmail)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading orders...</div>;

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold">Order History</h3>
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
              <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">You haven't placed any orders yet.</td></tr>
            ) : (
              orders?.map((o) => (
                <tr key={o.id} className="hover:bg-accent/40">
                  <td className="px-6 py-4 font-bold text-primary">{o.order_number}</td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-bold">{formatLKR(o.total)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase bg-muted border-border">
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
    <div className="space-y-6">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist?.map((item) => {
            const p = item.products;
            return (
              <div key={item.id} className="group relative bg-card rounded-2xl border border-border p-3 flex flex-col transition-all hover:shadow-md">
                <button 
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 z-10 size-7 rounded-full bg-white border border-border text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-3.5 mx-auto" />
                </button>
                <div className="aspect-square rounded-xl bg-muted/50 overflow-hidden mb-3">
                  <img src={p.product_images?.[0]?.url || ""} alt={p.name} className="h-full w-full object-contain p-2" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold truncate">{p.name}</p>
                  <p className="text-sm font-extrabold text-primary">{formatLKR(p.discount_price || p.price)}</p>
                </div>
                <button 
                  onClick={() => {
                    add(p.id);
                    toast.success("Added to cart");
                  }}
                  className="mt-3 w-full py-2 bg-primary text-primary-foreground rounded-lg text-[11px] font-bold hover:bg-primary-dark transition-colors"
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
    <div className="space-y-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block">{label}</span>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-muted-foreground" /> {value || "—"}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, full }: any) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:border-primary outline-none transition-all" 
      />
    </div>
  );
}

function Navigate({ to }: { to: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate({ to }); }, [navigate, to]);
  return null;
}