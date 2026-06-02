import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import iphone15pro from "@/assets/phone-iphone15pro.jpg";
import s24ultra from "@/assets/phone-s24ultra.jpg";
import oneplus12 from "@/assets/phone-oneplus12.jpg";
import xiaomi14 from "@/assets/phone-xiaomi14.jpg";
import nothing2 from "@/assets/phone-nothing2.jpg";
import earbuds from "@/assets/cat-earbuds.jpg";
import watch from "@/assets/cat-watch.jpg";
import tablet from "@/assets/cat-tablet.jpg";
import cases from "@/assets/cat-cases.jpg";
import charger from "@/assets/cat-charger.jpg";

export type Product = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
  storage?: string[];
  colors?: { name: string; hex: string }[];
  highlights?: string[];
  description?: string;
  specs?: Record<string, string>;
  variants?: any[];
  stock_quantity?: number;
};

export const products: Product[] = [
  {
    id: "iphone-15-pro-256",
    slug: "iphone-15-pro-256gb",
    brand: "Apple", name: "iPhone 15 Pro 256GB",
    price: 499999, oldPrice: 529999, rating: 4.8, reviews: 128,
    image: iphone15pro, category: "Smartphones", badge: "NEW",
    stock_quantity: 10,
    storage: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      { name: "Natural Titanium", hex: "#B5AFA4" },
      { name: "Blue Titanium", hex: "#3E5673" },
      { name: "White Titanium", hex: "#F0EDE6" },
      { name: "Black Titanium", hex: "#3A3A3C" },
    ],
    highlights: [
      "6.1-inch Super Retina XDR display with ProMotion",
      "A17 Pro chip. A monster win for gaming.",
      "Pro camera system with 48MP Main camera",
      "Titanium design. Strong. Light. Pro.",
      "Up to 23 hours video playback",
    ],
    description: "iPhone 15 Pro is built with a lightweight and durable titanium design and features the A17 Pro chip, a customizable Action button, and a powerful Pro camera system.",
    specs: {
      Display: "6.1-inch Super Retina XDR",
      Chip: "A17 Pro",
      Camera: "48MP Main | 12MP Ultra Wide | 12MP Telephoto",
      "Front Camera": "12MP TrueDepth",
      Battery: "Up to 23 hours video playback",
      Charging: "USB-C, Support for USB 3",
      "Water Resistance": "IP68 (6m for 30 min)",
      OS: "iOS 17",
    },
  },
  {
    id: "galaxy-s24-ultra-256",
    slug: "galaxy-s24-ultra-5g-256gb",
    brand: "Samsung", name: "Galaxy S24 Ultra 5G 256GB",
    price: 399999, oldPrice: 449999, rating: 4.7, reviews: 96,
    image: s24ultra, category: "Smartphones", badge: "-11%",
    stock_quantity: 5,
    storage: ["256GB", "512GB", "1TB"],
    colors: [{ name: "Titanium Black", hex: "#1c1c1e" }, { name: "Titanium Gray", hex: "#8e8e93" }],
  },
  {
    id: "oneplus-12-256",
    slug: "oneplus-12-5g-256gb",
    brand: "OnePlus", name: "OnePlus 12 5G 256GB",
    price: 279999, rating: 4.6, reviews: 64,
    image: oneplus12, category: "Smartphones",
    stock_quantity: 8,
    storage: ["256GB", "512GB"],
    colors: [{ name: "Flowy Emerald", hex: "#1c5f3f" }, { name: "Silky Black", hex: "#101010" }],
  },
  {
    id: "xiaomi-14-256",
    slug: "xiaomi-14-5g-256gb",
    brand: "Xiaomi", name: "Xiaomi 14 5G 256GB",
    price: 239999, rating: 4.5, reviews: 41,
    image: xiaomi14, category: "Smartphones",
    stock_quantity: 0,
  },
  {
    id: "nothing-2-256",
    slug: "nothing-phone-2-12gb-256gb",
    brand: "Nothing", name: "Nothing Phone (2) 12GB / 256GB",
    price: 189999, rating: 4.6, reviews: 88,
    image: nothing2, category: "Smartphones",
    stock_quantity: 12,
  },
  {
    id: "airpods-pro-2",
    slug: "airpods-pro-2nd-gen-usb-c",
    brand: "Apple", name: "AirPods Pro (2nd Gen) USB-C",
    price: 79999, rating: 4.8, reviews: 312,
    image: earbuds, category: "Earbuds",
    stock_quantity: 20,
  },
  {
    id: "apple-watch-s9",
    slug: "apple-watch-series-9-45mm",
    brand: "Apple", name: "Apple Watch Series 9 45mm",
    price: 139999, rating: 4.7, reviews: 152,
    image: watch, category: "Smartwatches",
    stock_quantity: 15,
  },
  {
    id: "ipad-pro-m4",
    slug: "ipad-pro-m4-11-256gb",
    brand: "Apple", name: 'iPad Pro M4 11" 256GB',
    price: 349999, rating: 4.9, reviews: 73,
    image: tablet, category: "Tablets",
    stock_quantity: 7,
  },
  {
    id: "case-iphone-15",
    slug: "silicone-case-iphone-15",
    brand: "buyphone", name: "Silicone Case for iPhone 15",
    price: 4990, rating: 4.4, reviews: 220,
    image: cases, category: "Cases",
    stock_quantity: 50,
  },
  {
    id: "charger-20w",
    slug: "20w-usb-c-power-adapter",
    brand: "Apple", name: "20W USB-C Power Adapter",
    price: 6990, rating: 4.6, reviews: 410,
    image: charger, category: "Chargers",
    stock_quantity: 0,
  },
];

export const categories = [
  { name: "Smartphones", image: iphone15pro, slug: "Smartphones" },
  { name: "Earbuds", image: earbuds, slug: "Earbuds" },
  { name: "Smartwatches", image: watch, slug: "Smartwatches" },
  { name: "Tablets", image: tablet, slug: "Tablets" },
  { name: "Cases", image: cases, slug: "Cases" },
  { name: "Chargers", image: charger, slug: "Chargers" },
];

export const brands = ["Apple", "Samsung", "Xiaomi", "OnePlus", "Nothing", "Google", "Honor", "Vivo", "Oppo"];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function formatLKR(n: number) {
  return "Rs. " + n.toLocaleString("en-LK");
}

/* ---------- Cart store ---------- */
export type CartItem = { productId: string; variantId?: string; qty: number };

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (v: boolean) => void;
  add: (productId: string, variantId?: string, qty?: number) => void;
  remove: (productId: string, variantId?: string) => void;
  setQty: (productId: string, variantId: string | undefined, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (v) => set({ isOpen: v }),
      add: (productId, variantId, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === productId && i.variantId === variantId);
          const items = existing
            ? s.items.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, qty: i.qty + qty } : i))
            : [...s.items, { productId, variantId, qty }];
          return { items, isOpen: true };
        }),
      remove: (productId, variantId) => set((s) => ({ items: s.items.filter((i) => !(i.productId === productId && i.variantId === variantId)) })),
      setQty: (productId, variantId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId && i.variantId === variantId ? { ...i, qty } : i)).filter(i => i.qty > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, b) => a + b.qty, 0),
      subtotal: () =>
        get().items.reduce((a, b) => {
          const p = getProduct(b.productId);
          if (!p) return a;
          return a + (p.price * b.qty);
        }, 0),
    }),
    {
      name: "buyphone-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);