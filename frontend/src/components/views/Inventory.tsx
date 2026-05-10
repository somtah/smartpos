import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Edit2, RotateCw, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StockMovementApi } from '../../api';
import { Product } from '../../types';

interface InventoryProps {
  products: Product[];
  stockLogs: StockMovementApi[];
  onAddProduct: (product: Omit<Product, 'id'>, imageFile?: File | null) => void | Promise<void>;
  onUpdateProduct: (product: Product, imageFile?: File | null) => void | Promise<void>;
}

function stockLogActionLabel(entry: StockMovementApi): string {
  switch (entry.action) {
    case 'SALE':
      return 'Sale (POS)';
    case 'CREATE':
      return 'New product';
    case 'ADJUSTMENT':
      return entry.quantityDelta >= 0 ? 'Inventory restock' : 'Stock adjustment';
    default:
      return 'Update';
  }
}

function stockLogStatus(stockAfter: number): { label: string; className: string } {
  if (stockAfter <= 0) {
    return {
      label: 'Out of Stock',
      className: 'bg-primary text-white ring-1 ring-white/20',
    };
  }
  if (stockAfter < 10) {
    return {
      label: 'Critical Low',
      className: 'bg-error-container text-on-error-container',
    };
  }
  return {
    label: 'Updated',
    className: 'bg-surface-variant text-primary',
  };
}

