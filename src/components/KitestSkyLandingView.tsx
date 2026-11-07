import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, TestItem } from '../types';
import { NavTab } from './Navbar';
import { KitestKiteLogo } from './KitestKiteLogo';
import {
  Trophy,
  FileText,
  Gamepad2,
  Zap,
  BookOpen,
  ArrowRight,
  Play,
  Camera,
  Shield,
  Sun,
  Bell,
  Sparkles,
  Compass,
  GraduationCap,
  Users,
  Send,
  MessageSquare,
  Bot,
} from 'lucide-react';

interface KitestSkyLandingViewProps {
  currentUser: User | null;
  isAdminUnlocked?: boolean;
  tests: TestItem[];
  users: User[];
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenFaceId: () => void;
  onOpenIncognito: () => void;
  onSelectTest: (test: TestItem) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenAiDrawer?: () => void;
}

export const KitestSkyLandingView: React.FC<KitestSkyLandingViewProps> = ({
  currentUser,
  onOpenAuth,
  onOpenFaceId,
  onOpenIncognito,
  onNavigateTab,
  onOpenAiDrawer,
}) => {
  const [activeNavPill, setActiveNavPill] = useState<'home' | 'courses' | 'paths' | 'teachers' | 'achievements' | 'books'>('home');

  return (
    <div className="min-h-screen bg-[#070b14] text-white font-sans flex flex-col relative overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* Background Cosmic Atmosphere & Ambient Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep space gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#19154a] via-[#0d1433]/70 to-transparent blur-3xl opacity-80" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-600/15 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-purple-600/15 blur-[120px] rounded-full" />

        {/* Floating Stars */}
        <svg className="w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12%" cy="18%" r="1.5" fill="#fff" />
          <circle cx="28%" cy="12%" r="1" fill="#38bdf8" />
          <circle cx="45%" cy="25%" r="2" fill="#c084fc" />
          <circle cx="68%" cy="15%" r="1.5" fill="#fff" />
          <circle cx="85%" cy="22%" r="1" fill="#38bdf8" />
          <circle cx="92%" cy="40%" r="2" fill="#fbbf24" />
          <circle cx="18%" cy="65%" r="1.5" fill="#fff" />
          <circle cx="75%" cy="75%" r="1" fill="#c084fc" />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (100% Matching Image 1)                                     */}
      {/* ========================================================================= */}
      <header className="relative z-30 border-b border-indigo-500/20 bg-[#070b14]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left Brand: 3D K Logo + KITESTAI + Ta'lim platformasi */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative">
              <KitestKiteLogo size={42} showWordmark={false} />
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                <span className="text-xl sm:text-2xl font-black text-white tracking-wider">KITEST</span>
                <span className="text-xl sm:text-2xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide -mt-1">
                Ta'lim platformasi
              </p>
            </div>
          </div>

          {/* Center Navigation Pills (Image 1) */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveNavPill('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`py-2 px-4 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                activeNavPill === 'home'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(147,51,234,0.5)] border border-purple-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-sm">🏠</span>
              <span>Bosh sahifa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavPill('courses');
                onNavigateTab('problems');
              }}
              className="py-2 px-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Kurslar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavPill('paths');
                onNavigateTab('duels');
              }}
              className="py-2 px-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Yo'nalishlar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavPill('teachers');
                onNavigateTab('majlis');
              }}
              className="py-2 px-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>O'qituvchilar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavPill('achievements');
                onNavigateTab('leaderboard');
              }}
              className="py-2 px-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-slate-400" />
              <span>Yutuqlar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveNavPill('books');
                onNavigateTab('books_3d');
              }}
              className="py-2 px-3.5 rounded-2xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Kitobxonlar uchun</span>
            </button>
          </nav>

          {/* Right Actions: Theme Toggle, Bell 2, Avatar / Login */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Mavzu rejimi"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-amber-400 transition-colors cursor-pointer"
            >
              <Sun className="w-4 h-4" />
            </button>

            <button
              type="button"
              title="Bildirishnomalar"
              className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-[#070b14]">
                2
              </span>
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={() => onNavigateTab('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-400/40 cursor-pointer transition-all shadow-md group"
                title="Shaxsiy Kabinetga o'tish"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-purple-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                    {currentUser.name?.[0] || 'B'}
                  </div>
                )}
                <span className="text-xs font-black text-white hidden sm:inline">
                  {currentUser.name?.split(' ')[0] || 'Behruz'}
                </span>
                <span className="text-[10px] text-purple-300 font-bold hidden md:inline">➔</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-md shadow-purple-600/40 cursor-pointer overflow-hidden border border-white/20"
                title="Kirish"
              >
                <div className="w-full h-full rounded-full bg-[#0a0f20] flex items-center justify-center text-white font-bold text-xs">
                  👤
                </div>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. GRAND HERO SECTION (100% Pixel-Perfect Recreation of Image 1)          */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 flex flex-col justify-between relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Left Column: Headings, Subtitle, and 4 Buttons (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold backdrop-blur-md shadow-sm">
              <span className="text-sm">🚀</span>
              <span>Kelajak ta'limi — KITESTAI bilan!</span>
            </div>

            {/* Giant Title */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                Kelajagingizni
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(168,85,247,0.4)]">
                KITEST bilan
              </h2>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                quring
              </h3>
            </div>

            {/* Subtitle with Purple Left Border */}
            <div className="border-l-4 border-indigo-500 pl-4 py-0.5">
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Minglab o'quvchilar allaqachon biz bilan o'z bilimini oshirmoqda!
              </p>
            </div>

            {/* Main Action Buttons Matching Image 1 */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Boshlash Button */}
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-[0_8px_24px_rgba(147,51,234,0.5)] flex items-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>🚀</span>
                  <span>Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 2. Kirish Button */}
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="py-3 px-6 rounded-2xl bg-[#0c142b]/90 hover:bg-[#131f42] text-white font-extrabold text-sm border border-indigo-500/40 hover:border-indigo-400 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
                  <span>Kirish</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* 3. Haqiqiy Kamera Face ID Button */}
                <button
                  type="button"
                  onClick={onOpenFaceId}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs border border-white/10 hover:border-cyan-400/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Haqiqiy Kamera Face ID</span>
                </button>

                {/* 4. Accountsiz (Inkognito) Kirish Button */}
                <button
                  type="button"
                  onClick={onOpenIncognito}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs border border-white/10 hover:border-purple-400/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Accountsiz (Inkognito) Kirish</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Robot, Glowing Pedestal, Floating Book & Tablet UI (7 cols) */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[440px] sm:min-h-[500px]">
            {/* Glowing Space Earth & Planetary Rings in Background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-indigo-900/40 via-blue-900/30 to-cyan-500/20 blur-xl opacity-70" />
              {/* Planetary Orbital Rings */}
              <div className="absolute w-[460px] h-[220px] rounded-[100%] border-2 border-cyan-400/30 -rotate-12 pointer-events-none shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
              <div className="absolute w-[520px] h-[260px] rounded-[100%] border border-purple-500/25 -rotate-12 pointer-events-none" />
            </div>

            {/* Floating 3D Book on the Left */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-2, 2, -2],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-2 sm:left-6 bottom-16 sm:bottom-24 z-20 w-24 h-20 sm:w-28 sm:h-24 pointer-events-none drop-shadow-[0_12px_24px_rgba(59,130,246,0.5)]"
            >
              <svg viewBox="0 0 100 80" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="landingBookGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <path d="M50 20 Q30 10 10 20 L10 65 Q30 55 50 65 L50 20 Z" fill="#0f172a" stroke="url(#landingBookGrad)" strokeWidth="2" />
                <path d="M50 20 Q70 10 90 20 L90 65 Q70 55 50 65 L50 20 Z" fill="#0f172a" stroke="url(#landingBookGrad)" strokeWidth="2" />
                <path d="M16 28 Q32 20 46 28" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
                <path d="M16 38 Q32 30 46 38" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                <path d="M16 48 Q32 40 46 48" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
                <path d="M54 28 Q68 20 84 28" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
                <path d="M54 38 Q68 30 84 38" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
                <path d="M54 48 Q68 40 84 48" stroke="#38bdf8" strokeWidth="1.5" opacity="0.4" />
              </svg>
            </motion.div>

            {/* Central 3D Animated Robot Mascot */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-64 h-80 sm:w-72 sm:h-96 flex flex-col items-center justify-center"
            >
              <svg viewBox="0 0 360 420" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="pedestalGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4338ca" />
                    <stop offset="50%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0b0f19" />
                  </linearGradient>
                  <linearGradient id="neonRobotGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="70%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                  </linearGradient>
                  <linearGradient id="robotScreenGradL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#020617" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="cyanGlowEye" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <filter id="neonEyeGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Circular Pedestal / Floating Platform */}
                <ellipse cx="180" cy="380" rx="140" ry="24" fill="url(#pedestalGrad)" stroke="#6366f1" strokeWidth="3" />
                <ellipse cx="180" cy="380" rx="110" ry="16" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                <ellipse cx="180" cy="380" rx="80" ry="10" fill="#020617" />

                {/* Graduation Cap */}
                <path d="M120 70 L180 50 L240 70 L180 85 Z" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="180" cy="70" r="3.5" fill="#fbbf24" />
                <path d="M180 70 Q215 75 225 100" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
                <circle cx="225" cy="100" r="4" fill="#fbbf24" />

                {/* Robot Head Shell */}
                <rect x="110" y="85" width="140" height="110" rx="45" fill="url(#neonRobotGrad)" stroke="#cbd5e1" strokeWidth="2.5" />
                {/* Cute Ear Discs */}
                <circle cx="108" cy="140" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />
                <circle cx="252" cy="140" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" />

                {/* Face Visor Display */}
                <rect x="125" y="100" width="110" height="75" rx="30" fill="url(#robotScreenGradL)" stroke="#38bdf8" strokeWidth="2" />
                {/* Glowing Smiling Eyes */}
                <path d="M142 135 Q152 122 162 135" stroke="url(#cyanGlowEye)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#neonEyeGlow)" />
                <path d="M188 135 Q198 122 208 135" stroke="url(#cyanGlowEye)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#neonEyeGlow)" />

                {/* Robot Body */}
                <path d="M140 200 Q180 210 220 200 L230 280 Q180 290 130 280 Z" fill="url(#neonRobotGrad)" stroke="#cbd5e1" strokeWidth="2.5" />
                <circle cx="180" cy="240" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <text x="175" y="246" fill="#fff" fontSize="16" fontWeight="bold">K</text>

                {/* Left Arm Pointing to Tablet Screen */}
                <path d="M130 215 Q80 215 60 190 Q50 180 40 170" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" fill="none" />
                <circle cx="40" cy="170" r="10" fill="#0284c7" />

                {/* Right Arm Holding Tablet */}
                <path d="M225 215 Q265 240 250 270" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" fill="none" />

                {/* Tablet held in hand with "K" */}
                <rect x="220" y="220" width="65" height="90" rx="10" fill="#0c142b" stroke="#38bdf8" strokeWidth="2" />
                <rect x="228" y="228" width="49" height="74" rx="6" fill="#020617" />
                <text x="244" y="270" fill="#38bdf8" fontSize="28" fontWeight="black" filter="url(#neonEyeGlow)">K</text>
              </svg>
            </motion.div>

            {/* Floating 3D Tablet UI Card on the Right (100% Matching Image 1) */}
            <motion.div
              animate={{
                y: [6, -6, 6],
              }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-2 sm:right-0 top-8 z-20 w-64 sm:w-72 rounded-2xl bg-[#090f22]/95 border-2 border-indigo-400/50 p-4 shadow-[0_16px_36px_rgba(79,70,229,0.5)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">KITEST</span>
                  <span className="text-xs font-black text-cyan-400">AI</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Olimpiada</span>
              </div>

              {/* Inside Tablet Card: Olimpiada & Trophy */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-black text-white">Olimpiada</div>
                  <div className="text-[10px] text-slate-300">Bilimingizni sinab ko'ring</div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('contests')}
                    className="mt-2 py-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <span>Boshlash ➔</span>
                  </button>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-inner">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
              </div>

              {/* Rising Stats Graph Bars */}
              <div className="mt-3 flex items-end gap-1.5 h-9 px-1">
                <span className="w-3 rounded-t-sm bg-purple-500/40 h-3" />
                <span className="w-3 rounded-t-sm bg-purple-500/60 h-4" />
                <span className="w-3 rounded-t-sm bg-indigo-500/70 h-6" />
                <span className="w-3 rounded-t-sm bg-cyan-400 h-9 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <span className="text-[10px] text-cyan-300 font-bold ml-auto font-mono">+85% O'sish</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM 5 CATEGORY CARDS (100% Matching Image 1)                       */}
        {/* ========================================================================= */}
        <div className="mt-12 pt-8 border-t border-indigo-500/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Olimpiada */}
          <button
            type="button"
            onClick={() => onNavigateTab('contests')}
            className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-purple-400/50 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs font-black text-white">Olimpiada</div>
            <div className="text-[10px] text-slate-400">Bilimingizni sinab ko'ring</div>
          </button>

          {/* Card 2: Testlar */}
          <button
            type="button"
            onClick={() => onNavigateTab('problems')}
            className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-sky-400/50 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-xs font-black text-white">Testlar</div>
            <div className="text-[10px] text-slate-400">Bilimni mustahkamlang</div>
          </button>

          {/* Card 3: Kiteshot */}
          <button
            type="button"
            onClick={() => onNavigateTab('gameball')}
            className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-emerald-400/50 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-xs font-black text-white">Kiteshot</div>
            <div className="text-[10px] text-slate-400">Qiziqarli o'yinlar</div>
          </button>

          {/* Card 4: Yutuqlar */}
          <button
            type="button"
            onClick={() => onNavigateTab('leaderboard')}
            className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-amber-400/50 text-left transition-all cursor-pointer group shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xs font-black text-white">Yutuqlar</div>
            <div className="text-[10px] text-slate-400">Natijalaringizni kuzating</div>
          </button>

          {/* Card 5: Kitobxonlar uchun */}
          <button
            type="button"
            onClick={() => onNavigateTab('books_3d')}
            className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-pink-400/50 text-left transition-all cursor-pointer group col-span-2 sm:col-span-1 shadow-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 text-pink-400" />
            </div>
            <div className="text-xs font-black text-white">Kitobxonlar uchun</div>
            <div className="text-[10px] text-slate-400">Foydali kitoblar</div>
          </button>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 4. FOOTER: Social Links (Telegram, YouTube, GitHub)                        */}
      {/* ========================================================================= */}
      <footer className="border-t border-indigo-500/20 bg-[#060a16] py-6 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">KITEST AI</span>
            <span>— Innovatsion milliy ta'lim ekotizimi. Barcha huquqlar himoyalangan.</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={(() => {
                try {
                  const s = localStorage.getItem('kitest_external_links');
                  if (s) return JSON.parse(s).kitestGramUrl || 'https://t.me/kitest_uz';
                } catch {}
                return 'https://t.me/kitest_uz';
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors"
            >
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Telegram</span>
            </a>
            <a
              href={(() => {
                try {
                  const s = localStorage.getItem('kitest_external_links');
                  if (s) return JSON.parse(s).youtubeUrl || 'https://youtube.com/@kitest_uz';
                } catch {}
                return 'https://youtube.com/@kitest_uz';
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
            >
              <Play className="w-4 h-4 text-red-500" />
              <span>YouTube</span>
            </a>
            <a
              href={(() => {
                try {
                  const s = localStorage.getItem('kitest_external_links');
                  if (s) return JSON.parse(s).githubUrl || 'https://github.com/kitest-platform';
                } catch {}
                return 'https://github.com/kitest-platform';
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-purple-400 transition-colors"
            >
              <span className="font-mono font-bold text-purple-400">GitHub</span>
            </a>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 5. FLOATING AI ASSISTANT MASCOT BUBBLE (Bottom Right - Matching Image 1)  */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <motion.button
          type="button"
          onClick={() => (onOpenAiDrawer ? onOpenAiDrawer() : onNavigateTab('gemini_ai'))}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Speech Bubble Pill */}
          <div className="py-2.5 px-4 rounded-2xl bg-white text-slate-900 font-extrabold text-xs shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <span>Sun'iy intellekt (AI) yordamchisi</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Glowing 3D Robot Head Mascot */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-[0_0_24px_rgba(79,70,229,0.7)] group-hover:shadow-[0_0_32px_rgba(6,182,212,0.9)] transition-shadow">
            <div className="w-full h-full rounded-full bg-[#0a0f20] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none">
                {/* Robot Helmet */}
                <rect x="20" y="24" width="60" height="52" rx="20" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="28" y="32" width="44" height="34" rx="12" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
                {/* Smiling Cyan Eyes */}
                <path d="M35 48 Q40 42 45 48" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M55 48 Q60 42 65 48" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none" />
                {/* Antennas */}
                <circle cx="16" cy="50" r="4" fill="#0284c7" />
                <circle cx="84" cy="50" r="4" fill="#0284c7" />
              </svg>
            </div>
            {/* Online Green Indicator Dot */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#070b14]" />
          </div>
        </motion.button>
      </div>
    </div>
  );
};
