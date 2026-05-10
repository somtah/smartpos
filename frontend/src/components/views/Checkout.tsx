import React, { useState, useEffect } from 'react';
import {
  Lock,
  Printer,
  Mail,
  Ban,
  CheckCircle,
  Banknote,
  QrCode,
  ArrowRight,
  PartyPopper,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../../types';

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onCancel: () => void;
  onComplete: () => void | Promise<void>;
}

export const Checkout: React.FC<CheckoutProps> = ({ items, onCancel, onComplete }) => {
  const [receiptOption, setReceiptOption] = useState<'print' | 'email' | 'none'>('print');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showQrSuccessDialog, setShowQrSuccessDialog] = useState(false);
  const [verifiedTxnId, setVerifiedTxnId] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.085;
  const discount = subtotal > 50 ? 5.35 : 0;
  const grandTotal = subtotal + tax - discount;

  /** Simulates verifying PromptPay / bank confirmation after customer pays via Thai QR */
  const handleVerifyQrPayment = () => {
    if (isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifiedTxnId(Math.random().toString(36).substring(2, 11).toUpperCase());
      setShowQrSuccessDialog(true);
    }, 2000);
  };

  useEffect(() => {
    if (!showQrSuccessDialog) return;
    const id = window.setTimeout(() => {
      setShowQrSuccessDialog(false);
      void Promise.resolve(onComplete()).catch(() => {});
    }, 3000);
    return () => window.clearTimeout(id);
  }, [showQrSuccessDialog, onComplete]);

  const renderPaymentDetail = () => {
    switch (paymentMethod) {
      case 'qr':
        return (
          <div className="flex flex-col items-center w-full">
            <div className="w-full max-w-[320px] bg-white rounded-2xl shadow-xl overflow-hidden border border-outline-variant/30 scale-90 sm:scale-100">
              <div className="bg-[#103E6B] p-4 flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-[#103E6B] font-bold text-lg">QR</span>
                </div>
                <div className="text-white">
                  <p className="text-xs font-bold leading-tight">THAI QR</p>
                  <p className="text-xs leading-tight opacity-90">PAYMENT</p>
                </div>
              </div>
              <div className="p-6 flex flex-col items-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="h-10 flex items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white px-3 shadow-sm">
                    <img
                      src={`${import.meta.env.BASE_URL}images/promptpay-badge.svg`}
                      alt="PromptPay"
                      className="h-7 w-auto object-contain"
                      width={160}
                      height={40}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyQrPayment}
                  className="relative w-48 h-48 bg-white border border-outline-variant p-2 rounded-lg mb-6 group cursor-pointer hover:border-secondary transition-all hover:scale-105 duration-300 shadow-sm"
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ThaiQR-Payment-${grandTotal}`}
                    alt="Payment QR Code"
                    className={`w-full h-full object-contain ${isVerifying ? 'opacity-20' : 'opacity-100'}`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isVerifying ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-bold text-secondary">VERIFYING PAYMENT...</p>
                      </div>
                    ) : (
                      <div className="bg-secondary/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity w-full h-full">
                        <p className="bg-secondary text-white text-[10px] px-2 py-1 rounded font-bold text-center leading-tight">
                          TAP AFTER CUSTOMER PAID TO VERIFY
                        </p>
                      </div>
                    )}
                  </div>
                </button>

                <div className="text-center">
                  <p className="font-bold text-[#103E6B] text-lg">Thai QR Payment</p>
                  <p className="text-on-surface-variant text-sm">Scan with banking app to pay</p>
                  <p className="text-outline text-xs mt-1">Ref: {grandTotal.toFixed(2)} THB</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-outline text-center max-w-xs mt-8">
              After the customer pays, tap the QR area to verify that the payment was received. A confirmation will
              show for 3 seconds, then you will return to the dashboard.
            </p>
          </div>
        );
      case 'cash':
        return (
          <div className="bg-surface-container-low p-10 rounded-2xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center w-full">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <Banknote size={40} className="text-emerald-700" />
              </div>
              <div className="absolute -top-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white" />
            </div>
            <p className="text-2xl font-bold text-on-surface mb-2">Cash Payment</p>
            <p className="text-on-surface-variant max-w-sm mb-6 font-medium">
              Collect payment from the customer, then tap Complete Payment below.
            </p>
            <div className="bg-white px-6 py-4 rounded-xl border border-outline-variant shadow-sm text-lg font-bold text-primary">
              Amount Due: ${grandTotal.toFixed(2)}
            </div>
          </div>
        );
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="max-w-7xl mx-auto px-6 py-8 mt-16 pb-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-on-surface">Order Summary</h2>
              <Lock size={20} className="text-outline" />
            </div>
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-surface-container">
                  <div className="flex flex-col">
                    <span className="text-on-surface-variant font-medium">{item.name}</span>
                    <span className="text-[10px] text-outline font-bold uppercase">
                      QTY: {item.quantity} × ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-semibold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-surface-container pt-4">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Tax (8.5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-indigo-600 font-bold">
                  <span>Discount (WELCOME10)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 flex flex-col items-end border-t border-dashed border-outline-variant">
              <p className="label-caps text-secondary mb-1">Total Amount Due</p>
              <p className="price-display text-primary">${grandTotal.toFixed(2)}</p>
            </div>
          </section>

          <section className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-on-surface">Receipt Options</h2>
            <div className="flex flex-col gap-3">
              {[
                { id: 'print', label: 'Print Receipt', icon: Printer },
                { id: 'email', label: 'Email Receipt', icon: Mail },
                { id: 'none', label: 'No Receipt', icon: Ban },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = receiptOption === option.id;
                return (
                  <label
                    key={option.id}
                    className={`group relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected ? 'border-secondary bg-surface-container' : 'border-outline-variant hover:bg-surface-container-low'
                    }`}
                    onClick={() => setReceiptOption(option.id as 'print' | 'email' | 'none')}
                  >
                    <Icon className={`mr-4 ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`} size={24} />
                    <span className="font-semibold">{option.label}</span>
                    {isSelected && <CheckCircle size={20} className="ml-auto text-secondary" />}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-6">
          <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm min-h-[460px]">
            <h2 className="text-2xl font-bold mb-8 text-on-surface">Select Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-xl mx-auto w-full">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center gap-4 p-6 border-2 rounded-xl transition-all active:scale-95 group ${
                  paymentMethod === 'cash'
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant hover:border-secondary transition-all'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                    paymentMethod === 'cash' ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <Banknote size={30} />
                </div>
                <span className={`font-bold text-center ${paymentMethod === 'cash' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Cash
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('qr')}
                className={`flex flex-col items-center justify-center gap-4 p-6 border-2 rounded-xl transition-all active:scale-95 group ${
                  paymentMethod === 'qr'
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant hover:border-secondary transition-all'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-1 ${
                    paymentMethod === 'qr' ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <QrCode size={30} />
                </div>
                <span className={`font-bold text-center ${paymentMethod === 'qr' ? 'text-primary' : 'text-on-surface-variant'}`}>
                  Thai QR Payment
                </span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[300px]">{renderPaymentDetail()}</div>
          </section>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => void Promise.resolve(onComplete())}
              disabled={paymentMethod !== 'cash'}
              className={`h-20 w-full rounded-xl flex items-center justify-center gap-4 transition-all shadow-lg group ${
                paymentMethod === 'cash'
                  ? 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-primary/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50 shadow-none'
              }`}
            >
              <span className="text-2xl font-bold">Complete Payment</span>
              <ArrowRight
                size={32}
                className={`${paymentMethod === 'cash' ? 'group-hover:translate-x-1' : ''} transition-transform`}
              />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="h-14 w-full border-2 border-outline-variant text-on-surface-variant rounded-xl flex items-center justify-center font-bold transition-all hover:bg-error/5 hover:text-error hover:border-error active:scale-95"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showQrSuccessDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative"
              >
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
                <CheckCircle size={48} className="text-emerald-600 relative z-10" />
              </motion.div>

              <h3 className="text-2xl font-black text-on-surface mb-2">Payment Received!</h3>
              <p className="text-emerald-700 font-bold text-lg mb-2">เงินเข้าเรียบร้อยแล้ว</p>
              <p className="text-on-surface-variant text-sm mb-4">Returning to dashboard in 3 seconds…</p>

              <div className="bg-slate-50 w-full p-4 rounded-2xl border border-outline-variant/30 mb-4 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-bold text-outline">
                  <span>TRANSACTION ID</span>
                  <span>#{verifiedTxnId}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-primary">
                  <span>Total Paid</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary font-bold">
                <PartyPopper size={20} />
                <span>SmartPOS</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
