import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, User, Mail, Phone, MapPin, Eye, Package, DollarSign, ShoppingBag, X, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/customers")({
  component: CustomersPage,
});

function fmtLkr(n: number) {
  return "Rs. " + n.toLocaleString("en-LK");
}

function CustomersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("total_spent", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (customers ?? []).filter((c: any) => 
    !q || 
    c.full_name?.toLowerCase().includes(q.toLowerCase()) || 
    c.email?.toLowerCase().includes(q.toLowerCase()) || 
    c.phone?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage customer profiles, loyalty, and order history.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Contact</th>
                <th className="text-left px-6 py-4">Location</th>
                <th className="text-right px-6 py-4">Orders</th>
                <th className="text-right px-6 py-4">Total Spend</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground">Loading customers...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <User className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">No customers found</h3>
                    <p className="text-sm text-muted-foreground">Customers are automatically added when they place an order.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-xs shrink-0">
                          {c.full_name?.slice(0, 2).toUpperCase() || "C"}
                        </div>
                        <div className="font-semibold">{c.full_name || "Unknown Customer"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-medium">{c.email}</div>
                      <div className="text-[11px] text-muted-foreground">{c.phone || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{c.city || "—"}</div>
                      <div className="text-[11px] text-muted-foreground">{c.district || "—"}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{c.order_count}</td>
                    <td className="px-6 py-4 text-right font-bold text-primary">{fmtLkr(c.total_spent)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedCustomer(c)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={() => setSelectedCustomer(null)} 
        />
      )}
    </div>
  );
}

function CustomerDetailModal({ customer, onClose }: { customer: any; onClose: () => void }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders", customer.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">
              {customer.full_name?.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{customer.full_name}</h2>
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent transition-colors"><X className="size-5" /></button>
        </div>

        <div className="p-6 grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-muted/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <User className="size-4" /> Profile Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{customer.phone || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right max-w-[150px]">{customer.city}, {customer.district}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right max-w-[150px]">{customer.address || "—"}</span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <DollarSign className="size-4" /> Value Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-bold">{customer.order_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lifetime Spend</span>
                  <span className="font-bold text-primary">{fmtLkr(customer.total_spent)}</span>
                </div>
              </div>
            </div>

            <div className="bg-muted/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Package className="size-4" /> Admin Notes
              </h3>
              <p className="text-sm italic text-muted-foreground">
                {customer.notes || "No notes added for this customer."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Order History</h3>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2">Order #</th>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="text-left px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading orders...</td></tr>
                  ) : orders?.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No orders found for this customer.</td></tr>
                  ) : (
                    orders?.map((o) => (
                      <tr key={o.id} className="hover:bg-accent/40">
                        <td className="px-4 py-3 font-bold text-primary">{o.order_number}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{fmtLkr(o.total)}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-current/20 bg-muted">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}