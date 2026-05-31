"use client";

import React, { useState, useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShopFiltersProps = {
  brands: string[];
  categories: { name: string; slug: string }[];
  activeBrand?: string;
  activeCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  onFilterChange: (filters: { brand?: string; category?: string; minPrice?: number; maxPrice?: number }) => void;
};

export function ShopFilters({
  brands,
  categories,
  activeBrand,
  activeCategory,
  minPrice,
  maxPrice,
  onFilterChange,
}: ShopFiltersProps) {
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || "");

  // Sync local price state when props change (e.g., when filters are cleared)
  useEffect(() => {
    setLocalMinPrice(minPrice || "");
    setLocalMaxPrice(maxPrice || "");
  }, [minPrice, maxPrice]);

  const handlePriceApply = () => {
    onFilterChange({
      minPrice: localMinPrice === "" ? undefined : Number(localMinPrice),
      maxPrice: localMaxPrice === "" ? undefined : Number(localMaxPrice),
    });
  };

  const clearAll = () => {
    onFilterChange({
      brand: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
    });
    setLocalMinPrice("");
    setLocalMaxPrice("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        <button 
          onClick={clearAll}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <RotateCcw className="size-3" /> Clear All
        </button>
      </div>

      {/* Categories Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Categories</h4>
        <div className="space-y-1">
          <button 
            onClick={() => onFilterChange({ category: undefined })} 
            className={cn(
              "block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors",
              !activeCategory ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted text-foreground/80"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.slug} 
              onClick={() => onFilterChange({ category: cat.name })} 
              className={cn(
                "block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors",
                activeCategory === cat.name ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted text-foreground/80"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Brands</h4>
        <div className="space-y-1">
          <button 
            onClick={() => onFilterChange({ brand: undefined })} 
            className={cn(
              "block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors",
              !activeBrand ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted text-foreground/80"
            )}
          >
            All Brands
          </button>
          {brands.map((brand) => (
            <button 
              key={brand} 
              onClick={() => onFilterChange({ brand })} 
              className={cn(
                "block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors",
                activeBrand === brand ? "bg-primary-soft text-primary font-semibold" : "hover:bg-muted text-foreground/80"
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Price Range (LKR)</h4>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              type="number"
              placeholder="Min"
              value={localMinPrice}
              onChange={(e) => setLocalMinPrice(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary outline-none"
            />
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="relative flex-1">
            <input 
              type="number"
              placeholder="Max"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary outline-none"
            />
          </div>
        </div>
        <button 
          onClick={handlePriceApply}
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
        >
          Apply Price
        </button>
      </div>
    </div>
  );
}