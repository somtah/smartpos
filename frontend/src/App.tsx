/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header, Navbar } from './components/Layout';
import { Dashboard } from './components/views/Dashboard';
import { Catalog } from './components/views/Catalog';
import { Cart } from './components/views/Cart';
import { Checkout } from './components/views/Checkout';
import { Inventory } from './components/views/Inventory';
import { ViewType, Product, CartItem } from './types';
import {
  createOrder,
  createProduct as createProductApi,
  fetchCurrentUser,
  fetchOrders,
  fetchProducts,
  fetchSalesReport,
  fetchStockMovements,
  StockMovementApi,
  logout as logoutApi,
  OrderListItem,
  updateProduct as updateProductApi,
} from './api';
import { AlertDialog } from './components/ui/AlertDialog';
import { isAuthBypass } from './authMode';

const AUTH_DISABLED = isAuthBypass();

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    target: 250,
    averageTicket: 0,
    growth: 0,
  });
  const [transactions, setTransactions] = useState<
    Array<{ id: string; name: string; amount: number; status: string; time: string }>
  >([]);
  const [stockLogs, setStockLogs] = useState<StockMovementApi[]>([]);
  const [staffName, setStaffName] = useState<string>('Staff');
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);
  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false);

  const refreshData = useCallback(async () => {
    const results = await Promise.allSettled([
      fetchProducts(),
      fetchSalesReport(),
      fetchOrders(),
      fetchCurrentUser(),
      fetchStockMovements(50),
    ]);

    const failed = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );
    if (failed.length > 0) {
      const detail = failed
        .map((r) => (r.reason instanceof Error ? r.reason.message : String(r.reason)))
        .join(' · ');
      setErrorAlert({
        title: 'โหลดข้อมูลไม่ครบ',
        message: detail,
      });
    }

    const [productsRes, reportRes, ordersRes, meRes, movementsRes] = results;

    if (productsRes.status === 'fulfilled') {
      setProducts(productsRes.value);
    }
    if (movementsRes.status === 'fulfilled') {
      setStockLogs(movementsRes.value);
    }
    if (reportRes.status === 'fulfilled') {
      const report = reportRes.value;
      setStats({
        revenue: report.totalSales,
        orders: report.ordersCount,
        target: 250,
        averageTicket: report.averageOrderValue,
        growth: 0,
      });
    }
    if (ordersRes.status === 'fulfilled') {
      const orders = ordersRes.value;
      setTransactions(
        orders.slice(0, 6).map((order: OrderListItem) => ({
          id: order.orderNumber,
          name: order.cashier?.fullName ?? 'Walk-in Customer',
          amount: Number(order.totalAmount),
          status: 'Completed',
          time: new Date(order.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })),
      );
    }
    if (meRes.status === 'fulfilled') {
      setStaffName(meRes.value.email);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshData();
  }, [isAuthenticated, refreshData]);

  /** หน้าหลัก = Dashboard เสมอ */
  useEffect(() => {
    setCurrentView((v) =>
      v === 'login' || v === 'register' ? 'dashboard' : v,
    );
  }, []);

  /*
  const handleRegister = useCallback(
    async (fullName: string, email: string, password: string) => {
      await registerApi(fullName, email, password);
      setIsAuthenticated(true);
      await refreshData();
      setCurrentView('dashboard');
    },
    [refreshData],
  );
  */

  const handleLogout = useCallback(() => {
    if (AUTH_DISABLED) return;
    logoutApi();
    setIsAuthenticated(false);
    setCartItems([]);
    setCurrentView('login');
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    if (product.stockStatus === 'Out of Stock' || product.stockCount === 0) return;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const handleAddProduct = useCallback(
    async (newProduct: Omit<Product, 'id'>, imageFile?: File | null) => {
      try {
        await createProductApi(newProduct, imageFile);
        await refreshData();
      } catch (error) {
        console.error('Failed to create product:', error);
        setErrorAlert({
          title: 'Could not create product',
          message: 'Unable to create product. Please try again.',
        });
      }
    },
    [refreshData],
  );

  const handleUpdateProduct = useCallback(
    async (updatedProduct: Product, imageFile?: File | null) => {
      try {
        await updateProductApi(updatedProduct, imageFile);
        await refreshData();
      } catch (error) {
        console.error('Failed to update product:', error);
        setErrorAlert({
          title: 'Could not update product',
          message: 'Unable to update product. Please try again.',
        });
      }
    },
    [refreshData],
  );

  const handleUpdateQuantity = useCallback((id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getItemQuantity = useCallback((id: string) => {
    return cartItems.find(item => item.id === id)?.quantity || 0;
  }, [cartItems]);

  const handleCancelTransaction = useCallback(() => {
    handleClearCart();
    setCurrentView('catalog');
  }, [handleClearCart]);

  const handleCompletePayment = useCallback(async () => {
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      }));
      await createOrder(orderItems);
      await refreshData();
      handleClearCart();
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Failed to create order:', error);
      setErrorAlert({
        title: 'Payment failed',
        message: 'Payment failed. Please check stock and try again.',
      });
    }
  }, [cartItems, handleClearCart, refreshData]);

  const handleEndShiftRequest = useCallback(() => {
    setEndShiftDialogOpen(true);
  }, []);

  const handleEndShiftConfirm = useCallback(() => {
    handleClearCart();
    void refreshData();
    setCurrentView('dashboard');
    setEndShiftDialogOpen(false);
  }, [handleClearCart, refreshData]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          onViewChange={setCurrentView} 
          onEndShift={handleEndShiftRequest}
          stats={stats}
          transactions={transactions}
        />
      );
      case 'catalog': return (
        <Catalog 
          products={products}
          onAddToCart={handleAddToCart} 
          cartCount={cartCount} 
          cartTotal={cartTotal} 
          onViewCart={() => setCurrentView('cart')} 
          getItemQuantity={getItemQuantity}
        />
      );
      case 'cart': return (
        <Cart 
          items={cartItems} 
          onUpdateQuantity={handleUpdateQuantity} 
          onRemoveItem={handleRemoveItem} 
          onClearCart={handleClearCart}
          onProceedToCheckout={() => setCurrentView('checkout')}
        />
      );
      case 'checkout': return (
        <Checkout 
          items={cartItems} 
          onCancel={handleCancelTransaction} 
          onComplete={handleCompletePayment}
        />
      );
      case 'inventory': return (
        <Inventory
          products={products}
          stockLogs={stockLogs}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
        />
      );
      default:
        return (
          <Dashboard
            onViewChange={setCurrentView}
            onEndShift={handleEndShiftRequest}
            stats={stats}
            transactions={transactions}
          />
        );
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Station Dashboard';
      case 'catalog': return 'Catalog';
      case 'cart': return 'Order Details';
      case 'checkout': return 'Checkout';
      case 'inventory': return 'Inventory';
      case 'login': return 'Dashboard';
      case 'register': return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {isAuthenticated && (
        <Header
          currentView={currentView}
          title={getTitle()}
          onViewChange={setCurrentView}
          staffName={staffName}
          onLogout={AUTH_DISABLED ? undefined : handleLogout}
        />
      )}
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>

      {isAuthenticated && <Navbar currentView={currentView} onViewChange={setCurrentView} />}

      <AlertDialog
        open={errorAlert !== null}
        title={errorAlert?.title ?? ''}
        message={errorAlert?.message ?? ''}
        onClose={() => setErrorAlert(null)}
      />

      <AlertDialog
        open={endShiftDialogOpen}
        title="End shift?"
        message="Are you sure you want to end your shift? This will clear the current cart and refresh from database."
        cancelLabel="Cancel"
        confirmLabel="End shift"
        onClose={() => setEndShiftDialogOpen(false)}
        onConfirm={handleEndShiftConfirm}
      />
    </div>
  );
}
