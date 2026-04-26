import React from 'react';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';

interface OnboardingModalProps {
  message: string;
  onClose: () => void;
  borderStyle?: 'rounded' | 'square';
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ message, onClose, borderStyle = 'rounded' }) => {
  const borderRadius = borderStyle === 'rounded' ? 'rounded-3xl' : 'rounded-none';

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`w-full max-w-lg bg-zinc-900 border border-white/10 p-10 relative shadow-2xl ${borderRadius}`}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
            <Info className="w-10 h-10 text-blue-400" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-wide">Mensaje del Administrador</h2>
            <p className="text-base text-white/70 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className={`w-full py-4 bg-white text-black font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors ${borderStyle === 'rounded' ? 'rounded-xl' : 'rounded-none'}`}
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingModal;
