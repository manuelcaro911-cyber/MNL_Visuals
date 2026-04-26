
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Lock, Loader2, ShieldAlert, Check } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { soundEngine } from '../lib/sounds';

interface LoginModalProps {
  onClose: () => void;
  setCurrentUser: (u: User) => void;
  themeStyles: any;
}

const MASTER_ACTIVATION_KEY = "STUDIO_MNL_2025"; 

const LoginModal: React.FC<LoginModalProps> = ({ onClose, setCurrentUser }) => {
  const [step, setStep] = useState<'policy' | 'form'>('policy');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAttemptingAdmin = !isLogin && (username.trim() === 'Manuel Caro' || username.trim() === 'MNL_Visuals');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          console.log(error.message)
          throw new Error(error.message)
        }
        
        if (data?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) setCurrentUser({ ...profile, email: data.user.email });
        }
      } else {
        if (isAttemptingAdmin && masterKey !== MASTER_ACTIVATION_KEY) throw new Error("Clave de Maestro inválida.");
        const { data, error: signUpError } = await supabase.auth.signUp({ 
          email: email.trim(), password, options: { data: { username: username.trim() } }
        });
        if (signUpError) throw signUpError;
        if (data.user) {
          const role: 'user' | 'admin' = (isAttemptingAdmin && masterKey === MASTER_ACTIVATION_KEY) ? 'admin' : 'user';
          const newProfile = { 
            id: data.user.id, 
            username: username.trim(), 
            role: role, 
            password: password, // SE GUARDA EN PROFILES PARA LA AUDITORÍA ADMIN
            bio: role === 'admin' ? 'Director de StudioVisuals.' : 'Artista.' 
          };
          await supabase.from('profiles').upsert(newProfile);
          if (data.session) setCurrentUser({ ...newProfile, email: data.user.email });
          else setError("Verifica tu email para continuar.");
        }
      }
      onClose();
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-[30px] cursor-pointer" />
      <AnimatePresence mode="wait">
        {step === 'policy' ? (
          <motion.div key="policy" initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative w-full max-w-lg bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl backdrop-blur-[60px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20"><ShieldAlert className="w-8 h-8 text-blue-500" /></div>
              <h2 className="text-3xl font-black tracking-widest text-white uppercase italic">Protocolo de Enlace</h2>
            </div>
            <div className="space-y-6 text-left mb-10 max-h-[40vh] overflow-y-auto pr-4">
              <div className="flex gap-5"><div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-500" /></div><p className="text-xs text-white/50 leading-relaxed uppercase tracking-tight font-black">El dibujo no aceptado se notificará con una razón específica en RE/apro.</p></div>
              <div className="flex gap-5"><div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0"><Check className="w-4 h-4 text-blue-500" /></div><p className="text-xs text-white/50 leading-relaxed uppercase tracking-tight font-black">Tu contraseña podrá ser verificada por el Super Admin en caso de auditoría técnica.</p></div>
            </div>
            <button onClick={() => setStep('form')} className="w-full py-5 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl">Aceptar Protocolo</button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.95, x: 15 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative w-full max-w-[400px] bg-[#1a1c29]/60 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black tracking-widest text-white uppercase">{isLogin ? 'Login' : 'Register'}</h2>
              {error && <p className="mt-4 text-[10px] text-red-500 uppercase font-black tracking-widest bg-red-500/10 py-2 rounded-lg">{error}</p>}
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {!isLogin && (
                <div className="relative border-b border-white/30 focus-within:border-white transition-colors pb-2">
                   <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent outline-none text-sm text-white placeholder-white/50 font-medium px-2" required />
                   <UserPlus className="absolute right-2 bottom-2 w-4 h-4 text-white/50" />
                </div>
              )}

              <div className="relative border-b border-white/30 focus-within:border-white transition-colors pb-2">
                 <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-sm text-white placeholder-white/50 font-medium px-2" required />
                 <Mail className="absolute right-2 bottom-2 w-4 h-4 text-white/50" />
              </div>

              {!isLogin && isAttemptingAdmin && (
                 <div className="relative border-b border-blue-500/50 focus-within:border-blue-500 transition-colors pb-2">
                    <input type="password" placeholder="Master Key" value={masterKey} onChange={(e) => setMasterKey(e.target.value)} className="w-full bg-transparent outline-none text-sm text-blue-400 placeholder-blue-500/50 font-medium px-2" required />
                 </div>
              )}

              <div className="relative border-b border-white/30 focus-within:border-white transition-colors pb-2">
                 <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent outline-none text-sm text-white placeholder-white/50 font-medium px-2" required />
                 <Lock className="absolute right-2 bottom-2 w-4 h-4 text-white/50" />
              </div>

              {isLogin && (
                <div className="flex items-center justify-between mt-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-5 h-5 rounded bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
                       <Check className="w-3 h-3 text-transparent" />
                    </div>
                    <span className="text-xs text-white/70 font-medium">Remember Me</span>
                  </label>
                  <p className="text-[10px] font-bold text-white/80 hover:text-white cursor-pointer transition-colors">Forgot Password?</p>
                </div>
              )}

              <div className="pt-4">
                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-400/80 to-blue-600/80 hover:from-blue-500 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </div>

            </form>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-xs">
              <span className="text-white/60">{isLogin ? "Don't have an Account?" : "Already have an Account?"}</span>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-bold text-white hover:text-blue-400 transition-colors">
                {isLogin ? 'Register' : 'Login'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginModal;
