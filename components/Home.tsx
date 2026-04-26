
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Palette, Image as ImageIcon, Sparkles, Globe } from 'lucide-react';

interface HomeProps {
  onStart: () => void;
  themeStyles: any;
  customTitle?: string;
  likes: number;
  onLike: () => void;
  hasLiked?: boolean;
  homeButtonText?: string;
  homeButtonLink?: string;
}

const Home: React.FC<HomeProps> = ({ onStart, themeStyles, customTitle, likes, onLike, hasLiked, homeButtonText, homeButtonLink }) => {
  const [vibeActive, setVibeActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLikeClick = () => {
    if (hasLiked) return;
    onLike();
    setVibeActive(true);
    setTimeout(() => setVibeActive(false), 1000);
  };

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStart();
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-transparent"
    >
      <AnimatePresence mode="wait">
        {isStarting && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl"
          >
            <div className="flex gap-4 sm:gap-6 lg:gap-8 mb-12">
              {['M', 'N', 'L'].map((letter, i) => (
                <motion.div 
                  key={letter}
                  initial={{ y: 0, opacity: 0 }} 
                  animate={{ y: [-5, 5, -5], opacity: 1 }} 
                  transition={{ 
                    y: { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 },
                    opacity: { duration: 0.5, delay: i * 0.1 }
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl shadow-xl"
                >
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-white tracking-widest">{letter}</span>
                </motion.div>
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-white/50 font-medium uppercase tracking-[0.8em] text-[10px] flex items-center gap-6"
            >
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/30" />
              Initializing
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/30" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full px-6 flex flex-col items-center justify-center h-full">
        {/* Elegant Minimal Card */}
        <motion.div
           initial={{ y: 30, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
           className="relative p-10 md:p-16 lg:p-20 rounded-[2.5rem] bg-white/[0.015] backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center max-w-[600px] w-full"
        >
            {/* Fine reflection Lines */}
            <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
            <div className="absolute bottom-0 left-20 right-20 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />

            {/* Top Detail */}
            <div className="px-5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] flex items-center gap-3 mb-10 shadow-inner">
               <Sparkles className="w-3.5 h-3.5 text-yellow-400/80" />
               <span className="text-[9px] md:text-[10px] uppercase tracking-[0.4em] text-white/70 font-medium">Digital Art Gallery</span>
            </div>

            {/* Typography */}
            <div className="text-center group cursor-default">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extralight text-white leading-none tracking-tighter transition-all duration-700">
                {customTitle ? customTitle.split(' ')[0] : 'STUDIO'}
                <br />
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{customTitle ? customTitle.split(' ').slice(1).join(' ') : 'VISUALS'}</span>
              </h1>
            </div>

            <div className="w-16 h-[1px] bg-white/10 my-10" />

            {/* Modern Call to Action */}
            <button
               onClick={handleStart}
               className="group relative px-12 py-4 bg-white text-black rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
            >
               <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
               <span className="relative z-10 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em]">
                 Iniciar Experiencia
               </span>
            </button>

            {/* Floating Detail Badge (MNL) */}
            <motion.div
               animate={{ y: [-4, 4, -4] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -bottom-5 right-8 md:-bottom-6 md:-right-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl"
            >
               <span className="text-white/90 text-[9px] md:text-[10px] font-mono tracking-[0.4em] font-black uppercase">
                 MNL Visuals
               </span>
            </motion.div>
        </motion.div>
      </div>

      {/* Like a la derecha inferior con brillo reactivo */}
      <div className="absolute bottom-12 right-12 z-20">
        <div className="flex flex-col items-end gap-4">
          <button 
            onClick={() => setShowPrivacy(true)}
            className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/5 rounded-[1rem] text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] mb-2"
          >
            Políticas de Privacidad
          </button>
          
          <div className="flex items-center gap-5 bg-white/[0.03] backdrop-blur-2xl border border-white/5 p-2 pr-6 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] group relative overflow-hidden transition-all hover:bg-white/[0.05]">
            <motion.button 
              onClick={handleLikeClick}
              disabled={hasLiked}
              whileHover={!hasLiked ? { scale: 1.05 } : {}} 
              whileTap={!hasLiked ? { scale: 0.95 } : {}}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 relative z-10 ${hasLiked ? 'bg-white/10' : 'bg-transparent'}`}
            >
              <Heart strokeWidth={hasLiked ? 0 : 1} className={`w-5 h-5 transition-colors duration-500 ${hasLiked || vibeActive ? 'text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/40 group-hover:text-white/80'}`} />
            </motion.button>
            <div className="flex flex-col relative z-10">
              <span className={`text-lg font-light tracking-widest leading-none transition-colors ${hasLiked ? 'text-white' : 'text-white/80'}`}>{likes}</span>
              <span className="text-[7px] uppercase font-medium text-white/30 tracking-[0.2em] mt-1">{hasLiked ? 'Acknowledged' : 'Interact'}</span>
            </div>
          </div>
          
          {homeButtonText && homeButtonLink && (
            <a 
              href={homeButtonLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-xl border border-white/5 rounded-full text-[9px] font-medium uppercase tracking-[0.2em] text-white/70 hover:text-white transition-all shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              {homeButtonText}
            </a>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black/40 backdrop-blur-3xl border border-white/10 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-[2rem]"
            >
              <div className="p-12 overflow-y-auto flex-1">
                <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-10 italic">Política de Privacidad y Moderación (COMPLETA)</h2>
                <div className="space-y-8 text-sm text-white/60 leading-relaxed font-light">
                  <p>
                    Bienvenido a StudioVisuals. Para garantizar un entorno seguro, creativo y respetuoso para todos nuestros usuarios, hemos establecido las siguientes políticas. Todo el contenido y la plataforma están bajo la supervisión directa de Manuel Caro, administrador y coordinador de la experiencia digital. (2026 - 2030)
                  </p>
                  
                  <h4 className="text-white/90 font-bold mt-10 mb-4 text-base uppercase tracking-widest">1. Moderación de Contenido, Galería y Obras</h4>
                  <p>
                    Todas las obras subidas por los usuarios están sujetas a un proceso de verificación por la administración central antes de ser mostradas a la comunidad libremente. Nos reservamos de forma exclusiva el derecho de aprobar, eliminar o desestimar de forma temporal o permanente cualquier contenido gráfico que infrinja las normas éticas del arte y del respeto mutuo. Obras con contenido explícito prohibido, que fomenten el discurso de odio, o violen derechos de autor, serán vetadas y se removerán de los servidores.
                  </p>
                  
                  <h4 className="text-white/90 font-bold mt-10 mb-4 text-base uppercase tracking-widest">2. Suspensión y Bloqueo de Perfiles (Terminación)</h4>
                  <p>
                    Los administradores del sistema tienen la facultad completa y unilateral de bloquear, suspender y eliminar permanentemente cualquier cuenta registrada ("usuario") que vulnere de manera reiterativa o grave las normativas establecidas.
                    El sistema aislará automáticamente tu ingreso. Una vez la etiqueta "blocked" es impuesta, toda interacción social en la Red, Galería, y Pizarra quedará revocada.
                  </p>
                  
                  <h4 className="text-white/90 font-bold mt-10 mb-4 text-base uppercase tracking-widest">3. Entorno Pizarra Digital y Colisión Mutua</h4>
                  <p>
                    Para los módulos experimentales compartidos, como la Pizarra Interactiva (Whiteboard) o el ecosistema general Multijugador, se exige a los participantes no sabotear las creaciones ajenas, mantener en orden el canvas y evitar el spameo de trazos pesados. Violar estos puntos traerá como consecuencia la inaccesibilidad al módulo.
                  </p>

                  <h4 className="text-white/90 font-bold mt-10 mb-4 text-base uppercase tracking-widest">4. Almacenamiento y Protección de Datos Privados</h4>
                  <p>
                    Solo se recopilan datos estrictamente necesarios para su registro como artistas: Identificadores (IDs), nombre de usuarios (Username), correo electrónico básico si aplica. Jamás vendemos su flujo de datos, métricas y preferencias a sistemas centralizados o agencias externas. Las copias de su arte están resguardadas en nodos cifrados mantenidos por Cloud Providers con altos sistemas de encriptación.
                  </p>
                  
                  <p className="mt-12 text-white/40 italic font-medium uppercase tracking-[0.2em] text-xs pb-4">
                    Estas políticas están diseñadas de forma estética y funcional para construir la mejor arquitectura digital de arte.
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-white/10 bg-white/[0.02] flex justify-end">
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="px-10 py-4 bg-white/10 hover:bg-white text-white/50 hover:text-black font-black uppercase tracking-[0.2em] transition-all rounded-xl text-xs"
                >
                  Cerrar Políticas
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
