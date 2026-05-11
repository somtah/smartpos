import { Product } from './types';
import { isAuthBypass } from './authMode';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
/** คู่กับ backend DISABLE_AUTH — ค่าเริ่มต้นเปิด bypass (ดู authMode.ts) */
const AUTH_DISABLED = isAuthBypass();
const AUTH_STORAGE_KEY = 'smartpos_auth_tokens';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type CurrentUser = {
  sub: string;
  email: string;
  role: string;
};

export type SalesReport = {
  from: string;
  to: string;
  ordersCount: number;
  totalSales: number;
  averageOrderValue: number;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  totalAmount: number | string;
  createdAt: string;
  cashier?: {
    id: string;
    fullName: string;
  };
};

export type StockMovementApi = {
  id: string;
  createdAt: string;
  action: 'SALE' | 'CREATE' | 'ADJUSTMENT';
  quantityDelta: number;
  stockAfter: number;
  product: { name: string };
  order: { orderNumber: string } | null;
};

let cachedTokens: AuthTokens | null = null;

function setCachedTokens(tokens: AuthTokens | null) {
  cachedTokens = tokens;
  if (!tokens) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

function getCachedTokens(): AuthTokens | null {
  if (cachedTokens) return cachedTokens;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthTokens;
    cachedTokens = parsed;
    return parsed;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function stockStatusFromCount(stockCount: number): Product['stockStatus'] {
  if (stockCount <= 0) return 'Out of Stock';
  if (stockCount < 10) return 'Low Stock';
  return 'In Stock';
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=600&fit=crop';

function resolveProductImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE;
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  return `${API_BASE_URL}/${imageUrl}`;
}

function mapApiProductToUi(product: {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number | string;
  stock: number;
}): Product {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description ?? undefined,
    price: Number(product.price),
    stockCount: product.stock,
    stockStatus: stockStatusFromCount(product.stock),
    category: 'General',
    image: resolveProductImageUrl(product.imageUrl),
  };
}

export async function login(_email: string, _password: string): Promise<AuthTokens> {
  throw new Error('Login is temporarily disabled');
  /*
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: _email, password: _password }),
  });

  if (!response.ok) {
    throw new Error('Unable to login');
  }
  const data = await response.json();
  const tokens = {
    accessToken: data.accessToken as string,
    refreshToken: data.refreshToken as string,
  };
  setCachedTokens(tokens);
  return tokens;
  */
}

export async function register(
  _fullName: string,
  _email: string,
  _password: string,
): Promise<AuthTokens> {
  throw new Error('Register is temporarily disabled');
  /*
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: _fullName, email: _email, password: _password }),
  });

  if (!response.ok) {
    throw new Error('Unable to register');
  }
  const data = await response.json();
  const tokens = {
    accessToken: data.accessToken as string,
    refreshToken: data.refreshToken as string,
  };
  setCachedTokens(tokens);
  return tokens;
  */
}

export function logout() {
  setCachedTokens(null);
}

export function isAuthenticated() {
  return AUTH_DISABLED || Boolean(getCachedTokens()?.accessToken);
}

async function ensureToken(): Promise<string> {
  if (AUTH_DISABLED) return '';
  const tokens = getCachedTokens();
  if (tokens?.accessToken) return tokens.accessToken;
  throw new Error('Not authenticated');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await ensureToken();
  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (init?.body && !(init.body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...baseHeaders,
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401) {
    if (AUTH_DISABLED) {
      const detail = await response.text();
      throw new Error(
        detail ||
          'API ส่ง 401 — ตรวจสอบ backend: ต้องมี user admin@smartpos.local (รัน npx prisma db seed) และอย่าตั้ง DISABLE_AUTH=false ถ้าไม่ต้องการ login',
      );
    }
    setCachedTokens(null);
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function requestMultipart<T>(
  path: string,
  method: 'POST' | 'PATCH',
  formData: FormData,
): Promise<T> {
  const token = await ensureToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401) {
    if (AUTH_DISABLED) {
      const detail = await response.text();
      throw new Error(
        detail ||
          'API ส่ง 401 — ตรวจสอบ backend: ต้องมี user admin@smartpos.local (รัน npx prisma db seed) และอย่าตั้ง DISABLE_AUTH=false ถ้าไม่ต้องการ login',
      );
    }
    setCachedTokens(null);
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(): Promise<Product[]> {
  const products = await request<
    Array<{
      id: string;
      sku: string;
      name: string;
      description?: string | null;
      imageUrl?: string | null;
      price: number | string;
      stock: number;
    }>
  >('/products');
  return products.map(mapApiProductToUi);
}

export async function createProduct(
  product: Omit<Product, 'id'>,
  imageFile?: File | null,
): Promise<Product> {
  const trimmedSku = product.sku?.trim();
  const sku = trimmedSku && trimmedSku.length > 0 ? trimmedSku : `SKU-${Date.now()}`;
  const form = new FormData();
  form.append('sku', sku);
  form.append('name', product.name);
  if (product.description) form.append('description', product.description);
  form.append('price', String(product.price));
  form.append('stock', String(product.stockCount ?? 0));
  form.append('isActive', 'true');
  if (imageFile) {
    form.append('image', imageFile);
  } else if (
    product.image &&
    (product.image.startsWith('http://') || product.image.startsWith('https://'))
  ) {
    form.append('imageUrl', product.image);
  }

  const created = await requestMultipart<{
    id: string;
    sku: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number | string;
    stock: number;
  }>('/products', 'POST', form);
  return mapApiProductToUi(created);
}

export async function updateProduct(
  product: Product,
  imageFile?: File | null,
): Promise<Product> {
  const form = new FormData();
  if (product.sku) form.append('sku', product.sku);
  form.append('name', product.name);
  if (product.description) form.append('description', product.description);
  form.append('price', String(product.price));
  form.append('stock', String(product.stockCount ?? 0));
  if (imageFile) {
    form.append('image', imageFile);
  }

  const updated = await requestMultipart<{
    id: string;
    sku: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    price: number | string;
    stock: number;
  }>(`/products/${product.id}`, 'PATCH', form);
  return mapApiProductToUi(updated);
}

export async function createOrder(items: Array<{ productId: string; quantity: number }>) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function fetchOrders(): Promise<OrderListItem[]> {
  return request<OrderListItem[]>('/orders');
}

export async function fetchStockMovements(limit = 50): Promise<StockMovementApi[]> {
  return request<StockMovementApi[]>(`/stock-movements?limit=${limit}`);
}

export async function fetchSalesReport(from?: string, to?: string): Promise<SalesReport> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  return request<SalesReport>(`/reports/sales${query ? `?${query}` : ''}`);
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/me');
}
