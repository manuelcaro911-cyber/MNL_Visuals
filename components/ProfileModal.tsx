
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Youtube, Music2, Instagram, Edit2, UserCircle, Upload, Link as LinkIcon } from 'lucide-react';
import { User, Drawing } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileModalProps {
  onClose: () => void;
  user: User;
  currentUser: User | null;
  allDrawings: Drawing[];
  onUpdate: (u: User) => void;
  themeStyles: any;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, user, currentUser, allDrawings, onUpdate, themeStyles }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user.username || '');
  const [editedBio, setEditedBio] = useState(user.bio || '');
  const [editedLinks, setEditedLinks] = useState(user.links || {});
  const [tempProfileUrl, setTempProfileUrl] = useState(user.profile_pic || '');
  const [tempBannerUrl, setTempBannerUrl] = useState(user.banner_url || '');
  
  const [showProfileUrlInput, setShowProfileUrlInput] = useState(false);
  const [showBannerUrlInput, setShowBannerUrlInput] = useState(false);
  
  const [uploadTypeProfile, setUploadTypeProfile] = useState<'url' | 'file'>('url');
  const [uploadTypeBanner, setUploadTypeBanner] = useState<'url' | 'file'>('url');
  
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRefProfile = useRef<HTMLInputElement>(null);
  const fileInputRefBanner = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?.id === user.id;
  const userDrawings = allDrawings.filter(d => {
    if (d.author_id !== user.id) return false;
    if (d.status === 'draft' && !isOwnProfile) return false;
    return true;
  });
  const isAdmin = useMemo(() => {
    const superAdminEmail = 'manuelcaro911@gmail.com';
    return user.email?.toLowerCase() === superAdminEmail.toLowerCase() || user.role === 'admin' || user.username === 'Manuel Caro' || user.username === 'MNL_Visuals';
  }, [user]);

  const handleSave = () => {
    if (!isOwnProfile) return;
    onUpdate({ 
      ...user, 
      username: editedUsername.trim() || user.username, 
      profile_pic: tempProfileUrl, 
      banner_url: tempBannerUrl,
      bio: editedBio.slice(0, 550), 
      links: editedLinks 
    });
    setIsEditing(false);
    setShowProfileUrlInput(false);
    setShowBannerUrlInput(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !isOwnProfile) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecciona una imagen válida.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}_${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('drawings').getPublicUrl(filePath);
      
      if (type === 'profile') {
        setTempProfileUrl(publicUrl);
        onUpdate({ ...user, profile_pic: publicUrl });
        setShowProfileUrlInput(false);
      } else {
        setTempBannerUrl(publicUrl);
        onUpdate({ ...user, banner_url: publicUrl });
        setShowBannerUrlInput(false);
      }
    } catch (error: any) {
      alert("Error al subir la imagen: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center">
      {/* Background layer no longer needs a backdrop blur click because it's full screen, but we'll keep a dark base */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full h-full bg-neutral-950 overflow-hidden flex flex-col"
      >
        <div className="flex-1 overflow-y-auto relative bg-neutral-950">
          {/* Banner Section - Absolute to sit behind content */}
          <div className="absolute top-0 left-0 w-full h-[380px] md:h-[480px] bg-neutral-900 z-0 overflow-hidden">
            {tempBannerUrl ? (
              <img src={tempBannerUrl} alt="Banner" className="w-full h-full object-cover blur-sm scale-110" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 blur-sm scale-110" />
            )}
            
            {/* Gradient fade at the bottom of the banner */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
          </div>

          {/* Close Button */}
          <button onClick={onClose} className="fixed top-8 left-8 p-4 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all border border-white/20 z-50 shadow-2xl">
            <X className="w-8 h-8" />
          </button>
          
          {/* Camera Button for Banner */}
          {isOwnProfile && (
            <button 
              onClick={() => setShowBannerUrlInput(!showBannerUrlInput)} 
              className="absolute top-12 right-12 p-4 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-all border border-white/20 z-20"
            >
              <Camera className="w-6 h-6" />
            </button>
          )}

          {/* Banner Upload Input */}
          {showBannerUrlInput && isOwnProfile && (
            <div className="absolute top-24 right-8 w-96 bg-black/80 backdrop-blur-xl p-6 rounded-2xl border border-white/20 z-30 shadow-2xl">
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-xl border border-white/10 mb-4">
                <button onClick={() => setUploadTypeBanner('file')} className={`flex-1 py-3 text-sm font-black uppercase rounded-lg transition-all ${uploadTypeBanner === 'file' ? 'bg-white text-black' : 'text-white/20'}`}>Archivo</button>
                <button onClick={() => setUploadTypeBanner('url')} className={`flex-1 py-3 text-sm font-black uppercase rounded-lg transition-all ${uploadTypeBanner === 'url' ? 'bg-white text-black' : 'text-white/20'}`}>URL</button>
              </div>
              {uploadTypeBanner === 'url' ? (
                <div className="space-y-4">
                  <input type="text" value={tempBannerUrl} onChange={(e) => setTempBannerUrl(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-base text-white focus:border-blue-500 outline-none" placeholder="URL del banner" />
                  <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-500">Guardar</button>
                </div>
              ) : (
                <div onClick={() => !isUploading && fileInputRefBanner.current?.click()} className={`w-full py-8 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'opacity-50' : 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10'}`}>
                  <Upload className="w-8 h-8 text-white/50" />
                  <span className="text-sm font-bold text-white/50">{isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}</span>
                  <input type="file" ref={fileInputRefBanner} onChange={(e) => handleFileChange(e, 'banner')} className="hidden" accept="image/*" />
                </div>
              )}
            </div>
          )}

          {/* Spacer to push content down over the absolute banner */}
          <div className="h-48 md:h-64 shrink-0 relative z-10" />

          <div className="px-6 md:px-12 pb-20 pt-16 relative z-10 flex flex-col items-center">
            
            {/* Top Container: Text/About Left, Profile Right */}
            <div className="w-full max-w-5xl flex flex-col-reverse lg:flex-row gap-12 lg:gap-24 mb-20 md:mb-32">
              
              {/* Left Column: About & Contact */}
              <div className="flex-1 flex flex-col justify-center space-y-12">
                {/* About Me Section */}
                <div className="space-y-6">
                  {/* Big Chip Header */}
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-12 py-3 md:py-4 shadow-xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wide">About me</h2>
                  </div>

                  <div className="pl-2">
                    {isEditing && isOwnProfile ? (
                      <div className="space-y-4">
                        <input type="text" value={editedUsername} onChange={e => setEditedUsername(e.target.value)} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white font-bold outline-none text-xl" placeholder="Username" />
                        <textarea value={editedBio} onChange={e => setEditedBio(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-light h-40 resize-none text-white outline-none leading-relaxed" placeholder="Tell us about yourself..." />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-primary font-medium text-white/90 text-xl md:text-2xl">Hi!</p>
                        <p className="font-medium text-white/90 text-xl md:text-2xl">My name is <span className="font-bold text-white">{user.username || 'Artist'}</span>{isAdmin ? ' (MAESTRO)' : ''}.</p>
                        <p className="text-white/70 text-lg md:text-xl leading-loose font-light whitespace-pre-wrap max-w-xl">
                          {user.bio || "Exploring the frontier between reality and the digital canvas."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="space-y-6 pl-2">
                  <h3 className="text-3xl font-bold text-white tracking-wide">Contact</h3>
                  
                  {isEditing && isOwnProfile ? (
                    <div className="space-y-4 max-w-md">
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Youtube className="w-3 h-3 text-white" /></div>
                        <input type="text" value={editedLinks.youtube || ''} onChange={e => setEditedLinks({...editedLinks, youtube: e.target.value})} className="bg-transparent border-none text-sm text-white w-full outline-none" placeholder="YouTube URL" />
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Instagram className="w-3 h-3 text-white" /></div>
                        <input type="text" value={editedLinks.instagram || ''} onChange={e => setEditedLinks({...editedLinks, instagram: e.target.value})} className="bg-transparent border-none text-sm text-white w-full outline-none" placeholder="Instagram URL" />
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"><Music2 className="w-3 h-3 text-white" /></div>
                        <input type="text" value={editedLinks.tiktok || ''} onChange={e => setEditedLinks({...editedLinks, tiktok: e.target.value})} className="bg-transparent border-none text-sm text-white w-full outline-none" placeholder="TikTok URL" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      {user.email && (
                         <div className="flex items-center gap-4 group">
                           <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-blue-600/30 group-hover:border-blue-500/50 flex items-center justify-center transition-all">
                             <span className="text-[10px] font-bold text-white">@</span>
                           </div>
                           <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">{user.email}</span>
                         </div>
                      )}
                      {user.links?.youtube && (
                        <a href={user.links.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-red-500/30 group-hover:border-red-500/50 flex items-center justify-center transition-all">
                            <Youtube className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">{new URL(user.links.youtube).hostname.replace('www.', '')}</span>
                        </a>
                      )}
                      {user.links?.instagram && (
                        <a href={user.links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-pink-500/30 group-hover:border-pink-500/50 flex items-center justify-center transition-all">
                            <Instagram className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">{new URL(user.links.instagram).hostname.replace('www.', '')}</span>
                        </a>
                      )}
                      {user.links?.tiktok && (
                        <a href={user.links.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/20 group-hover:border-white/50 flex items-center justify-center transition-all">
                            <Music2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors truncate">{new URL(user.links.tiktok).hostname.replace('www.', '')}</span>
                        </a>
                      )}
                    </div>
                  )}

                  {isOwnProfile && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="mt-8 px-8 py-3 bg-white/5 text-white border border-white/20 rounded-full font-bold text-xs hover:bg-white hover:text-black transition-all shadow-xl flex items-center gap-2">
                       <Edit2 className="w-3 h-3" /> Edit Profile
                    </button>
                  )}
                  {isOwnProfile && isEditing && (
                    <div className="flex gap-4 mt-8">
                       <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-xs hover:bg-blue-500 transition-all shadow-xl">Save</button>
                       <button onClick={() => setIsEditing(false)} className="px-8 py-3 bg-white/5 text-white border border-white/20 rounded-full font-bold text-xs hover:bg-white/10 transition-all">Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Profile Picture */}
              <div className="flex-1 flex justify-center lg:justify-end items-center relative">
                 {/* Decorative background lines/circles mimicking the image could be SVG here. Using CSS shapes for simplicity */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-[0.5px] border-white/10 rounded-full mix-blend-overlay pointer-events-none" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-[60%] w-[100%] h-[100%] border-[0.5px] border-blue-500/20 rounded-[40%] mix-blend-overlay pointer-events-none" />
                 
                 <div className="relative group w-64 h-80 md:w-80 md:h-[26rem] rounded-t-full rounded-b-[4rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-neutral-900 z-10">
                    {tempProfileUrl ? (
                      <img src={tempProfileUrl} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 flex items-center justify-center text-8xl font-black text-white/30">
                        {(editedUsername || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isOwnProfile && (
                      <button onClick={() => setShowProfileUrlInput(!showProfileUrlInput)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-8 h-8 mb-4 border border-white/30 rounded-full p-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Update Photo</span>
                      </button>
                    )}
                 </div>

                 {/* Stats Bubble */}
                 <div className="absolute -bottom-6 -left-6 md:left-0 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-4 md:p-6 rounded-3xl shadow-2xl flex gap-6 md:gap-8">
                    <div className="flex flex-col items-center">
                       <span className="text-2xl md:text-3xl font-black text-white">{user.followers?.length || 0}</span>
                       <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Followers</span>
                    </div>
                    <div className="w-[1px] bg-white/20" />
                    <div className="flex flex-col items-center">
                       <span className="text-2xl md:text-3xl font-black text-white">{userDrawings.length}</span>
                       <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Drawings</span>
                    </div>
                 </div>
              </div>
            </div>

            {/* Profile Picture Upload Input (Shown only when triggered) */}
            <AnimatePresence>
              {showProfileUrlInput && isOwnProfile && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full max-w-2xl overflow-hidden">
                  <div className="w-full mb-16 bg-white/5 p-8 rounded-3xl border border-white/10">
                    <h4 className="text-white font-bold text-lg mb-6">Actualizar Foto de Perfil</h4>
                    <div className="flex gap-2 p-1.5 bg-black/40 rounded-xl border border-white/10 mb-5">
                      <button onClick={() => setUploadTypeProfile('file')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${uploadTypeProfile === 'file' ? 'bg-white text-black' : 'text-white/20'}`}>Archivo</button>
                      <button onClick={() => setUploadTypeProfile('url')} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${uploadTypeProfile === 'url' ? 'bg-white text-black' : 'text-white/20'}`}>URL</button>
                    </div>
                    {uploadTypeProfile === 'url' ? (
                      <div className="space-y-4">
                        <input type="text" value={tempProfileUrl} onChange={(e) => setTempProfileUrl(e.target.value)} className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 outline-none" placeholder="URL de la imagen" />
                        <button onClick={handleSave} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500">Guardar Foto</button>
                      </div>
                    ) : (
                      <div onClick={() => !isUploading && fileInputRefProfile.current?.click()} className={`w-full py-8 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10'}`}>
                        <Upload className="w-8 h-8 text-white/50" />
                        <span className="text-sm font-bold text-white/50">{isUploading ? 'Subiendo...' : 'Seleccionar Imagen'}</span>
                        <input type="file" ref={fileInputRefProfile} onChange={(e) => handleFileChange(e, 'profile')} className="hidden" accept="image/*" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Area: Published Artworks Grid (Full Width Expansion style) */}
            <div className="w-full mt-12 pb-12 relative px-4 md:px-12">
                <div className="flex items-center gap-5 border-b border-white/10 pb-6 mb-12 max-w-5xl mx-auto">
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wide">Drawings</h3>
                </div>
                
                {userDrawings.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center opacity-40 space-y-4 text-white text-center">
                    <UserCircle className="w-16 h-16" />
                    <p className="text-sm font-medium tracking-wide">No published works yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full max-w-[1600px] mx-auto auto-rows-[250px]">
                    {userDrawings.map((drawing, i) => {
                      // Custom size assignment for random masonry-like appearance without JS calculation
                      const styleClass = 
                        i % 5 === 0 ? 'md:col-span-2 md:row-span-2' : 
                        i % 7 === 0 ? 'md:col-span-2 lg:col-span-3 hover:scale-[1.02]' : 
                        i % 3 === 0 ? 'md:row-span-2' : '';
                        
                      return (
                      <motion.div 
                        key={drawing.id} 
                        whileHover={{ y: -5 }}
                        className={`relative group rounded-[2rem] overflow-hidden border border-white/10 shadow-xl transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${styleClass}`}
                      >
                        <img src={drawing.image_url} className="w-full h-full block object-cover transition-all duration-700 group-hover:scale-110" alt="Work" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        
                        <div className="absolute inset-x-0 bottom-0 pt-20 pb-8 px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end pointer-events-none z-10">
                          <p className="text-2xl font-bold text-white mb-2 truncate drop-shadow-lg">{drawing.title || 'Dibujo'}</p>
                          <p className={`text-xs font-bold uppercase tracking-widest ${drawing.status === 'approved' ? 'text-green-400' : drawing.status === 'rejected' ? 'text-red-400' : drawing.status === 'draft' ? 'text-yellow-400' : 'text-blue-400'} drop-shadow-md`}>
                            {drawing.status === 'draft' ? 'Draft' : drawing.status}
                          </p>
                        </div>
                      </motion.div>
                    )})}
                  </div>
                )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
