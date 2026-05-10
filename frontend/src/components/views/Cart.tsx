import React from 'react';
import { Minus, Plus, Trash2, Percent, Heart, Ticket, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../../types';

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const Cart: React.FC<CartProps> = ({ items, onUpdateQuantity, onRemoveItem, onClearCart, onProceedToCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const discount = subtotal > 50 ? 5.35 : 0;
  const total = subtotal + tax - discount;

  return (
    <motion.main 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-grow flex flex-col md:flex-row p-6 lg:p-8 gap-6 mt-16 mb-20 max-w-7xl mx-auto w-full"
    >
      {/* Left Section: Item List */}
      <section className="flex-grow space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-2xl font-bold text-primary">Cart <span className="text-on-primary-container text-lg font-normal ml-2">({items.length} items)</span></h2>
          <button 
            onClick={onClearCart}
            className="text-secondary font-semibold hover:underline text-sm transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Scrollable Items Container */}
        <div className="space-y-3 max-h-[calc(100vh-450px)] md:max-h-none overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl p-12 text-center border border-dashed border-outline-variant"
              >
                <div className="p-4 bg-slate-50 w-fit mx-auto rounded-full mb-4">
                  <Ticket size={40} className="text-outline" />
                </div>
                <p className="text-on-surface-variant font-medium">Your cart is empty.</p>
                <p className="text-sm text-outline mt-1">Start adding items from the catalog.</p>
              </motion.div>
            ) : (
              items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-outline-variant p-4 flex items-center gap-4 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="w-24 h-24 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-primary">{item.name}</h3>
                        <p className="text-on-surface-variant text-sm italic">{item.description || 'No special requests'}</p>
                      </div>
                      <span className="font-bold text-primary text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-primary transition-colors active:scale-90"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-primary">{item.quantity.toString().padStart(2, '0')}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white text-primary transition-colors active:scale-90"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="text-error flex items-center gap-1 hover:bg-error/5 px-2 py-1 rounded-lg transition-all active:scale-95"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden md:block">Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Right Section: Order Summary Panel */}
      <aside className="w-full md:w-[400px] flex flex-col gap-4">
        {/* Adjustments Section */}
        <div className="bg-white border border-outline-variant p-4 rounded-xl space-y-4 shadow-sm">
          <h3 className="label-caps text-on-primary-container font-bold">Order Adjustments</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-2 border border-outline-variant rounded-lg h-12 text-primary font-semibold hover:bg-surface-container-low transition-all active:scale-95">
              <Percent size={18} className="text-secondary" />
              Discount
            </button>
            <button className="flex items-center justify-center gap-2 border border-outline-variant rounded-lg h-12 text-primary font-semibold hover:bg-surface-container-low transition-all active:scale-95">
              <Heart size={18} className="text-secondary" />
              Add Tip
            </button>
          </div>
          <div className="relative mt-2">
            <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden focus-within:border-secondary transition-colors">
              <input 
                className="flex-grow border-none focus:ring-0 bg-transparent px-4 py-3 text-sm placeholder:text-outline/50" 
                placeholder="Enter promo code..." 
                type="text" 
              />
              <button className="bg-secondary text-white px-6 py-3 text-sm font-bold hover:brightness-110 active:scale-95 transition-all">Apply</button>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-on-surface-variant font-medium">
              <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
              <span className="text-primary">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant font-medium">
              <span>Tax (8.5%)</span>
              <span className="text-primary">${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-indigo-700 bg-indigo-50 p-2 rounded-lg font-bold items-center">
                <span className="flex items-center gap-2 text-sm italic">
                  <Ticket size={16} />
                  Discount (WELCOME10)
                </span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="bg-primary px-4 py-4 flex justify-between items-center text-white">
            <span className="text-lg font-medium opacity-80 uppercase tracking-widest">Total</span>
            <span className="text-3xl font-bold">${total.toFixed(2)}</span>
          </div>
          <div className="p-4 bg-white">
            <button 
              onClick={onProceedToCheckout}
              disabled={items.length === 0}
              className="w-full h-14 bg-secondary text-white font-bold text-lg rounded-xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-secondary/30 active:scale-[0.98] transition-all group disabled:opacity-50 disabled:grayscale"
            >
              Proceed to Checkout
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] inline-flex items-center gap-1.5 whitespace-nowrap">
                <Ticket size={10} /> Transaction Secure
              </p>
              <p className="text-[9px] text-outline-variant uppercase">Terminal #042 • V2.4.0</p>
            </div>
          </div>
        </div>
      </aside>
    </motion.main>
  );
};
