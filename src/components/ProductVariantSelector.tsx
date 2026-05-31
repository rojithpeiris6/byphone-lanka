"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Check } from 'lucide-react';
import { formatLKR } from '@/lib/shop';
import { toast } from 'sonner';

type ProductVariantSelectorProps = {
  productId: string;
  productName: string;
  basePrice: number;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (variantId: string, qty: number) => void;
};

export function ProductVariantSelector({ productId, productName, basePrice, isOpen, onClose, onAdd }: ProductVariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-variants-selector", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("price_diff", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: isOpen,
  });

  const handleConfirm = () => {
    if (!selectedId) {
      toast.error("Please select a configuration");
      return;
    }
    onAdd(selectedId, qty);
    onClose();
  };

  const variantLabel = (v: any) => {
    return [v.storage, v.color, v.ram, v.network, v.model].filter(Boolean).join(" / ");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden rounded-l-3xl">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle className="text-xl font-extrabold">Select Configuration</SheetTitle>
          <SheetDescription className="text-sm">
            {productName}
          </SheetDescription>
        </SheetHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Options</h4>
            {isLoading ? (
              <div className="py-10 flex justify-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
            ) : variants?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No specific variants available for this product.</p>
            ) : (
              <div className="grid gap-2">
                {variants?.map((v) => {
                  const isSelected = selectedId === v.id;
                  const finalPrice = basePrice + v.price_diff;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedId(v.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected 
                          ? "border-primary bg-primary-soft ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50 bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                        )}>
                          {isSelected && <Check className="size-3" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{variantLabel(v)}</p>
                          <p className="text-xs text-muted-foreground">Stock: {v.stock_quantity} units</p>
                        </div>
                      </div>
                      <div className="text-sm font-extrabold text-primary">
                        {formatLKR(finalPrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</h4>
            <div className="inline-flex items-center border border-border rounded-xl p-1 bg-card">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                className="size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold min-w-[40px] text-center">{qty}</span>
              <button 
                onClick={() => setQty(qty + 1)} 
                className="size-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-muted/20">
          <Button 
            onClick={handleConfirm} 
            disabled={isLoading || !selectedId}
            className="w-full h-12 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20"
          >
            <ShoppingCart className="size-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}