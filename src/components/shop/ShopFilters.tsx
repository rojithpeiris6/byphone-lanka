"use client";

import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ShopFiltersProps = {
  brands: string[];
  categories: Category[];
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
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  useEffect(() => {
    setLocalMinPrice(minPrice || "");
    setLocalMaxPrice(maxPrice || "");
    
    // If activeCategory is set, try to find its parent to pre-set the parent select
    if (activeCategory) {
      const cat = categories.find(c => c.name === activeCategory);
      if (cat?.parent_id) {
        setSelectedParentId(cat.parent_id);
      } else {
        setSelectedParentId("");
      }
    } else {
      setSelectedParentId("");
    }
  }, [minPrice, maxPrice, activeCategory, categories]);

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
    setSelectedParentId("");
  };

  const selectCls = "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:border-primary outline-none transition-all";

  const parentCategories = categories.filter(c => c.parent_id === null);
  const childCategories = categories.filter(c => c.parent_id === selectedParentId);

  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId);
    if (!parentId) {
      onFilterChange({ category: undefined });
    } else {
      // When a parent is selected, we can either filter by the parent itself 
      // or wait for the user to pick a sub-category. Usually, selecting the parent 
      // should show all products in that parent and its children.
      const parent = categories.find(c => c.id === parentId);
      onFilterChange({ category: parent?.name });
    }
  };

  const handleChildChange = (categoryName: string) => {
    onFilterChange({ category: categoryName || undefined });
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
        
        <div className="space-y-2">
          <select 
            value={selectedParentId} 
            onChange={(e) => handleParentChange(e.target.value)} 
            className={selectCls}
          >
            <option value="">All Categories</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {selectedParentId && (
            <select 
              value={activeCategory || ""} 
              onChange={(e) => handleChildChange(e.target.value)} 
              className={cn(selectCls, "bg-primary-soft/30 border-primary/20 animate-in slide-in-from-top-2 duration-200")}
            >
              <option value="">All in {parentCategories.find(c => c.id === selectedParentId)?.name}</option>
              {childCategories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Brands Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Brands</h4>
        <select 
          value={activeBrand || ""} 
          onChange={(e) => onFilterChange({ brand: e.target.value || undefined })} 
          className={selectCls}
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}