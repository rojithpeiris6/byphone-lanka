"use client";

import React from 'react';
import { Ticket, Copy, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatLKR } from '@/lib/shop';

type CouponCardProps = {
  coupon: {
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    end_date: string | null;
  };
};

export function CouponCard({ coupon }: CouponCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success("Coupon code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercentage = coupon.discount_type === 'percentage';

  return (
    <div className="group relative bg-card border border-border rounded-3xl p-5 sm:p-6 transition-all hover:shadow-lg hover:border-primary/30 flex flex-col h-full overflow-hidden">
      {/* Background patterns */}
      <div className="absolute -top-10 -right-10 size-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <Ticket className="size-6" />
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary leading-none">
              {isPercentage ? `${coupon.discount_value}%` : formatLKR(coupon.discount_value)}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">OFF YOUR ORDER</p>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-lg leading-tight mb-2">{coupon.description || "Special Discount"}</h3>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="size-3" /> Min. spend: <span className="font-bold text-foreground">{formatLKR(coupon.min_order_amount)}</span>
            </p>
            {coupon.end_date && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3" /> Valid until: <span className="font-bold text-foreground">{new Date(coupon.end_date).toLocaleDateString()}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-dashed border-border flex items-center gap-2">
          <div className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 font-mono font-bold text-sm text-center border border-border select-all">
            {coupon.code}
          </div>
          <button 
            onClick={handleCopy}
            className={cn(
              "size-10 rounded-xl grid place-items-center transition-all active:scale-95",
              copied ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary-dark"
            )}
            title="Copy Code"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
      
      {/* Coupon notch edges */}
      <div className="absolute top-1/2 -left-3 size-6 rounded-full bg-background border border-border -translate-y-1/2" />
      <div className="absolute top-1/2 -right-3 size-6 rounded-full bg-background border border-border -translate-y-1/2" />
    </div>
  );
}