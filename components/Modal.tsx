
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, size = 'medium' }) => {
  const sizeClasses = {
    small: 'max-w-lg',
    medium: 'max-w-5xl',
    large: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[15px] cursor-pointer"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`relative w-full ${sizeClasses[size]} h-full max-h-[90vh] bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 rounded-[3.5rem] backdrop-blur-[60px] flex flex-col overflow-hidden`}
      >
        {/* Header Ultra-Limpio sin bloques oscuros */}
        <div className="px-12 py-10 flex items-center justify-between border-b border-white/10">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-[0.4em] uppercase text-white/50 italic">{title}</h2>
            <div className="h-1 w-12 bg-blue-600 rounded-full" />
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all border border-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Cuerpo con scroll interno */}
        <div className="flex-1 overflow-y-auto p-10 md:p-16 text-white text-lg">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default Modal;
