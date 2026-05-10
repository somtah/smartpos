import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  /** Single-button mode: dismiss */
  onClose: () => void;
  actionLabel?: string;
  /** Two-button mode: Cancel runs `onClose`, Confirm runs `onConfirm` */
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Replaces `alert()` and `confirm()` — single OK when `onConfirm` is omitted;
 * Cancel + Confirm when `onConfirm` is provided.
 */
export const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  title,
  message,
  onClose,
  actionLabel = 'OK',
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  const confirmMode = onConfirm != null;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role={confirmMode ? 'dialog' : 'alertdialog'}
            aria-modal="true"
            aria-labelledby="app-alert-dialog-title"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="relative bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`absolute top-0 inset-x-0 h-2 ${confirmMode ? 'bg-amber-500' : 'bg-secondary'}`}
            />

            <div className="flex flex-col items-center text-center pt-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${
                  confirmMode ? 'bg-amber-100' : 'bg-secondary/10'
                }`}
              >
                {confirmMode ? (
                  <AlertTriangle className="text-amber-700" size={32} />
                ) : (
                  <Info className="text-secondary" size={32} />
                )}
              </div>
              <h2 id="app-alert-dialog-title" className="text-xl font-black text-on-surface mb-3">
                {title}
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">{message}</p>

              {confirmMode ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl border-2 border-outline-variant font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onConfirm();
                    }}
                    className="flex-1 h-12 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-colors shadow-lg"
                  >
                    {confirmLabel}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full h-12 rounded-xl bg-primary text-white font-black hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {actionLabel}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
