import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, X, ChevronRight, Zap } from 'lucide-react';
import { playKitestSound } from './KitestEmblem';

interface KitestFloatingRobotMascotProps {
  onOpenAi: () => void;
  soundEnabled?: boolean;
}

export const KitestFloatingRobotMascot: React.FC<KitestFloatingRobotMascotProps> = ({
  onOpenAi,
  soundEnabled = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  const handleClick = () => {
    playKitestSound('coin', soundEnabled);
    onOpenAi();
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 select-none pointer-events-auto">
      {/* Interactive Speech Bubble matching Image 2 */}
      <AnimatePresence>
        {!bubbleDismissed && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={handleClick}
            className="group cursor-pointer hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0e1526]/95 hover:bg-[#152038] border border-indigo-500/40 text-slate-100 shadow-[0_8px_30px_rgba(99,102,241,0.3)] backdrop-blur-md transition-all hover:border-indigo-400"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5 leading-tight">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Sun'iy intellekt (AI) yordamchisi
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-[9px] text-slate-400 font-medium">
                Test, kod va fan savollari bo'yicha yordam
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBubbleDismissed(true);
              }}
              title="Yashirish"
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Animated Floating Robot Character */}
      <motion.div
        animate={{
          y: [-4, 4, -4],
          rotate: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className="relative cursor-pointer group"
        title="Sun'iy intellekt (AI) yordamchisini ochish"
      >
        {/* Pulsing Outer Energy Glow Ring */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all animate-pulse" />

        {/* Orbit Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-1 rounded-full border border-dashed border-cyan-400/50 pointer-events-none"
        />

        {/* 3D Robot Head Graphic */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0a0f1d] border-2 border-cyan-400/80 shadow-[0_0_24px_rgba(6,182,212,0.5)] overflow-hidden flex items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Metallic body gradient */}
              <linearGradient id="botBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="60%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id="visorGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="eyeGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="tasselGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>

            {/* Robot Head Shell */}
            <circle cx="50" cy="54" r="32" fill="url(#botBody)" stroke="#38bdf8" strokeWidth="2" />

            {/* Cute Ear Pods */}
            <rect x="12" y="44" width="8" height="20" rx="4" fill="#0ea5e9" />
            <rect x="80" y="44" width="8" height="20" rx="4" fill="#0ea5e9" />

            {/* Dark Digital Visor Screen */}
            <rect x="24" y="38" width="52" height="28" rx="14" fill="url(#visorGlass)" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Glowing Visor Eyes (Animated Blink) */}
            <g>
              <ellipse cx="38" cy="51" rx="5" ry="6" fill="url(#eyeGlow)" />
              <circle cx="40" cy="49" r="2" fill="#ffffff" />

              <ellipse cx="62" cy="51" rx="5" ry="6" fill="url(#eyeGlow)" />
              <circle cx="64" cy="49" r="2" fill="#ffffff" />

              {/* Cute smiling mouth */}
              <path
                d="M44 58 Q50 62 56 58"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* Graduation Mortarboard Hat (Matching Image 2) */}
            <g transform="translate(0, -2)">
              {/* Cap rhombus top */}
              <polygon
                points="50,14 84,24 50,33 16,24"
                fill="#1e1b4b"
                stroke="#818cf8"
                strokeWidth="1.5"
              />
              {/* Cap skull cap base */}
              <path
                d="M32 29 Q50 36 68 29 V34 Q50 42 32 34 Z"
                fill="#0f172a"
              />
              {/* Golden Button in center */}
              <circle cx="50" cy="24" r="2.5" fill="url(#tasselGold)" />
              {/* Golden Tassel hanging to right */}
              <path
                d="M50 24 Q65 24 74 34"
                stroke="url(#tasselGold)"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="74" cy="35" r="2" fill="url(#tasselGold)" />
            </g>
          </svg>
        </div>

        {/* Small Active Badge */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-[#070b14] items-center justify-center">
            <Zap className="w-2 h-2 text-white" />
          </span>
        </span>
      </motion.div>
    </div>
  );
};
