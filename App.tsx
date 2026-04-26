
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Page, User, Drawing, ThemeMode, SiteSettings, Feedback } from './types';
import Home from './components/Home';
import Modules from './components/Modules';
import Community from './components/Community';
import NavigationBar from './components/NavigationBar';
import ConfigModal from './components/ConfigModal';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import FeedbackModal from './components/FeedbackModal';
import UploadModal from './components/UploadModal';
import BackgroundEditor from './components/BackgroundEditor';
import Whiteboard from './components/Whiteboard';
import MasterWorks from './components/MasterWorks';
import ImagePreview from './components/ImagePreview';
import OnboardingModal from './components/OnboardingModal';
import PrivacyBanner from './components/PrivacyBanner';
import { AnimatePresence, motion } from 'framer-motion';
import { Youtube, Music2, Instagram, ExternalLink, ShoppingBag, Mail, ShieldCheck, Send, AlertTriangle, User as UserIcon, Palette } from 'lucide-react';
import { ABOUT_ME_TEXT as DEFAULT_ABOUT_TEXT } from './constants';
import { supabase } from './lib/supabase';
import { soundEngine } from './lib/sounds';
import ScrollableContainer from './components/ScrollableContainer';

const BrandIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 5l7 7-7 7-7-7 7-7z" />
    <path d="M7 2L2 7v10l5 5" />
    <path d="M17 2l5 5v10l-5 5" />
  </svg>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('theme') as ThemeMode) || 'black');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [moduleTexts, setModuleTexts] = useState<Record<string, {title: string, desc: string}>>({});
  const [uploadTarget, setUploadTarget] = useState<'community' | 'master'>('community');
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [authorFollowers, setAuthorFollowers] = useState<string[]>([]);
  const processingLikes = useRef(new Set<string>());

  useEffect(() => {
    if (selectedDrawing?.author_id) {
      supabase.from('profiles').select('followers').eq('id', selectedDrawing.author_id).single().then(({ data }) => {
        if (data) setAuthorFollowers(data.followers || []);
      });
    } else {
      setAuthorFollowers([]);
    }
  }, [selectedDrawing]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    homeBg: 'https://images.wallpaperscraft.com/image/single/mount_fuji_mountain_lake_152643_1920x1080.jpg', modulesBg: '', galleryBg: '', homeTitle: '',
    aboutMeText: DEFAULT_ABOUT_TEXT, aboutMeImage: '',
    homeBlur: 0, homeGray: 0,
    modulesBlur: 15, modulesGray: 0,
    galleryBlur: 10, galleryGray: 0,
    likes: 0, last_fan_name: 'Invitado',
    sounds_enabled: true,
    borderStyle: 'rounded',
    theme: 'dark',
    onboardingMessage: '¡Bienvenido a StudioVisuals! Sigue al creador para no perderte ninguna de sus nuevas obras y actualizaciones.',
    module_states: {
      about: true, social: true, commissions: true, community: true, masterworks: true, whiteboard: true
    }
  });
  
  const [showConfig, setShowConfig] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCommissionsWarning, setShowCommissionsWarning] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState<User | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showBgEditor, setShowBgEditor] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [hasParsedUrl, setHasParsedUrl] = useState(false);
  const [hasLikedHome, setHasLikedHome] = useState(() => localStorage.getItem('hasLikedHome') === 'true');
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(() => localStorage.getItem('hasAcceptedPrivacy') === 'true');

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    const superAdminEmail = 'manuelcaro911@gmail.com';
    return (
      currentUser.email?.toLowerCase() === superAdminEmail.toLowerCase() || 
      currentUser.role === 'admin' || 
      ['MNL_Visuals', 'Manuel Caro'].includes(currentUser.username)
    );
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && !isAdmin && !hasSeenOnboarding) {
      setShowOnboarding(true);
      setHasSeenOnboarding(true);
    }
  }, [currentUser, isAdmin, hasSeenOnboarding]);

  const handleDeleteFeedback = async (id: string) => {
    if (!isAdmin) return;
    await supabase.from('feedback').delete().eq('id', id);
    setFeedbacks(prev => prev.filter(f => f.id !== id));
  };

  const handleLikeFeedback = async (id: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    if (processingLikes.current.has(id)) return;
    
    const feedback = feedbacks.find(f => f.id === id);
    if (!feedback) return;

    const currentLikes = feedback.likes || [];
    const currentDislikes = feedback.dislikes || [];

    if (currentLikes.includes(currentUser.id)) {
      return; // Likes are permanent
    }

    processingLikes.current.add(id);
    const newLikes = [...currentLikes, currentUser.id];
    const newDislikes = currentDislikes.filter(uid => uid !== currentUser.id);

    // Optimistic Update
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, likes: newLikes, dislikes: newDislikes } : f));

    try {
      await supabase.from('feedback').update({ likes: newLikes, dislikes: newDislikes }).eq('id', id);
    } catch (err) {
      console.error("Error liking feedback", err);
      // Revert on error
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, likes: currentLikes, dislikes: currentDislikes } : f));
    } finally {
      processingLikes.current.delete(id);
    }
  };

  const handleDislikeFeedback = async (id: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    if (processingLikes.current.has(id)) return;

    const feedback = feedbacks.find(f => f.id === id);
    if (!feedback) return;

    const currentLikes = feedback.likes || [];
    const currentDislikes = feedback.dislikes || [];

    if (currentDislikes.includes(currentUser.id)) {
      return; // Dislikes are permanent
    }

    processingLikes.current.add(id);
    const newDislikes = [...currentDislikes, currentUser.id];
    const newLikes = currentLikes.filter(uid => uid !== currentUser.id);

    // Optimistic Update
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, likes: newLikes, dislikes: newDislikes } : f));

    try {
      await supabase.from('feedback').update({ likes: newLikes, dislikes: newDislikes }).eq('id', id);
    } catch (err) {
      console.error("Error disliking feedback", err);
      // Revert on error
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, likes: currentLikes, dislikes: currentDislikes } : f));
    } finally {
      processingLikes.current.delete(id);
    }
  };

  const handleOpenProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setSelectedUserForProfile(data);
    }
  };

  const handleBlockUser = async (id: string, blocked: boolean) => {
    if (!isAdmin) return;
    const { error } = await supabase.from('profiles').update({ is_blocked: blocked }).eq('id', id);
    if (!error) {
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, is_blocked: blocked } : u));
    }
  };

  const loadInitialData = async () => {
    try {
      const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (settings) {
        soundEngine.setEnabled(settings.sounds_enabled ?? true);
        setSiteSettings({
          homeBg: settings.home_bg && settings.home_bg !== 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2564&fit=crop' ? settings.home_bg : 'https://images.wallpaperscraft.com/image/single/mount_fuji_mountain_lake_152643_1920x1080.jpg',
          modulesBg: settings.modules_bg || '',
          galleryBg: settings.gallery_bg || '',
          homeTitle: settings.home_title || 'STUDIO VISUALS',
          aboutMeText: settings.about_me_text || DEFAULT_ABOUT_TEXT,
          aboutMeImage: settings.about_me_image || '',
          aboutMeBannerImage: settings.about_me_banner_image || '',
          homeBlur: settings.home_blur ?? 0,
          homeGray: settings.home_gray ?? 0,
          modulesBlur: settings.modules_blur ?? 15,
          modulesGray: settings.modules_gray ?? 0,
          galleryBlur: settings.gallery_blur ?? 10,
          galleryGray: settings.gallery_gray ?? 0,
          likes: settings.likes || 0,
          last_fan_name: settings.last_fan_name || 'Invitado',
          sounds_enabled: settings.sounds_enabled ?? true,
          borderStyle: settings.border_style || 'rounded',
          customLinkUrl: settings.custom_link_url || '',
          customLinks: (settings.custom_links || []).filter((l: any) => l.title !== '__whiteboard__'),
          whiteboardLink: (settings.custom_links || []).find((l: any) => l.title === '__whiteboard__')?.url || '',
          theme: settings.theme || 'dark',
          onboardingMessage: settings.onboarding_message || '',
          homeButtonText: settings.home_button_text || '',
          homeButtonLink: settings.home_button_link || '',
          commissionsLink: settings.commissions_link || '',
          recommendedUsers: settings.recommended_users || [],
          module_states: settings.module_states || { about: true, social: true, commissions: true, community: true, masterworks: true, whiteboard: true }
        });
      }

      const { data: mTexts } = await supabase.from('module_settings').select('*');
      if (mTexts) {
        const textMap: any = {};
        mTexts.forEach(m => { textMap[m.id] = { title: m.title, desc: m.description }; });
        setModuleTexts(textMap);
      }
      
      const { data: dr } = await supabase.from('drawings').select('*').order('timestamp', { ascending: false });
      if (dr) setDrawings(dr);
      
      const { data: fb } = await supabase.from('feedback').select('*').order('timestamp', { ascending: false });
      if (fb) setFeedbacks(fb);

      const { data: users } = await supabase.from('profiles').select('*');
      if (users) setAllUsers(users);
    } catch (err) { console.warn("Error en carga:", err); }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setCurrentUser(profile ? { ...profile, email: session.user.email } : null);
      }
      setLoading(false);
    };
    checkUser();
    loadInitialData();

    const subscription = supabase
      .channel('site_settings_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_settings' }, (payload) => {
        const settings = payload.new;
        setSiteSettings(prev => ({
          ...prev,
          homeBg: settings.home_bg || prev.homeBg,
          modulesBg: settings.modules_bg || prev.modulesBg,
          galleryBg: settings.gallery_bg || prev.galleryBg,
          homeTitle: settings.home_title || prev.homeTitle,
          aboutMeText: settings.about_me_text || prev.aboutMeText,
          aboutMeImage: settings.about_me_image || prev.aboutMeImage,
          aboutMeBannerImage: settings.about_me_banner_image || prev.aboutMeBannerImage,
          homeBlur: settings.home_blur ?? prev.homeBlur,
          homeGray: settings.home_gray ?? prev.homeGray,
          modulesBlur: settings.modules_blur ?? prev.modulesBlur,
          modulesGray: settings.modules_gray ?? prev.modulesGray,
          galleryBlur: settings.gallery_blur ?? prev.galleryBlur,
          galleryGray: settings.gallery_gray ?? prev.galleryGray,
          borderStyle: settings.border_style || prev.borderStyle,
          theme: settings.theme || prev.theme,
          customLinkUrl: settings.custom_link_url || prev.customLinkUrl,
          onboardingMessage: settings.onboarding_message || prev.onboardingMessage,
          homeButtonText: settings.home_button_text || prev.homeButtonText,
          homeButtonLink: settings.home_button_link || prev.homeButtonLink,
          commissionsLink: settings.commissions_link || prev.commissionsLink,
          recommendedUsers: settings.recommended_users || prev.recommendedUsers,
          likes: settings.likes || prev.likes
        }));
      })
      .subscribe();

    const drawingsSubscription = supabase
      .channel('drawings_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drawings' }, (payload) => {
        const updated = payload.new as Drawing;
        setDrawings(prev => prev.map(d => d.id === updated.id ? { ...d, likes: updated.likes, status: updated.status } : d));
        setSelectedDrawing(prev => prev?.id === updated.id ? { ...prev, likes: updated.likes, status: updated.status } : prev);
      })
      .subscribe();

    const feedbackSubscription = supabase
      .channel('feedback_realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'feedback' }, (payload) => {
        const updated = payload.new as Feedback;
        setFeedbacks(prev => prev.map(f => f.id === updated.id ? { ...f, likes: updated.likes, dislikes: updated.dislikes } : f));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(drawingsSubscription);
      supabase.removeChannel(feedbackSubscription);
    };
  }, [isAdmin]);

  useEffect(() => {
    if (!hasParsedUrl && drawings.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const drawingId = params.get('artwork');
      if (drawingId) {
        const drawing = drawings.find(d => d.id === drawingId);
        if (drawing) {
          setSelectedDrawing(drawing);
        }
      }
      setHasParsedUrl(true);
    }
  }, [drawings, hasParsedUrl]);

  const handleLikeDrawing = async (id: string) => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    if (processingLikes.current.has(id)) return;
    
    const drawing = drawings.find(d => d.id === id);
    if (!drawing) return;

    const currentLikes = drawing.likes || [];
    const hasLiked = currentLikes.includes(currentUser.id);
    
    if (hasLiked) {
      return; // Likes are permanent
    }
    
    processingLikes.current.add(id);
    const newLikes = [...currentLikes, currentUser.id];

    // Optimistic update
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, likes: newLikes } : d));
    if (selectedDrawing?.id === id) {
      setSelectedDrawing(prev => prev ? { ...prev, likes: newLikes } : null);
    }

    try {
      await supabase.from('drawings').update({ likes: newLikes }).eq('id', id);
    } catch (error) {
      console.error("Error updating likes", error);
      // Revert on error
      setDrawings(prev => prev.map(d => d.id === id ? { ...d, likes: currentLikes } : d));
      if (selectedDrawing?.id === id) {
        setSelectedDrawing(prev => prev ? { ...prev, likes: currentLikes } : null);
      }
    } finally {
      processingLikes.current.delete(id);
    }
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    soundEngine.play(status === 'approved' ? 'success' : 'error');
    const finalStatus = status === 'rejected' ? 'draft' : status;
    const { error } = await supabase.from('drawings').update({ status: finalStatus, rejection_reason: reason || null }).eq('id', id);
    if (!error) {
      setDrawings(prev => prev.map(d => d.id === id ? { ...d, status: finalStatus as any, rejection_reason: reason } : d));
    }
  };

  const handlePageChange = (page: Page) => {
    soundEngine.play('transition');
    setCurrentPage(page);
    setSelectedDrawing(null); // Limpiar preview al cambiar página
  };

  const currentEffects = useMemo(() => {
    if (currentPage === Page.Home) return { blur: siteSettings.homeBlur, gray: siteSettings.homeGray };
    if ([Page.MyGallery, Page.MasterWorks].includes(currentPage)) return { blur: siteSettings.galleryBlur, gray: siteSettings.galleryGray };
    return { blur: siteSettings.modulesBlur, gray: siteSettings.modulesGray };
  }, [currentPage, siteSettings]);

  const activeBg = useMemo(() => {
    if (currentPage === Page.Whiteboard) return ''; 
    if (currentPage === Page.Home) return siteSettings.homeBg || siteSettings.modulesBg;
    if ([Page.MyGallery, Page.MasterWorks].includes(currentPage)) return siteSettings.galleryBg || siteSettings.modulesBg || siteSettings.homeBg;
    return siteSettings.modulesBg || siteSettings.homeBg;
  }, [currentPage, siteSettings]);

  if (loading) return null;

  const openUploadModal = (target: 'community' | 'master' = 'community') => {
    if (!currentUser) { setShowLogin(true); return; }
    if (currentUser.is_blocked) {
      alert("Tu cuenta ha sido bloqueada. No puedes subir dibujos.");
      return;
    }
    setUploadTarget(target);
    setShowUpload(true);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    await supabase.from('profiles').update({
      username: updatedUser.username,
      profile_pic: updatedUser.profile_pic,
      banner_url: updatedUser.banner_url,
      bio: updatedUser.bio,
      links: updatedUser.links
    }).eq('id', updatedUser.id);
  };

  return (
    <div className={`fixed inset-0 w-full h-full bg-black overflow-hidden flex flex-col ${siteSettings.borderStyle === 'square' ? 'style-square' : ''} ${siteSettings.theme === 'light' ? 'theme-light' : ''}`}>
      {/* Background System */}
      {currentPage !== Page.Whiteboard && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
          <AnimatePresence mode="wait">
            {activeBg && (
              <motion.div key={activeBg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                <img 
                  src={activeBg} 
                  referrerPolicy="no-referrer" 
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2564&fit=crop'; }}
                  className="w-full h-full object-cover transition-all duration-300 ease-out" 
                  alt="Fondo" 
                  style={{ 
                    filter: `grayscale(${currentEffects.gray || 0}%) blur(${currentEffects.blur || 0}px)`,
                    transform: `scale(${currentEffects.blur || 8 ? 1.1 : 1})` // Prevent blurry edges
                  }} 
                />
                {/* Dark Purple Glassmorphism Overlay */}
                <div className="absolute inset-0 bg-purple-900/40 mix-blend-color" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Header / Nav - PERSISTENTE con Z-INDEX superior al visualizador */}
      {currentPage !== Page.Home && currentPage !== Page.Whiteboard && (
        <motion.header 
          initial={{ y: -50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }} 
          className="fixed top-0 left-0 w-full z-[1000] pointer-events-none"
        >
          <div className="w-full bg-black/60 backdrop-blur-3xl border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative pointer-events-auto flex items-center justify-between px-4 md:px-8 py-2" style={{ borderImage: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent) 1' }}>
            <motion.h1 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(Page.Home)} 
              className="flex items-center gap-4 text-sm md:text-xl font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-white cursor-pointer opacity-90 hover:opacity-100 shimmer-text flex-shrink-0 mr-4 group"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              >
                <BrandIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-500 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transition-all duration-300" />
              </motion.div>
              <span>MNL_<span className="text-blue-500 hidden md:inline">Visuals</span></span>
            </motion.h1>
            <div className="flex-1 flex justify-start md:justify-end overflow-hidden">
              <NavigationBar onHome={() => handlePageChange(Page.Home)} onBack={() => handlePageChange(currentPage === Page.Modules ? Page.Home : Page.Modules)} onFeedback={() => setShowFeedback(true)} onPlus={() => openUploadModal(currentPage === Page.MasterWorks && isAdmin ? 'master' : 'community')} onProfile={() => currentUser ? setShowProfile(true) : setShowLogin(true)} onConfig={() => setShowConfig(true)} onStar={() => handlePageChange(Page.Ambiente)} isAdmin={isAdmin} themeStyles={{}} currentPage={currentPage} />
            </div>
          </div>
        </motion.header>
      )}

      <main className="flex-1 relative z-10 w-full overflow-hidden flex flex-col pt-20">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} className="w-full h-full overflow-hidden flex flex-col" initial={{ opacity: 0, scale: 0.97, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.03, y: -15 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
            {currentPage === Page.Home && <Home onStart={() => handlePageChange(Page.Modules)} themeStyles={{text: 'text-white'}} customTitle={siteSettings.homeTitle} likes={siteSettings.likes} onLike={async () => {
              if (hasLikedHome) return;
              const newLikes = siteSettings.likes + 1;
              await supabase.from('site_settings').update({ likes: newLikes }).eq('id', 1);
              setSiteSettings(prev => ({...prev, likes: newLikes}));
              setHasLikedHome(true);
              localStorage.setItem('hasLikedHome', 'true');
            }} hasLiked={hasLikedHome} homeButtonText={siteSettings.homeButtonText} homeButtonLink={siteSettings.homeButtonLink} />}
            {currentPage === Page.Modules && <div className="flex-1 overflow-hidden"><Modules onNavigate={handlePageChange} themeStyles={{text: 'text-white', card: 'bg-white/5 border-white/5'}} theme={theme} customTexts={moduleTexts} customLinkUrl={siteSettings.customLinkUrl} customLinks={siteSettings.customLinks} onShowPrivacy={() => setHasAcceptedPrivacy(false)} moduleStates={siteSettings.module_states} /></div>}
            {currentPage === Page.About && (
              <ScrollableContainer className="p-0 flex flex-col w-full h-full">
                {/* Hero Banner Area */}
                <div className="relative w-full h-[55vh] md:h-[65vh] shrink-0 rounded-b-[2rem] md:rounded-b-[4rem] overflow-hidden mx-auto max-w-[98vw] mt-2">
                  <img src={siteSettings.aboutMeBannerImage || siteSettings.homeBg} className="w-full h-full object-cover" alt="Banner" />
                  
                  {/* Subtle Dark Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/60 pointer-events-none" />

                  {/* Main Glass Panel mimicking the image */}
                  <div className="absolute inset-4 md:inset-8 lg:inset-12 border border-white/20 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
                    
                    {/* Top Right "Find trips" button equivalent */}
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
                       <button className="px-4 py-2 border border-white/40 rounded-full text-[10px] uppercase font-bold tracking-widest text-white/80 hover:bg-white hover:text-black transition-all flex items-center gap-2">
                         Explorar Galería
                       </button>
                    </div>

                    {/* Branding Top Center */}
                    <div className="absolute top-6 left-0 right-0 flex justify-center z-10">
                       <h3 className="text-sm tracking-[0.4em] text-white/80 font-medium">MNL <span className="font-light">VISUALS</span></h3>
                    </div>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 space-y-4">
                       <h2 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white drop-shadow-lg tracking-tight">Manuel Caro</h2>
                       <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs text-white/80 tracking-widest uppercase">
                         Artist & Developer
                       </div>
                    </div>

                    {/* Bottom floating glass bar */}
                    <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 w-[90%] md:w-auto px-8 py-4 md:px-12 md:py-5 bg-white/20 backdrop-blur-2xl border border-white/30 rounded-full flex gap-6 md:gap-12 justify-center items-center overflow-x-auto z-50 shadow-2xl">
                        <div className="flex items-center gap-3 text-white text-xs md:text-sm font-black uppercase tracking-widest cursor-pointer hover:text-white/80 transition-colors">
                           <UserIcon size={18} /> <span>Biografía</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/40" />
                        <div className="flex items-center gap-3 text-white text-xs md:text-sm font-black uppercase tracking-widest cursor-pointer hover:text-white/80 transition-colors">
                           <Palette size={18} /> <span>Visión</span>
                        </div>
                        <div className="w-[1px] h-6 bg-white/40" />
                        <div className="flex items-center gap-3 text-white text-xs md:text-sm font-black uppercase tracking-widest cursor-pointer hover:text-white/80 transition-colors">
                           <ShoppingBag size={18} /> <span>Arte</span>
                        </div>
                    </div>
                  </div>
                </div>

                {/* Content Section below banner */}
                <div className="w-full max-w-[1000px] mx-auto pb-12 px-6 relative z-10 -mt-16 md:-mt-24">
                  {/* Purple/Blue tinted card mimicking the image */}
                  <div className="bg-[#6b72a4]/85 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden shadow-2xl border border-white/10">
                     {/* Image Left */}
                     <div className="w-full md:w-5/12 aspect-[3/4] md:aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shrink-0">
                        <img src={siteSettings.aboutMeImage || siteSettings.homeBg} className="w-full h-full object-cover object-top" alt="Profile Vertical" />
                     </div>
                     
                     {/* Text Right */}
                     <div className="w-full md:w-7/12 flex flex-col space-y-6 md:space-y-8">
                        <h4 className="text-4xl md:text-5xl lg:text-5xl font-black text-white leading-[1.1] drop-shadow-md tracking-tighter">Mente Creativa & Arquitecto Visual</h4>
                        <p className="text-white/95 text-base md:text-lg lg:text-xl font-normal leading-relaxed whitespace-pre-wrap drop-shadow-sm">
                          {siteSettings.aboutMeText}
                        </p>
                        
                     </div>
                  </div>
                  
                  <div className="w-full text-center mt-12 pb-8 flex justify-between items-center px-4">
                    <p className="text-xs font-medium text-white/40 uppercase tracking-widest">© 2026 - 2030 MNL Visuals</p>
                    <button onClick={() => handlePageChange(Page.Social)} className="px-6 py-2 rounded-full border border-white/20 text-white/60 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                      Contacto
                    </button>
                  </div>
                </div>
              </ScrollableContainer>
            )}
            {currentPage === Page.Social && (
              <ScrollableContainer className="p-12 flex flex-col items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[98vw] my-auto">
                  {[{ name: 'YouTube', icon: <Youtube />, url: 'https://youtube.com/@mnl-visuals?si=bXeR13PYh1hy-HK1', color: 'bg-red-600', id: '@mnl-visuals' }, { name: 'TikTok', icon: <Music2 />, url: 'https://tiktok.com/@mnl_visuals', color: 'bg-white text-black', id: '@mnl_visuals' }, { name: 'Instagram', icon: <Instagram />, url: 'https://www.instagram.com/mnlv.isuals?igsh=Ynp6and0ajYwcGZn', color: 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500', id: '@mnlv.isuals' }].map((social) => (
                    <motion.a key={social.name} href={social.url} target="_blank" whileHover={{ y: -10, scale: 1.02 }} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] flex flex-col items-center gap-6 backdrop-blur-xl group hover:border-white/30 transition-all">
                      <div className={`w-16 h-16 ${social.color} rounded-2xl flex items-center justify-center shadow-2xl`}>{React.cloneElement(social.icon as any, { size: 32 })}</div>
                      <div className="text-center">
                        <h4 className="text-white font-black uppercase tracking-widest text-lg">{social.name}</h4>
                        <p className="text-[10px] text-white/30 font-mono mt-1">{social.id}</p>
                      </div>
                      <ExternalLink className="text-white/20 group-hover:text-white transition-colors" size={20} />
                    </motion.a>
                  ))}
                </div>
                
                {siteSettings.recommendedUsers && siteSettings.recommendedUsers.length > 0 && (
                  <div className="w-full max-w-4xl mt-24 mb-12">
                    <div className="flex items-center gap-8 mb-12">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 whitespace-nowrap italic">Usuarios Recomendados</h3>
                       <div className="h-[1px] w-full bg-white/5" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                      {siteSettings.recommendedUsers.map(userId => {
                        const user = allUsers.find(u => u.id === userId);
                        if (!user) return null;
                        return (
                          <motion.div 
                            key={user.id}
                            whileHover={{ y: -5, scale: 1.05 }}
                            onClick={() => handleOpenProfile(user.id)}
                            className="flex flex-col items-center gap-4 cursor-pointer group"
                          >
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-white/20 transition-all shadow-2xl bg-neutral-900 flex items-center justify-center">
                              {user.profile_pic ? (
                                <img src={user.profile_pic} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-3xl font-black text-white/30">{(user.username || 'U')[0].toUpperCase()}</span>
                              )}
                            </div>
                            <div className="text-center">
                              <p className="text-white font-bold text-sm">{user.username}</p>
                              <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">{user.followers?.length || 0} seg</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </ScrollableContainer>
            )}
            {currentPage === Page.Commissions && (
              <ScrollableContainer className="p-12 flex flex-col items-center justify-center">
                <div className="bg-white/5 border border-white/10 rounded-[4rem] p-16 max-w-[98vw] w-full backdrop-blur-3xl text-center space-y-10 relative overflow-hidden my-auto">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  <ShoppingBag className="w-16 h-16 text-blue-500 mx-auto" />
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Request_Custom_Arte</h2>
                    <p className="text-white/40 text-sm font-light leading-relaxed max-w-md mx-auto italic">
                      Si deseas una obra personalizada, un retrato realista o un diseño visual único, ponte en contacto conmigo para discutir los detalles del proyecto.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 text-left">
                      <Mail className="text-blue-500" />
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Email_Official</p>
                        <p className="text-xs text-white font-mono">manuelcaro911@gmail.com</p>
                      </div>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 text-left">
                      <ShieldCheck className="text-green-500" />
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Pago_Seguro</p>
                        <p className="text-xs text-white">Transferencia / PayPal</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const link = siteSettings.commissionsLink?.trim();
                      if (link) {
                        window.open(link, '_blank');
                      } else {
                        setShowCommissionsWarning(true);
                      }
                    }}
                    className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-xs md:text-sm rounded-full hover:bg-blue-600 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3"
                  >
                    <Send size={18} /> Iniciar Consulta
                  </button>
                </div>
              </ScrollableContainer>
            )}
            {currentPage === Page.MyGallery && <div className="flex-1 overflow-hidden"><Community drawings={drawings.filter(d => d.status === 'approved')} isAdmin={isAdmin} currentUser={currentUser} allUsers={allUsers} onLike={handleLikeDrawing} onOpenProfile={handleOpenProfile} themeStyles={{text: 'text-white', card: 'bg-white/5 border-white/5'}} onSelect={setSelectedDrawing} onDelete={async (id) => { await supabase.from('drawings').delete().eq('id', id); setDrawings(prev => prev.filter(d => d.id !== id)); }} /></div>}
            {currentPage === Page.MasterWorks && <MasterWorks drawings={drawings.filter(d => d.author === 'Manuel Caro' && d.status !== 'draft')} isAdmin={isAdmin} currentUser={currentUser} onLike={handleLikeDrawing} onOpenProfile={handleOpenProfile} onUploadRequest={openUploadModal} onSelect={setSelectedDrawing} onDelete={async (id) => { await supabase.from('drawings').delete().eq('id', id); setDrawings(prev => prev.filter(d => d.id !== id)); }} />}
            {currentPage === Page.Whiteboard && <Whiteboard onClose={() => handlePageChange(Page.Modules)} themeStyles={{}} userRole={isAdmin ? 'admin' : 'artist'} isBlocked={currentUser?.is_blocked} whiteboardLink={siteSettings.whiteboardLink} onUpdateWhiteboardLink={async (link) => { 
              setSiteSettings(prev => ({...prev, whiteboardLink: link})); 
              const newCustomLinks = [...(siteSettings.customLinks || [])];
              const wbIndex = newCustomLinks.findIndex(l => l.title === '__whiteboard__');
              if (wbIndex >= 0) {
                if (link) newCustomLinks[wbIndex].url = link;
                else newCustomLinks.splice(wbIndex, 1);
              } else if (link) {
                newCustomLinks.push({ title: '__whiteboard__', url: link });
              }
              await supabase.from('site_settings').update({ custom_links: newCustomLinks }).eq('id', 1); 
            }} />}
            {currentPage === Page.Ambiente && isAdmin && (
              <BackgroundEditor onClose={() => handlePageChange(Page.Modules)} settings={siteSettings} moduleTexts={moduleTexts} onUpdate={async (s) => { 
                setSiteSettings(prev => ({...prev, ...s})); 
                const dbPayload: any = {}; 
                if (s.homeBg !== undefined) dbPayload.home_bg = s.homeBg; 
                if (s.modulesBg !== undefined) dbPayload.modules_bg = s.modulesBg; 
                if (s.galleryBg !== undefined) dbPayload.gallery_bg = s.galleryBg; 
                if (s.homeTitle !== undefined) dbPayload.home_title = s.homeTitle; 
                if (s.aboutMeText !== undefined) dbPayload.about_me_text = s.aboutMeText; 
                if (s.aboutMeImage !== undefined) dbPayload.about_me_image = s.aboutMeImage; 
                if (s.aboutMeBannerImage !== undefined) dbPayload.about_me_banner_image = s.aboutMeBannerImage; 
                if (s.homeBlur !== undefined) dbPayload.home_blur = s.homeBlur; 
                if (s.homeGray !== undefined) dbPayload.home_gray = s.homeGray; 
                if (s.modulesBlur !== undefined) dbPayload.modules_blur = s.modulesBlur; 
                if (s.modulesGray !== undefined) dbPayload.modules_gray = s.modulesGray; 
                if (s.galleryBlur !== undefined) dbPayload.gallery_blur = s.galleryBlur; 
                if (s.galleryGray !== undefined) dbPayload.gallery_gray = s.galleryGray; 
                if (s.borderStyle !== undefined) dbPayload.border_style = s.borderStyle; 
                if (s.customLinkUrl !== undefined) dbPayload.custom_link_url = s.customLinkUrl; 
                if (s.customLinks !== undefined) dbPayload.custom_links = s.customLinks; 
                if (s.onboardingMessage !== undefined) dbPayload.onboarding_message = s.onboardingMessage; 
                if (s.homeButtonText !== undefined) dbPayload.home_button_text = s.homeButtonText; 
                if (s.homeButtonLink !== undefined) dbPayload.home_button_link = s.homeButtonLink; 
                if (s.commissionsLink !== undefined) dbPayload.commissions_link = s.commissionsLink;
                if (Object.keys(dbPayload).length > 0) { await supabase.from('site_settings').update(dbPayload).eq('id', 1); } 
              }} onUpdateModuleTexts={async (texts) => { 
                setModuleTexts(texts); 
                const promises = Object.entries(texts).map(([key, val]) => supabase.from('module_texts').upsert({ module_key: key, title: val.title, description: val.desc })); 
                await Promise.all(promises); 
              }} themeStyles={{}} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Layer de Previsualización - Z-INDEX [500] (Debajo del Header) */}
      <AnimatePresence>
        {selectedDrawing && (
          <ImagePreview 
            drawing={selectedDrawing} 
            allDrawings={drawings}
            onSelectSuggested={(d) => setSelectedDrawing(d)}
            onClose={() => setSelectedDrawing(null)} 
            borderStyle={siteSettings.borderStyle} 
            currentUser={currentUser}
            onLike={handleLikeDrawing}
            onOpenProfile={handleOpenProfile}
            onFollow={async (authorId) => {
              if (!currentUser) return;
              
              let newFollowers = [...authorFollowers];
              if (newFollowers.includes(currentUser.id)) {
                newFollowers = newFollowers.filter(uid => uid !== currentUser.id);
              } else {
                newFollowers.push(currentUser.id);
              }
              
              setAuthorFollowers(newFollowers);
              await supabase.from('profiles').update({ followers: newFollowers }).eq('id', authorId);
            }}
            isFollowing={currentUser ? authorFollowers.includes(currentUser.id) : false}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCommissionsWarning && (
          <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCommissionsWarning(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-neutral-900 border-2 border-yellow-500/50 p-8 md:p-12 max-w-2xl w-full shadow-[0_0_50px_rgba(234,179,8,0.2)]"
              style={{ borderRadius: '0px' }}
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-2">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest">Aviso Importante</h3>
                <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
                  Por los momentos, las comisiones no están disponibles debido a temas de tiempo y carga de trabajo actual. Agradecemos mucho tu interés y te invitamos a estar atento a futuras actualizaciones cuando se vuelvan a abrir los cupos.
                </p>
                <button 
                  onClick={() => setShowCommissionsWarning(false)}
                  className="mt-8 px-12 py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-base transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} setCurrentUser={setCurrentUser} themeStyles={{}} />}
        {showProfile && currentUser && <ProfileModal onClose={() => setShowProfile(false)} user={currentUser} currentUser={currentUser} allDrawings={drawings} onUpdate={handleUpdateUser} themeStyles={{}} />}
        {selectedUserForProfile && <ProfileModal onClose={() => setSelectedUserForProfile(null)} user={selectedUserForProfile} currentUser={currentUser} allDrawings={drawings} onUpdate={() => {}} themeStyles={{}} />}
        {showConfig && <ConfigModal onClose={() => setShowConfig(false)} theme={theme} setTheme={setTheme} currentUser={currentUser} onLogout={async () => { await supabase.auth.signOut(); setCurrentUser(null); setShowConfig(false); }} onOpenProfile={(id) => id ? handleOpenProfile(id) : setShowProfile(true)} onLogin={() => setShowLogin(true)} allDrawings={drawings} allUsers={allUsers} onModerate={handleModerate} onBlockUser={handleBlockUser} themeStyles={{}} soundsEnabled={siteSettings.sounds_enabled} onToggleSounds={(val) => setSiteSettings(prev => ({...prev, sounds_enabled: val}))} recommendedUsers={siteSettings.recommendedUsers} onUpdateRecommendedUsers={async (users) => { setSiteSettings(prev => ({...prev, recommendedUsers: users})); await supabase.from('site_settings').update({ recommended_users: users }).eq('id', 1); }} moduleStates={siteSettings.module_states} onUpdateModuleStates={async (states) => { setSiteSettings(prev => ({...prev, module_states: states})); await supabase.from('site_settings').update({ module_states: states }).eq('id', 1); }} />}
        {showUpload && currentUser && <UploadModal onClose={() => setShowUpload(false)} currentUser={currentUser} isAdmin={isAdmin} initialGallery={uploadTarget} onUpload={(d) => setDrawings([d, ...drawings])} themeStyles={{}} />}
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} feedbacks={feedbacks} onSubmit={async (f) => { const { data } = await supabase.from('feedback').insert([f]).select(); if (data) setFeedbacks([data[0], ...feedbacks]); }} onDelete={handleDeleteFeedback} onLike={handleLikeFeedback} onDislike={handleDislikeFeedback} onOpenProfile={handleOpenProfile} currentUser={currentUser} isAdmin={isAdmin} themeStyles={{}} />}
        {showOnboarding && <OnboardingModal message={siteSettings.onboardingMessage || ''} onClose={() => setShowOnboarding(false)} borderStyle={siteSettings.borderStyle} />}
      </AnimatePresence>

      {!hasAcceptedPrivacy && (
        <PrivacyBanner onAccept={() => {
          setHasAcceptedPrivacy(true);
          localStorage.setItem('hasAcceptedPrivacy', 'true');
        }} />
      )}
    </div>
  );
};

export default App;
