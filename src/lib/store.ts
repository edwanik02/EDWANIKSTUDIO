// API client + Zustand stores for FunziToys
import { create } from "zustand";

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(opts.headers as any) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Request failed (${res.status})`);
  return data as T;
}

export async function apiUpload(path: string, formData: FormData): Promise<any> {
  const res = await fetch(path, { method: "POST", body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `Upload failed (${res.status})`);
  return data;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "OWNER" | "CUSTOMER";
  avatarUrl?: string | null;
  isVerified: boolean;
  ownerId?: string | null;
}

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  setUser: (u: SessionUser | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (u) => set({ user: u }),
  fetchUser: async () => {
    try {
      const data = await api<{ user: SessionUser | null }>("/api/auth/login");
      set({ user: data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    await api("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
}));

// Cart store (mirrors server cart for logged-in; localStorage for guest)
export interface CartLine {
  id: string;
  productId: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    mrpPrice: number | null;
    slug: string;
    stock: number;
    images?: { url: string }[];
  };
}

interface CartState {
  items: CartLine[];
  loading: boolean;
  guestCart: { productId: string; quantity: number }[];
  setItems: (items: CartLine[]) => void;
  fetchCart: () => Promise<void>;
  add: (productId: string, quantity?: number) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  addGuest: (productId: string, quantity?: number) => void;
}

const GUEST_KEY = "ft_guest_cart";
function loadGuest(): { productId: string; quantity: number }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveGuest(items: { productId: string; quantity: number }[]) {
  if (typeof window !== "undefined") localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  guestCart: [],
  setItems: (items) => set({ items }),
  fetchCart: async () => {
    const auth = useAuth.getState();
    if (!auth.user) {
      set({ guestCart: loadGuest(), items: [] });
      return;
    }
    set({ loading: true });
    try {
      const data = await api<{ items: CartLine[] }>("/api/cart");
      set({ items: data.items, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  add: async (productId, quantity = 1) => {
    const auth = useAuth.getState();
    if (!auth.user) {
      get().addGuest(productId, quantity);
      return;
    }
    await api("/api/cart", { method: "POST", body: JSON.stringify({ productId, quantity }) });
    await get().fetchCart();
  },
  updateQty: async (id, quantity) => {
    const auth = useAuth.getState();
    if (!auth.user) return;
    await api("/api/cart", { method: "PUT", body: JSON.stringify({ id, quantity }) });
    await get().fetchCart();
  },
  remove: async (id) => {
    const auth = useAuth.getState();
    if (!auth.user) return;
    await api(`/api/cart?id=${id}`, { method: "DELETE" });
    await get().fetchCart();
  },
  clear: async () => {
    const auth = useAuth.getState();
    if (!auth.user) return;
    await api("/api/cart", { method: "DELETE" });
    await get().fetchCart();
  },
  addGuest: (productId, quantity = 1) => {
    const items = loadGuest();
    const ex = items.find((i) => i.productId === productId);
    if (ex) ex.quantity += quantity;
    else items.push({ productId, quantity });
    saveGuest(items);
    set({ guestCart: items });
  },
}));

// UI store: auth modal, mobile menu
interface UIState {
  authModal: null | "login" | "register";
  requireAuthMsg: string | null;
  openAuth: (mode?: "login" | "register", msg?: string) => void;
  closeAuth: () => void;
  toasts: { id: number; type: "success" | "error" | "info"; message: string }[];
  toast: (message: string, type?: "success" | "error" | "info") => void;
  dismissToast: (id: number) => void;
}

let toastId = 0;
export const useUI = create<UIState>((set) => ({
  authModal: null,
  requireAuthMsg: null,
  openAuth: (mode = "login", msg) => set({ authModal: mode, requireAuthMsg: msg || null }),
  closeAuth: () => set({ authModal: null, requireAuthMsg: null }),
  toasts: [],
  toast: (message, type = "success") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Navigation helper using searchParams on the single route
export function navigate(params: Record<string, string | undefined>, replace = false) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  if (replace) window.history.replaceState({}, "", url.toString());
  else window.history.pushState({}, "", url.toString());
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function getParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => (obj[k] = v));
  return obj;
}
