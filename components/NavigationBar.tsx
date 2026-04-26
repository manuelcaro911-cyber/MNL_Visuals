
import React from 'react';
import { Home, ArrowLeft, MessageSquare, Plus, Settings, User, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Page } from '../types';
import { soundEngine } from '../lib/sounds';

interface NavigationBarProps {
  onHome: () => void;
  onBack: () => void;
  onFeedback: () => void;
  onPlus: () => void;
  onConfig: () => void;
  onProfile: () => void;
  onStar?: () => void;
  isAdmin?: boolean;
  themeStyles: any;
  currentPage: Page;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  onHome, onBack, onFeedback, onPlus, onConfig, onProfile, onStar, isAdmin, themeStyles, currentPage 
}) => {
  const isLight = themeStyles.bg === 'bg-[#fafafa]';
  
  const NavButton = ({ icon: Icon, onClick, title, primary = false, active = false, accent = false }: { icon: any, onClick: () => void, title: string, primary?: boolean, active?: boolean, accent?: boolean }) => (
    <motion.button 
      onClick={(e) => {
        e.stopPropagation();
        soundEngine.play('click');
        onClick();
      }}
      onMouseEnter={() => soundEngine.play('hover')}
      whileHover={{ y: primary ? -6 : -2 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 transform-gpu cursor-pointer border-b-2 shrink-0
        ${primary 
          ? 'bg-blue-600 text-white border-blue-400 shadow-[0_15px_50px_rgba(59,130,246,0.6)] scale-110 -translate-y-2 px-8 py-5 z-10'
          : accent
            ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-gradient-to-r hover:from-purple-600/40 hover:to-blue-600/40 hover:text-white'
            : (active 
                ? 'bg-white/10 text-white border-blue-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]' 
                : 'border-transparent text-white/30 hover:text-white hover:bg-white/5')}`}
    >
      <Icon className={`w-4 h-4 ${active || accent ? 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''} ${primary ? 'w-6 h-6' : ''}`} />
      <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${primary ? 'text-xs' : ''}`}>{title}</span>
      
      {active && (
        <motion.div 
          layoutId="tab-active" 
          className="absolute -bottom-1 left-4 right-4 h-[2px] bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]"
        />
      )}
    </motion.button>
  );

  return (
    <nav className="flex items-center gap-1 p-2 transform-gpu pointer-events-auto overflow-x-auto no-scrollbar max-w-full relative">
      {isAdmin && onStar && (
        <NavButton icon={Star} onClick={onStar} title="Ambiente" accent active={currentPage === Page.Ambiente} />
      )}

      <NavButton icon={Plus} onClick={onPlus} title="Publicar" primary />
      
      <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2 shrink-0" />
      
      <NavButton icon={Home} onClick={onHome} title="Inicio" active={currentPage === Page.Home} />
      <NavButton icon={ArrowLeft} onClick={onBack} title="Atrás" />
      
      <div className="w-[1px] h-6 bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2 shrink-0" />
      
      <NavButton icon={User} onClick={onProfile} title="Perfil" active={false} />
      <NavButton icon={MessageSquare} onClick={onFeedback} title="Feedback" />
      <NavButton icon={Settings} onClick={onConfig} title="Sistema" />
    </nav>
  );
};

export default NavigationBar;
