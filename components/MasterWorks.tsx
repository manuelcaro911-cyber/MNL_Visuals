
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawing, User } from '../types';
import { Plus, Image as ImageIcon, Maximize2, Trash2, Heart } from 'lucide-react';
import { soundEngine } from '../lib/sounds';
import ScrollableContainer from './ScrollableContainer';

interface MasterWorksProps {
  drawings: Drawing[];
  isAdmin: boolean;
  currentUser?: User | null;
  onUploadRequest: (gallery: 'community' | 'master') => void;
  onSelect?: (d: Drawing) => void;
  onDelete?: (id: string) => void;
  onLike?: (id: string) => void;
  onOpenProfile?: (userId: string) => void;
}

const MasterWorks: React.FC<MasterWorksProps> = ({ drawings, isAdmin, currentUser, onUploadRequest, onSelect, onDelete, onLike, onOpenProfile }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { uploaded, whiteboard } = useMemo(() => {
    const uploaded = drawings.filter(d => !d.data).sort((a, b) => b.timestamp - a.timestamp);
    const whiteboard = drawings.filter(d => !!d.data).sort((a, b) => b.timestamp - a.timestamp);
    return { uploaded, whiteboard };
  }, [drawings]);

  const [showAllUploaded, setShowAllUploaded] = useState(false);
  const visibleUploaded = showAllUploaded ? uploaded : uploaded.slice(0, 4);

  const renderDrawingCard = (drawing: Drawing, index: number) => {
    // Generate stable random style (0, 1, or 2)
    const styleType = drawing.id ? (drawing.id.charCodeAt(0) + drawing.id.charCodeAt(drawing.id.length - 1)) % 3 : 0;
    
    // Fallback info
    const authorName = drawing.author || 'Invitado';
    const likesCount = drawing.likes?.length || 0;
    const isLiked = drawing.likes?.includes(currentUser?.id || '');

    if (styleType === 2) {
      // Style 2: Description Only
      return (
        <motion.div 
          key={drawing.id} 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ y: -4 }} 
          onClick={() => { soundEngine.play('click'); onSelect?.(drawing); }}
          className="break-inside-avoid mb-6 md:mb-10 relative group cursor-pointer"
        >
          <div className="relative overflow-hidden p-8 md:p-10 rounded-[1.5rem] bg-neutral-200 text-black shadow-xl transition-all duration-300 hover:bg-white group-hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)]">
             <div className="absolute top-6 right-6 p-2 rounded-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="w-5 h-5 text-black/50" />
             </div>
             
             {isAdmin && onDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(drawing.id); }}
                  className="absolute top-6 right-20 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
             )}

             <h4 className="text-2xl md:text-3xl font-serif font-bold mb-4 leading-tight text-neutral-900">{drawing.title || 'Dibujo'}</h4>
             
             <p className="text-sm md:text-base font-medium text-neutral-600 mb-8 line-clamp-6 leading-relaxed">
                {drawing.description || 'Explora esta perspectiva artística y la visión creativa a través de su composición visual.'}
             </p>

             <div className="flex items-center justify-between border-t border-black/10 pt-6 mt-auto">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Artista</span>
                  <span onClick={(e) => { e.stopPropagation(); if(drawing.author_id) onOpenProfile?.(drawing.author_id); }} className="text-xs font-black uppercase tracking-wider text-black hover:text-blue-600 cursor-pointer transition-colors">{authorName}</span>
               </div>
               <button onClick={(e) => { e.stopPropagation(); onLike?.(drawing.id); }} className="flex items-center gap-2 group/like bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors">
                 <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-500 group-hover/like:text-red-500'}`} />
                 <span className="text-sm font-bold">{likesCount}</span>
               </button>
             </div>
          </div>
        </motion.div>
      );
    }

    if (styleType === 1) {
      // Style 1: Image top, text block bottom
      return (
        <motion.div 
          key={drawing.id} 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          whileHover={{ y: -4 }} 
          onClick={() => { soundEngine.play('click'); onSelect?.(drawing); }}
          className="break-inside-avoid mb-6 md:mb-10 relative group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-[1.5rem] shadow-xl bg-neutral-200 text-black flex flex-col transition-all duration-300 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] group-hover:bg-white">
             
             <div className="relative w-full overflow-hidden bg-black min-h-[200px]">
               <img 
                 src={drawing.image_url} 
                 className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                 alt={drawing.title || "Arte"} 
                 loading="lazy"
               />
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <Maximize2 className="text-white w-10 h-10 drop-shadow-2xl" />
               </div>

               {isAdmin && onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(drawing.id); }}
                    className="absolute top-4 right-4 p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
             </div>

             <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                <div>
                   <h4 className="text-xl md:text-2xl font-serif font-bold mb-3 text-neutral-900">{drawing.title || 'Dibujo'}</h4>
                   {drawing.description && (
                     <p className="text-sm font-medium text-neutral-600 line-clamp-3 mb-6">
                        {drawing.description}
                     </p>
                   )}
                </div>
                
                <div className="flex items-center justify-between border-t border-black/10 pt-6 mt-auto">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Artista</span>
                      <span onClick={(e) => { e.stopPropagation(); if(drawing.author_id) onOpenProfile?.(drawing.author_id); }} className="text-xs font-black uppercase tracking-wider text-black hover:text-blue-600 cursor-pointer transition-colors">{authorName}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onLike?.(drawing.id); }} className="flex items-center gap-2 group/like bg-black/5 hover:bg-black/10 px-4 py-2 rounded-full transition-colors">
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-neutral-500 group-hover/like:text-red-500'}`} />
                    <span className="text-sm font-bold">{likesCount}</span>
                  </button>
                </div>
             </div>
          </div>
        </motion.div>
      );
    }

    // Style 0: Large Image Only (Focus on visuals)
    return (
      <motion.div 
        key={drawing.id} 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        whileHover={{ y: -4 }} 
        onClick={() => { soundEngine.play('click'); onSelect?.(drawing); }}
        className="break-inside-avoid mb-6 md:mb-10 relative group cursor-pointer"
      >
        <div className="relative overflow-hidden rounded-[1.5rem] shadow-xl bg-black border border-white/10 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)]">
          <img 
            src={drawing.image_url} 
            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105" 
            alt="Studio Visual" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Maximize2 className="text-white w-12 h-12 drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-between z-10 pointer-events-none">
             <div className="flex flex-col flex-1 pr-4">
                <span className="text-white font-serif font-bold text-xl md:text-2xl leading-none mb-2 drop-shadow-lg line-clamp-1">{drawing.title || 'Dibujo'}</span>
                <span onClick={(e) => { e.stopPropagation(); if(drawing.author_id) onOpenProfile?.(drawing.author_id); }} className="text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white cursor-pointer transition-colors drop-shadow pointer-events-auto">{authorName}</span>
             </div>
             <button onClick={(e) => { e.stopPropagation(); onLike?.(drawing.id); }} className="flex items-center gap-2 group/like backdrop-blur-xl bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full border border-white/20 pointer-events-auto transition-colors">
               <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/70 group-hover/like:text-red-400'}`} />
               <span className="text-xs font-bold text-white">{likesCount}</span>
             </button>
          </div>

          {isAdmin && onDelete && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(drawing.id); }}
              className="absolute top-4 right-4 p-3 bg-red-600/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl z-20 pointer-events-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <ScrollableContainer className="p-12">
      <div className="max-w-[98%] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase shimmer-text">Mi Galería</h2>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em] italic">Exposición_Exclusiva_MNL</p>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { soundEngine.play('click'); onUploadRequest('master'); }}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Añadir Obra Maestra</span>
            </motion.button>
          )}
        </div>

        {drawings.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center opacity-10 space-y-4">
            <ImageIcon className="w-16 h-16" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Galeria_Vacia</p>
          </div>
        ) : (
          <>
            {uploaded.length > 0 && (
              <section className="mb-24">
                <div className="flex items-center gap-8 mb-12">
                   <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Obras Publicadas</h3>
                   <div className="h-[1px] w-full bg-white/5" />
                </div>
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, staggerChildren: 0.05 }} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                  {visibleUploaded.map((d, index) => renderDrawingCard(d, index))}
                </motion.div>
                
                {!showAllUploaded && uploaded.length > 4 && (
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setShowAllUploaded(true)}
                      className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all group"
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Ver más</span>
                      <motion.div 
                        animate={{ y: [0, 5, 0] }} 
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="p-3 rounded-full bg-white/5 group-hover:bg-white/10"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </motion.div>
                    </button>
                  </div>
                )}
              </section>
            )}

            {whiteboard.length > 0 && (
              <section>
                <div className="flex items-center gap-8 mb-12">
                   <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Obras de la Pizarra</h3>
                   <div className="h-[1px] w-full bg-white/5" />
                </div>
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, staggerChildren: 0.05 }} className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                  {whiteboard.map((d, index) => renderDrawingCard(d, index))}
                </motion.div>
              </section>
            )}
          </>
        )}
      </div>
    </ScrollableContainer>
  );
};

export default MasterWorks;
