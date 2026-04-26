
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, FileText, Heart, Share2, UserPlus, Check } from 'lucide-react';
import { Drawing, User as UserType } from '../types';

interface ImagePreviewProps {
  drawing: Drawing;
  allDrawings?: Drawing[];
  onSelectSuggested?: (drawing: Drawing) => void;
  onClose: () => void;
  borderStyle?: 'rounded' | 'square';
  currentUser?: UserType | null;
  onLike?: (id: string) => void;
  onFollow?: (authorId: string) => void;
  isFollowing?: boolean;
  onOpenProfile?: (userId: string) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ drawing, allDrawings = [], onSelectSuggested, onClose, borderStyle, currentUser, onLike, onFollow, isFollowing, onOpenProfile }) => {
  const hasLiked = currentUser && drawing.likes?.includes(currentUser.id);
  const [copied, setCopied] = React.useState(false);

  const suggestedDrawings = useMemo(() => {
    return allDrawings.filter(d => d.id !== drawing.id && d.status === 'approved').slice(0, 15);
  }, [allDrawings, drawing.id]);

  const handleShare = () => {
    const url = `${window.location.origin}?artwork=${drawing.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Background Mask */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-2xl cursor-zoom-out"
      />

      {/* Main Superposed Window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-[1400px] h-full max-h-[90vh] bg-[#111111] rounded-[2.5rem] md:rounded-[3rem] border border-white/10 flex flex-col xl:flex-row overflow-hidden shadow-2xl z-10"
      >
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[100] p-3 bg-black/50 hover:bg-white text-white/50 hover:text-black rounded-full transition-all backdrop-blur-xl border border-white/10 xl:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Main Image View */}
        <div className="flex-[3] relative p-4 md:p-6 lg:p-8 flex flex-col overflow-hidden bg-[#111111]">
          {/* Inner Rounded Frame for the Image */}
          <div className="flex-1 relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-inner flex flex-col justify-end group">
            
            <AnimatePresence mode="wait">
              <motion.img 
                key={drawing.id}
                initial={{ opacity: 0, scale: 1.02 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                src={drawing.image_url} 
                className="absolute inset-0 w-full h-full object-contain md:object-cover" 
                alt="Preview" 
              />
            </AnimatePresence>

            {/* Bottom Gradient separating image from description pill */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32 pb-8 px-6 md:px-12 flex flex-col justify-end opacity-100 transition-opacity">
               
               {/* Description & Action Pill Box */}
               <div className="relative z-20 flex flex-col md:flex-row items-center gap-4 bg-white/10 backdrop-blur-xl rounded-[2rem] md:rounded-full border border-white/20 p-2 md:p-2 w-full max-w-4xl mx-auto shadow-2xl">
                 
                 {/* Author Avatar Pill */}
                 <div 
                   onClick={() => { if(drawing.author_id) { onClose(); onOpenProfile?.(drawing.author_id); } }}
                   className="flex items-center gap-3 bg-white hover:bg-white/90 transition-all rounded-full pr-8 pl-2 py-2 cursor-pointer border border-white/5 whitespace-nowrap shadow-lg shrink-0"
                 >
                    <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg">
                      <User className="text-white w-5 h-5" />
                    </div>
                    <span className="text-black font-black uppercase tracking-widest text-xs">{drawing.author || 'Usuario'}</span>
                 </div>

                 {/* Description text */}
                 <div className="flex-1 px-4 py-4 md:py-2 flex items-center w-full min-w-0">
                    <p className="text-white/90 text-sm font-medium truncate w-full text-center md:text-left">"{drawing.description}"</p>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center gap-2 px-2 md:px-4 whitespace-nowrap w-full md:w-auto justify-center md:justify-end pb-2 md:pb-0 shrink-0">
                    {currentUser && currentUser.id !== drawing.author_id && drawing.author_id && (
                       <button 
                         onClick={() => onFollow && onFollow(drawing.author_id!)}
                         className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${isFollowing ? 'bg-white text-black' : 'bg-black/50 text-white hover:bg-black'}`}
                       >
                         {isFollowing ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                       </button>
                    )}
                    <button 
                      onClick={() => onLike && onLike(drawing.id)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all ${hasLiked ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-black'}`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : ''}`} />
                      <span className="font-bold text-xs">{drawing.likes?.length || 0}</span>
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-black text-white hover:text-white bg-black/50"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                    </button>
                 </div>

               </div>
               
            </div>
          </div>
        </div>

        {/* Right Side - Suggestions Sidebar */}
        <div className="flex-1 max-w-[420px] w-full bg-[#111111] flex flex-col h-full overflow-hidden shrink-0 hidden xl:flex border-l border-white/5">
          
          <div className="p-8 flex items-center justify-between pb-6 shrink-0 relative z-10">
             <div className="bg-white/5 px-6 py-4 rounded-full border border-white/10 text-white/50 text-xs font-bold tracking-[0.3em] uppercase w-full flex items-center justify-between shadow-inner">
                Sugerencias
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors"><X className="w-4 h-4" /></button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-12 flex flex-col gap-6 relative">
             <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#111111] to-transparent z-10 pointer-events-none" />
             
             {suggestedDrawings.length > 0 ? suggestedDrawings.map((suggested, index) => (
                <motion.div 
                  key={suggested.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onSelectSuggested && onSelectSuggested(suggested)}
                  className="relative group cursor-pointer aspect-[4/3] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shrink-0 shadow-lg hover:shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all"
                >
                   <img 
                     src={suggested.image_url} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     alt={`Suggestion`} 
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-8">
                      <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/20 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                         Ver Obra
                      </div>
                      <p className="absolute bottom-6 left-6 text-white font-bold truncate max-w-[80%] text-sm drop-shadow-md">
                        {suggested.title || 'Galería'}
                      </p>
                   </div>
                </motion.div>
             )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-white">
                   <p className="text-xs uppercase tracking-widest font-black text-center px-8">No hay imágenes sugeridas en este momento.</p>
                </div>
             )}
          </div>
          
        </div>
      </motion.div>
    </div>
  );
};

export default ImagePreview;
