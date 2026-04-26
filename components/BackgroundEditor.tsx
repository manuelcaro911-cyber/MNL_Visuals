
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Home, Layout, Image as ImageIconLucide, Palette, User, FileText, Settings2, Box, Circle, Link, Upload } from 'lucide-react';
import { SiteSettings } from '../types';
import { supabase } from '../lib/supabase';

interface BackgroundEditorProps {
  onClose: () => void;
  settings: SiteSettings;
  moduleTexts: Record<string, {title: string, desc: string}>;
  onUpdate: (s: Partial<SiteSettings> & { moduleTexts?: any }) => void;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({ onClose, settings, moduleTexts, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'modules' | 'gallery' | 'about' | 'content' | 'style' | 'enlaces'>('home');
  
  const [tempHomeBg, setTempHomeBg] = useState(settings.homeBg || '');
  const [tempModulesBg, setTempModulesBg] = useState(settings.modulesBg || '');
  const [tempGalleryBg, setTempGalleryBg] = useState(settings.galleryBg || '');
  const [tempAboutText, setTempAboutText] = useState(settings.aboutMeText || '');
  const [tempAboutImage, setTempAboutImage] = useState(settings.aboutMeImage || '');
  const [tempAboutBannerImage, setTempAboutBannerImage] = useState(settings.aboutMeBannerImage || '');
  const [tempTitle, setTempTitle] = useState(settings.homeTitle);
  const [tempBorderStyle, setTempBorderStyle] = useState<'rounded' | 'square'>(settings.borderStyle || 'rounded');
  const [tempTheme, setTempTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [tempOnboardingMessage, setTempOnboardingMessage] = useState(settings.onboardingMessage || '¡Bienvenido a StudioVisuals! Sigue al creador para no perderte ninguna de sus nuevas obras y actualizaciones.');
  const [tempCustomLinkUrl, setTempCustomLinkUrl] = useState(settings.customLinkUrl || '');
  const [tempCustomLinks, setTempCustomLinks] = useState<{title: string, url: string}[]>(settings.customLinks || []);
  const [tempHomeButtonText, setTempHomeButtonText] = useState(settings.homeButtonText || '');
  const [tempHomeButtonLink, setTempHomeButtonLink] = useState(settings.homeButtonLink || '');
  const [tempCommissionsLink, setTempCommissionsLink] = useState(settings.commissionsLink || '');
  
  const [editedModuleTexts, setEditedModuleTexts] = useState<any>({ ...moduleTexts });

  const [tempHomeBlur, setTempHomeBlur] = useState(settings.homeBlur);
  const [tempHomeGray, setTempHomeGray] = useState(settings.homeGray);
  const [tempModulesBlur, setTempModulesBlur] = useState(settings.modulesBlur);
  const [tempModulesGray, setTempModulesGray] = useState(settings.modulesGray);
  const [tempGalleryBlur, setTempGalleryBlur] = useState(settings.galleryBlur);
  const [tempGalleryGray, setTempGalleryGray] = useState(settings.galleryGray);

  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'home' | 'modules' | 'gallery' | 'about' | 'aboutBanner') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("Por favor, selecciona una imagen válida.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg_${target}_${Math.random()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;
      
      const { error: uploadError } = await supabase.storage.from('drawings').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('drawings').getPublicUrl(filePath);
      
      if (target === 'home') setTempHomeBg(publicUrl);
      else if (target === 'modules') setTempModulesBg(publicUrl);
      else if (target === 'gallery') setTempGalleryBg(publicUrl);
      else if (target === 'about') setTempAboutImage(publicUrl);
      else if (target === 'aboutBanner') setTempAboutBannerImage(publicUrl);
      
    } catch (error: any) {
      alert("Error al subir la imagen: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    await onUpdate({ 
      homeBg: tempHomeBg, modulesBg: tempModulesBg, galleryBg: tempGalleryBg, 
      aboutMeText: tempAboutText, aboutMeImage: tempAboutImage, aboutMeBannerImage: tempAboutBannerImage, homeTitle: tempTitle,
      homeBlur: tempHomeBlur, homeGray: tempHomeGray,
      modulesBlur: tempModulesBlur, modulesGray: tempModulesGray,
      galleryBlur: tempGalleryBlur, galleryGray: tempGalleryGray,
      moduleTexts: editedModuleTexts,
      borderStyle: tempBorderStyle,
      customLinkUrl: tempCustomLinkUrl,
      customLinks: tempCustomLinks,
      theme: tempTheme,
      onboardingMessage: tempOnboardingMessage,
      homeButtonText: tempHomeButtonText,
      homeButtonLink: tempHomeButtonLink,
      commissionsLink: tempCommissionsLink
    });
    onClose();
  };

  const TabButton = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl transition-all border ${activeTab === id ? 'bg-blue-600 text-white border-blue-500 shadow-xl' : 'bg-white/10 text-white/40 border-white/10 hover:bg-white/20'}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[6000] bg-black/40 backdrop-blur-sm overflow-hidden h-full w-full flex flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full h-full flex flex-col bg-black/60 shadow-[0_60px_120px_rgba(0,0,0,0.5)] backdrop-blur-[40px]"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 shrink-0">
          <h2 className="text-2xl font-black tracking-widest text-white uppercase italic">Configuración_Maestra</h2>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white text-white/60 hover:text-black transition-all rounded-full"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-14 py-8">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              <TabButton id="home" label="Inicio" icon={Home} />
              <TabButton id="modules" label="Módulos" icon={Layout} />
              <TabButton id="gallery" label="Galería" icon={ImageIconLucide} />
              <TabButton id="about" label="Bio" icon={User} />
              <TabButton id="content" label="Textos" icon={FileText} />
              <TabButton id="style" label="Estilo" icon={Settings2} />
              <TabButton id="enlaces" label="Enlaces" icon={Link} />
            </div>

            <div className="space-y-8">
            {activeTab === 'style' ? (
              <div className="space-y-12">
                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 text-center">
                   <h3 className="text-base font-black text-white uppercase tracking-[0.4em] italic">Arquitectura Global de Bordes</h3>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest italic leading-relaxed">Define la personalidad del sitio: vanguardia orgánica (curvo) o minimalismo estructural (recto).</p>
                   
                   <div className="grid grid-cols-2 gap-6">
                     <button 
                       onClick={() => setTempBorderStyle('rounded')}
                       className={`p-12 border-2 rounded-[2rem] flex flex-col items-center gap-5 transition-all ${tempBorderStyle === 'rounded' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                     >
                        <Circle className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">Bordes Curvos</span>
                     </button>
                     <button 
                       onClick={() => setTempBorderStyle('square')}
                       className={`p-12 border-2 rounded-none flex flex-col items-center gap-5 transition-all ${tempBorderStyle === 'square' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                     >
                        <Box className="w-12 h-12" />
                        <span className="text-xs font-black uppercase tracking-widest">Esquinas Rectas</span>
                     </button>
                   </div>
                </div>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 text-center">
                   <h3 className="text-base font-black text-white uppercase tracking-[0.4em] italic">Tema del Sitio</h3>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest italic leading-relaxed">Elige entre el clásico modo oscuro o el nuevo modo claro.</p>
                   
                   <div className="grid grid-cols-2 gap-6">
                     <button 
                       onClick={() => setTempTheme('dark')}
                       className={`p-12 border-2 rounded-[2rem] flex flex-col items-center gap-5 transition-all ${tempTheme === 'dark' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                     >
                        <div className="w-12 h-12 rounded-full bg-black border border-white/20" />
                        <span className="text-xs font-black uppercase tracking-widest">Modo Oscuro</span>
                     </button>
                     <button 
                       onClick={() => setTempTheme('light')}
                       className={`p-12 border-2 rounded-[2rem] flex flex-col items-center gap-5 transition-all ${tempTheme === 'light' ? 'bg-white text-black border-white shadow-2xl scale-105' : 'bg-white/5 border-white/10 text-white/30 hover:bg-white/10'}`}
                     >
                        <div className="w-12 h-12 rounded-full bg-white border border-black/20" />
                        <span className="text-xs font-black uppercase tracking-widest">Modo Claro</span>
                     </button>
                   </div>
                </div>
              </div>
            ) : activeTab === 'content' ? (
              <div className="space-y-10">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-5">
                  <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] italic">MENSAJE_DE_BIENVENIDA</p>
                  <textarea 
                    value={tempOnboardingMessage} 
                    onChange={(e) => setTempOnboardingMessage(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white italic resize-none" placeholder="Mensaje para nuevos usuarios..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {Object.entries(editedModuleTexts).map(([id, data]: [string, any]) => (
                    <div key={id} className="bg-white/5 p-8 rounded-[2rem] border border-white/5 space-y-5">
                      <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] italic">{id.toUpperCase()}_MODULE</p>
                      <input 
                        type="text" value={data.title} 
                        onChange={(e) => setEditedModuleTexts({...editedModuleTexts, [id]: {...data, title: e.target.value}})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white italic" placeholder="Título..."
                      />
                      <input 
                        type="text" value={data.desc} 
                        onChange={(e) => setEditedModuleTexts({...editedModuleTexts, [id]: {...data, desc: e.target.value}})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-xs text-white/40" placeholder="Subtítulo..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'about' ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-4 italic">Foto de Perfil</label>
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-3">
                    <button onClick={() => setUploadType('file')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'file' ? 'bg-white text-black' : 'text-white/20'}`}>Archivo</button>
                    <button onClick={() => setUploadType('url')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'url' ? 'bg-white text-black' : 'text-white/20'}`}>URL</button>
                  </div>
                  
                  {uploadType === 'url' ? (
                    <div className="relative">
                      <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input 
                        type="text" 
                        value={tempAboutImage} 
                        onChange={(e) => setTempAboutImage(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                        placeholder="https://ejemplo.com/foto.jpg" 
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => !isUploading && fileInputRef.current?.click()} 
                      className={`w-full py-6 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10'}`}
                    >
                      <Upload className="w-6 h-6 text-white/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'about')} className="hidden" accept="image/*" />
                    </div>
                  )}
                  {tempAboutImage && (
                    <div className="mt-6 space-y-4">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 relative bg-black/50 mx-auto group">
                        <img 
                          src={tempAboutImage} 
                          alt="Vista Previa Bio" 
                          className="w-full h-full object-cover transition-all"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/200/200';
                          }}
                        />
                      </div>
                      <a 
                        href={tempAboutImage} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all"
                      >
                        <Link className="w-4 h-4" />
                        Ver Imagen
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-4 italic">Banner Superior (Bio)</label>
                  <div className="relative">
                    <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input 
                      type="text" 
                      value={tempAboutBannerImage} 
                      onChange={(e) => setTempAboutBannerImage(e.target.value)} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-3" 
                      placeholder="https://ejemplo.com/banner.jpg" 
                    />
                  </div>
                  <div 
                    onClick={() => !isUploading && document.getElementById('banner-upload')?.click()} 
                    className={`w-full py-6 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10'}`}
                  >
                    <Upload className="w-6 h-6 text-white/50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{isUploading ? 'Subiendo...' : 'Subir Banner Archivo'}</span>
                    <input id="banner-upload" type="file" onChange={(e) => handleFileChange(e, 'aboutBanner')} className="hidden" accept="image/*" />
                  </div>
                  {tempAboutBannerImage && (
                    <div className="mt-6 w-full h-32 rounded-2xl overflow-hidden border-2 border-white/20 relative bg-black/50">
                       <img src={tempAboutBannerImage} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <textarea value={tempAboutText} onChange={(e) => setTempAboutText(e.target.value)} className="w-full h-56 bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-sm text-white italic resize-none" placeholder="Biografía..." />
              </div>
            ) : activeTab === 'enlaces' ? (
              <div className="space-y-8">
                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 text-center">
                   <h3 className="text-base font-black text-white uppercase tracking-[0.4em] italic">Enlaces Personalizados</h3>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest italic leading-relaxed">Configura hasta 7 enlaces para el módulo "Enlaces".</p>
                   
                   <div className="space-y-5">
                     {tempCustomLinks.map((link, index) => (
                       <div key={index} className="flex gap-3 items-center">
                         <input 
                           type="text" 
                           value={link.title} 
                           onChange={(e) => {
                             const newLinks = [...tempCustomLinks];
                             newLinks[index].title = e.target.value;
                             setTempCustomLinks(newLinks);
                           }} 
                           className="w-1/3 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white italic" 
                           placeholder="Título (ej. YouTube)" 
                         />
                         <input 
                           type="text" 
                           value={link.url} 
                           onChange={(e) => {
                             const newLinks = [...tempCustomLinks];
                             newLinks[index].url = e.target.value;
                             setTempCustomLinks(newLinks);
                           }} 
                           className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white font-mono" 
                           placeholder="https://ejemplo.com" 
                         />
                         <button 
                           onClick={() => setTempCustomLinks(tempCustomLinks.filter((_, i) => i !== index))}
                           className="p-4 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                         >
                           <X className="w-5 h-5" />
                         </button>
                       </div>
                     ))}
                     {tempCustomLinks.length < 7 && (
                       <button 
                         onClick={() => setTempCustomLinks([...tempCustomLinks, { title: '', url: '' }])}
                         className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
                       >
                         + Agregar Enlace ({tempCustomLinks.length}/7)
                       </button>
                     )}
                   </div>
                </div>
                
                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 text-center">
                   <h3 className="text-base font-black text-white uppercase tracking-[0.4em] italic">Botón de Inicio</h3>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest italic leading-relaxed">Configura el botón que aparece debajo de los likes en la pantalla principal.</p>
                   <div className="space-y-5">
                     <input 
                       type="text" 
                       value={tempHomeButtonText} 
                       onChange={(e) => setTempHomeButtonText(e.target.value)} 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white italic" 
                       placeholder="Texto del botón (ej. Mi Portafolio)" 
                     />
                     <input 
                       type="text" 
                       value={tempHomeButtonLink} 
                       onChange={(e) => setTempHomeButtonLink(e.target.value)} 
                       className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white font-mono" 
                       placeholder="URL (ej. https://ejemplo.com)" 
                     />
                   </div>
                </div>

                <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-8 text-center">
                   <h3 className="text-base font-black text-white uppercase tracking-[0.4em] italic">Enlace de Comisiones</h3>
                   <p className="text-xs text-white/30 uppercase font-black tracking-widest italic leading-relaxed">Si dejas esto vacío, se mostrará un aviso de que las comisiones no están disponibles.</p>
                   <input 
                     type="text" 
                     value={tempCommissionsLink} 
                     onChange={(e) => setTempCommissionsLink(e.target.value)} 
                     className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white font-mono" 
                     placeholder="URL de Comisiones (ej. https://fiverr.com/...)" 
                   />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-4 italic">Imagen (Wallpaper {activeTab.toUpperCase()})</label>
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-3">
                    <button onClick={() => setUploadType('file')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'file' ? 'bg-white text-black' : 'text-white/20'}`}>Archivo</button>
                    <button onClick={() => setUploadType('url')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${uploadType === 'url' ? 'bg-white text-black' : 'text-white/20'}`}>URL</button>
                  </div>

                  {uploadType === 'url' ? (
                    <div className="relative">
                      <Link className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input 
                        type="text" 
                        value={activeTab === 'home' ? tempHomeBg : activeTab === 'modules' ? tempModulesBg : tempGalleryBg} 
                        onChange={(e) => activeTab === 'home' ? setTempHomeBg(e.target.value) : activeTab === 'modules' ? setTempModulesBg(e.target.value) : setTempGalleryBg(e.target.value)} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-8 py-5 text-sm text-white font-mono focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                      />
                    </div>
                  ) : (
                    <div 
                      onClick={() => !isUploading && fileInputRef.current?.click()} 
                      className={`w-full py-6 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/10'}`}
                    >
                      <Upload className="w-6 h-6 text-white/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{isUploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                      <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, activeTab as 'home' | 'modules' | 'gallery')} className="hidden" accept="image/*" />
                    </div>
                  )}
                  
                  {/* Vista Previa en Tiempo Real */}
                  {(activeTab === 'home' ? tempHomeBg : activeTab === 'modules' ? tempModulesBg : tempGalleryBg) && (
                    <div className="mt-6 space-y-4">
                      <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 relative bg-black/50 group">
                        <img 
                          src={activeTab === 'home' ? tempHomeBg : activeTab === 'modules' ? tempModulesBg : tempGalleryBg} 
                          alt="Vista Previa Wallpaper" 
                          className="w-full h-full object-cover transition-all"
                          style={{
                            filter: `blur(${activeTab === 'home' ? tempHomeBlur : activeTab === 'modules' ? tempModulesBlur : tempGalleryBlur}px) grayscale(${activeTab === 'home' ? tempHomeGray : activeTab === 'modules' ? tempModulesGray : tempGalleryGray}%)`
                          }}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/1920/1080?blur=10';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-black uppercase tracking-widest bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
                            Vista Previa en Tiempo Real
                          </span>
                        </div>
                      </div>
                      <a 
                        href={activeTab === 'home' ? tempHomeBg : activeTab === 'modules' ? tempModulesBg : tempGalleryBg} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-all"
                      >
                        <Link className="w-4 h-4" />
                        Abrir Enlace Original
                      </a>
                    </div>
                  )}
                </div>
                {activeTab === 'home' && (
                   <input type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm text-white italic mt-6" placeholder="Título de la Web..." />
                )}
                
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-4 italic">Desenfoque (Blur)</label>
                    <input type="range" min="0" max="50" value={activeTab === 'home' ? tempHomeBlur : activeTab === 'modules' ? tempModulesBlur : tempGalleryBlur} onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (activeTab === 'home') setTempHomeBlur(val);
                      else if (activeTab === 'modules') setTempModulesBlur(val);
                      else setTempGalleryBlur(val);
                    }} className="w-full accent-blue-500" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black text-white/40 tracking-widest ml-4 italic">Escala de Grises</label>
                    <input type="range" min="0" max="100" value={activeTab === 'home' ? tempHomeGray : activeTab === 'modules' ? tempModulesGray : tempGalleryGray} onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (activeTab === 'home') setTempHomeGray(val);
                      else if (activeTab === 'modules') setTempModulesGray(val);
                      else setTempGalleryGray(val);
                    }} className="w-full accent-blue-500" />
                  </div>
                </div>
              </div>
            )}
            
            <button onClick={handleSave} className="w-full py-10 bg-white text-black text-sm tracking-[0.8em] uppercase font-black rounded-full shadow-2xl hover:bg-blue-600 hover:text-white transition-all mt-12 mb-12">
              Sincronizar Datos Permanentemente
            </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BackgroundEditor;
