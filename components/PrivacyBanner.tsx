import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyBannerProps {
  onAccept: () => void;
}

const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onAccept }) => {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [showThanks, setShowThanks] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setShowThanks(true);
    setTimeout(() => {
      setShowThanks(false);
      onAccept();
    }, 2000);
  };

  if (accepted && !showThanks) return null;

  return (
    <>
      <AnimatePresence>
        {!accepted && !showModal && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="fixed bottom-4 right-4 z-[9999] w-96 bg-neutral-900 border border-white/10 p-8 shadow-2xl"
            style={{ borderRadius: '0px' }} // Square edges
          >
            <h3 className="text-white font-black uppercase tracking-widest text-base mb-3">Política de Privacidad</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Utilizamos cookies y políticas estrictas para asegurar la mejor experiencia. Al continuar, aceptas nuestras políticas de moderación y privacidad.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-black uppercase tracking-widest transition-colors"
              >
                Denegar
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest transition-colors"
              >
                Aceptar :)
              </button>
            </div>
          </motion.div>
        )}

        {showThanks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 z-[9999] bg-green-500 text-white px-8 py-5 shadow-2xl font-black uppercase tracking-widest text-sm"
            style={{ borderRadius: '0px' }}
          >
            Gracias, espero disfrutes de la experiencia
          </motion.div>
        )}

        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-white/10 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl"
              style={{ borderRadius: '0px' }}
            >
              <div className="p-12 overflow-y-auto flex-1">
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-10">Política de Privacidad y Moderación</h2>
                <div className="space-y-8 text-lg text-white/70 leading-relaxed font-light">
                  <p>
                    Bienvenido a StudioVisuals. Para garantizar un entorno seguro, creativo y respetuoso para todos nuestros usuarios, hemos establecido las siguientes políticas que debes aceptar para utilizar nuestra plataforma. Todo el contenido y la plataforma están bajo la supervisión directa de Manuel Caro, administrador y único coordinador del sitio web. (2026 - 2030)
                  </p>
                  <h4 className="text-white font-bold mt-10 mb-4 text-xl">1. Moderación de Contenido</h4>
                  <p>
                    Todas las obras subidas por los usuarios están sujetas a un proceso de verificación por parte de los administradores. Nos reservamos el derecho de aprobar o rechazar cualquier contenido que no cumpla con nuestros estándares de calidad o que infrinja nuestras normas comunitarias.
                  </p>
                  <h4 className="text-white font-bold mt-10 mb-4 text-xl">2. Bloqueo de Usuarios</h4>
                  <p>
                    Los administradores tienen la facultad de bloquear a cualquier usuario que viole repetidamente las normas, publique contenido inapropiado o mantenga un comportamiento tóxico. Un usuario bloqueado perderá inmediatamente sus privilegios para subir dibujos, comentar o interactuar en la plataforma. Este bloqueo puede ser revertido a discreción de la administración.
                  </p>
                  <h4 className="text-white font-bold mt-10 mb-4 text-xl">3. Privacidad y Datos</h4>
                  <p>
                    Respetamos tu privacidad. Los datos recopilados se utilizan exclusivamente para mejorar tu experiencia en la plataforma, gestionar tu perfil y mantener la seguridad del sitio. No compartimos tu información personal con terceros sin tu consentimiento explícito.
                  </p>
                  <p className="mt-12 text-white/50 italic text-base">
                    Es fundamental que aceptes estas políticas para poder disfrutar de todas las funcionalidades de StudioVisuals. Queremos construir una comunidad sana donde el arte sea el protagonista.
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-white/10 bg-black/20">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleAccept();
                  }}
                  className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] transition-colors text-base"
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PrivacyBanner;
