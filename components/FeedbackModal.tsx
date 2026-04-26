
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, ThumbsUp, ThumbsDown, Trash2, UserCircle } from 'lucide-react';
import { Feedback, User } from '../types';

interface FeedbackModalProps {
  onClose: () => void;
  feedbacks: Feedback[];
  onSubmit: (f: Feedback) => void;
  onDelete?: (id: string) => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onOpenProfile?: (userId: string) => void;
  currentUser: User | null;
  isAdmin: boolean;
  themeStyles: any;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, feedbacks, onSubmit, onDelete, onLike, onDislike, onOpenProfile, currentUser, isAdmin, themeStyles }) => {
  const [name, setName] = useState(currentUser?.username || '');
  const [opinion, setOpinion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser?.is_blocked) {
      alert("Tu cuenta ha sido bloqueada. No puedes comentar.");
      return;
    }
    if (!name.trim() || !opinion.trim()) return;
    onSubmit({ 
      name: currentUser?.username || name, 
      opinion, 
      timestamp: Date.now(),
      user_id: currentUser?.id,
      profile_pic: currentUser?.profile_pic
    });
    if (!currentUser) setName(''); 
    setOpinion('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[20px] cursor-pointer"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative w-full max-w-4xl bg-black/80 border border-white/10 rounded-[3rem] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] backdrop-blur-[60px] flex flex-col max-h-[90vh] overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-10 text-white">
          <h2 className="text-3xl font-black tracking-[0.2em] uppercase opacity-60 italic">Buzón_Opiniones</h2>
          <button onClick={onClose} className="p-4 opacity-40 hover:opacity-100 transition-all border border-white/10 rounded-full hover:bg-white/10"><X className="w-8 h-8" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mb-12">
          {!currentUser && (
            <input type="text" placeholder="Tu Nombre" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white focus:outline-none focus:border-white/40 transition-all" required />
          )}
          <textarea placeholder="Comparte tu opinión o mensaje..." rows={4} value={opinion} onChange={(e) => setOpinion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-lg text-white focus:outline-none focus:border-white/40 transition-all resize-none italic" required />
          <button type="submit" className="w-full flex items-center justify-center gap-4 bg-white text-black font-black uppercase tracking-widest py-6 rounded-2xl hover:scale-[1.02] transition-all text-sm"><Send className="w-6 h-6" /> Publicar Mensaje</button>
        </form>

        <div className="flex-1 overflow-y-auto space-y-8 pr-6">
          <h3 className="text-xs uppercase tracking-[0.5em] text-white/30 font-black italic mb-6">Red_Feedbacks_Recientes</h3>
          {feedbacks.length === 0 ? (
            <p className="text-white/20 text-center py-16 italic text-xl">Aún no hay ecos de la comunidad.</p>
          ) : (
            feedbacks.map((f, i) => {
              const hasLiked = currentUser && f.likes?.includes(currentUser.id);
              const hasDisliked = currentUser && f.dislikes?.includes(currentUser.id);
              
              return (
                <div key={f.id || i} className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-6">
                    <div 
                      className={`flex items-center gap-5 ${f.user_id ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                      onClick={() => {
                        if (f.user_id && onOpenProfile) {
                          onClose();
                          onOpenProfile(f.user_id);
                        }
                      }}
                    >
                      {f.profile_pic ? (
                        <img src={f.profile_pic} alt={f.name} className="w-16 h-16 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                          <UserCircle className="w-10 h-10" />
                        </div>
                      )}
                      <div>
                        <span className="font-black text-base text-blue-400 uppercase tracking-widest block">{f.name}</span>
                        <span className="text-xs text-white/30 font-mono">{new Date(f.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    {isAdmin && onDelete && f.id && (
                      <button onClick={() => onDelete(f.id!)} className="p-3 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-all">
                        <Trash2 className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                  <p className="text-white/80 text-lg font-light italic leading-relaxed mb-8">"{f.opinion}"</p>
                  
                  <div className="flex items-center gap-5 border-t border-white/5 pt-6">
                    <button 
                      onClick={() => onLike && f.id && onLike(f.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-black transition-all ${hasLiked ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                      <ThumbsUp className="w-5 h-5" /> {f.likes?.length || 0}
                    </button>
                    <button 
                      onClick={() => onDislike && f.id && onDislike(f.id)}
                      className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-black transition-all ${hasDisliked ? 'bg-red-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                      <ThumbsDown className="w-5 h-5" /> {f.dislikes?.length || 0}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackModal;
