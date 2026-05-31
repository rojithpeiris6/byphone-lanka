import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Star, Trash2, CheckCircle2, XCircle, Clock, Filter, MessageSquare, Package, User, MoreVertical, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: reviews, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["admin-reviews", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("product_reviews" as any)
        .select(`
          *,
          products(name, sku, product_images(url))
        `)
        .order("created_at", { ascending: false });
      
      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (reviews ?? []).filter((r: any) => 
    !q || 
    r.customer_name?.toLowerCase().includes(q.toLowerCase()) || 
    r.products?.name?.toLowerCase().includes(q.toLowerCase()) ||
    r.comment?.toLowerCase().includes(q.toLowerCase())
  );

  async function updateStatus(id: string, status: string) {
    const loadingToast = toast.loading(`Updating review status...`);
    
    // We let the DB handle updated_at via trigger to avoid schema cache issues
    const { error } = await supabase
      .from("product_reviews" as any)
      .update({ status })
      .eq("id", id);

    toast.dismiss(loadingToast);

    if (error) {
      console.error("Update error:", error);
      return toast.error(`Failed to update review: ${error.message}`);
    }
    
    toast.success(`Review ${status}`);
    // Invalidate the root key to refresh all views
    await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    
    const loadingToast = toast.loading(`Deleting review...`);
    const { error } = await supabase.from("product_reviews" as any).delete().eq("id", id);
    toast.dismiss(loadingToast);

    if (error) return toast.error(error.message);
    
    toast.success("Review deleted");
    await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
  }

  const stats = {
    total: reviews?.length ?? 0,
    pending: reviews?.filter((r: any) => r.status === 'pending').length ?? 0,
    avg: reviews?.length ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0",
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Product Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate customer feedback and ratings.</p>
        </div>
        <button 
          onClick={() => refetch()} 
          disabled={isLoading || isRefetching}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-accent disabled:opacity-50 transition-colors"
        >
          <RefreshCcw className={cn("size-4", (isLoading || isRefetching) && "animate-spin")} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Reviews" value={stats.total} icon={MessageSquare} color="text-primary" />
        <StatCard label="Pending Moderation" value={stats.pending} icon={Clock} color="text-amber-500" />
        <StatCard label="Average Rating" value={`${stats.avg} / 5.0`} icon={Star} color="text-amber-400" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
              placeholder="Search by product, customer or content..." 
              className="w-full pl-10 pr-4 h-10 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm transition-all" 
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-background border border-border text-sm font-medium outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Rating & Feedback</th>
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && !isRefetching ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">Loading reviews...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <MessageSquare className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">No reviews found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r: any) => (
                  <tr key={r.id} className="group hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-xs shrink-0">
                          {r.customer_name?.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{r.customer_name}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="flex gap-0.5 text-amber-400 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("size-3.5", i < r.rating ? "fill-amber-400" : "text-muted/40")} />
                        ))}
                      </div>
                      <p className="text-xs text-foreground line-clamp-2 italic">"{r.comment}"</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded bg-muted overflow-hidden shrink-0">
                          <img src={r.products?.product_images?.[0]?.url || ""} alt="" className="size-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[11px] truncate">{r.products?.name}</div>
                          <div className="text-[9px] text-muted-foreground font-mono">{r.products?.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider",
                        r.status === 'approved' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        r.status === 'pending' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}>
                        {r.status === 'pending' ? <Clock className="size-3" /> : r.status === 'approved' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.status !== 'approved' && (
                          <button 
                            onClick={() => updateStatus(r.id, 'approved')} 
                            className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Approve Review"
                          >
                            <CheckCircle2 className="size-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button 
                            onClick={() => updateStatus(r.id, 'rejected')} 
                            className="p-2 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Reject Review"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(r.id)} 
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Review"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={cn("size-12 rounded-xl bg-muted grid place-items-center shrink-0", color.replace('text-', 'bg-').replace('600', '100').replace('500', '100').replace('400', '100'))}>
        <Icon className={cn("size-6", color)} />
      </div>
      <div>
        <div className="text-2xl font-extrabold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}