
export enum Page {
  Home = 'home',
  Modules = 'modules',
  About = 'about',
  Social = 'social',
  Commissions = 'commissions',
  MyGallery = 'community',
  MasterWorks = 'masterworks',
  Whiteboard = 'whiteboard',
  Ambiente = 'ambiente'
}

export type ThemeMode = 'white' | 'combined' | 'black';

export interface UserLinks {
  youtube?: string;
  tiktok?: string;
  instagram?: string;
}

export interface User {
  id: string; 
  username: string;
  old_username?: string;
  email?: string;
  password?: string;
  bio?: string;
  profile_pic?: string;
  banner_url?: string;
  links?: UserLinks;
  role?: 'user' | 'admin';
  followers?: string[];
  is_blocked?: boolean;
}

export interface Drawing {
  id: string;
  author: string;
  author_id?: string;
  image_url: string;
  description: string;
  timestamp: number;
  is_archived?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  rejection_reason?: string;
  likes?: string[];
  data?: any;
}

export interface ModuleStates {
  about?: boolean;
  social?: boolean;
  commissions?: boolean;
  community?: boolean;
  masterworks?: boolean;
  whiteboard?: boolean;
}

export interface SiteSettings {
  homeBg: string;
  modulesBg: string;
  galleryBg: string;
  homeTitle: string;
  aboutMeText?: string;
  aboutMeImage?: string;
  aboutMeBannerImage?: string;
  homeBlur: number;
  homeGray: number;
  modulesBlur: number;
  modulesGray: number;
  galleryBlur: number;
  galleryGray: number;
  likes: number;
  last_fan_name?: string;
  sounds_enabled?: boolean;
  borderStyle?: 'rounded' | 'square';
  customLinkUrl?: string;
  customLinks?: { title: string; url: string }[];
  theme?: 'dark' | 'light';
  onboardingMessage?: string;
  homeButtonText?: string;
  homeButtonLink?: string;
  whiteboardLink?: string;
  commissionsLink?: string;
  recommendedUsers?: string[];
  module_states?: ModuleStates;
}

export interface Feedback {
  id?: string;
  user_id?: string;
  name: string;
  opinion: string;
  timestamp: number;
  likes?: string[];
  dislikes?: string[];
  profile_pic?: string;
}

export interface Material {
  name: string;
  category: string;
  type: string;
  description: string;
}
