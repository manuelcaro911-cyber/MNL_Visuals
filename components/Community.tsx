
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drawing, User } from '../types';
import { Image as ImageIcon, Sparkles, Trash2, Maximize2, Heart, X, Users, ArrowUpRight } from 'lucide-react';
import { soundEngine } from '../lib/sounds';
import ScrollableContainer from './ScrollableContainer';

interface CommunityProps {
  drawings: Drawing[];
  isAdmin: boolean;
  themeStyles: any;
  currentUser?: User | null;
  allUsers?: User[];
  onDelete?: (id: string) => void;
  onSelect?: (d: Drawing) => void;
  onLike?: (id: string) => void;
  onOpenProfile?: (userId: string) => void;
}

const Community: React.FC<CommunityProps> = ({ drawings, isAdmin, themeStyles, currentUser, allUsers = [], onDelete, onSelect, onLike, onOpenProfile }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fallbackImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";

  const { uploaded, whiteboard } = useMemo(() => {
    const uploaded = drawings.filter(d => !d.data).sort((a, b) => b.timestamp - a.timestamp);
    const whiteboard = drawings.filter(d => !!d.data).sort((a, b) => b.timestamp - a.timestamp);
    return { uploaded, whiteboard };
  }, [drawings]);

  const [showAllUploaded, setShowAllUploaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUsers, setShowAllUsers] = useState(false);
  
  const visibleUploaded = showAllUploaded ? uploaded : uploaded.slice(0, 4);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { users: [], drawings: [] };
    const query = searchQuery.toLowerCase();
    
    const matchedUsers = allUsers.filter(u => 
      u.username?.toLowerCase().startsWith(query) || 
      u.old_username?.toLowerCase().startsWith(query)
    );
    
    const matchedDrawings = drawings.filter(d => 
      d.title?.toLowerCase().startsWith(query) || 
      d.description?.toLowerCase().startsWith(query) ||
      d.author?.toLowerCase().startsWith(query)
    );
    
    return { users: matchedUsers, drawings: matchedDrawings };
  }, [searchQuery, allUsers, drawings]);

  const renderDrawingCard = (drawing: Drawing, isRecent: boolean = false) => {
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
          className={`${isRecent ? 'flex-shrink-0 w-[300px] md:w-[450px] snap-center py-6' : 'break-inside-avoid mb-6 md:mb-10'} relative group cursor-pointer`}
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
          className={`${isRecent ? 'flex-shrink-0 w-[300px] md:w-[450px] snap-center py-6' : 'break-inside-avoid mb-6 md:mb-10'} relative group cursor-pointer`}
        >
          <div className="relative overflow-hidden rounded-[1.5rem] shadow-xl bg-neutral-200 text-black flex flex-col transition-all duration-300 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)] group-hover:bg-white">
             
             <div className="relative w-full overflow-hidden bg-black min-h-[200px]">
               <img 
                 src={drawing.image_url} 
                 onError={(e) => e.currentTarget.src = fallbackImage} 
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
        className={`${isRecent ? 'flex-shrink-0 w-[300px] md:w-[450px] snap-center py-6' : 'break-inside-avoid mb-6 md:mb-10'} relative group cursor-pointer`}
      >
        <div className={`relative overflow-hidden rounded-[1.5rem] shadow-xl bg-black border border-white/10 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(255,255,255,0.1)]`}>
          <img 
            src={drawing.image_url} 
            onError={(e) => e.currentTarget.src = fallbackImage} 
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
    <ScrollableContainer className="max-w-[95%] mx-auto py-24 px-6 relative">
      <header className="text-center mb-16 space-y-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
          <h2 className={`text-5xl font-extralight tracking-[0.6em] uppercase ${themeStyles.text} mb-4`}>Galería Comunidad</h2>
          <div className="flex items-center justify-center gap-4 opacity-20">
            <div className="w-8 h-[1px] bg-white" />
            <Sparkles className="w-3 h-3" />
            <div className="w-8 h-[1px] bg-white" />
          </div>
        </motion.div>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-12 relative group">
          <div className="flex items-center gap-4 px-4 py-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 group-focus-within:text-white transition-colors">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios u obras..." 
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/30 font-light tracking-widest"
            />
          </div>
          <div className="h-[1px] w-full bg-white/20 group-focus-within:bg-white transition-colors mt-2" />
        </div>
      </header>

      {/* Hero Drawing Section */}
      {!searchQuery.trim() && uploaded.length > 0 && (
        <section className="mb-24 w-full flex flex-col lg:flex-row gap-6 h-[400px] md:h-[500px]">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             className="relative flex-1 rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl border border-white/10 h-full"
             onClick={() => { soundEngine.play('click'); onSelect?.(uploaded[0]); }}
           >
             <img 
               src={uploaded[0].image_url} 
               alt={uploaded[0].title || 'Hero'} 
               className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
             
             <div className="absolute bottom-0 left-0 p-8 md:p-12 flex flex-col items-start w-full pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-3 inline-flex items-center gap-2">
                   <Sparkles className="w-3 h-3 text-yellow-400" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">Destacado</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2 drop-shadow-lg line-clamp-1">
                  {uploaded[0].title || 'Dibujo'}
                </h2>
                <p className="text-white/70 font-medium text-base flex items-center gap-2">
                   Por <span className="font-bold text-white">{uploaded[0].author || 'Artista Invitado'}</span>
                </p>
             </div>
           </motion.div>

           {/* Side Thumbnails */}
           <div className="hidden lg:flex flex-col gap-6 w-[280px] xl:w-[340px] shrink-0 h-full">
             {[...uploaded, ...uploaded, ...uploaded].slice(1, 4).map((d, i) => (
                <motion.div
                  key={`hero-side-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                  onClick={() => { soundEngine.play('click'); onSelect?.(d); }}
                  className="flex-1 rounded-3xl overflow-hidden relative cursor-pointer group shadow-xl border border-white/10"
                >
                  <img src={d.image_url} alt="Thumbnail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <p className="text-white font-bold text-sm truncate">{d.title || 'Dibujo'}</p>
                  </div>
                </motion.div>
             ))}
           </div>
        </section>
      )}

      {searchQuery.trim() ? (
        <div className="space-y-16">
          {/* Users Search Results */}
          {searchResults.users.length > 0 && (
            <section>
              <div className="flex items-center gap-8 mb-8">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Usuarios Encontrados</h3>
                 <div className="h-[1px] w-full bg-white/5" />
              </div>
              <div className="flex flex-col gap-4">
                {searchResults.users.slice(0, 2).map(user => (
                  <div 
                    key={user.id} 
                    onClick={() => onOpenProfile?.(user.id)}
                    className="flex items-center gap-4 p-3 md:p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-all duration-300 border border-white/10 hover:border-white/30 group"
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-neutral-800 border border-white/10 shrink-0 group-hover:scale-[1.02] transition-transform duration-300 shadow-md">
                      {user.profile_pic ? (
                        <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/50 bg-blue-900/20">
                          {(user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase mb-0.5">{user.username}</h4>
                      <p className="text-blue-400/80 text-xs md:text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                         <Users className="w-4 h-4" /> 
                         {user.followers?.length || 0} {user.followers?.length === 1 ? 'Seguidor' : 'Seguidores'}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                      <ArrowUpRight className="text-white/40 w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
              {searchResults.users.length > 2 && (
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => setShowAllUsers(true)}
                    className="flex flex-col items-center gap-2 text-white/40 hover:text-white transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Ver todos los usuarios</span>
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

          {/* Drawings Search Results */}
          {searchResults.drawings.length > 0 && (
            <section>
              <div className="flex items-center gap-8 mb-8">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Obras Encontradas</h3>
                 <div className="h-[1px] w-full bg-white/5" />
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                {searchResults.drawings.map(d => renderDrawingCard(d))}
              </div>
            </section>
          )}

          {searchResults.users.length === 0 && searchResults.drawings.length === 0 && (
            <div className="text-center py-32 space-y-6 opacity-20">
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">No se encontraron resultados</p>
            </div>
          )}
        </div>
      ) : drawings.length === 0 ? (
        <div className="text-center py-32 space-y-6 opacity-20">
           <ImageIcon className="w-16 h-16 mx-auto" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em]">Sin obras disponibles</p>
        </div>
      ) : (
        <>
          {uploaded.length > 0 && (
            <section className="mb-24">
              <div className="flex items-center gap-8 mb-12">
                 <h3 className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Obras Publicadas</h3>
                 <div className="h-[1px] w-full bg-white/5" />
              </div>
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                {visibleUploaded.map(d => renderDrawingCard(d))}
              </div>
              
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
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-10">
                {whiteboard.map(d => renderDrawingCard(d))}
              </div>
            </section>
          )}
        </>
      )}
      {/* All Users Popup */}
      <AnimatePresence>
        {showAllUsers && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAllUsers(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="text-xl font-black uppercase tracking-widest text-white">Todos los Usuarios</h3>
                <button onClick={() => setShowAllUsers(false)} className="p-2 bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto flex-1">
                <div className="flex flex-col gap-4">
                  {searchResults.users.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => {
                        setShowAllUsers(false);
                        onOpenProfile?.(user.id);
                      }}
                      className="flex items-center gap-4 p-3 md:p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] cursor-pointer transition-all duration-300 border border-white/10 hover:border-white/30 group"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-neutral-800 border border-white/10 shrink-0 group-hover:scale-[1.02] transition-transform duration-300 shadow-md">
                        {user.profile_pic ? (
                          <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/50 bg-blue-900/20">
                            {(user.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase mb-0.5">{user.username}</h4>
                        <p className="text-blue-400/80 text-xs md:text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                           <Users className="w-4 h-4" /> 
                           {user.followers?.length || 0} {user.followers?.length === 1 ? 'Seguidor' : 'Seguidores'}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                        <ArrowUpRight className="text-white/40 w-6 h-6" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ScrollableContainer>
  );
};

export default Community;