export const Inventory: React.FC<InventoryProps> = ({
  products,
  stockLogs,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Items');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobPreviewRef = useRef<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Food',
    sku: '',
    stockCount: '0',
  });

  const revokeBlobPreview = () => {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  };

  const setPreviewFromFile = (file: File) => {
    revokeBlobPreview();
    const url = URL.createObjectURL(file);
    blobPreviewRef.current = url;
    setImagePreview(url);
  };

  useEffect(() => {
    return () => revokeBlobPreview();
  }, []);

  const filters = ['All Items', 'Beverages', 'Spirits', 'Food', 'Bakery', 'Coffee', 'Retail'];
  
  const inventoryItems = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = activeFilter === 'All Items' || p.category === activeFilter || (activeFilter === 'Beverages' && (p.category === 'Drinks' || p.category === 'Spirits' || p.category === 'Coffee'));
    return matchesSearch && matchesFilter;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    revokeBlobPreview();
    setImageFile(null);
    setImagePreview('');
    setFormData({ name: '', price: '', category: 'Food', sku: '', stockCount: '0' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    revokeBlobPreview();
    setImageFile(null);
    setImagePreview(product.image || '');
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      sku: product.sku || '',
      stockCount: product.stockCount.toString(),
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewFromFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const base = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      sku: formData.sku,
      stockCount: parseInt(formData.stockCount, 10),
      image: imagePreview || '',
    };

    if (editingProduct) {
      await onUpdateProduct({ ...editingProduct, ...base }, imageFile);
    } else {
      await onAddProduct(base, imageFile);
    }

    revokeBlobPreview();
    setImageFile(null);
    setIsModalOpen(false);
  };

  return (
    <motion.main 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-7xl mx-auto px-6 pt-24 pb-32"
    >
      {/* Dashboard Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <p className="label-caps text-secondary font-bold">Stock Management</p>
          <h2 className="text-h2 font-bold text-primary">System Inventory</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow min-w-[300px]">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary outline-none rounded-lg font-medium transition-all shadow-sm"
              placeholder="Search products, SKU or category..."
              type="text"
            />
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="h-12 px-6 bg-secondary text-white font-bold flex items-center justify-center gap-2 rounded-lg active:scale-95 hover:bg-opacity-90 transition-all shadow-lg shadow-secondary/20 whitespace-nowrap"
          >
            <Plus size={20} /> Add New Product
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
                <h3 className="text-xl font-bold text-primary">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Product Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-secondary'); }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-secondary'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-secondary');
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setPreviewFromFile(file);
                      }
                    }}
                    className="relative w-full h-32 border-2 border-dashed border-outline-variant rounded-xl overflow-hidden cursor-pointer hover:border-secondary transition-colors flex flex-col items-center justify-center bg-slate-50 group"
                  >
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold bg-secondary/80 px-3 py-1 rounded-full">Change Image</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-outline group-hover:text-secondary">
                        <Upload size={24} />
                        <p className="text-[10px] font-bold mt-2">Click or drag to upload</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Product Name *</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Artisanal Espresso"
                    className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-medium"
                    type="text" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Price ($) *</label>
                    <input 
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-medium"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Stock Count</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        value={formData.stockCount}
                        onChange={e => setFormData({...formData, stockCount: e.target.value})}
                        className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-medium text-center"
                        type="number" 
                      />
                      {editingProduct && (
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, stockCount: (parseInt(prev.stockCount || '0') + 10).toString()}))}
                            className="flex-1 h-8 bg-slate-100 hover:bg-slate-200 text-primary text-[10px] font-bold rounded transition-colors"
                          >
                            +10
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData(prev => ({...prev, stockCount: (parseInt(prev.stockCount || '0') + 50).toString()}))}
                            className="flex-1 h-8 bg-slate-100 hover:bg-slate-200 text-primary text-[10px] font-bold rounded transition-colors"
                          >
                            +50
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Category</label>
                    <select 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-medium bg-white"
                    >
                      {filters.filter(f => f !== 'All Items').map(cat => (
                        <option key={cat} value={cat === 'Beverages' ? 'Drinks' : cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">SKU</label>
                    <input 
                      value={formData.sku}
                      onChange={e => setFormData({...formData, sku: e.target.value})}
                      placeholder="Unique ID"
                      className="w-full h-12 px-4 border border-outline-variant rounded-lg focus:border-secondary focus:ring-1 focus:ring-secondary outline-none font-medium"
                      type="text" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 bg-secondary text-white font-bold rounded-xl mt-4 hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-secondary/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all ${
              activeFilter === f
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-on-surface-variant border border-outline-variant hover:border-secondary transition-colors shadow-sm'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inventoryItems.map((product) => (
          <div key={product.id} className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow group">
            <div className="relative h-48 bg-surface-container-low overflow-hidden">
              <img
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src={product.image}
              />
              {product.stockStatus && (
                <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded font-bold text-[10px] uppercase shadow-lg ${
                  product.stockStatus === 'In Stock' ? 'bg-secondary' :
                  product.stockStatus === 'Low Stock' ? 'bg-error' :
                  'bg-primary ring-1 ring-white/20'
                }`}>
                  {product.stockStatus}
                </div>
              )}
            </div>
            <div className="p-4 flex-grow flex flex-col justify-between">
              <div>
                <p className="label-caps text-secondary font-bold text-[10px] mb-1">{product.category}</p>
                <h3 className="text-lg font-bold text-on-surface mb-1">{product.name}</h3>
                <p className="text-xs text-outline font-medium tracking-tight">SKU: {product.sku || 'N/A'}</p>
              </div>
                <div className="mt-4 pt-4 border-t border-surface-variant flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase font-bold text-outline">Current Stock</p>
                  <p className={`text-2xl font-bold ${product.stockCount === 0 ? 'text-error' : 'text-on-surface'}`}>
                    {product.stockCount} <span className="text-sm font-normal text-outline">units</span>
                  </p>
                </div>
                {product.stockCount < 10 ? (
                  <button 
                    onClick={() => handleOpenEditModal(product)}
                    className="h-10 px-4 flex items-center justify-center bg-secondary text-white rounded-lg text-xs font-bold uppercase transition-colors hover:bg-secondary/90 active:scale-95 shadow-md gap-2"
                  >
                    <RotateCw size={14} /> Restock
                  </button>
                ) : (
                  <button 
                    onClick={() => handleOpenEditModal(product)}
                    className="w-10 h-10 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface hover:bg-secondary hover:text-white hover:border-secondary transition-all active:scale-95"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table (Alternative view hint) */}
      <div className="mt-12 bg-white border border-outline-variant rounded-xl overflow-hidden hidden md:block shadow-sm">
        <div className="px-6 py-5 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-lg text-on-surface font-bold">Recent Activity & Stock Logs</h3>
          <span className="text-outline text-sm font-medium">
            {stockLogs.length} record{stockLogs.length === 1 ? '' : 's'} stored
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-outline-variant">
                <th className="px-6 py-4 label-caps text-outline">Transaction ID</th>
                <th className="px-6 py-4 label-caps text-outline">Product</th>
                <th className="px-6 py-4 label-caps text-outline">Action</th>
                <th className="px-6 py-4 label-caps text-outline text-right">Quantity</th>
                <th className="px-6 py-4 label-caps text-outline text-right">Timestamp</th>
                <th className="px-6 py-4 label-caps text-outline text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {stockLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-outline text-sm">
                    No stock activity recorded yet. Sales from checkout and inventory changes will appear here.
                  </td>
                </tr>
              ) : (
                stockLogs.map((entry) => {
                  const txn =
                    entry.order?.orderNumber ??
                    `LOG-${entry.id.slice(0, 8).toUpperCase()}`;
                  const qty = entry.quantityDelta;
                  const qtyClass =
                    qty < 0 ? 'text-error' : qty > 0 ? 'text-secondary' : 'text-outline';
                  const signed = qty > 0 ? `+${qty}` : String(qty);
                  const status = stockLogStatus(entry.stockAfter);
                  const ts = new Date(entry.createdAt);
                  return (
                    <tr key={entry.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        #{txn}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">{entry.product.name}</td>
                      <td className="px-6 py-4 text-sm">{stockLogActionLabel(entry)}</td>
                      <td className={`px-6 py-4 font-bold text-right ${qtyClass}`}>{signed}</td>
                      <td className="px-6 py-4 text-sm text-outline text-right font-medium">
                        {ts.toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.main>
  );
};
