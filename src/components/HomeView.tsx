import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TestItem,
  User,
  Submission,
  Contest,
  ADMIN_EMAIL,
} from '../types';
import { NavTab } from './Navbar';
import { Kitest3DKiteIllustration } from './KitestKiteLogo';
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Swords,
  Sparkles,
  Terminal,
  Video,
  Gift,
  Clock,
  ChevronRight,
  Layers,
  Flame,
  Star,
  CheckCircle2,
  Megaphone,
  Bell,
  Calendar,
  Pin,
  Play,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Trophy,
  Users,
  Gamepad2,
  ScanFace,
  ShieldCheck,
  BookOpen,
  Zap,
  Send,
  Code,
  Award,
} from 'lucide-react';

interface HomeViewProps {
  tests: TestItem[];
  users: User[];
  submissions: Submission[];
  contests: Contest[];
  currentUser: User | null;
  isAdminUnlocked?: boolean;
  soundEnabled?: boolean;
  bgConfig?: any;
  onChangeBgConfig?: any;
  onOpenBgCustomizer?: () => void;
  onSelectTest: (test: TestItem) => void;
  onNavigate: (tab: NavTab) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAdminModal: () => void;
  onOpenCertificatesStore?: () => void;
  onOpenLuckyWheel?: () => void;
  onOpenProfile?: () => void;
  onOpenImageShowcase?: (imgOrUrl?: any) => void;
  onUpdateUser?: (user: User) => void;
  onRefreshState?: () => void;
  onOpenAiDrawer?: () => void;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category: 'olimpiada' | 'coding' | 'yangilik' | 'tanlov';
  categoryLabel: string;
  categoryColor: string;
  emoji: string;
  date: string;
  isPinned?: boolean;
  linkUrl?: string;
  videoUrl?: string;
  targetTab?: NavTab;
  isGalleryTrigger?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tests,
  users,
  submissions,
  currentUser,
  isAdminUnlocked,
  onSelectTest,
  onNavigate,
  onOpenAuth,
  onOpenCertificatesStore,
  onOpenLuckyWheel,
  onOpenImageShowcase,
  onOpenAiDrawer,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Barchasi');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [announcementCategory, setAnnouncementCategory] = useState<
    'all' | 'olimpiada' | 'coding' | 'yangilik'
  >('all');
  const [announcementSearch, setAnnouncementSearch] = useState('');

