
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Image as ImageIcon, Link as LinkIcon, Lock, FileText, Upload, MousePointer2, AlertCircle } from 'lucide-react';
import { User, Drawing } from '../types';
import { supabase } from '../lib/supabase';
import { soundEngine } from '../lib/sounds';

interface UploadModalProps {
  onClose: () => void;
  currentUser: User;
  isAdmin: boolean;
  onUpload: (d: Drawing) => void;
  themeStyles: any;
  initialGallery?: 'community' | 'master';
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, currentUser, isAdmin, onUpload, themeStyles, initialGallery = 'community' }) => {
  const [step, setStep] = useState<'policies' | 'form'>('policies');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('file');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [targetGallery] = useState<'community' | 'master'>(initialGallery);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Imagen no válida.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    soundEngine.play('success');
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); };

  const handlePublish = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let finalImageUrl = imageUrl;
      if (uploadType === 'file' && selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('drawings').getPublicUrl(filePath);
        finalImageUrl = publicUrl;
      }

      if (!finalImageUrl) throw new Error("Falta imagen.");

      const finalDescription = targetGallery === 'master' ? `${title}\n${description}` : description;
      
      // LÓGICA: Si es para Comunidad y es Admin, se auto-aprueba.
      const shouldAutoApprove = targetGallery === 'master' || isAdmin;
      
      let finalStatus = 'pending';
      if (isDraft) {
        finalStatus = 'draft';
      } else if (shouldAutoApprove) {
        finalStatus = 'approved';
      }

      const newDrawing: Partial<Drawing> = { 
        author: targetGallery === 'master' ? 'Manuel Caro' : currentUser.username, 
        author_id: currentUser.id, 
        image_url: finalImageUrl, 
        description: finalDescription.slice(0, 250), // Forzar límite
        timestamp: Date.now(), 
        status: finalStatus as any 
      };
      
      const { data, error } = await supabase.from('drawings').insert([newDrawing]).select();
      if (error) throw error;
      
      if (data) { 
        onUpload(data[0]); 
        soundEngine.play('success');
        if (isDraft) {
          onClose();
        } else if (!shouldAutoApprove) {
          setShowPendingMessage(true);
        } else {
          onClose(); 
        }
      }
    } catch (err: any) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  if (showPendingMessage) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative bg-neutral-900 p-12 rounded-[4rem] text-center space-y-8 max-w-md border border-white/10 shadow-3xl z-10"
        >
           <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
             <Check className="w-10 h-10 text-blue-500" />
           </div>
           <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Obra en Revisión</h3>
           <p className="text-white/60 text-sm leading-relaxed">
             Tu obra ha sido enviada exitosamente y actualmente se encuentra en estado <strong className="text-white">Pendiente</strong>. 
             Un administrador revisará tu dibujo para asegurarse de que cumple con nuestras políticas antes de ser aprobado y publicado en la galería comunitaria, o denegado si incumple las normas. 
             ¡Gracias por compartir tu arte con nosotros!
           </p>
           <button onClick={onClose} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all">
             Entendido
           </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[20px] cursor-pointer" />
      
      <AnimatePresence mode="wait">
        {step === 'policies' ? (
          <motion.div key="policies" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative w-full max-w-sm bg-black/80 border border-white/10 rounded-[3rem] p-12 text-center backdrop-blur-3xl shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20"><ShieldAlert className="w-8 h-8 text-blue-500" /></div>
            <h2 className="text-xl font-black text-white uppercase italic tracking-widest mb-6">Protocolo_De_Publicación</h2>
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-relaxed mb-10">
              {targetGallery === 'master' ? 'ESTÁS SUBIENDO A TU GALERÍA MAESTRA.' : 'ESTÁS SUBIENDO A LA COMUNIDAD PÚBLICA.'}
            </p>
            <button onClick={() => setStep('form')} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">Acceder al Terminal</button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.98, x: 15 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative w-full max-w-6xl bg-black/80 border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl backdrop-blur-[50px] flex flex-col md:flex-row h-[90vh]">
            <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`flex-1 bg-white/5 flex flex-col items-center justify-center relative ${isDragging ? 'bg-blue-600/10' : ''}`}>
              {(uploadType === 'url' ? imageUrl : previewUrl) ? (
                <div className="relative w-full h-full p-10 group">
                  <img src={uploadType === 'url' ? imageUrl : previewUrl} className="w-full h-full object-contain" alt="Preview" />
                  <button onClick={() => { setImageUrl(''); setPreviewUrl(''); setSelectedFile(null); }} className="absolute top-12 right-12 p-4 bg-red-600 rounded-full text-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"><X size={20} /></button>
                </div>
              ) : (
                <div onClick={() => uploadType === 'file' && fileInputRef.current?.click()} className="text-center cursor-pointer group p-20 border-2 border-dashed border-white/5 rounded-[3rem] hover:border-blue-500/20 transition-all">
                  <Upload className="w-20 h-20 mx-auto mb-6 text-white/20 group-hover:text-blue-500" />
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-white/20">Cargar Archivo Local</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
              )}
            </div>

            <div className="w-full md:w-[500px] p-12 border-l border-white/10 bg-black/40 flex flex-col justify-between">
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Sincronizar_Data</h2>
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${targetGallery === 'master' ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
                    {targetGallery === 'master' ? 'Galería_Maestra' : 'Comunidad'}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
                    <button onClick={() => setUploadType('file')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'file' ? 'bg-white text-black' : 'text-white/20'}`}>Archivo</button>
                    <button onClick={() => setUploadType('url')} className={`flex-1 py-4 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'url' ? 'bg-white text-black' : 'text-white/20'}`}>URL</button>
                  </div>

                  {uploadType === 'url' && (
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white font-mono" placeholder="URL_IMAGEN_HTTP..." />
                  )}

                  {targetGallery === 'master' && (
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white italic" placeholder="Título de la Obra..." />
                  )}

                  <div className="relative">
                    <textarea 
                      maxLength={250} value={description} onChange={(e) => setDescription(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-sm text-white h-48 resize-none italic leading-relaxed" 
                      placeholder="Descripción visual (Máx 250)..." 
                    />
                    <div className="absolute bottom-6 right-6 text-[10px] font-black text-white/20 uppercase tracking-widest">
                      {description.length} / 250
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                 <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
                    <AlertCircle className="text-blue-500" size={18} />
                    <p className="text-[10px] text-white/30 uppercase font-black leading-tight italic">Los cambios en descripciones son permanentes tras la publicación.</p>
                 </div>
                 <div className="flex gap-4">
                   <button onClick={(e) => handlePublish(e, true)} disabled={loading || (uploadType === 'url' ? !imageUrl : !selectedFile)} className="flex-1 py-8 bg-white/10 text-white border border-white/20 rounded-3xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white/20 transition-all disabled:opacity-20">
                      {loading ? '...' : 'Respaldar'}
                   </button>
                   <button onClick={(e) => handlePublish(e, false)} disabled={loading || (uploadType === 'url' ? !imageUrl : !selectedFile)} className="flex-1 py-8 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-blue-600 hover:text-white transition-all disabled:opacity-20">
                      {loading ? 'Cargando...' : 'Lanzar Obra'}
                   </button>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadModal;
