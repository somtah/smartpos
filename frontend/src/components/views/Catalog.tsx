import React, { useState } from 'react';
import { Search, Plus, ShoppingCart, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../types';

interface CatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  cartCount: number;
  cartTotal: number;
  onViewCart: () => void;
  getItemQuantity: (id: string) => number;
}

export const Catalog: React.FC<CatalogProps> = ({ products, onAddToCart, cartCount, cartTotal, onViewCart, getItemQuantity }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  
  const categories = ['All Items', 'Drinks', 'Main Course', 'Sides', 'Bakery', 'Retail', 'Coffee', 'Spirits'];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All Items' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-7xl mx-auto px-6 pt-24 pb-32"
    >
      {/* Search & Filter Bar */}
      <section className="mb-8 space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
            <Search size={20} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary rounded-xl font-medium outline-none transition-all placeholder:text-outline shadow-sm"
            placeholder="Search products..."
            type="text"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap active:scale-95 transition-all border ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low transition-colors'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => {
            const quantity = getItemQuantity(product.id);
            const isOutOfStock = product.stockStatus === 'Out of Stock' || product.stockCount === 0;

            return (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-white border border-outline-variant/30 rounded-xl overflow-hidden group transition-all relative ${
                  isOutOfStock 
                    ? 'opacity-80 cursor-not-allowed' 
                    : 'hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] cursor-pointer'
                }`}
                onClick={() => !isOutOfStock && onAddToCart(product)}
              >
                <div className="aspect-[4/5] w-full bg-slate-100 relative overflow-hidden">
                  <img
                    alt={product.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isOutOfStock ? 'grayscale' : 'group-hover:scale-110'
                    }`}
                    src={product.image}
                  />
                  {!isOutOfStock && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                  
                  {/* Quantity Badge */}
                  <AnimatePresence>
                    {quantity > 0 && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute top-3 right-3 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg z-20 ring-2 ring-white"
                      >
                        {quantity}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {product.stockStatus && (
                    <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg ${
                      product.stockStatus === 'In Stock' ? 'bg-indigo-600 text-white' :
                      product.stockStatus === 'Low Stock' ? 'bg-error text-white' :
                      'bg-slate-900 text-white'
                    }`}>
                      {product.stockStatus}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1">
                  <h3 className={`font-semibold text-sm line-clamp-1 ${isOutOfStock ? 'text-outline' : 'text-on-surface'}`}>{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className={`font-bold text-lg ${isOutOfStock ? 'text-outline' : 'text-primary'}`}>${product.price.toFixed(2)}</span>
                    <button 
                      disabled={isOutOfStock}
                      className={`p-1.5 rounded-full transition-colors ${
                        isOutOfStock ? 'bg-slate-200 text-slate-400' :
                        quantity > 0 ? 'bg-secondary text-white' : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
                      }`}
                    >
                      {isOutOfStock ? <Ban size={20} /> : <Plus size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Action Button: View Cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-28 right-6 z-40"
          >
            <button 
              onClick={onViewCart}
              className="bg-secondary text-white h-16 pl-6 pr-8 rounded-2xl shadow-2xl shadow-secondary/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-4 group"
            >
              <div className="relative">
                <ShoppingCart size={28} />
                <span className="absolute -top-2 -right-2 bg-error text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-secondary">
                  {cartCount}
                </span>
              </div>
              <div className="text-left">
                <p className="label-caps opacity-70 leading-tight">Basket</p>
                <p className="font-bold text-lg leading-tight">${cartTotal.toFixed(2)}</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
