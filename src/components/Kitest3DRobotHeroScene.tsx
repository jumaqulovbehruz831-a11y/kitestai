import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Trophy, ArrowRight, Play, Sparkles, BookOpen } from 'lucide-react';
import { NavTab } from './Navbar';

interface Kitest3DRobotHeroSceneProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const Kitest3DRobotHeroScene: React.FC<Kitest3DRobotHeroSceneProps> = ({
  onNavigateTab,
}) => {
  // State for eye blinking animation
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 220);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // 3D Parallax Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 180 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const robotRotateX = useTransform(smoothMouseY, [-200, 200], [5, -5]);
  const robotRotateY = useTransform(smoothMouseX, [-200, 200], [-7, 7]);

  const tabletRotateX = useTransform(smoothMouseY, [-200, 200], [8, 0]);
  const tabletRotateY = useTransform(smoothMouseX, [-200, 200], [-18, -6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-2xl mx-auto min-h-[480px] sm:min-h-[540px] flex items-center justify-center select-none"
      style={{ perspective: '1200px' }}
    >
      {/* ===================================================================== */}
      {/* 1. DEEP SPACE BACKDROP & GLOWING EARTH GLOBE                          */}
      {/* ===================================================================== */}
      <div className="absolute right-2 sm:right-6 top-6 sm:top-8 w-72 sm:w-96 h-72 sm:h-96 pointer-events-none">
        {/* Atmospheric Cyan-Blue Halo */}
        <div className="absolute inset-0 rounded-full bg-radial from-cyan-500/25 via-blue-600/15 to-transparent blur-2xl transform scale-110" />

        {/* 3D Rendered Earth Sphere with Continents & Grid */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
          <defs>
            {/* Sphere 3D shading */}
            <radialGradient id="globeShade" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#1d4ed8" stopOpacity="0.8" />
              <stop offset="75%" stopColor="#0b1e4f" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#030718" stopOpacity="1" />
            </radialGradient>

            {/* Glowing atmosphere rim */}
            <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
              <stop offset="85%" stopColor="transparent" />
              <stop offset="97%" stopColor="#38bdf8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
            </radialGradient>

            {/* Orbit Glow */}
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Base Globe Sphere */}
          <circle cx="100" cy="100" r="92" fill="url(#globeShade)" />

          {/* Latitude Lines */}
          <ellipse cx="100" cy="100" rx="90" ry="25" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="90" ry="50" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
          <ellipse cx="100" cy="100" rx="90" ry="75" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.3" />
          {/* Longitude Lines */}
          <ellipse cx="100" cy="100" rx="28" ry="90" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="60" ry="90" fill="none" stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35" />
          <line x1="100" y1="8" x2="100" y2="192" stroke="#60a5fa" strokeWidth="0.8" opacity="0.3" />

          {/* Glowing Continents (Europe, Asia, Africa outlines) */}
          <g fill="#38bdf8" opacity="0.65" filter="drop-shadow(0 0 4px #0284c7)">
            {/* Eurasia Landmass */}
            <path d="M 95 40 Q 115 35, 135 45 Q 160 50, 155 75 Q 140 85, 120 70 Q 105 80, 85 65 Q 90 48, 95 40 Z" />
            <path d="M 130 75 Q 150 80, 165 95 Q 155 110, 135 105 Q 125 90, 130 75 Z" />
            {/* Africa outline */}
            <path d="M 85 75 Q 100 80, 105 105 Q 100 135, 80 145 Q 70 120, 75 95 Z" />
            {/* Japan / islands */}
            <circle cx="168" cy="82" r="3" />
            <circle cx="172" cy="88" r="2.5" />
          </g>

          {/* Atmosphere rim */}
          <circle cx="100" cy="100" r="92" fill="url(#rimGlow)" />
        </svg>

        {/* Outer Orbit Light Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 pointer-events-none"
        >
          <svg viewBox="0 0 240 240" className="w-full h-full">
            <ellipse
              cx="120"
              cy="120"
              rx="115"
              ry="45"
              fill="none"
              stroke="url(#orbitGrad)"
              strokeWidth="1.5"
              strokeDasharray="8 6"
              transform="rotate(-25 120 120)"
            />
            {/* Orbiting Satellite Star */}
            <circle cx="215" cy="80" r="3" fill="#38bdf8" className="animate-pulse shadow-[0_0_8px_#38bdf8]" />
            <circle cx="28" cy="155" r="2.5" fill="#c084fc" className="animate-pulse shadow-[0_0_8px_#c084fc]" />
          </svg>
        </motion.div>
      </div>

      {/* ===================================================================== */}
      {/* 2. FLOATING 3D TRANSLUCENT PLAY BUTTONS (Background Depth)             */}
      {/* ===================================================================== */}
      <motion.div
        animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-6 top-16 pointer-events-none z-10"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-blue-500/10 to-transparent border border-cyan-400/40 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <Play className="w-5 h-5 text-cyan-300 fill-cyan-400/40 ml-0.5" />
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [6, -6, 6], rotate: [4, -4, 4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-12 sm:right-24 top-10 pointer-events-none z-10"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/25 via-pink-500/15 to-transparent border border-purple-400/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
          <Play className="w-4 h-4 text-purple-300 fill-purple-400/40 ml-0.5" />
        </div>
      </motion.div>

      {/* ===================================================================== */}
      {/* 3. CYBER PEDESTAL PLATFORM (Base for Robot Mascot)                    */}
      {/* ===================================================================== */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-80 sm:w-96 h-28 pointer-events-none z-10">
        <svg viewBox="0 0 380 110" className="w-full h-full">
          <defs>
            <linearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="pedestalRim" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="90%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Ambient Platform Shadow */}
          <ellipse cx="190" cy="75" rx="160" ry="24" fill="#000000" opacity="0.6" filter="blur(8px)" />

          {/* Lower Cylindrical Rim */}
          <path d="M 50 55 C 50 78, 330 78, 330 55 L 330 70 C 330 92, 50 92, 50 70 Z" fill="#0a0f24" stroke="#4338ca" strokeWidth="1" />

          {/* Middle Glowing Tier */}
          <ellipse cx="190" cy="55" rx="140" ry="22" fill="url(#pedestalGrad)" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(56,189,248,0.7))" />

          {/* Top Platform Disc */}
          <ellipse cx="190" cy="50" rx="115" ry="17" fill="#0f172a" stroke="#a855f7" strokeWidth="2" filter="drop-shadow(0 0 10px rgba(168,85,247,0.8))" />

          {/* Central Energy Core on Pedestal */}
          <ellipse cx="190" cy="50" rx="85" ry="12" fill="#06b6d4" opacity="0.3" filter="blur(4px)" />
          <ellipse cx="190" cy="50" rx="60" ry="8" fill="#ffffff" opacity="0.6" filter="blur(2px)" />

          {/* Concentric Neon Rings */}
          <ellipse cx="190" cy="48" rx="160" ry="25" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.5" />
        </svg>
      </div>

      {/* ===================================================================== */}
      {/* 4. MAGIC FLOATING OPEN BOOK (Left Side of Robot)                      */}
      {/* ===================================================================== */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
          rotate: [-3, 3, -3],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-2 sm:left-6 bottom-20 sm:bottom-28 z-20 cursor-pointer group"
        onClick={() => onNavigateTab('books_3d')}
        title="Kitobxonlar uchun kutubxona"
      >
        <div className="relative w-28 sm:w-36 h-24 sm:h-28">
          {/* Magic Glow underneath book */}
          <div className="absolute inset-0 bg-radial from-cyan-400/40 via-blue-500/20 to-transparent blur-xl transform scale-125" />

          {/* 3D SVG Open Book */}
          <svg viewBox="0 0 140 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(6,182,212,0.6)]">
            <defs>
              <linearGradient id="pageLeft" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="pageRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
              <linearGradient id="bookCover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Book Spine / Cover */}
            <path d="M 12 75 C 38 72, 66 74, 70 82 C 74 74, 102 72, 128 75 L 128 78 C 102 75, 74 77, 70 85 C 66 77, 38 75, 12 78 Z" fill="url(#bookCover)" stroke="#38bdf8" strokeWidth="1.2" />

            {/* Left Pages Block (Curved open page) */}
            <path d="M 16 35 C 36 28, 58 32, 70 42 L 70 76 C 58 68, 36 64, 16 70 Z" fill="url(#pageLeft)" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Left Page Text Lines */}
            <line x1="26" y1="45" x2="58" y2="42" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="26" y1="52" x2="55" y2="49" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="26" y1="59" x2="52" y2="56" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

            {/* Right Pages Block (Curved open page) */}
            <path d="M 70 42 C 82 32, 104 28, 124 35 L 124 70 C 104 64, 82 68, 70 76 Z" fill="url(#pageRight)" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Right Page Text Lines */}
            <line x1="82" y1="42" x2="114" y2="45" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="85" y1="49" x2="114" y2="52" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <line x1="88" y1="56" x2="114" y2="59" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

            {/* Glowing Center Seam */}
            <line x1="70" y1="40" x2="70" y2="78" stroke="#38bdf8" strokeWidth="2.5" filter="drop-shadow(0 0 6px #38bdf8)" />

            {/* Rising Light Rays / Magic Sparkles */}
            <circle cx="50" cy="24" r="1.5" fill="#38bdf8" className="animate-ping" />
            <circle cx="70" cy="18" r="2" fill="#ffffff" className="animate-pulse" />
            <circle cx="90" cy="22" r="1.5" fill="#c084fc" className="animate-ping" />
          </svg>
        </div>
      </motion.div>

      {/* ===================================================================== */}
      {/* 5. 3D ROBOT GRADUATE MASCOT (Centerpiece)                              */}
      {/* ===================================================================== */}
      <motion.div
        style={{
          rotateX: robotRotateX,
          rotateY: robotRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [-7, 7, -7],
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-30 w-64 sm:w-72 h-80 sm:h-92 flex items-center justify-center -ml-16 sm:-ml-24"
      >
        <svg viewBox="0 0 280 340" className="w-full h-full drop-shadow-[0_16px_36px_rgba(2,132,199,0.45)]">
          <defs>
            {/* High-Gloss 3D Robot White Plastic */}
            <radialGradient id="robotWhite3D" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#f1f5f9" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>

            {/* Metallic Cobalt Blue for Torso & Ears */}
            <radialGradient id="robotBlue3D" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="80%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </radialGradient>

            {/* Dark Obsidian Glass Visor */}
            <linearGradient id="visorGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="50%" stopColor="#030712" />
              <stop offset="100%" stopColor="#080e1e" />
            </linearGradient>

            {/* Visor Specular Reflection */}
            <linearGradient id="visorShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Gold Gradient for Graduation Tassel */}
            <linearGradient id="goldTassel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Cap Black Velvet Gradient */}
            <linearGradient id="capBlack" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>

          {/* ================= ROBOT BODY & TORSO ================= */}
          <g transform="translate(0, 40)">
            {/* Robot Neck */}
            <rect x="122" y="150" width="36" height="24" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1" />
            <line x1="126" y1="158" x2="154" y2="158" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
            <line x1="126" y1="164" x2="154" y2="164" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />

            {/* Main Torso Outer Shell */}
            <path
              d="M 95 168 C 95 168, 140 160, 185 168 C 205 172, 212 195, 208 235 C 204 265, 180 275, 140 275 C 100 275, 76 265, 72 235 C 68 195, 75 172, 95 168 Z"
              fill="url(#robotBlue3D)"
              stroke="#38bdf8"
              strokeWidth="2"
              filter="drop-shadow(0 8px 16px rgba(2,132,199,0.5))"
            />

            {/* Torso Center White Breastplate */}
            <path
              d="M 112 176 C 112 176, 140 172, 168 176 C 182 180, 186 195, 184 225 C 182 250, 165 258, 140 258 C 115 258, 98 250, 96 225 C 94 195, 98 180, 112 176 Z"
              fill="url(#robotWhite3D)"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />

            {/* Center Glowing Power Emblem (KITEST Logo Badge) */}
            <circle cx="140" cy="215" r="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 8px #38bdf8)" />
            <circle cx="140" cy="215" r="10" fill="#ffffff" opacity="0.9" />
            <path d="M 136 210 L 144 215 L 136 220 Z" fill="#0284c7" />
          </g>

          {/* ================= ROBOT HEAD ================= */}
          <g>
            {/* White Glossy Spherical Head Capsule */}
            <rect
              x="65"
              y="58"
              width="150"
              height="115"
              rx="55"
              fill="url(#robotWhite3D)"
              stroke="#f8fafc"
              strokeWidth="2.5"
              filter="drop-shadow(0 10px 24px rgba(0,0,0,0.5))"
            />

            {/* Blue Audio Earcups / Headphones */}
            {/* Left Earcup */}
            <rect x="52" y="88" width="18" height="48" rx="8" fill="url(#robotBlue3D)" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="61" cy="112" r="6" fill="#38bdf8" opacity="0.8" className="animate-pulse" />
            {/* Right Earcup */}
            <rect x="210" y="88" width="18" height="48" rx="8" fill="url(#robotBlue3D)" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="219" cy="112" r="6" fill="#38bdf8" opacity="0.8" className="animate-pulse" />

            {/* Dark Curved Visor Screen */}
            <rect
              x="82"
              y="78"
              width="116"
              height="75"
              rx="32"
              fill="url(#visorGlass)"
              stroke="#38bdf8"
              strokeWidth="2"
              filter="drop-shadow(0 0 16px rgba(56,189,248,0.5))"
            />

            {/* Visor Top Glass Specular Arc */}
            <path d="M 96 86 Q 140 80, 184 86" stroke="url(#visorShine)" strokeWidth="3" strokeLinecap="round" />

            {/* GLOWING CYAN HAPPY CURVED EYES (^ ^) */}
            <g filter="drop-shadow(0 0 8px #38bdf8)">
              {isBlinking ? (
                // Blinking State: thin flat glowing slit
                <>
                  <line x1="102" y1="116" x2="124" y2="116" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1="156" y1="116" x2="178" y2="116" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : (
                // Normal Happy Smiling Curved Eyes (^ ^)
                <>
                  {/* Left Eye */}
                  <path d="M 100 120 Q 113 100, 126 120" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                  {/* Right Eye */}
                  <path d="M 154 120 Q 167 100, 180 120" stroke="#38bdf8" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                </>
              )}
            </g>

            {/* Soft Happy Smile on Visor */}
            <path d="M 132 138 Q 140 144, 148 138" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />

            {/* Cute Rosy Cyber Cheeks */}
            <ellipse cx="94" cy="132" rx="6" ry="3" fill="#06b6d4" opacity="0.35" filter="blur(2px)" />
            <ellipse cx="186" cy="132" rx="6" ry="3" fill="#06b6d4" opacity="0.35" filter="blur(2px)" />
          </g>

          {/* ================= GRADUATION MORTARBOARD CAP ================= */}
          <g transform="translate(0, 0)">
            {/* Cap Head Band / Skull Cap Base */}
            <path d="M 105 58 C 105 58, 140 52, 175 58 L 178 72 C 178 72, 140 66, 102 72 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />

            {/* Rhombus Flat Mortarboard Top (Tilted in 3D perspective) */}
            <polygon
              points="140,14 235,46 140,74 45,46"
              fill="url(#capBlack)"
              stroke="#334155"
              strokeWidth="1.5"
              filter="drop-shadow(0 6px 14px rgba(0,0,0,0.7))"
            />
            {/* Cap Edge Highlights */}
            <line x1="45" y1="46" x2="140" y2="74" stroke="#475569" strokeWidth="1.5" />
            <line x1="140" y1="74" x2="235" y2="46" stroke="#475569" strokeWidth="1.5" />

            {/* Cap Center Golden Button */}
            <circle cx="140" cy="44" r="5" fill="url(#goldTassel)" stroke="#78350f" strokeWidth="0.8" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />

            {/* Dangling Golden Tassel with subtle animation */}
            <motion.g
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: '140px', originY: '44px' }}
            >
              {/* Tassel String */}
              <path d="M 140 44 Q 120 48, 102 62" stroke="url(#goldTassel)" strokeWidth="2.5" fill="none" />
              {/* Tassel Knot Ring */}
              <circle cx="102" cy="62" r="3.5" fill="url(#goldTassel)" />
              {/* Tassel Fringe / Brush */}
              <polygon points="102,64 96,86 108,86" fill="url(#goldTassel)" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
              <line x1="97" y1="86" x2="107" y2="86" stroke="#78350f" strokeWidth="1" />
            </motion.g>
          </g>

          {/* ================= ROBOT ARMS ================= */}
          {/* RIGHT ARM HOLDING MINI-TABLET */}
          <g transform="translate(0, 40)">
            {/* Arm Shoulder & Bicep */}
            <path d="M 76 185 Q 52 205, 58 235" stroke="url(#robotWhite3D)" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Hand holding tablet */}
            <circle cx="60" cy="238" r="9" fill="url(#robotWhite3D)" stroke="#cbd5e1" strokeWidth="1" />

            {/* Hand-held Mini-Tablet with glowing 'K' */}
            <g transform="rotate(-15 62 238)">
              <rect x="36" y="210" width="46" height="56" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" filter="drop-shadow(0 0 12px rgba(56,189,248,0.7))" />
              <rect x="40" y="214" width="38" height="48" rx="6" fill="#020617" />
              {/* Glowing Cyan 'K' logo */}
              <path d="M 52 224 L 52 248 M 65 224 L 54 236 L 66 248" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="drop-shadow(0 0 6px #38bdf8)" />
            </g>
          </g>

          {/* LEFT ARM POINTING FORWARD & RIGHTWARD TOWARD THE BIG TABLET */}
          <g transform="translate(0, 40)">
            {/* Shoulder */}
            <circle cx="202" cy="188" r="10" fill="url(#robotBlue3D)" stroke="#38bdf8" strokeWidth="1" />
            {/* Forearm pointing right */}
            <path d="M 204 188 Q 235 180, 255 170" stroke="url(#robotWhite3D)" strokeWidth="15" strokeLinecap="round" fill="none" />
            {/* Pointing Hand with Index Finger extended */}
            <circle cx="255" cy="170" r="8" fill="url(#robotWhite3D)" />
            {/* Extended index finger */}
            <path d="M 255 170 L 274 162" stroke="url(#robotWhite3D)" strokeWidth="7" strokeLinecap="round" />
            {/* Energy beacon tip on finger */}
            <circle cx="275" cy="162" r="3" fill="#38bdf8" className="animate-ping" />
          </g>
        </svg>
      </motion.div>

      {/* ===================================================================== */}
      {/* 6. THE 3D INTERACTIVE CYBER TABLET SCREEN (Right Side)                */}
      {/* ===================================================================== */}
      <motion.div
        style={{
          rotateX: tabletRotateX,
          rotateY: tabletRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [-5, 5, -5],
        }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="relative z-30 w-72 sm:w-84 -ml-6 sm:-ml-10 mt-6 sm:mt-10 cursor-pointer"
        onClick={() => onNavigateTab('contests')}
      >
        {/* Tablet Glass Shell / Chassis */}
        <div className="relative rounded-3xl p-3 sm:p-4 bg-gradient-to-br from-[#0c142c]/95 via-[#070c1c]/95 to-[#050814]/95 border-2 border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.35)] backdrop-blur-xl overflow-hidden group">
          {/* Ambient Inner Corner Neon Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-cyan-500/25 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-radial from-purple-500/20 to-transparent blur-2xl pointer-events-none" />

          {/* Tablet Top Header Bar */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-purple-600 to-cyan-400 p-0.5 flex items-center justify-center">
                <span className="font-black text-[10px] text-white">K</span>
              </div>
              <span className="text-[11px] font-black text-white tracking-wider">KITEST<span className="text-cyan-400">AI</span></span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] font-mono text-cyan-300 font-bold">ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-2">
            {/* Mini Sidebar inside Tablet (Left column) */}
            <div className="col-span-4 border-r border-indigo-500/20 pr-1.5 space-y-1">
              <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[9px] font-black flex items-center gap-1 shadow-sm">
                <span>🏠</span>
                <span className="truncate">Bosh sahifa</span>
              </div>
              <div className="px-2 py-1 rounded-lg hover:bg-white/5 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                <span>🏆</span>
                <span className="truncate">Olimpiada</span>
              </div>
              <div className="px-2 py-1 rounded-lg hover:bg-white/5 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                <span>📝</span>
                <span className="truncate">Testlar</span>
              </div>
              <div className="px-2 py-1 rounded-lg hover:bg-white/5 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                <span>🤖</span>
                <span className="truncate">Chat AI</span>
              </div>
              <div className="px-2 py-1 rounded-lg hover:bg-white/5 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                <span>🏅</span>
                <span className="truncate">Yutuqlar</span>
              </div>
            </div>

            {/* Main Center Feature Card inside Tablet */}
            <div className="col-span-8 pl-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight">Olimpiada</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bilimingizni sinab ko'ring</p>
                  </div>

                  {/* 3D Shiny Golden Trophy Icon */}
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">
                      <defs>
                        <linearGradient id="goldCupGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="35%" stopColor="#fbbf24" />
                          <stop offset="70%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                      </defs>
                      {/* Trophy Handles */}
                      <path d="M 14 18 C 6 18, 6 36, 18 36" stroke="url(#goldCupGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M 50 18 C 58 18, 58 36, 46 36" stroke="url(#goldCupGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                      {/* Cup Main Body */}
                      <path d="M 16 14 L 48 14 C 48 28, 42 42, 32 44 C 22 42, 16 28, 16 14 Z" fill="url(#goldCupGrad)" stroke="#fef08a" strokeWidth="1" />
                      {/* Stem */}
                      <rect x="29" y="44" width="6" height="8" fill="url(#goldCupGrad)" />
                      {/* Base Pedestal */}
                      <rect x="22" y="52" width="20" height="6" rx="2" fill="url(#goldCupGrad)" stroke="#78350f" strokeWidth="0.8" />
                      {/* Star Sparkle */}
                      <polygon points="32,22 34,26 38,26 35,29 36,33 32,30 28,33 29,29 26,26 30,26" fill="#ffffff" className="animate-pulse" />
                    </svg>
                  </div>
                </div>

                {/* Interactive Clickable Boshlash Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('contests');
                  }}
                  className="mt-3 w-full py-2 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/40 flex items-center justify-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer group-hover:border group-hover:border-cyan-300"
                >
                  <span>Boshlash</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Animated Growth Chart inside Tablet */}
              <div className="mt-3 pt-2 border-t border-cyan-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono text-slate-400 font-bold">O'sish dinamikasi</span>
                  <span className="text-[9px] font-mono font-black text-cyan-300">+94% Natija</span>
                </div>

                {/* SVG Area Chart + Bars */}
                <div className="h-10 w-full relative">
                  <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path d="M 0 35 Q 25 32, 45 22 T 85 10 T 100 6 L 100 40 L 0 40 Z" fill="url(#chartArea)" />
                    {/* Rising Neon Stroke Curve */}
                    <path d="M 0 35 Q 25 32, 45 22 T 85 10 T 100 6" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
                  </svg>

                  {/* Rising Vertical Glow Bars */}
                  <div className="absolute inset-x-1 bottom-0 flex items-end justify-between h-8 pointer-events-none">
                    <span className="w-1.5 h-2 rounded-t-sm bg-purple-500/40" />
                    <span className="w-1.5 h-3.5 rounded-t-sm bg-indigo-500/50" />
                    <span className="w-1.5 h-5 rounded-t-sm bg-blue-500/60" />
                    <span className="w-1.5 h-7 rounded-t-sm bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
                    <span className="w-1.5 h-8 rounded-t-sm bg-white shadow-[0_0_8px_#ffffff]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Kitest3DRobotHeroScene;
