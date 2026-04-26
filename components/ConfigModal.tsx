
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Moon, Sun, Monitor, LogOut, Layout, Shield, Palette,
  Users, Volume2, VolumeX, CheckCircle2, XCircle, Info, Lock
} from 'lucide-react';
import { ThemeMode, User as UserType, Drawing } from '../types';
import { soundEngine } from '../lib/sounds';

interface ConfigModalProps {
  onClose: () => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  currentUser: UserType | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenProfile: (userId?: string) => void;
  allUsers?: UserType[];
  allDrawings?: Drawing[];
  onModerate?: (id: string, status: 'approved' | 'rejected', reason?: string) => void;
  onBlockUser?: (id: string, blocked: boolean) => void;
  themeStyles: any;
  soundsEnabled?: boolean;
  onToggleSounds?: (val: boolean) => void;
  recommendedUsers?: string[];
  onUpdateRecommendedUsers?: (users: string[]) => void;
  moduleStates?: { [key: string]: boolean };
  onUpdateModuleStates?: (states: { [key: string]: boolean }) => void;
}

const ConfigModal: React.FC<ConfigModalProps> = ({ 
  onClose, theme, setTheme, currentUser, onLogout, allDrawings = [], allUsers = [], soundsEnabled, onToggleSounds, onModerate, onBlockUser, onOpenProfile, recommendedUsers = [], onUpdateRecommendedUsers, moduleStates = {}, onUpdateModuleStates
}) => {
  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || ['MNL_Visuals', 'Manuel Caro'].includes(currentUser.username);
  }, [currentUser]);

  const [activeSection, setActiveSection] = useState<'system' | 're-apro' | 'admin' | 'rejected' | 'users' | 'social' | 'modules'>('system');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});

  const pendingDrawings = useMemo(() => allDrawings.filter(d => d.status === 'pending'), [allDrawings]);
  const rejectedDrawings = useMemo(() => allDrawings.filter(d => d.status === 'rejected'), [allDrawings]);
  const mySubmissions = useMemo(() => 
    allDrawings.filter(d => d.author_id === currentUser?.id), 
  [allDrawings, currentUser]);

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 md:p-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[25px] cursor-pointer" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-full max-w-7xl bg-black/70 border border-white/10 rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.6)] backdrop-blur-[60px] flex flex-col md:flex-row h-[90vh] overflow-hidden"
      >
        <div className="w-full md:w-80 border-r border-white/10 bg-white/5 p-10 flex flex-col justify-between">
          <div className="space-y-12">
            <div className="px-4">
              <h2 className="text-2xl font-black tracking-widest text-white uppercase italic">SISTEMA_PRO</h2>
              <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-3" />
            </div>

            <nav className="flex flex-col gap-3">
              {[
                { id: 'system', icon: <Layout />, label: 'Consola' },
                { id: 're-apro', icon: <Info />, label: 'RE/apro', hidden: !currentUser },
                { id: 'admin', icon: <Shield />, label: 'Moderación', hidden: !isAdmin, badge: pendingDrawings.length > 0 },
                { id: 'modules', icon: <Monitor />, label: 'Módulos', hidden: !isAdmin },
                { id: 'rejected', icon: <XCircle />, label: 'No Aprobados', hidden: !isAdmin },
                { id: 'users', icon: <Users />, label: 'Auditoría', hidden: !isAdmin },
                { id: 'social', icon: <Users />, label: 'Recomendados', hidden: !isAdmin }
              ].map(section => !section.hidden && (
                <button 
                  key={section.id}
                  onClick={() => { soundEngine.play('click'); setActiveSection(section.id as any); }}
                  className={`flex items-center gap-4 px-6 py-5 rounded-2xl transition-all relative ${activeSection === section.id ? 'bg-blue-600 text-white shadow-xl' : 'text-white/30 hover:bg-white/10 hover:text-white'}`}
                >
                  {React.cloneElement(section.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                  <span className="text-xs font-black uppercase tracking-widest">{section.label}</span>
                  {section.badge && <div className="absolute right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
                </button>
              ))}
            </nav>
          </div>
          <div className="pt-10 border-t border-white/10 px-4">
            {currentUser && (
              <button onClick={onLogout} className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">
                <span>Cerrar Conexión</span>
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-black/30">
          <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${currentUser ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-white/40">Terminal_ID: {activeSection.toUpperCase()}</span>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white text-white/40 hover:text-black transition-all rounded-full border border-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-12">
            <AnimatePresence mode="wait">
              {activeSection === 'system' && (
                <motion.div key="system" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-16">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {soundsEnabled ? <Volume2 className="text-blue-500 w-8 h-8" /> : <VolumeX className="text-white/20 w-8 h-8" />}
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Sistemas de Audio</h3>
                        <p className="text-xs font-black text-white/20 uppercase tracking-widest mt-1">Interfaz Háptica Visual</p>
                      </div>
                    </div>
                    <button onClick={() => onToggleSounds?.(!soundsEnabled)} className={`w-16 h-10 rounded-full transition-all flex items-center p-1.5 ${soundsEnabled ? 'bg-blue-600' : 'bg-white/10'}`}>
                      <div className={`w-7 h-7 rounded-full bg-white shadow-xl transform transition-transform ${soundsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {['black', 'white', 'combined'].map((t) => (
                      <button key={t} onClick={() => setTheme(t as ThemeMode)} className={`p-12 border-2 flex flex-col items-center gap-6 transition-all rounded-[2.5rem] ${theme === t ? 'bg-white text-black border-white scale-105 shadow-2xl' : 'bg-white/5 border-white/10 text-white/30 hover:border-white/40'}`}>
                        {t === 'black' ? <Moon className="w-8 h-8" /> : t === 'white' ? <Sun className="w-8 h-8" /> : <Monitor className="w-8 h-8" />}
                        <span className="text-xs font-black uppercase tracking-widest">{t.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 're-apro' && (
                <motion.div key="re-apro" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Monitorización de Sincronía</h3>
                  {mySubmissions.length === 0 ? (
                    <div className="p-20 text-center border border-dashed border-white/10 rounded-[3rem] text-white/20 italic font-light text-lg">Sin transmisiones registradas en el servidor.</div>
                  ) : (
                    <div className="grid gap-6">
                      {mySubmissions.map(d => (
                        <div key={d.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-8 group">
                          <img src={d.image_url} className="w-32 h-32 rounded-2xl object-cover grayscale transition-all group-hover:grayscale-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {d.status === 'approved' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : d.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-500" /> : <Info className="w-5 h-5 text-blue-500" />}
                              <span className={`text-xs font-black uppercase tracking-widest ${d.status === 'approved' ? 'text-green-500' : d.status === 'rejected' ? 'text-red-500' : 'text-blue-500'}`}>{d.status?.toUpperCase()}</span>
                            </div>
                            {d.status === 'approved' && <p className="text-2xl font-black text-white italic shimmer-text leading-tight">Felicidades, tu dibujo fue aceptado</p>}
                            {d.status === 'rejected' && <div className="space-y-2"><p className="text-xs text-white/30 uppercase font-black">Feedback del Director:</p><p className="text-white/80 italic text-base border-l-2 border-red-500/30 pl-4">"{d.rejection_reason || 'Sin razón especificada'}"</p></div>}
                            {d.status === 'pending' && <p className="text-white/40 text-xs uppercase font-black tracking-widest animate-pulse">Analizando composición visual...</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'admin' && isAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Consola de Moderación ({pendingDrawings.length})</h3>
                  {pendingDrawings.length === 0 ? (
                    <div className="p-20 text-center border border-dashed border-white/10 rounded-[3rem] text-white/20 italic text-lg">Base de datos de envíos limpia.</div>
                  ) : (
                    <div className="grid gap-8">
                      {pendingDrawings.map(d => (
                        <div key={d.id} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-10 opacity-10"><Shield className="w-32 h-32" /></div>
                          <div className="flex gap-10 items-start relative z-10 flex-col md:flex-row">
                            <img src={d.image_url} className="w-full md:w-64 h-64 rounded-[2rem] object-cover shadow-2xl border border-white/5" />
                            <div className="flex-1 space-y-6 w-full">
                              <div>
                                <p className="text-sm font-black text-blue-500 uppercase tracking-[0.2em] mb-3 italic cursor-pointer hover:underline" onClick={() => { onClose(); onOpenProfile(d.author_id); }}>Emisor: {d.author}</p>
                                <p className="text-white/80 font-light italic text-base leading-relaxed bg-black/20 p-6 rounded-2xl border border-white/5">"{d.description}"</p>
                              </div>
                              <textarea 
                                placeholder="Escribe el motivo del rechazo para notificar al artista..." 
                                value={rejectionReason[d.id] || ''}
                                onChange={(e) => setRejectionReason({...rejectionReason, [d.id]: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white italic resize-none focus:border-blue-500 transition-all h-32 outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-4 relative z-10">
                            <button onClick={() => onModerate?.(d.id, 'approved')} className="flex-1 py-6 bg-green-600/10 text-green-500 border border-green-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all shadow-lg">Validar y Publicar</button>
                            <button onClick={() => onModerate?.(d.id, 'rejected', rejectionReason[d.id])} className="flex-1 py-6 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Eliminar / Rechazar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'rejected' && isAdmin && (
                <motion.div key="rejected" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Obras No Aprobadas ({rejectedDrawings.length})</h3>
                  {rejectedDrawings.length === 0 ? (
                    <div className="p-20 text-center border border-dashed border-white/10 rounded-[3rem] text-white/20 italic text-lg">No hay obras rechazadas.</div>
                  ) : (
                    <div className="grid gap-6">
                      {rejectedDrawings.map(d => (
                        <div key={d.id} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-8 group">
                          <img src={d.image_url} className="w-32 h-32 rounded-2xl object-cover grayscale transition-all group-hover:grayscale-0" />
                          <div className="flex-1">
                            <p className="text-sm font-black text-red-500 uppercase tracking-[0.2em] mb-3 italic cursor-pointer hover:underline" onClick={() => { onClose(); onOpenProfile(d.author_id); }}>Emisor: {d.author}</p>
                            <div className="space-y-2">
                              <p className="text-xs text-white/30 uppercase font-black">Motivo de rechazo:</p>
                              <p className="text-white/80 italic text-base border-l-2 border-red-500/30 pl-4">"{d.rejection_reason || 'Sin razón especificada'}"</p>
                            </div>
                          </div>
                          <button onClick={() => onModerate?.(d.id, 'approved')} className="px-8 py-4 bg-green-600/10 text-green-500 border border-green-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">
                            Aprobar ahora
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'modules' && isAdmin && (
                <motion.div key="modules" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Control Principal de Módulos</h3>
                  <p className="text-xs text-white/50 leading-relaxed mb-6">Activa o desactiva las secciones de tu sitio web. Los módulos inactivos se mostrarán pero estarán bloqueados con un aviso de mantenimiento o desarrollo para los usuarios. Esto no te bloquea de modificarlos desde la base o previsualizarlos.</p>
                  
                  <div className="grid gap-4">
                    {[
                      { id: 'about', title: 'Sobre Mi', desc: 'Historia_Behind_The_Art.' },
                      { id: 'community', title: 'Comunidad', desc: 'Sincronización_Seguidores.' },
                      { id: 'masterworks', title: 'Mi Galería', desc: 'Master_Works_Collection.' },
                      { id: 'whiteboard', title: 'Pizarra', desc: 'Visual_Lab_Experiment.' },
                      { id: 'commissions', title: 'Comisiones', desc: 'Request_Custom_Arte.' },
                      { id: 'social', title: 'Red Social', desc: 'Digital_Ecosystem_Links.' }
                    ].map(mod => {
                      const isActive = moduleStates[mod.id] !== false;
                      const toggleModule = () => {
                        const nextStates = { ...moduleStates, [mod.id]: !isActive };
                        onUpdateModuleStates?.(nextStates);
                      };
                      return (
                        <div key={mod.id} className={`p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all ${!isActive ? 'opacity-50 grayscale' : ''}`}>
                          <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black border shadow-inner text-xl ${isActive ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                              <Monitor className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className={`text-base font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/40 line-through'}`}>{mod.title}</h4>
                              <p className="text-[10px] text-white/40 tracking-widest uppercase italic">{mod.desc}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3 pr-6">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">{isActive ? 'ON' : 'OFF'}</span>
                              <button 
                                onClick={toggleModule}
                                className={`w-14 h-7 rounded-full transition-all flex items-center p-1 ${isActive ? 'bg-blue-600' : 'bg-white/20'}`}
                              >
                                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isActive ? 'translate-x-7' : 'translate-x-0'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeSection === 'users' && isAdmin && (
                <motion.div key="users" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                   <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Maestro de Credenciales ({allUsers.length})</h3>
                   <div className="grid gap-4">
                     {allUsers.map(user => (
                       <div key={user.id} className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all relative overflow-hidden">
                         <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black border border-blue-500/20 shadow-inner text-xl">
                             {user.profile_pic ? <img src={user.profile_pic} className="w-full h-full rounded-2xl object-cover" /> : (user.username || 'U')[0]}
                           </div>
                           <div className="space-y-1">
                             <h4 className="text-white font-black text-base uppercase tracking-widest cursor-pointer hover:underline" onClick={() => { onClose(); onOpenProfile(user.id); }}>{user.username}</h4>
                             <p className="text-xs text-white/30 font-mono italic">{user.email}</p>
                           </div>
                         </div>
                         
                         <div className="flex flex-col items-end gap-3 pr-6">
                           <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Bloqueo</span>
                             <button 
                               onClick={() => onBlockUser?.(user.id, !user.is_blocked)}
                               className={`w-12 h-6 rounded-full transition-all flex items-center p-1 ${user.is_blocked ? 'bg-red-600' : 'bg-green-500'}`}
                             >
                               <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${user.is_blocked ? 'translate-x-6' : 'translate-x-0'}`} />
                             </button>
                           </div>
                           <div className="relative group/pass cursor-help mt-2">
                              <div className="flex items-center gap-3 px-6 py-3 bg-black/40 border border-white/5 rounded-2xl transition-all group-hover/pass:border-blue-500/50">
                                <Lock className="w-4 h-4 text-blue-500/40" />
                                <span className="text-xs font-mono text-blue-500 transition-all blur-lg group-hover/pass:blur-0 select-text font-bold">
                                  {user.password || 'Sin Clave'}
                                </span>
                              </div>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                </motion.div>
              )}
              {activeSection === 'social' && isAdmin && (
                <motion.div key="social" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="space-y-8">
                   <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white/40 italic">Usuarios Recomendados</h3>
                   <p className="text-xs text-white/50">Selecciona los usuarios que aparecerán en la sección de Red Social.</p>
                   <div className="grid gap-4">
                     {allUsers.map(user => {
                       const isRecommended = recommendedUsers.includes(user.id);
                       return (
                         <div key={user.id} className="p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/10 transition-all relative overflow-hidden">
                           <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-black border border-blue-500/20 shadow-inner text-xl">
                               {user.profile_pic ? <img src={user.profile_pic} className="w-full h-full rounded-2xl object-cover" /> : (user.username || 'U')[0]}
                             </div>
                             <div className="space-y-1">
                               <h4 className="text-white font-black text-base uppercase tracking-widest cursor-pointer hover:underline" onClick={() => { onClose(); onOpenProfile(user.id); }}>{user.username}</h4>
                               <p className="text-xs text-white/30 font-mono italic">{user.email}</p>
                             </div>
                           </div>
                           
                           <div className="flex flex-col items-end gap-3 pr-6">
                             <button 
                               onClick={() => {
                                 if (isRecommended) {
                                   onUpdateRecommendedUsers?.(recommendedUsers.filter(id => id !== user.id));
                                 } else {
                                   onUpdateRecommendedUsers?.([...recommendedUsers, user.id]);
                                 }
                               }}
                               className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRecommended ? 'bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' : 'bg-green-600/10 text-green-500 border border-green-500/20 hover:bg-green-600 hover:text-white'}`}
                             >
                               {isRecommended ? 'Quitar' : 'Añadir'}
                             </button>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfigModal;