  const isUserAdmin = Boolean(
    isAdminUnlocked ||
      currentUser?.role === 'admin' ||
      currentUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      currentUser?.username === 'behruz_admin'
  );

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    try {
      const saved = localStorage.getItem('kitest_announcements_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'ann_1',
        title: '🏆 Respublika CHSB & Matematika Fan Olimpiadasi Boshlandi!',
        category: 'olimpiada',
        categoryLabel: 'Fan Olimpiadasi',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-300',
        emoji: '🏆',
        date: '24-Oktyabr, 2026',
        isPinned: true,
        content:
          'Barcha 5-11 sinf o‘quvchilari va abituriyentlar uchun yangi bosqich masalalari ochildi. Eng yuqori ball to‘plagan 3 kishiga rasmiy Oltin sertifikat va sovg‘alar taqdim etiladi.',
        targetTab: 'contests',
      },
      {
        id: 'ann_2',
        title: '🚀 Kiteshot 3D Real-Time Duel & Yangi Harakat Mexanikasi',
        category: 'coding',
        categoryLabel: 'Kiteshot 3D',
        categoryColor: 'bg-sky-100 text-sky-800 border-sky-300',
        emoji: '🎮',
        date: '23-Oktyabr, 2026',
        isPinned: true,
        content:
          'Roblox Hypershot uslubidagi harakatlar, raqiblarning lazer bilan otishi, o‘lganda qayta paydo bo‘lish (respawn) va himoya qalqoni tizimi ishga tushirildi! 1-o‘rin egalariga 3 ta ball beriladi.',
        targetTab: 'gameball',
      },
      {
        id: 'ann_3',
        title: '🤖 KitestAI Pro: Ultra-Tezkor Intellektual Neyrotizim Ishga Tushdi!',
        category: 'yangilik',
        categoryLabel: 'KitestAI Pro',
        categoryColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        emoji: '⚡',
        date: 'Bugun',
        isPinned: true,
        content:
          'Matematika, Fizika, Dasturlash va barcha fan savollariga ultra-tezkor va xotirali rejimda 100% mukammal javob beruvchi yangi intellektual assistent tayyor!',
        targetTab: 'gemini_ai',
      },
      {
        id: 'ann_4',
        title: '✈️ KitestGram: Telegram Dek Haqiqiy Onlayn Muloqot',
        category: 'yangilik',
        categoryLabel: 'KitestGram',
        categoryColor: 'bg-sky-100 text-sky-800 border-sky-300',
        emoji: '✈️',
        date: 'Bugun',
        isPinned: true,
        content:
          'Telegram ko‘rinishidagi xabarlar, kanallar, guruhlar, ovozli xabarlar va jonli emotsiyalar bilan real vaqtda yozishing!',
        targetTab: 'kitestgram',
      },
    ];
  });

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => {
        if (
          data &&
          Array.isArray(data.announcements) &&
          data.announcements.length > 0
        ) {
          setAnnouncements(data.announcements);
          try {
            localStorage.setItem(
              'kitest_announcements_v2',
              JSON.stringify(data.announcements)
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annFormData, setAnnFormData] = useState<{
    title: string;
    content: string;
    category: 'olimpiada' | 'coding' | 'yangilik' | 'tanlov';
    categoryLabel: string;
    emoji: string;
    linkUrl: string;
    videoUrl: string;
    targetTab: NavTab;
    isPinned: boolean;
  }>({
    title: '',
    content: '',
    category: 'yangilik',
    categoryLabel: 'Yangilik',
    emoji: '📢',
    linkUrl: '',
    videoUrl: '',
    targetTab: 'problems',
    isPinned: false,
  });

  const handleOpenCreateAnnouncement = () => {
    setEditingAnnId(null);
    setAnnFormData({
      title: '',
      content: '',
      category: 'yangilik',
      categoryLabel: 'Yangilik',
      emoji: '📢',
      linkUrl: '',
      videoUrl: '',
      targetTab: 'problems',
      isPinned: false,
    });
    setIsAnnModalOpen(true);
  };

  const handleOpenEditAnnouncement = (ann: AnnouncementItem) => {
    setEditingAnnId(ann.id);
    setAnnFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      categoryLabel: ann.categoryLabel,
      emoji: ann.emoji || '📢',
      linkUrl: ann.linkUrl || '',
      videoUrl: ann.videoUrl || '',
      targetTab: ann.targetTab || 'problems',
      isPinned: Boolean(ann.isPinned),
    });
    setIsAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!annFormData.title.trim()) {
      alert("Iltimos, e'lon sarlavhasini kiriting!");
      return;
    }

    let cleanVideo = annFormData.videoUrl.trim();
    if (cleanVideo.includes('watch?v=')) {
      cleanVideo = cleanVideo.replace('watch?v=', 'embed/');
    }

    const payload = {
      title: annFormData.title.trim(),
      content: annFormData.content.trim(),
      category: annFormData.category,
      categoryLabel: annFormData.categoryLabel,
      emoji: annFormData.emoji,
      linkUrl: annFormData.linkUrl.trim() || undefined,
      videoUrl: cleanVideo || undefined,
      targetTab: annFormData.targetTab,
      isPinned: annFormData.isPinned,
    };

    if (editingAnnId) {
      // Edit existing
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingAnnId ? { ...item, ...payload } : item
        )
      );
      try {
        await fetch(`/api/admin/announcements/${editingAnnId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}
    } else {
      // Create new
      const newAnn: AnnouncementItem = {
        id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: 'Bugun',
        categoryColor:
          annFormData.category === 'olimpiada'
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : annFormData.category === 'coding'
            ? 'bg-sky-100 text-sky-800 border-sky-300'
            : 'bg-indigo-100 text-indigo-800 border-indigo-300',
        ...payload,
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      try {
        await fetch('/api/admin/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {}
    }

    setIsAnnModalOpen(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm("Rostdan ham ushbu e'lonni o'chirmoqchimisiz?")) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      try {
        await fetch(`/api/admin/announcements/${id}`, {
          method: 'DELETE',
        });
      } catch {}
    }
  };

  // 100% REAL statistics based on actual user activity and database records
  const completedTestsCount = useMemo(() => {
    if (!currentUser) return 0;
    return submissions.filter((s) => s.userId === currentUser.id).length;
  }, [currentUser, submissions]);

  const certificateCount = useMemo(() => {
    if (!currentUser) return 0;
    return currentUser.purchasedCertificates?.length || 0;
  }, [currentUser]);

  const overallMasteryPct = useMemo(() => {
    if (!currentUser) return 0;
    const userSubs = submissions.filter((s) => s.userId === currentUser.id);
    if (userSubs.length === 0) return 0;
    const passedSubs = userSubs.filter(
      (s) => s.verdict === 'Accepted' || (s.score && s.score >= 60)
    ).length;
    return Math.min(100, Math.round((passedSubs / userSubs.length) * 100));
  }, [currentUser, submissions]);

  // Showcase courses with 100% valid images and vector art (NO broken white boxes)
  const showcaseCourses = [
    {
      id: 'c_web',
      tag: 'Web Development',
      tagColor: 'bg-blue-500/20 text-blue-300 border border-blue-400/30',
      title: 'Web Development to‘liq kurs',
      author: 'Sardor Abduqodirov',
      avatar: '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png',
      rating: 4.8,
      progress: 35,
      image: '/assets/aistudio/file_000000003568821099a576100a447aeb_93e3c615.png',
      targetTab: 'courses' as NavTab,
    },
    {
      id: 'c_ds',
      tag: 'Data Science',
      tagColor: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
      title: 'Data Science asoslari',
      author: 'Nigora Karimova',
      avatar: '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png',
      rating: 4.7,
      progress: 20,
      image: '/assets/aistudio/file_0000000016f88210a72df912ffd53d2b_f8910431.png',
      targetTab: 'courses' as NavTab,
    },
    {
      id: 'c_uiux',
      tag: 'UI/UX Design',
      tagColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
      title: 'UI/UX Design amaliyot',
      author: 'Azizbek Rakhimov',
      avatar: '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png',
      rating: 4.9,
      progress: 50,
      image: '/assets/aistudio/file_000000003568821099a576100a447aeb_93e3c615.png',
      targetTab: 'courses' as NavTab,
    },
    {
      id: 'c_mkt',
      tag: 'Marketing',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
      title: 'Raqamli marketing strategiyasi',
      author: 'Diyor Khaydarov',
      avatar: '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png',
      rating: 4.6,
      progress: 10,
      image: '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png',
      targetTab: 'courses' as NavTab,
    },
  ];

  // Subject filters
  const subjectsList = useMemo(() => {
    const list = Array.from(new Set(tests.map((t) => t.subject))).filter(
      (s) => Boolean(s) && s !== 'Barchasi'
    );
    return ['Barchasi', ...list];
  }, [tests]);

  // Filtered tests
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchSubject =
        selectedSubject === 'Barchasi' ||
        t.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchSearch =
        !searchFilter.trim() ||
        t.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchFilter.toLowerCase()) ||
        String(t.id).includes(searchFilter);
      return matchSubject && matchSearch;
    });
  }, [tests, selectedSubject, searchFilter]);

  const displayName = currentUser ? currentUser.name.split(' ')[0] : 'Behruz';

  return (
    <div className="space-y-8 pb-20 text-slate-100">
      {/* ========================================================================= */}
      {/* 0. GRAND HERO SECTION (Disabled in Dashboard as Image 1 is rendered by KitestSkyLandingView) */}
      {false && !currentUser && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0b1028] via-[#090e21] to-[#070b18] border border-indigo-500/35 p-6 sm:p-10 lg:p-12 shadow-[0_12px_48px_rgba(79,70,229,0.3)]">
          {/* Ambient neon orbs and celestial rings */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Column: Headline and Call to Actions (Image 1) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Pill Badge matching Image 1 */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-200 text-xs font-black shadow-inner shadow-purple-500/20">
                <span className="text-sm">🚀</span>
                <span>Kelajak ta'limi — KITESTAI bilan!</span>
              </div>

              {/* Giant Title matching Image 1 */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                Kelajagingizni <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
                  KITEST bilan
                </span> <br />
                quring
              </h1>

              {/* Subtitle with vertical accent bar matching Image 1 */}
              <div className="flex items-start gap-3 text-slate-300 text-sm sm:text-base font-medium max-w-lg">
                <span className="w-1.5 h-12 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500 shrink-0 mt-0.5" />
                <p>Minglab o'quvchilar allaqachon biz bilan o'z bilimini oshirmoqda!</p>
              </div>

              {/* Main CTA Buttons matching Image 1 */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-[0_8px_24px_rgba(147,51,234,0.45)] hover:shadow-[0_12px_28px_rgba(147,51,234,0.6)] flex items-center gap-2.5 transition-all cursor-pointer hover:scale-102"
                >
                  <span>🚀 Boshlash</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="py-3.5 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-extrabold text-sm border border-slate-700/80 hover:border-indigo-400/60 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-cyan-400" />
                  <span>Kirish</span>
                </button>
              </div>

              {/* Sub-actions row matching Image 1 */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-bold text-slate-400">
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-2 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <ScanFace className="w-3.5 h-3.5" />
                  </div>
                  <span>Haqiqiy Kamera Face ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('problems')}
                  className="flex items-center gap-2 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>Accountsiz (Inkognito) Kirish</span>
                </button>
              </div>
            </div>

            {/* Right Column: Code-Native 3D Robot & Interactive Floating Tablet Scene (Image 1) */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
              <motion.div
                animate={{
                  y: [-6, 6, -6],
                }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-full max-w-lg rounded-3xl p-4 flex flex-col items-center justify-center select-none"
              >
                {/* Glowing Cosmic Planetary Rings Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-cyan-500/30 border-dashed animate-spin [animation-duration:30s]" />
                  <div className="absolute w-80 h-48 rounded-full border border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.3)] [transform:rotate(-30deg)]" />
                </div>

                {/* 3D Robot Mascot (Vector-Crafted matching Image 1) */}
                <div className="relative z-10 flex items-center justify-center">
                  <svg viewBox="0 0 340 320" className="w-full max-w-sm drop-shadow-[0_20px_40px_rgba(6,182,212,0.45)]">
                    <defs>
                      <linearGradient id="robotHeadGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="60%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#94a3b8" />
                      </linearGradient>
                      <linearGradient id="robotCapGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <linearGradient id="robotScreenGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                      </linearGradient>
                      <linearGradient id="robotEyeGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="robotPadGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#1e1b4b" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                      <filter id="neonBlueGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38bdf8" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Graduation Cap */}
                    <path d="M120 40 L180 20 L240 40 L180 55 Z" fill="url(#robotCapGrad)" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="180" cy="40" r="3" fill="#fbbf24" />
                    <path d="M180 40 Q210 45 220 70" stroke="#fbbf24" strokeWidth="2" fill="none" />
                    <circle cx="220" cy="70" r="3.5" fill="#fbbf24" />

                    {/* Head Outer Shell */}
                    <rect x="110" y="55" width="140" height="110" rx="45" fill="url(#robotHeadGrad)" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="108" cy="110" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="252" cy="110" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />

                    {/* Face Visor Display */}
                    <rect x="125" y="70" width="110" height="75" rx="30" fill="url(#robotScreenGrad)" stroke="#38bdf8" strokeWidth="2" />
                    {/* Glowing Eyes Curved in Smile */}
                    <path d="M142 105 Q152 92 162 105" stroke="url(#robotEyeGrad)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#neonBlueGlow)" />
                    <path d="M188 105 Q198 92 208 105" stroke="url(#robotEyeGrad)" strokeWidth="6" strokeLinecap="round" fill="none" filter="url(#neonBlueGlow)" />

                    {/* Robot Body */}
                    <path d="M140 170 Q180 180 220 170 L230 250 Q180 260 130 250 Z" fill="url(#robotHeadGrad)" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx="180" cy="210" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <text x="175" y="216" fill="#fff" fontSize="16" fontWeight="bold">K</text>

                    {/* Left Arm Pointing to Tablet */}
                    <path d="M130 185 Q90 190 70 170 Q60 160 50 150" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" fill="none" />
                    <circle cx="50" cy="150" r="10" fill="#0284c7" />

                    {/* Right Arm Holding Tablet */}
                    <path d="M225 185 Q260 210 250 240" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" fill="none" />

                    {/* Tablet held by Robot */}
                    <rect x="220" y="190" width="65" height="90" rx="10" fill="url(#robotPadGrad)" stroke="#38bdf8" strokeWidth="2" />
                    <rect x="228" y="198" width="49" height="74" rx="6" fill="#020617" />
                    <text x="244" y="240" fill="#38bdf8" fontSize="28" fontWeight="black" filter="url(#neonBlueGlow)">K</text>
                  </svg>
                </div>

                {/* Floating 3D Tablet UI Card on the Right (Matching Image 1) */}
                <motion.div
                  animate={{
                    y: [6, -6, 6],
                  }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-4 top-12 z-20 w-64 rounded-2xl bg-[#090f22]/95 border-2 border-indigo-400/50 p-3.5 shadow-[0_16px_36px_rgba(79,70,229,0.5)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">KITEST</span>
                      <span className="text-xs font-black text-cyan-400">AI</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">Olimpiada</span>
                  </div>

                  {/* Inside Tablet Card: Olimpiada & Trophy */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 border border-purple-500/40 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-white">Olimpiada</div>
                      <div className="text-[9px] text-slate-300">Bilimingizni sinab ko'ring</div>
                      <button
                        type="button"
                        onClick={() => onNavigate('contests')}
                        className="mt-1.5 py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-sm"
                      >
                        <span>Boshlash ➔</span>
                      </button>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/40 shadow-inner">
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>

                  {/* Rising Stats Graph Bars */}
                  <div className="mt-2 flex items-end gap-1.5 h-8 px-1">
                    <span className="w-3 rounded-t-sm bg-purple-500/40 h-3" />
                    <span className="w-3 rounded-t-sm bg-purple-500/60 h-4" />
                    <span className="w-3 rounded-t-sm bg-indigo-500/70 h-6" />
                    <span className="w-3 rounded-t-sm bg-cyan-400 h-8 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    <span className="text-[9px] text-cyan-300 font-bold ml-auto font-mono">+85% O'sish</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Bottom 5 Category Cards (Image 1) */}
          <div className="mt-10 pt-8 border-t border-indigo-500/20 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => onNavigate('contests')}
              className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-purple-400/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-xs font-black text-white">Olimpiada</div>
              <div className="text-[10px] text-slate-400">Bilimingizni sinab ko'ring</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('problems')}
              className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-sky-400/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-sky-400" />
              </div>
              <div className="text-xs font-black text-white">Testlar</div>
              <div className="text-[10px] text-slate-400">Bilimni mustahkamlang</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('gameball')}
              className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-emerald-400/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-xs font-black text-white">Kiteshot</div>
              <div className="text-[10px] text-slate-400">Qiziqarli o'yinlar</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('leaderboard')}
              className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-amber-400/50 text-left transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-xs font-black text-white">Yutuqlar</div>
              <div className="text-[10px] text-slate-400">Natijalaringizni kuzating</div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('books_3d')}
              className="p-3.5 rounded-2xl bg-[#0f172f]/80 hover:bg-[#162347] border border-indigo-500/20 hover:border-pink-400/50 text-left transition-all cursor-pointer group col-span-2 sm:col-span-1"
            >
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5 text-pink-400" />
              </div>
              <div className="text-xs font-black text-white">Kitobxonlar uchun</div>
              <div className="text-[10px] text-slate-400">Foydali kitoblar</div>
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO WELCOME ROCKET BANNER (100% Matching Screenshot Image 1)          */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#170e38] via-[#12163b] to-[#0d1c44] border border-indigo-500/30 p-6 sm:p-8 shadow-[0_8px_32px_rgba(79,70,229,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Starfield sparkles & space grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10%" cy="20%" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="25%" cy="80%" r="1" fill="#38bdf8" opacity="0.6" />
            <circle cx="45%" cy="15%" r="2" fill="#c084fc" opacity="0.7" />
            <circle cx="70%" cy="30%" r="1.5" fill="#fff" opacity="0.8" />
            <circle cx="85%" cy="75%" r="2" fill="#fbbf24" opacity="0.6" />
            <circle cx="60%" cy="85%" r="1" fill="#fff" opacity="0.5" />
          </svg>
        </div>

        {/* Ambient cosmic gradient orb */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Left Welcome Copy */}
        <div className="relative z-10 max-w-xl space-y-2">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex flex-wrap items-center gap-2">
            <span>Assalomu alaykum,</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent font-black drop-shadow-sm">
              {displayName}!
            </span>
            <span className="text-amber-400 animate-bounce">👋</span>
          </h1>

          <p className="text-base sm:text-lg font-bold text-slate-200">
            Bilim sari yana bir qadam oldinga!
          </p>

          <p className="text-xs sm:text-sm text-slate-300/90 font-medium flex items-center gap-1.5 pt-1">
            <span className="text-amber-400 font-bold">⚡ KITEST</span> bilan o'rganing va maqsadlaringizga yana bir qadam yaqinlashing.
          </p>
        </div>

        {/* Center / Right: 3D Rocket Launching into Space */}
        <div className="relative z-10 flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <motion.div
            animate={{
              y: [-6, 6, -6],
              rotate: [-2, 2, -2],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 drop-shadow-[0_12px_28px_rgba(249,115,22,0.4)]"
          >
            <svg viewBox="0 0 120 120" className="w-full h-full" fill="none">
              <defs>
                <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
                <linearGradient id="rocketNose" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="fireTrail" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Flame exhaust */}
              <g transform="translate(18, 68) rotate(-45)">
                <path
                  d="M10 0 Q15 25 10 38 Q5 25 10 0 Z"
                  fill="url(#fireTrail)"
                  className="animate-pulse"
                />
                <circle cx="10" cy="20" r="4" fill="#fbbf24" />
              </g>

              {/* Rocket Body */}
              <g transform="rotate(-35 60 60)">
                {/* Side Wings */}
                <path d="M42 62 L32 75 L45 74 Z" fill="url(#rocketNose)" />
                <path d="M78 62 L88 75 L75 74 Z" fill="url(#rocketNose)" />

                {/* Main Fuselage */}
                <path
                  d="M60 20 C48 35 46 65 48 76 L72 76 C74 65 72 35 60 20 Z"
                  fill="url(#rocketBody)"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                />

                {/* Nose Cone */}
                <path
                  d="M60 20 C54 28 50 35 50 40 L70 40 C70 35 66 28 60 20 Z"
                  fill="url(#rocketNose)"
                />

                {/* Cyan Glowing Cabin Porthole */}
                <circle cx="60" cy="50" r="7" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="62" cy="48" r="2.5" fill="#ffffff" opacity="0.8" />
              </g>

              {/* Sparkle Stars */}
              <circle cx="95" cy="25" r="2.5" fill="#fde047" className="animate-ping" />
              <circle cx="20" cy="35" r="2" fill="#38bdf8" />
              <circle cx="105" cy="80" r="1.5" fill="#ffffff" />
            </svg>
          </motion.div>

          {/* Right 7 Kunlik Seriya Card matching Image 1 */}
          <div className="bg-[#0b1021]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-indigo-500/40 shadow-lg flex items-center gap-3.5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
              <Flame className="w-7 h-7 fill-current text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-white leading-none">
                <span className="text-xl font-mono text-amber-400">7</span>
                <span className="text-xs font-bold text-slate-300">Kunlik seriya</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-[11px] text-sky-400 font-bold mt-1">
                Ajoyib! Ketishda davom eting!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER PILLS ROW (Matching Screenshot Image 1)                         */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
        <button
          type="button"
          onClick={() => setAnnouncementCategory('all')}
          className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            announcementCategory === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 border border-slate-700/60'
          }`}
        >
          <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
            <span className="bg-current rounded-xs" />
            <span className="bg-current rounded-xs" />
            <span className="bg-current rounded-xs" />
            <span className="bg-current rounded-xs" />
          </div>
          <span>Barchasi</span>
        </button>

        <button
          type="button"
          onClick={() => setAnnouncementCategory('olimpiada')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            announcementCategory === 'olimpiada'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 border border-slate-700/60'
          }`}
        >
          <span>🏆 Olimpiada</span>
        </button>

        <button
          type="button"
          onClick={() => (onOpenAiDrawer ? onOpenAiDrawer() : onNavigate('gemini_ai'))}
          className="py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 border border-slate-700/60 transition-all cursor-pointer whitespace-nowrap"
        >
          <span>🤖 Kitestbot</span>
        </button>

        <button
          type="button"
          onClick={() => setAnnouncementCategory('yangilik')}
          className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            announcementCategory === 'yangilik'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
              : 'bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 border border-slate-700/60'
          }`}
        >
          <span>📢 Yangilik</span>
        </button>

        {isUserAdmin && (
          <button
            type="button"
            onClick={handleOpenCreateAnnouncement}
            className="py-2 px-4 rounded-xl text-xs font-black flex items-center gap-1.5 bg-[#0f172a]/90 hover:bg-indigo-950 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer whitespace-nowrap ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>E'lon Qo'shish (Admin)</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. TWO FEATURED HERO CARDS (100% Matching Screenshot Image 1)             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Mashhur Tanlovlar (UHSB & Matematika Fan Olimpiadasi) */}
        <div className="relative rounded-3xl p-6 bg-[#0c1224]/90 border border-indigo-500/30 hover:border-indigo-400/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all backdrop-blur-md flex flex-col justify-between overflow-hidden group">
          {/* Subtle Golden Trophy Watermark */}
          <div className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 pointer-events-none">
            <Trophy className="w-full h-full text-amber-400" />
          </div>

          <div className="space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Mashhur Tanlovlar</h3>
                  <p className="text-[10px] text-slate-400">Eng ko'p foydalaniladigan yo'nalishlar</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('contests')}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Barchasi</span>
                <ArrowRight className="w-3 h-3 text-indigo-400" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex items-start gap-4 pt-1">
              {/* Math Icon Box (+ - x ÷) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-3 flex flex-col items-center justify-center shadow-lg shadow-purple-900/40 border border-indigo-400/40 shrink-0">
                <div className="grid grid-cols-2 gap-2 text-white font-black text-xl leading-none">
                  <span>+</span>
                  <span>−</span>
                  <span>×</span>
                  <span>÷</span>
                </div>
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Qoldi: 24-oktyabr, 2026</span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  UHSB & Matematika Fan Olimpiadasi
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  Quyidagilar va abituriyentlar uchun yangi bosqich. Eng yuqori ball to'plagan 3 kishiga rasmiy Oltin medal taqdim etiladi.
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="pt-4 border-t border-indigo-500/20 flex items-center justify-between gap-3 mt-4">
            <button
              type="button"
              onClick={() => onNavigate('contests')}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Boshlash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>2.5K ishtirokchi</span>
            </span>
          </div>
        </div>

        {/* CARD 2: Kitest 3D (Real-Time Duel & Yangi Harakat Mexanikasi) */}
        <div className="relative rounded-3xl p-6 bg-[#0c1224]/90 border border-indigo-500/30 hover:border-indigo-400/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all backdrop-blur-md flex flex-col justify-between overflow-hidden group">
          {/* Futuristic Cyber Grid Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-full h-full bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="space-y-4 relative z-10">
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-sm">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Kitest 3D</h3>
                  <p className="text-[10px] text-slate-400">Real-time duel va yangi imkoniyatlar</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('gameball')}
                className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span>Barchasi</span>
                <ArrowRight className="w-3 h-3 text-sky-400" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex items-start gap-4 pt-1">
              {/* Game Controller Box */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-2 flex items-center justify-center shadow-lg border border-cyan-500/40 shrink-0">
                <Gamepad2 className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1 min-w-0 pr-0 sm:pr-2">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Qoldi: 23-oktyabr, 2026</span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-white leading-tight truncate">
                  Kitest 3D Real-Time Duel & Yangi Harakat Mexanikasi
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  Roblox Hypershot uslubidagi harakatlar, raqiblarning lazer bilan otishi, o'lganda qayta paydo bo'lish (respawn) va himoya qalqoni tizimi ishga tushirildi! 1-o'rin egalariga 3 ta ball beriladi.
                </p>
              </div>

              {/* Roblox Anime Cyber Warrior Graphic with Neon Laser Sword (Image 2) */}
              <div className="hidden sm:block w-28 h-32 shrink-0 relative overflow-hidden rounded-xl border border-cyan-500/30 bg-[#060b18]/80 shadow-md shadow-cyan-900/30">
                {/* Cyber City Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#091530] to-[#0d2350] opacity-90" />
                <svg className="w-full h-full relative z-10" viewBox="0 0 110 130" fill="none">
                  <defs>
                    <linearGradient id="cyberSwordGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="30%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>
                    <filter id="swordLaserGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="glow" />
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Skyscraper silhouettes */}
                  <rect x="5" y="45" width="22" height="85" fill="#040d21" />
                  <rect x="8" y="52" width="4" height="6" fill="#38bdf8" opacity="0.6" />
                  <rect x="18" y="65" width="4" height="6" fill="#38bdf8" opacity="0.8" />
                  <rect x="85" y="30" width="22" height="100" fill="#040d21" />
                  <rect x="90" y="40" width="5" height="7" fill="#06b6d4" opacity="0.7" />
                  <rect x="90" y="60" width="5" height="7" fill="#38bdf8" opacity="0.5" />

                  {/* Anime Character Torso & Black Hoodie with Cyan stripes */}
                  <path d="M30 75 Q55 70 80 75 L85 130 L25 130 Z" fill="#0b1120" stroke="#1e293b" strokeWidth="1.5" />
                  {/* Cyan neon hoodie patterns */}
                  <path d="M40 76 L36 110" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M70 76 L74 110" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                  <rect x="48" y="90" width="14" height="14" rx="3" fill="#0284c7" />
                  <text x="52" y="101" fill="#fff" fontSize="10" fontWeight="bold">K</text>

                  {/* Character Head */}
                  <rect x="40" y="36" width="30" height="28" rx="7" fill="#fed7aa" />
                  {/* Eyes */}
                  <circle cx="48" cy="48" r="2.5" fill="#0f172a" />
                  <circle cx="62" cy="48" r="2.5" fill="#0f172a" />
                  <circle cx="49" cy="47" r="0.8" fill="#fff" />
                  <circle cx="63" cy="47" r="0.8" fill="#fff" />
                  {/* Confident smirk */}
                  <path d="M52 57 Q55 59 58 57" stroke="#9a3412" strokeWidth="1.2" fill="none" />

                  {/* Spiky Anime Dark Hair */}
                  <path d="M36 38 C32 20 50 18 55 18 C65 18 78 24 75 38 C75 38 72 28 66 28 C60 28 58 35 52 32 C46 32 42 36 36 38 Z" fill="#0f172a" />
                  <path d="M34 38 Q32 46 36 50 Q38 42 40 40 Z" fill="#0f172a" />
                  <path d="M76 38 Q78 46 74 50 Q72 42 70 40 Z" fill="#0f172a" />

                  {/* Left Arm holding glowing cyber sword */}
                  <path d="M30 80 Q15 95 24 105" stroke="#0b1120" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="24" cy="105" r="5" fill="#fed7aa" />

                  {/* Glowing Cyan Cyber Sword */}
                  <rect x="18" y="104" width="22" height="4" rx="2" fill="#334155" transform="rotate(-38 24 105)" />
                  <line x1="24" y1="105" x2="88" y2="55" stroke="url(#cyberSwordGrad)" strokeWidth="6" strokeLinecap="round" filter="url(#swordLaserGlow)" />
                  <line x1="26" y1="103" x2="86" y2="56" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card Footer Actions */}
          <div className="pt-4 border-t border-indigo-500/20 flex items-center justify-between gap-3 mt-4 relative z-10">
            <button
              type="button"
              onClick={() => onNavigate('gameball')}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>O'ynash</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>1.8K o'yinchi</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM NEWS TICKER (Matching Screenshot Image 1)                       */}
      {/* ========================================================================= */}
      <div className="rounded-2xl p-4 bg-[#0d1428]/95 border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-200">
            <span className="text-purple-400 font-black">Yangi yangilik:</span> KITEST platformasida endi AI Chat funksiyasi mavjud!
          </p>
        </div>

        <button
          type="button"
          onClick={() => (onOpenAiDrawer ? onOpenAiDrawer() : onNavigate('gemini_ai'))}
          className="py-1.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
        >
          <span>Batafsil</span>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. E'LONLAR VA YANGILIKLAR DOSKASI (Filtered view or Admin modal)          */}
      {/* ========================================================================= */}
      {(announcementCategory !== 'all' || isAnnModalOpen) && (
      <div className="relative rounded-3xl overflow-hidden bg-[#0c1226]/90 border border-indigo-500/30 shadow-lg p-6 sm:p-7 space-y-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
                <Pin className="w-3 h-3 text-amber-400" />
                <span>RASMIY E'LONLAR & YANGILIKLAR</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Muhim Xabarlar & Maxsus E'lonlar
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin Add Announcement Button */}
            {isUserAdmin && (
              <button
                type="button"
                onClick={handleOpenCreateAnnouncement}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>E'lon Qo'shish (Admin)</span>
              </button>
            )}

            {onOpenImageShowcase && (
              <button
                type="button"
                onClick={() => onOpenImageShowcase()}
                className="py-2 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>🖼️ Fotogalereya</span>
              </button>
            )}

            {/* Category Tabs */}
            <div className="flex items-center gap-1 bg-[#070b18] p-1 rounded-xl text-xs font-bold border border-indigo-500/20">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'olimpiada', label: '🏆 Olimpiada' },
                { id: 'coding', label: '🎮 Kiteshot' },
                { id: 'yangilik', label: '⚡ Yangilik' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAnnouncementCategory(tab.id as any)}
                  className={`py-1.5 px-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-xs ${
                    announcementCategory === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Announcement Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {announcements
            .filter((item) =>
              announcementCategory === 'all' ? true : item.category === announcementCategory
            )
            .map((item, idx) => (
              <div
                key={`ann_card_${item.id || 'c'}_${idx}`}
                className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                  item.isPinned
                    ? 'border-amber-500/50 bg-[#161a33] shadow-md shadow-amber-500/10'
                    : 'border-indigo-500/20 hover:border-indigo-400/50 bg-[#0e162f] hover:shadow-lg'
                }`}
              >
                <div className="space-y-3">
                  {/* Category + Date + Emoji */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl shrink-0">{item.emoji || '📢'}</span>
                      <span className={`px-2.5 py-0.5 rounded-md font-bold border text-[11px] ${item.categoryColor || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                        {item.categoryLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60">
                          <Pin className="w-3 h-3 fill-current" />
                          Qadalgan
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  {/* Text / Content */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {/* Bottom Actions & Perixod */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    {/* External Link */}
                    {item.linkUrl && (
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        <span>Havola</span>
                      </a>
                    )}

                    {/* Navigation Perixod */}
                    {item.targetTab && (
                      <button
                        type="button"
                        onClick={() => onNavigate(item.targetTab!)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        <span>Bo'limga o'tish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {item.isGalleryTrigger && (
                      <button
                        type="button"
                        onClick={() => onOpenImageShowcase?.()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Rasmlarni ko'rish</span>
                      </button>
                    )}
                  </div>

                  {/* Admin Edit & Delete buttons */}
                  {isUserAdmin && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAnnouncement(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Tahrirlash"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAnnouncement(item.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Admin Announcement Creation / Edit Modal */}
        {isAnnModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{annFormData.emoji || '📢'}</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {editingAnnId ? "E'lonni Tahrirlash" : "Yangi E'lon Qo'shish"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Foydalanuvchilarga ko'rinadigan muhim yangilik va perixod
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Sarlavha */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Sarlavha (Yozuv): *
                  </label>
                  <input
                    type="text"
                    value={annFormData.title}
                    onChange={(e) =>
                      setAnnFormData({ ...annFormData, title: e.target.value })
                    }
                    placeholder="Masalan: 🏆 Katta Respublika Olimpiadasi boshlandi!"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Yozuv / Matn */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Batafsil matn (Yozuv):
                  </label>
                  <textarea
                    rows={3}
                    value={annFormData.content}
                    onChange={(e) =>
                      setAnnFormData({ ...annFormData, content: e.target.value })
                    }
                    placeholder="E'lon haqida to'liq tushuntirish va shartlar..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Emotsiya & Kategoriya */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Emotsiya (Stiker):
                    </label>
                    <div className="flex items-center gap-1.5">
                      {['📢', '🏆', '🚀', '🤖', '🎮', '💎'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setAnnFormData({ ...annFormData, emoji: em })}
                          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border cursor-pointer ${
                            annFormData.emoji === em
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Kategoriya:
                    </label>
                    <select
                      value={annFormData.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        const labelMap: Record<string, string> = {
                          yangilik: 'Yangilik',
                          olimpiada: 'Fan Olimpiadasi',
                          coding: 'Kiteshot 3D',
                          tanlov: 'Maxsus Tanlov',
                        };
                        setAnnFormData({
                          ...annFormData,
                          category: val,
                          categoryLabel: labelMap[val] || 'Yangilik',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="yangilik">⚡ Yangilik</option>
                      <option value="olimpiada">🏆 Fan Olimpiadasi</option>
                      <option value="coding">🎮 Kiteshot 3D</option>
                      <option value="tanlov">🎯 Maxsus Tanlov</option>
                    </select>
                  </div>
                </div>

                {/* Video havola */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Video havola (YouTube / embed):
                  </label>
                  <input
                    type="text"
                    value={annFormData.videoUrl}
                    onChange={(e) =>
                      setAnnFormData({ ...annFormData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/embed/... yoki watch?v=..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Tashqi Link */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Tashqi Link (Havola):
                  </label>
                  <input
                    type="text"
                    value={annFormData.linkUrl}
                    onChange={(e) =>
                      setAnnFormData({ ...annFormData, linkUrl: e.target.value })
                    }
                    placeholder="https://t.me/... yoki https://kitest.uz/..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Perixod (Target Tab) */}
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Perixod (Bo'limga o'tish tugmasi):
                  </label>
                  <select
                    value={annFormData.targetTab}
                    onChange={(e) =>
                      setAnnFormData({
                        ...annFormData,
                        targetTab: e.target.value as NavTab,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="problems">📚 Testlar & Masalalar (problems)</option>
                    <option value="contests">🏆 Fan Olimpiadalari (contests)</option>
                    <option value="gameball">🎮 Kiteshot 3D O'yini (gameball)</option>
                    <option value="gemini_ai">🤖 KitestAI Gemini Universal (gemini_ai)</option>
                    <option value="kitestgram">✈️ KitestGram Onlayn Chat (kitestgram)</option>
                    <option value="majlis">🎥 Jonli Video Majlis (majlis)</option>
                    <option value="courses">🎓 Onlayn Kurslar (courses)</option>
                    <option value="duels">⚔️ Jonli Duellar (duels)</option>
                    <option value="leaderboard">🏅 Reyting & Pes HQadamlar (leaderboard)</option>
                  </select>
                </div>

                {/* Pinned checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={annFormData.isPinned}
                    onChange={(e) =>
                      setAnnFormData({ ...annFormData, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label
                    htmlFor="isPinnedCheck"
                    className="font-bold text-slate-700 cursor-pointer select-none"
                  >
                    Ushbu e'lonni yuqoriga qadash (Pinned)
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSaveAnnouncement}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {editingAnnId ? "Saqlash" : "E'lonni Chiqarish"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}

      {/* 2. MENING YUTUQLARIM */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Mening yutuqlarim
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('leaderboard')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Barcha yutuqlarni ko‘rish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Umumiy o'zlashtirish (REAL %) */}
          <div className="bg-[#0c1224]/90 rounded-3xl p-5 border border-indigo-500/25 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray={`${overallMasteryPct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-sm text-white font-mono">
                {overallMasteryPct}%
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">
                Umumiy o‘zlashtirish
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {overallMasteryPct > 0
                  ? 'Barqaror boring! Oldinga siljishda davom eting.'
                  : 'Testlarni yeching va o‘zlashtirish ballini to‘plang.'}
              </p>
              <div className="mt-2 text-sky-400">
                <svg width="60" height="8" viewBox="0 0 60 8" fill="none">
                  <path d="M0 4 Q15 0 30 4 T60 4" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Yakunlangan kurslar / testlar (REAL Count) */}
          <div className="bg-[#0c1224]/90 rounded-3xl p-5 border border-indigo-500/25 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeDasharray={`${Math.min(100, completedTestsCount * 10)}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-sm text-white font-mono">
                {completedTestsCount}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">
                Yakunlangan kurslar
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {completedTestsCount > 0
                  ? 'Tabriklaymiz! Ajoyib natija.'
                  : 'Hozircha yakunlangan darslar yo‘q.'}
              </p>
              <div className="mt-2 text-emerald-400">
                <svg width="60" height="8" viewBox="0 0 60 8" fill="none">
                  <path d="M0 4 Q15 0 30 4 T60 4" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Olingan sertifikatlar (REAL Count) */}
          <div className="bg-[#0c1224]/90 rounded-3xl p-5 border border-indigo-500/25 shadow-lg flex items-center gap-4 backdrop-blur-md">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="3.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.5"
                  strokeDasharray={`${Math.min(100, certificateCount * 20)}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-sm text-white font-mono">
                {certificateCount}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-white truncate">
                Olingan sertifikatlar
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {certificateCount > 0
                  ? 'Sertifikatlaringizni boshqalar bilan ulashing.'
                  : 'Kurs va testlarni yakunlab sertifikat oling.'}
              </p>
              <div className="mt-2 text-purple-400">
                <svg width="60" height="8" viewBox="0 0 60 8" fill="none">
                  <path d="M0 4 Q15 0 30 4 T60 4" stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TAVSIYA ETILGAN KURSLAR (100% Matching Dark Aesthetic)                 */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Tavsiya etilgan kurslar
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Barcha kurslarni ko‘rish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {showcaseCourses.map((c, cIdx) => (
            <div
              key={`sc_course_${c.id}_${cIdx}`}
              onClick={() => onNavigate(c.targetTab)}
              className="group bg-[#0c1224]/90 rounded-3xl p-4 border border-indigo-500/25 shadow-lg hover:border-indigo-400/60 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer backdrop-blur-md"
            >
              <div>
                {/* Course Banner Preview */}
                <div className="relative rounded-2xl overflow-hidden h-36 bg-slate-950 mb-3.5 border border-slate-800">
                  <img
                    src={c.image}
                    alt={c.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/aistudio/file_000000003568821099a576100a447aeb_93e3c615.png';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${c.tagColor} shadow-md backdrop-blur-md`}>
                      {c.tag}
                    </span>
                  </div>
                </div>

                {/* Course Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-2">
                  {c.title}
                </h3>

                {/* Author & Rating */}
                <div className="flex items-center justify-between mt-2.5 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <img
                      src={c.avatar}
                      alt={c.author}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/aistudio/file_000000005a0881f4b4301ee96ec807ad_bcc3ada6.png';
                      }}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                    <span className="text-slate-400 truncate text-[11px] font-medium">
                      {c.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{c.rating}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Percentage */}
              <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {c.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FAN TESTLARI & BARCHA FUNKSIYALAR RO'YXATI                             */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Fan testlari va Masalalar arxivi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haqiqiy testlar soni: {tests.length} ta · Bosganda oynasi bevosita ustida ochiladi
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('problems')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Barcha testlar ({tests.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {subjectsList.slice(0, 7).map((sub, sIdx) => (
            <button
              key={`home_subj_${sub}_${sIdx}`}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTests.slice(0, 6).map((test, tIdx) => (
            <div
              key={`home_test_${test.id}_${tIdx}`}
              onClick={() => onSelectTest(test)}
              className="bg-[#0c1224]/90 rounded-3xl p-4 sm:p-5 border border-indigo-500/25 shadow-lg hover:border-indigo-400/60 hover:shadow-xl transition-all flex flex-col justify-between cursor-pointer group backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                    {test.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    #{test.id}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors line-clamp-1">
                  {test.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {test.description || `${test.subject} fanidan maxsus savollar to‘plami`}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-indigo-500/20 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{test.durationMinutes || 25} daqiqa · {test.questions.length} savol</span>
                </span>
                <span className="font-bold text-sky-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Yechish <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TEZKOR BOSHQARUV VA ASOSIY FUNKSIYALAR RO'YXATI                        */}
      {/* ========================================================================= */}
      <section className="bg-[#0b1021]/90 rounded-3xl p-5 sm:p-6 border border-indigo-500/30 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Platforma vositalari va Modullar
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('duels')}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-rose-400/50 text-left transition-all cursor-pointer group"
          >
            <Swords className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">1v1 Duellar</div>
            <div className="text-[10px] text-slate-400">Jonli bellashuv</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('create_test')}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-purple-400/50 text-left transition-all cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">AI Savol Tuzish</div>
            <div className="text-[10px] text-slate-400">Sun&apos;iy intellekt</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('books_3d')}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-amber-400/50 text-left transition-all cursor-pointer group"
          >
            <Layers className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">3D Kitoblar</div>
            <div className="text-[10px] text-slate-400">Varaqlanadigan darslik</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('code_arena')}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-emerald-400/50 text-left transition-all cursor-pointer group"
          >
            <Terminal className="w-5 h-5 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Kod Poligoni</div>
            <div className="text-[10px] text-slate-400">Python, JS, C++</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('majlis')}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-cyan-400/50 text-left transition-all cursor-pointer group"
          >
            <Video className="w-5 h-5 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Video Majlis</div>
            <div className="text-[10px] text-slate-400">Jonli o&apos;quv zali</div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onOpenLuckyWheel) onOpenLuckyWheel();
            }}
            className="p-3.5 rounded-2xl bg-[#0e172f] hover:bg-[#152347] border border-indigo-500/20 hover:border-amber-400/50 text-left transition-all cursor-pointer group"
          >
            <Gift className="w-5 h-5 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-white">Omad Barabani</div>
            <div className="text-[10px] text-slate-400">Har kunlik sovg&apos;a</div>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REAL STATISTIKA                                                         */}
      {/* ========================================================================= */}
      <section className="bg-[#0c1224]/90 rounded-3xl p-6 border border-indigo-500/25 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-indigo-500/20">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono">
              {users.length} ta
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">Ro&apos;yxatdan o&apos;tgan foydalanuvchilar</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              {tests.length} ta
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">Mavjud testlar to&apos;plami</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">
              {submissions.length} ta
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">Topshirilgan test natijalari</div>
          </div>
          <div className="pt-2 md:pt-0">
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {submissions.length > 0
                ? `${Math.round(
                    (submissions.filter((s) => s.verdict === 'Accepted' || (s.score && s.score >= 60)).length /
                      submissions.length) *
                      100
                  )}%`
                : '0%'}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">Haqiqiy o&apos;rtacha natijadorlik</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. MODERN COSMIC FOOTER (Telegram, YouTube, GitHub, Resurslar)            */}
      {/* ========================================================================= */}
      <footer className="mt-12 pt-10 pb-8 border-t border-indigo-500/20 bg-[#070b14]/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Col 1: Platform Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30">
                <div className="w-full h-full rounded-2xl bg-[#070b14] flex items-center justify-center font-black text-white text-lg">
                  K
                </div>
              </div>
              <div>
                <div className="text-base font-black text-white tracking-wider flex items-center gap-1.5 font-mono">
                  <span>KITEST</span>
                  <span className="text-cyan-400">AI</span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Milliy Bilim, Test va Dasturlash Platformasi
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              KITEST — maktab o&apos;quvchilari, abituriyentlar va dasturchilar uchun sun&apos;iy intellekt, algoritmik masalalar, interaktiv testlar hamda 3D o&apos;yinlashtirilgan ta&apos;lim makoni.
            </p>

            {/* Social Link Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="https://t.me/kitest_uz"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-xs font-bold text-sky-300 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Send className="w-3.5 h-3.5 text-sky-400" />
                <span>Telegram Kanal</span>
              </a>

              <a
                href="https://www.youtube.com/@FC_UZB-67b"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-xs font-bold text-rose-300 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Video className="w-3.5 h-3.5 text-rose-400" />
                <span>YouTube Darslar</span>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-xs font-bold text-purple-300 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Code className="w-3.5 h-3.5 text-purple-400" />
                <span>GitHub Repozitoriy</span>
              </a>
            </div>
          </div>

          {/* Col 2: Yo'nalishlar */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Platforma Yo&apos;nalishlari
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contests')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Respublika Fan va Dasturlash Olimpiadalari</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('tests')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-sky-400" />
                  <span>Bilimni Mustahkamlash Testlari (DTM / Attestatsiya)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('code_arena')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Code className="w-3 h-3 text-purple-400" />
                  <span>RoboContest Algoritmik Masalalar va IDE</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('duels')}
                  className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Gamepad2 className="w-3 h-3 text-emerald-400" />
                  <span>Kitest 3D Real-Vaqt Duel & Kiteshot O&apos;yini</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Asoschi & Qo'llab-quvvatlash */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Loyiha & Qo&apos;llab-quvvatlash
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <div>
                <strong className="text-white">Bosh Admin:</strong> Behruz Jumaqulov
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Qorako&apos;l tumani 1-sonli IMI
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Email: jumaqulovbehruz831@gmail.com
              </div>
              <div className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  ● Server va Database: 100% Faol
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-indigo-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div>
            © 2026 KITEST.UZ — Barcha huquqlar qonun bilan himoyalangan.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-cyan-400">robocontest.uz standartlari</span>
            <span>·</span>
            <span className="text-indigo-400">Google Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
