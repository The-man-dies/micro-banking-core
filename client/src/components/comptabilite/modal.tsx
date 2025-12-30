// src/components/ui/Modal.tsx
import React, { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl"
              aria-label="Fermer"
            >
              &times;
            </button>
          </div>
        </div>
        
        {/* Contenu */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Pied de page (optionnel) */}
        {footer && (
          <div className="sticky bottom-0 bg-slate-800 p-6 border-t border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;