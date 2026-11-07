import React from 'react';
import { motion } from 'motion/react';

/**
 * Official KITEST Kite Logo matching the design pictures:
 * - Geometric faceted kite with cyan/blue/indigo facets
 * - Cross struts and tail with ribbon bows
 */
export const KitestKiteLogo: React.FC<{
  className?: string;
  size?: number;
  showWordmark?: boolean;
  showSlogan?: boolean;
  variant?: 'flying' | 'faceted' | 'vortex';
}> = ({
  className = '',
  size = 40,
  showWordmark = false,
  showSlogan = false,
  variant = 'flying',
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {variant === 'flying' && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]"
        >
          <defs>
            <linearGradient id="kPillarStem" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="kArmTopNeon" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id="kArmBottomNeon" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="kGlossSpecular" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="kGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Left Vertical Pillar with rounded pill caps */}
          <rect x="16" y="12" width="16" height="76" rx="8" fill="url(#kPillarStem)" />
          <rect x="18" y="14" width="4.5" height="72" rx="2.25" fill="url(#kGlossSpecular)" />

          {/* Upper Diagonal Arm (Neon Violet / Magenta) with rounded cap */}
          <path
            d="M34 50 L68 18 C71 15 77 15 81 19 C85 23 85 29 81 33 L49 61 Z"
            fill="url(#kArmTopNeon)"
          />
          <path
            d="M36 49 L68 20 C70 18 74 18 77 21 L47 52 Z"
            fill="url(#kGlossSpecular)"
            opacity="0.5"
          />

          {/* Lower Diagonal Arm (Neon Cyan / Blue) with rounded cap */}
          <path
            d="M36 48 L71 81 C75 85 81 85 85 81 C89 77 89 71 85 67 L51 36 Z"
            fill="url(#kArmBottomNeon)"
          />
          <path
            d="M38 49 L71 80 C73 82 77 82 80 79 L49 46 Z"
            fill="url(#kGlossSpecular)"
            opacity="0.4"
          />

          {/* Core Intersection Highlight Orb */}
          <circle cx="40" cy="50" r="3.5" fill="#ffffff" filter="url(#kGlowFilter)" />
        </svg>
      )}

      {variant === 'vortex' && (
        <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]"
          >
            <defs>
              <linearGradient id="vortexG1" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            {/* Glowing Orbit Rings */}
            <circle cx="50" cy="50" r="42" stroke="rgba(56,189,248,0.3)" strokeWidth="1.5" strokeDasharray="6 3" />
            <ellipse cx="50" cy="50" rx="44" ry="24" stroke="rgba(147,197,253,0.4)" strokeWidth="2" transform="rotate(-25 50 50)" />

            {/* 3 Curved Kite Aerodynamic Blades */}
            <path
              d="M50 50 Q56 22 75 25 Q68 45 50 50 Z"
              fill="url(#vortexG1)"
              className="drop-shadow-sm"
            />
            <path
              d="M50 50 Q28 32 24 50 Q42 64 50 50 Z"
              fill="#0ea5e9"
            />
            <path
              d="M50 50 Q52 78 70 70 Q62 55 50 50 Z"
              fill="#2563eb"
            />
          </svg>
        </div>
      )}

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
              KITEST<span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase leading-tight mt-0.5">
            Ta'lim platformasi
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Floating Sky Kites Background matching the uploaded images (k3BbK.jpg, 53B5s.jpg, LfU09.jpg)
 * Colorful kites (pink, yellow, green, purple) gracefully drifting among soft clouds.
 */
