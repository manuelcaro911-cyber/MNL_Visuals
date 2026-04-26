
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Users, Palette, ShoppingBag, Share2, 
  Image as ImageIconLucide, ArrowUpRight, Youtube, Music2, Instagram, Link, X, ExternalLink, ShieldCheck
} from 'lucide-react';
import { Page } from '../types';
import { soundEngine } from '../lib/sounds';
import ScrollableContainer from './ScrollableContainer';

interface ModulesProps {
  onNavigate: (p: Page) => void;
  themeStyles: any;
  theme: string;
  customTexts?: Record<string, {title: string, desc: string}>;
  customLinkUrl?: string;
  customLinks?: {title: string, url: string}[];
  onShowPrivacy?: () => void;
  moduleStates?: { [key: string]: boolean };
}

const Modules: React.FC<ModulesProps> = ({ onNavigate, themeStyles, theme, customTexts = {}, customLinkUrl, customLinks = [], onShowPrivacy, moduleStates = {} }) => {
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  const isEnabled = (id: string, def = true) => {
    if (id === 'custom_link') return true;
    const keyMap: Record<string, string> = {
      [Page.About]: 'about',
      [Page.MyGallery]: 'community',
      [Page.MasterWorks]: 'masterworks',
      [Page.Whiteboard]: 'whiteboard',
      [Page.Commissions]: 'commissions',
      [Page.Social]: 'social'
    };
    const key = keyMap[id];
    return key ? (moduleStates[key] ?? def) : def;
  };

  const modules = [
    { id: Page.About, title: customTexts['about']?.title || 'Sobre mí', desc: customTexts['about']?.desc || 'Conoce la visión, trayectoria y los fundamentos detrás del arte en esta arquitectura digital.', icon: <User className="w-10 h-10 md:w-16 md:h-16" />, size: 'col-span-1 md:col-span-12 lg:col-span-8 lg:row-span-3', styleType: 'featured' },
    { id: Page.MyGallery, title: customTexts['community']?.title || 'Comunidad', desc: customTexts['community']?.desc || 'Conecta y comparte experiencias con otros entusiastas.', icon: <Users className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', styleType: 'list' },
    { id: Page.MasterWorks, title: customTexts['masterworks']?.title || 'Mi Galería', desc: customTexts['masterworks']?.desc || 'Explora la colección de obras destacadas y arte finalizado.', icon: <ImageIconLucide className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', styleType: 'list' },
    { id: Page.Whiteboard, title: customTexts['whiteboard']?.title || 'Pizarra', desc: customTexts['whiteboard']?.desc || 'Laboratorio visual interactivo para crear en tiempo real.', icon: <Palette className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', styleType: 'list' },
    { id: Page.Commissions, title: customTexts['commissions']?.title || 'Comisiones', desc: customTexts['commissions']?.desc || 'Solicita piezas de arte personalizadas y proyectos exclusivos.', icon: <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', styleType: 'grid' },
    { id: Page.Social, title: customTexts['social']?.title || 'Red Social', desc: customTexts['social']?.desc || 'Enlaces a mis plataformas externas y ecosistema social.', icon: <Share2 className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', styleType: 'grid' },
    { id: 'custom_link', title: customTexts['enlaces']?.title || 'Enlaces', desc: customTexts['enlaces']?.desc || 'Acceso rápido a recursos externos y contacto.', icon: <Link className="w-8 h-8 md:w-10 md:h-10" />, size: 'col-span-1 md:col-span-4 lg:col-span-4', isExternal: true, styleType: 'grid' },
  ];

  const socialLinks = [
    { 
      id: 'youtube', 
      icon: <Youtube className="w-5 h-5" />, 
      url: 'https://youtube.com/@mnl-visuals?si=bXeR13PYh1hy-HK1', 
      color: 'hover:bg-red-600' 
    },
    { 
      id: 'instagram', 
      icon: <Instagram className="w-5 h-5" />, 
      url: 'https://www.instagram.com/mnlv.isuals?igsh=Ynp6and0ajYwcGZn', 
      color: 'hover:bg-gradient-to-tr hover:from-yellow-500 hover:via-red-500 hover:to-purple-500' 
    }
  ];

  return (
    <ScrollableContainer className="max-w-[98%] mx-auto py-4 px-4 md:px-6 relative">
      <div className="absolute top-16 md:top-20 right-4 md:right-8 flex gap-2 md:gap-3 z-[2000]">
        {onShowPrivacy && (
          <motion.button
            onClick={() => {
              soundEngine.play('click');
              onShowPrivacy();
            }}
            onMouseEnter={() => soundEngine.play('hover')}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            className={`px-4 py-2 h-10 md:h-12 flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white/80 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:bg-blue-600 group`}
            title="Política de Privacidad"
          >
            <ShieldCheck className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Privacidad</span>
          </motion.button>
        )}
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => soundEngine.play('hover')}
            onClick={() => soundEngine.play('click')}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + (index * 0.05), duration: 0.3, ease: "easeOut" }}
            className={`px-4 py-2 h-10 md:h-12 flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-xl text-white/80 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] ${link.color} group`}
          >
            {link.icon}
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{link.id === 'youtube' ? 'YT' : 'IG'}</span>
          </motion.a>
        ))}
      </div>

      <div className="w-full">
        <h2 className="text-4xl md:text-5xl font-light text-white mb-8 tracking-tighter mt-16 md:mt-24 px-2">Ecosistema<br/><span className="font-bold">Digital</span></h2>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, staggerChildren: 0.05 }} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 w-full">
          {modules.map((m, index) => {
            const active = isEnabled(m.id);
            return (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                onMouseEnter={() => active && soundEngine.play('hover')}
                whileHover={active ? { y: -4, scale: 1.01 } : { scale: 0.98 }}
                whileTap={active ? { scale: 0.98 } : {}}
                onClick={() => { 
                  soundEngine.play('click'); 
                  if (!active) {
                    setBlockMessage(`El módulo "${m.title}" se encuentra en desarrollo o bajo mantenimiento. Pronto estará disponible.`);
                    setTimeout(() => setBlockMessage(null), 4000);
                    return;
                  }
                  
                  if (m.isExternal) {
                    if (customLinks && customLinks.length > 1) {
                      setShowLinksModal(true);
                    } else if (customLinks && customLinks.length === 1) {
                      window.open(customLinks[0].url, '_blank');
                    } else if (customLinkUrl) {
                      window.open(customLinkUrl, '_blank');
                    } else {
                      setBlockMessage('Pronto disponible');
                      setTimeout(() => setBlockMessage(null), 4000);
                    }
                  } else {
                    onNavigate(m.id as Page); 
                  }
                }}
                className={`group cursor-pointer rounded-[2rem] flex relative overflow-hidden ${m.size} ${active ? 'bg-white/[0.02] hover:bg-white/[0.05] border-white/10 border backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,100,255,0.15)]' : 'bg-black/40 border-dashed border-white/5 opacity-50 grayscale'}
                  ${m.styleType === 'featured' ? 'flex-col justify-end p-8 md:p-12 min-h-[300px] md:min-h-[450px]' : 
                    m.styleType === 'list' ? 'flex-row items-center p-6 min-h-[120px]' : 
                    'flex-col justify-between p-6 md:p-8 min-h-[200px]'}
                `}
              >
                {/* Background reflections */}
                {active && <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />}
                {active && <div className="absolute inset-0 rounded-[2rem] border border-white/5 group-hover:border-white/20 transition-colors duration-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none" />}
                
                {/* Maintenance Tag */}
                {!active && (
                  <div className="absolute top-0 right-0 p-6 opacity-40 z-10">
                     <div className="text-[8px] border border-white/20 rounded-full px-2 py-1 uppercase tracking-widest font-black text-white/50 bg-black/40">Maintenance</div>
                  </div>
                )}
                
                {/* Render Logic Based on Type */}
                {m.styleType === 'featured' && (
                  <>
                    <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-10">
                       <div className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[9px] uppercase tracking-widest text-white/70 font-bold flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                         Destacado
                       </div>
                       {active && <ArrowUpRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />}
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
                      {m.icon && React.cloneElement(m.icon as React.ReactElement, { className: 'w-64 h-64 text-white' })}
                    </div>

                    <div className="relative z-10 mt-auto">
                      <h3 className={`text-3xl md:text-5xl font-black tracking-tighter ${themeStyles.text} uppercase transition-all mb-2`}>{m.title}</h3>
                      <p className={`text-xs md:text-sm font-light text-white/70 leading-relaxed max-w-lg mt-2`}>
                        {m.desc}
                      </p>
                    </div>
                  </>
                )}

                {m.styleType === 'list' && (
                  <>
                    <div className="relative z-10 flex items-center gap-6 w-full">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] shrink-0 flex items-center justify-center bg-white/5 border border-white/10 transition-all duration-500 ${active ? 'group-hover:bg-blue-500 group-hover:text-white group-hover:-rotate-6 group-hover:scale-110' : ''}`}>
                        {m.icon}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg md:text-xl font-bold tracking-tight text-white uppercase">{m.title}</h3>
                          {active && <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />}
                        </div>
                        <p className="text-[11px] md:text-xs font-light text-white/50 leading-snug line-clamp-2 md:line-clamp-none">{m.desc}</p>
                      </div>
                    </div>
                  </>
                )}

                {m.styleType === 'grid' && (
                  <>
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                       <ArrowUpRight className="w-4 h-4 text-white/50" />
                    </div>
                    <div className="relative z-10 flex flex-col justify-between h-full w-full">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.2rem] flex items-center justify-center bg-white/5 border border-white/10 transition-all duration-500 ${active ? 'group-hover:bg-blue-500 group-hover:text-white group-hover:-rotate-6 group-hover:scale-110' : ''}`}>
                        {m.icon}
                      </div>
                      <div className="mt-8 text-left">
                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2 uppercase">{m.title}</h3>
                        <p className="text-[11px] md:text-xs font-light text-white/60 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </>
                )}

              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {blockMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-black/80 backdrop-blur-3xl border border-white/10 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center"
          >
            <ShieldCheck className="w-8 h-8 text-blue-500 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-2">Acceso Restringido</h4>
            <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">{blockMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLinksModal && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowLinksModal(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-black/80 border border-white/10 rounded-[3rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-[60px] overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black tracking-widest text-white uppercase italic">Enlaces</h2>
                <button onClick={() => setShowLinksModal(false)} className="p-4 bg-white/10 hover:bg-white text-white/60 hover:text-black transition-all rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-5">
                {customLinks?.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <span className="text-base font-bold text-white tracking-wide">{link.title || link.url}</span>
                    <ExternalLink className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ScrollableContainer>
  );
};

export default Modules;
