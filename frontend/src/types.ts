export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  stockCount?: number;
  sku?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
  modifiers?: string;
}

export type ViewType =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'catalog'
  | 'cart'
  | 'checkout'
  | 'inventory';