export const KitestSkyBackground: React.FC<{
  children?: React.ReactNode;
  showKites?: boolean;
  className?: string;
}> = ({ children, showKites = true, className = '' }) => {
  return (
    <div className={`relative min-h-screen bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#ffffff] text-slate-900 overflow-x-hidden ${className}`}>
      {/* Soft Sky Ambient Lights & Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Cloud silhouettes */}
        <div className="absolute -top-16 -left-20 w-96 h-96 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute top-40 right-[-10%] w-[38rem] h-[38rem] rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-[32rem] h-[32rem] rounded-full bg-blue-50/80 blur-3xl" />

        {/* Floating Decorative Kites */}
        {showKites && (
          <>
            {/* Top-left Pink Kite */}
            <motion.div
              animate={{
                y: [-8, 8, -8],
                x: [-4, 6, -4],
                rotate: [-4, 5, -4],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-12 left-[6%] sm:left-[10%] w-14 h-18 opacity-85 select-none"
            >
              <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-[0_8px_16px_rgba(244,114,182,0.3)]">
                <path d="M30 4 L10 32 L30 56 L50 32 Z" fill="#f472b6" />
                <path d="M30 32 L50 32 L30 56 Z" fill="#ec4899" opacity="0.4" />
                <line x1="30" y1="4" x2="30" y2="56" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <line x1="10" y1="32" x2="50" y2="32" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <path d="M30 56 Q24 64 27 72 T20 80" stroke="#f472b6" strokeWidth="1.2" fill="none" />
                <circle cx="25" cy="65" r="1.8" fill="#fb7185" />
                <circle cx="23" cy="73" r="1.8" fill="#fda4af" />
              </svg>
            </motion.div>

            {/* Bottom-left Purple Kite */}
            <motion.div
              animate={{
                y: [6, -10, 6],
                x: [5, -4, 5],
                rotate: [5, -5, 5],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-80 sm:top-96 left-[3%] sm:left-[5%] w-12 h-16 opacity-80 select-none"
            >
              <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-[0_8px_16px_rgba(168,85,247,0.3)]">
                <path d="M30 4 L10 32 L30 56 L50 32 Z" fill="#a855f7" />
                <path d="M30 32 L50 32 L30 56 Z" fill="#9333ea" opacity="0.4" />
                <line x1="30" y1="4" x2="30" y2="56" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <line x1="10" y1="32" x2="50" y2="32" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <path d="M30 56 Q36 65 32 73 T38 80" stroke="#a855f7" strokeWidth="1.2" fill="none" />
                <circle cx="34" cy="66" r="1.8" fill="#c084fc" />
              </svg>
            </motion.div>

            {/* Top-right Mint-Green Kite */}
            <motion.div
              animate={{
                y: [-10, 6, -10],
                x: [4, -5, 4],
                rotate: [-6, 4, -6],
              }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-16 right-[8%] sm:right-[12%] w-14 h-18 opacity-85 select-none"
            >
              <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-[0_8px_16px_rgba(52,211,153,0.3)]">
                <path d="M30 4 L10 32 L30 56 L50 32 Z" fill="#34d399" />
                <path d="M30 32 L50 32 L30 56 Z" fill="#059669" opacity="0.35" />
                <line x1="30" y1="4" x2="30" y2="56" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <line x1="10" y1="32" x2="50" y2="32" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <path d="M30 56 Q35 64 31 72 T37 80" stroke="#34d399" strokeWidth="1.2" fill="none" />
                <circle cx="33" cy="64" r="1.8" fill="#6ee7b7" />
              </svg>
            </motion.div>

            {/* Mid-right Golden-Yellow Kite */}
            <motion.div
              animate={{
                y: [8, -8, 8],
                x: [-3, 5, -3],
                rotate: [4, -4, 4],
              }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute top-64 sm:top-80 right-[4%] sm:right-[7%] w-12 h-16 opacity-85 select-none"
            >
              <svg viewBox="0 0 60 80" className="w-full h-full drop-shadow-[0_8px_16px_rgba(251,191,36,0.35)]">
                <path d="M30 4 L10 32 L30 56 L50 32 Z" fill="#fbbf24" />
                <path d="M30 32 L50 32 L30 56 Z" fill="#d97706" opacity="0.35" />
                <line x1="30" y1="4" x2="30" y2="56" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <line x1="10" y1="32" x2="50" y2="32" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                <path d="M30 56 Q25 65 28 73 T22 80" stroke="#fbbf24" strokeWidth="1.2" fill="none" />
                <circle cx="26" cy="65" r="1.8" fill="#fde047" />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * KITEST Splash / Loading Screen matching k3BbK.jpg:
 * - 3D glowing blue curved kite pinwheel spinning smoothly inside orbit rings
 * - "Yuklanmoqda..."
 * - Percentage counter (e.g. 67% -> 100%)
 * - Sleek rounded progress bar
 * - Floating clouds and pastel kites in background
 */
export const KitestSplashScreen: React.FC<{
  progress?: number;
  onFinish?: () => void;
}> = ({ progress = 67, onFinish }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-radial from-[#121c38] via-[#080d1e] to-[#04060d] px-6 select-none overflow-hidden">
      {/* Background Starfield & Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15%" cy="20%" r="1.5" fill="#38bdf8" opacity="0.8" />
          <circle cx="80%" cy="15%" r="2" fill="#c084fc" opacity="0.8" />
          <circle cx="85%" cy="80%" r="1.5" fill="#fbbf24" opacity="0.6" />
          <circle cx="20%" cy="75%" r="2" fill="#34d399" opacity="0.7" />
          <circle cx="50%" cy="90%" r="1" fill="#fff" opacity="0.5" />
        </svg>
      </div>

      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      {/* Center 3D K Emblem with 4 Orbital Pills (Image 4) */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-6">
        {/* Orbital Ellipse Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-72 h-72 rounded-full border border-cyan-500/30 border-dashed"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute w-60 h-40 rounded-full border border-purple-500/40 shadow-[0_0_24px_rgba(168,85,247,0.3)]"
          style={{ transform: 'rotate(-25deg)' }}
        />

        {/* 4 Orbital Feature Badges (Matching Image 4) */}
        {/* 1. Top-Left: Online darslar */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1 -left-4 py-1.5 px-3 rounded-full bg-[#0b1329]/90 border border-sky-400/50 text-sky-300 text-xs font-black shadow-[0_0_16px_rgba(56,189,248,0.35)] flex items-center gap-1.5 backdrop-blur-md"
        >
          <span>🎓</span>
          <span>Online darslar</span>
        </motion.div>

        {/* 2. Top-Right: Testlar */}
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute -top-1 -right-4 py-1.5 px-3 rounded-full bg-[#0b1329]/90 border border-purple-400/50 text-purple-300 text-xs font-black shadow-[0_0_16px_rgba(192,132,252,0.35)] flex items-center gap-1.5 backdrop-blur-md"
        >
          <span>☑️</span>
          <span>Testlar</span>
        </motion.div>

        {/* 3. Bottom-Left: AI Chat */}
        <motion.div
          animate={{ y: [-3, 5, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute -bottom-2 -left-2 py-1.5 px-3 rounded-full bg-[#0b1329]/90 border border-cyan-400/50 text-cyan-300 text-xs font-black shadow-[0_0_16px_rgba(6,182,212,0.35)] flex items-center gap-1.5 backdrop-blur-md"
        >
          <span>🤖</span>
          <span>AI Chat</span>
        </motion.div>

        {/* 4. Bottom-Right: Sertifikat */}
        <motion.div
          animate={{ y: [4, -3, 4] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
          className="absolute -bottom-2 -right-2 py-1.5 px-3 rounded-full bg-[#0b1329]/90 border border-amber-400/50 text-amber-300 text-xs font-black shadow-[0_0_16px_rgba(251,191,36,0.35)] flex items-center gap-1.5 backdrop-blur-md"
        >
          <span>🏆</span>
          <span>Sertifikat</span>
        </motion.div>

        {/* Center 3D K Logo with Graduation Cap & Book */}
        <motion.div
          animate={{
            scale: [0.98, 1.03, 0.98],
            rotate: [-2, 2, -2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-36 h-36 flex items-center justify-center drop-shadow-[0_0_32px_rgba(56,189,248,0.6)]"
        >
          <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="splashKStem" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="splashKTopArm" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="splashKBotArm" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="goldCapGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Graduation Cap on top of K */}
            <path d="M60 12 L85 22 L60 32 L35 22 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <path d="M60 22 L78 29 L78 35 C78 40 60 45 60 45 C60 45 42 40 42 35 L42 29 Z" fill="#0f172a" />
            <circle cx="60" cy="22" r="2.5" fill="url(#goldCapGrad)" />
            <path d="M60 22 Q75 25 80 38" stroke="url(#goldCapGrad)" strokeWidth="1.5" fill="none" />
            <circle cx="80" cy="38" r="2" fill="url(#goldCapGrad)" />

            {/* 3D K Pillar */}
            <rect x="28" y="32" width="16" height="58" rx="8" fill="url(#splashKStem)" stroke="#38bdf8" strokeWidth="1.2" />
            <rect x="31" y="35" width="4" height="52" rx="2" fill="#fff" opacity="0.6" />

            {/* Upper Arm (Magenta-Purple) */}
            <path d="M46 58 L78 32 C82 28 88 29 91 33 C94 37 93 43 89 47 L58 68 Z" fill="url(#splashKTopArm)" />
            {/* Lower Arm (Cyan-Blue) */}
            <path d="M48 64 L80 96 C84 100 90 99 94 95 C98 91 97 85 93 81 L60 52 Z" fill="url(#splashKBotArm)" />

            {/* Open Book Base under K */}
            <path d="M30 96 Q60 92 60 102 Q60 92 90 96 L88 106 Q60 102 60 110 Q60 102 32 106 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <path d="M34 98 Q60 95 60 104 Q60 95 86 98" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.8" />
          </svg>
        </motion.div>
      </div>

      {/* Brand Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 flex items-center gap-1.5">
        <span>KITEST</span>
        <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">AI</span>
      </h1>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
        Ta'lim platformasi
      </p>

      {/* Loading Status & Percent */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-slate-300">Yuklanmoqda...</span>
        <span className="text-sm font-mono font-black text-cyan-400">{Math.round(progress)}%</span>
      </div>

      {/* Glowing Neon Cosmic Progress Bar */}
      <div className="w-64 sm:w-80 h-2.5 rounded-full bg-[#0d152c] p-0.5 border border-indigo-500/40 shadow-[0_0_16px_rgba(79,70,229,0.3)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          initial={{ width: '0%' }}
          animate={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/**
 * Magnificent 3D Flying Kite Illustration matching image.png:
 * - Rich 3D shaded geometric kite facets
 * - High-tech specular light edges
 * - Gracefully flowing tail with cute ribbon bows
 */
export const Kitest3DKiteIllustration: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 110 }) => {
  return (
    <motion.div
      animate={{
        y: [-6, 6, -6],
        x: [-2, 3, -2],
        rotate: [-3, 3, -3],
      }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size * 1.25 }}
    >
      <svg
        viewBox="0 0 120 150"
        className="w-full h-full drop-shadow-[0_12px_24px_rgba(37,99,235,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="facetTopLeft" x1="20" y1="15" x2="60" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="facetTopRight" x1="60" y1="15" x2="100" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="facetBottomLeft" x1="30" y1="65" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <linearGradient id="facetBottomRight" x1="90" y1="65" x2="60" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Shaded 3D Facets */}
        <path d="M60 12 L22 65 L60 106 Z" fill="url(#facetTopLeft)" />
        <path d="M60 12 L98 65 L60 106 Z" fill="url(#facetTopRight)" />
        <path d="M60 65 L22 65 L60 106 Z" fill="url(#facetBottomLeft)" opacity="0.6" />
        <path d="M60 65 L98 65 L60 106 Z" fill="url(#facetBottomRight)" opacity="0.7" />

        {/* Specular Edge Highlights */}
        <line x1="60" y1="12" x2="60" y2="106" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
        <line x1="22" y1="65" x2="98" y2="65" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />

        {/* Diagonal Tension Ribs */}
        <line x1="32" y1="36" x2="88" y2="92" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />
        <line x1="88" y1="36" x2="32" y2="92" stroke="#ffffff" strokeWidth="0.8" opacity="0.4" />

        {/* Flowing Kite Tail */}
        <path
          d="M60 106 C50 118 45 125 54 135 C60 142 48 146 40 148"
          stroke="#2563eb"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ribbon Bows on Tail */}
        <circle cx="50" cy="120" r="3" fill="#38bdf8" />
        <path d="M44 117 L56 123 M56 117 L44 123" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />

        <circle cx="51" cy="132" r="3" fill="#60a5fa" />
        <path d="M45 129 L57 135 M57 129 L45 135" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />

        <circle cx="43" cy="144" r="3" fill="#f472b6" />
        <path d="M37 141 L49 147 M49 141 L37 147" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
};

/**
 * Super Glorious Animated Kite with Glowing Aura, Specular Facets & Wind Trails:
 * 100% matches user request: "varak rasmii ajoyibroq qil"
 */
export const KitestGloriousKite: React.FC<{
  className?: string;
  size?: number;
  showRays?: boolean;
}> = ({ className = '', size = 160, showRays = true }) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer Glow Halo & Ambient Radial Light */}
      <div
        className="absolute rounded-full bg-gradient-to-tr from-sky-400/30 via-blue-500/20 to-indigo-500/30 blur-2xl pointer-events-none animate-pulse"
        style={{ width: size * 1.5, height: size * 1.5 }}
      />

      {/* Orbiting Sparkle Rings */}
      {showRays && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute rounded-full border border-sky-300/30 border-dashed pointer-events-none"
          style={{ width: size * 1.35, height: size * 1.35 }}
        />
      )}

      {/* Main Flying Kite Motion Frame */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          x: [-4, 5, -4],
          rotate: [-4, 4, -4],
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: size, height: size * 1.28 }}
        className="relative z-10 drop-shadow-[0_16px_32px_rgba(37,99,235,0.4)]"
      >
        <svg
          viewBox="0 0 160 200"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Rich multi-stop crystalline gradients */}
            <linearGradient id="gFacetTL" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="gFacetTR" x1="80" y1="20" x2="140" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="gFacetBL" x1="30" y1="90" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="gFacetBR" x1="130" y1="90" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="gGoldenCore" x1="80" y1="20" x2="80" y2="150" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <filter id="softKiteGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Wind Stream Particles */}
          <path d="M10 60 Q40 45 60 70" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <path d="M110 30 Q130 50 150 40" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* 3D Geometric Diamond Facets */}
          <path d="M80 15 L25 85 L80 145 Z" fill="url(#gFacetTL)" filter="url(#softKiteGlow)" />
          <path d="M80 15 L135 85 L80 145 Z" fill="url(#gFacetTR)" filter="url(#softKiteGlow)" />
          <path d="M80 85 L25 85 L80 145 Z" fill="url(#gFacetBL)" opacity="0.75" />
          <path d="M80 85 L135 85 L80 145 Z" fill="url(#gFacetBR)" opacity="0.85" />

          {/* Structural High-Strength Spine and Crossbars */}
          <line x1="80" y1="15" x2="80" y2="145" stroke="url(#gGoldenCore)" strokeWidth="3" strokeLinecap="round" />
          <line x1="25" y1="85" x2="135" y2="85" stroke="url(#gGoldenCore)" strokeWidth="3" strokeLinecap="round" />

          {/* Fine Crystalline Internal Facet Lines */}
          <line x1="38" y1="48" x2="122" y2="122" stroke="#ffffff" strokeWidth="1" opacity="0.45" />
          <line x1="122" y1="48" x2="38" y2="122" stroke="#ffffff" strokeWidth="1" opacity="0.45" />

          {/* Specular White Light Star at the Apex */}
          <circle cx="80" cy="15" r="3.5" fill="#ffffff" />
          <circle cx="80" cy="85" r="4.5" fill="#ffffff" />
          <circle cx="25" cy="85" r="3" fill="#ffffff" />
          <circle cx="135" cy="85" r="3" fill="#ffffff" />

          {/* Flowing Graceful Silk Tail */}
          <path
            d="M80 145 C65 160 60 172 74 182 C85 190 70 196 55 198"
            stroke="#2563eb"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Tail Ribbon Bow 1 (Cyan) */}
          <circle cx="68" cy="162" r="3.5" fill="#38bdf8" />
          <path d="M60 158 L76 166 M76 158 L60 166" stroke="#0284c7" strokeWidth="2.4" strokeLinecap="round" />

          {/* Tail Ribbon Bow 2 (Royal Blue) */}
          <circle cx="70" cy="177" r="3.5" fill="#60a5fa" />
          <path d="M62 173 L78 181 M78 173 L62 181" stroke="#1d4ed8" strokeWidth="2.4" strokeLinecap="round" />

          {/* Tail Ribbon Bow 3 (Pink/Rose) */}
          <circle cx="62" cy="192" r="3.5" fill="#f472b6" />
          <path d="M54 188 L70 196 M70 188 L54 196" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
};

