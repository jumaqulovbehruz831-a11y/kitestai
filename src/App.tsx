import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { KitestSkyLandingView } from './components/KitestSkyLandingView';
import { FaceIdScannerModal } from './components/FaceIdScannerModal';
import { ProblemList } from './components/ProblemList';
import { ProblemDetail } from './components/ProblemDetail';
import { TelegramQuizBuilder } from './components/TelegramQuizBuilder';
import { ContestView } from './components/ContestView';
import { CoursesView } from './components/CoursesView';
import { SubmissionsView } from './components/SubmissionsView';
import { LeaderboardView } from './components/LeaderboardView';
import { OnlineChatView } from './components/OnlineChatView';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { AdminAuthModal, ADMIN_PASSCODE_VALUE } from './components/AdminAuthModal';
import {
  ProfileModal,
  readAndOptimizeAvatarFile,
} from './components/ProfileModal';
import { CertificateModal } from './components/CertificateModal';
import { CertificatesStoreModal } from './components/CertificatesStoreModal';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { Books3DView } from './components/Books3DView';
import { FlyingKitesAndEmotionsOverlay } from './components/FlyingKitesAndEmotionsOverlay';
import { MajlisView } from './components/MajlisView';
import { InteractiveTutorialModal } from './components/InteractiveTutorialModal';
import { PremiumModal } from './components/PremiumModal';
import { CodeStudioView } from './components/CodeStudioView';
import { FloatingScoreRewardOverlay } from './components/FloatingScoreRewardOverlay';
import {
  GiantImageShowcaseModal,
  ShowcaseImageItem,
} from './components/GiantImageShowcaseModal';
import { KitestAIGeminiAssistant } from './components/KitestAIGeminiAssistant';
import { StoreShopView } from './components/StoreShopView';
import { KitestGramView } from './components/KitestGramView';
import { RaqamliUstozView } from './components/RaqamliUstozView';
import { CurrencyExchangeModal } from './components/CurrencyExchangeModal';
import {
  StudyPlansView,
  AlgorithmsView,
  RoadmapView,
  MyClassesView,
  BlogsView,
  HowItWorksView,
  OurTeamView,
} from './components/PlatformHubViews';
import { KITESTHubViews } from './components/KITESTHubViews';
import {
  BackgroundCustomizerModal,
  CustomBackgroundConfig,
  DEFAULT_BG_CONFIG,
  BACKGROUND_PRESETS,
} from './components/BackgroundCustomizerModal';
import { signInWithRealGooglePopup } from './firebase';
import { getClientState } from './services/clientApiInterceptor';
import {
  KitestKiteLogo,
  KitestSplashScreen,
} from './components/KitestKiteLogo';
import { KitestFloatingRobotMascot } from './components/KitestFloatingRobotMascot';
import { KitestAiSideDrawer } from './components/KitestAiSideDrawer';
import { UzbekistanRegionsModal } from './components/UzbekistanRegionsModal';
import {
  KitestEmblem,
  KIDTEST_LOGO_DATA_URL,
  playKitestSound,
} from './components/KitestEmblem';
import {
  User,
  TestItem,
  Submission,
  Contest,
  CourseItem,
  StudyPlan,
  AlgorithmTopic,
  Classroom,
  BlogPost,
  TeamMember,
  ChatMessage,
  ChatGroup,
  OnlinePresenceUser,
  CertificateData,
  StoreCertificate,
  UserPurchasedCertificate,
  PlatformWheelConfig,
  Book3DItem,
  STAR_COLOR_META,
  StarColor,
  computeRankClass,
  ADMIN_EMAIL,
  OFFICIAL_YOUTUBE_URL,
} from './types';
import {
  MessageSquare,
  Sparkles,
  Youtube,
  ExternalLink,
  LayoutDashboard,
  FileText,
  Send,
  Trophy,
  ClipboardCheck,
  Target,
  Cpu,
  Compass,
  GraduationCap,
  Users,
  BookOpen,
  HelpCircle,
  HeartHandshake,
  Bell,
  PlusCircle,
  ShieldCheck,
  Award,
  Zap,
  Upload,
  PanelLeftClose,
  LogIn,
  UserPlus,
  LogOut,
  Swords,
  Terminal,
  Calendar,
  Video,
  Settings,
  ScanFace,
  Home as HomeIcon,
  X,
  ArrowLeft,
  PlaySquare,
  Star,
  Gamepad2,
  Image as ImageIcon,
  ShoppingBag,
  Code2,
} from 'lucide-react';

const AUTH_STORAGE_KEY = 'kitest_clean_user_v3';
const ADMIN_PASSCODE_STORAGE_KEY = 'kitest_admin_passcode_v1';
const THEME_STORAGE_KEY = 'kitest_theme_mode';
const SOUND_STORAGE_KEY = 'kitest_sound_enabled';
const BG_CONFIG_STORAGE_KEY = 'kitest_custom_bg_v1';

// KITEST Standard Hash-Based URL Routing ("har bitta bo'lim uchun alohida havola/oyna")
export const TAB_TO_HASH: Record<NavTab, string> = {
  home: '#/home',
  problems: '#/tasks',
  tests_list: '#/tests',
  tests: '#/tests',
  code_arena: '#/arena',
  duels: '#/duels',
  contests: '#/contests',
  courses: '#/courses',
  books_3d: '#/books',
  study_plans: '#/study',
  algorithms: '#/algorithms',
  roadmap: '#/roadmap',
  my_classes: '#/classes',
  leaderboard: '#/users',
  all_users: '#/users',
  subscriptions: '#/subscriptions',
  blogs: '#/blogs',
  how_it_works: '#/about',
  our_team: '#/team',
  create_test: '#/create-test',
  submissions: '#/submissions',
  gemini_ai: '#/ai',
  kitestgram: '#/kitestgram',
  chat: '#/chat',
  majlis: '#/majlis',
  activity_map: '#/faces',
  admin: '#/admin',
  gameball: '#/kiteshot',
  shop: '#/shop',
  raqamli_ustoz: '#/mentor',
  auth_portal: '#/portal',
};

export const HASH_TO_TAB: Record<string, NavTab> = {
  '#/home': 'home',
  '#/tasks': 'problems',
  '#/problems': 'problems',
  '#/tests': 'tests_list',
  '#/tests_list': 'tests_list',
  '#/arena': 'code_arena',
  '#/code_arena': 'code_arena',
  '#/duels': 'duels',
  '#/contests': 'contests',
  '#/courses': 'courses',
  '#/books': 'books_3d',
  '#/study': 'study_plans',
  '#/algorithms': 'algorithms',
  '#/roadmap': 'roadmap',
  '#/classes': 'my_classes',
  '#/users': 'leaderboard',
  '#/leaderboard': 'leaderboard',
  '#/all_users': 'all_users',
  '#/subscriptions': 'subscriptions',
  '#/blogs': 'blogs',
  '#/about': 'how_it_works',
  '#/team': 'our_team',
  '#/create-test': 'create_test',
  '#/submissions': 'submissions',
  '#/ai': 'gemini_ai',
  '#/gemini_ai': 'gemini_ai',
  '#/kitestgram': 'kitestgram',
  '#/chat': 'kitestgram',
  '#/majlis': 'majlis',
  '#/faces': 'activity_map',
  '#/admin': 'admin',
  '#/kiteshot': 'gameball',
  '#/gameball': 'gameball',
  '#/shop': 'shop',
  '#/mentor': 'raqamli_ustoz',
  '#/portal': 'auth_portal',
};

let ringtoneAudioCtx: AudioContext | null = null;
let ringtoneIntervalTimer: any = null;

function playIncomingCallRingtone() {
  try {
    stopIncomingCallRingtone();
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    ringtoneAudioCtx = new AudioCtx();

    const ringTone = () => {
      if (!ringtoneAudioCtx || ringtoneAudioCtx.state === 'closed') return;
      const now = ringtoneAudioCtx.currentTime;
      const osc1 = ringtoneAudioCtx.createOscillator();
      const osc2 = ringtoneAudioCtx.createOscillator();
      const gain = ringtoneAudioCtx.createGain();

      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);
      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.setValueAtTime(0.2, now + 0.8);
      gain.gain.linearRampToValueAtTime(0, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ringtoneAudioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.95);
      osc2.stop(now + 0.95);
    };

    ringTone();
    setTimeout(ringTone, 1100);
    ringtoneIntervalTimer = setInterval(() => {
      ringTone();
      setTimeout(ringTone, 1100);
    }, 3000);
  } catch {}
}

function stopIncomingCallRingtone() {
  if (ringtoneIntervalTimer) {
    clearInterval(ringtoneIntervalTimer);
    ringtoneIntervalTimer = null;
  }
  if (ringtoneAudioCtx) {
    try {
      ringtoneAudioCtx.close();
    } catch {}
    ringtoneAudioCtx = null;
  }
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedTest, setSelectedTest] = useState<TestItem | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [authPortalMode, setAuthPortalMode] = useState<
    'login' | 'register' | 'admin'
  >('login');
  const [isFaceScannerOpen, setIsFaceScannerOpen] = useState(false);
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);

  // Single active session concurrency security alert ("bitta accountga bir paytning ozida ikkikishi kirib bolmasoin")
  const [isSecurityAlertOpen, setIsSecurityAlertOpen] = useState(false);
  const [securityAlertMessage, setSecurityAlertMessage] = useState(
    "⚠️ Xavfsizlik ogohlantiruvi: Ushbu hisobga boshqa qurilmadan kirildi. Bir vaqtning o'zida ikkita kishi bitta hisobdan foydalana olmaydi!"
  );

  // Theme state: read saved theme or default to cosmic dark
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // User-customizable Dashboard & Platform Background State
  const [bgConfig, setBgConfig] = useState<CustomBackgroundConfig>(() => {
    try {
      const saved = localStorage.getItem(BG_CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BG_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_BG_CONFIG;
  });

  const [isBgCustomizerOpen, setIsBgCustomizerOpen] = useState(false);

  const handleChangeBgConfig = (nextConfig: CustomBackgroundConfig) => {
    setBgConfig(nextConfig);
    try {
      localStorage.setItem(BG_CONFIG_STORAGE_KEY, JSON.stringify(nextConfig));
    } catch {}
    if (nextConfig.mode === 'preset') {
      const preset = BACKGROUND_PRESETS.find((p) => p.id === nextConfig.presetId);
      if (preset?.isLight) {
        setTheme('light');
      } else {
        setTheme('dark');
      }
    }
  };

  const handleResetBgConfig = () => {
    setBgConfig(DEFAULT_BG_CONFIG);
    setTheme('dark');
    try {
      localStorage.removeItem(BG_CONFIG_STORAGE_KEY);
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch {}
  };

  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const handleToggleTheme = () => {
    playKitestSound('click', soundEnabled);
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      } catch {}
      if (next) playKitestSound('click', true);
      return next;
    });
  };

  // Synchronously initialize state from client cache / seed data
  const initialClientState = useMemo(() => {
    try {
      return getClientState();
    } catch {
      return {};
    }
  }, []);

  const [users, setUsers] = useState<User[]>(() =>
    Array.isArray(initialClientState.users) ? initialClientState.users : []
  );
  const [tests, setTests] = useState<TestItem[]>(() =>
    Array.isArray(initialClientState.tests) ? initialClientState.tests : []
  );
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    Array.isArray(initialClientState.submissions) ? initialClientState.submissions : []
  );
  const [contests, setContests] = useState<Contest[]>(() =>
    Array.isArray(initialClientState.contests) ? initialClientState.contests : []
  );
  const [courses, setCourses] = useState<CourseItem[]>(() =>
    Array.isArray(initialClientState.courses) ? initialClientState.courses : []
  );
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() =>
    Array.isArray(initialClientState.studyPlans) ? initialClientState.studyPlans : []
  );
  const [algorithms, setAlgorithms] = useState<AlgorithmTopic[]>(() =>
    Array.isArray(initialClientState.algorithms) ? initialClientState.algorithms : []
  );
  const [classrooms, setClassrooms] = useState<Classroom[]>(() =>
    Array.isArray(initialClientState.classrooms) ? initialClientState.classrooms : []
  );
  const [blogs, setBlogs] = useState<BlogPost[]>(() =>
    Array.isArray(initialClientState.blogs) ? initialClientState.blogs : []
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    Array.isArray(initialClientState.teamMembers) ? initialClientState.teamMembers : []
  );
  const [books, setBooks] = useState<Book3DItem[]>(() =>
    Array.isArray(initialClientState.books) ? initialClientState.books : []
  );
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [storeCertificates, setStoreCertificates] = useState<StoreCertificate[]>(() =>
    Array.isArray(initialClientState.storeCertificates)
      ? initialClientState.storeCertificates
      : []
  );
  const [purchasedCertificates, setPurchasedCertificates] = useState<
    UserPurchasedCertificate[]
  >(() =>
    Array.isArray(initialClientState.purchasedCertificates)
      ? initialClientState.purchasedCertificates
      : []
  );
  const [wheelConfig, setWheelConfig] = useState<PlatformWheelConfig>(() =>
    initialClientState.wheelConfig || {
      globalEnabled: false,
      globalWheelEnabled: false,
      defaultSpinsPerGrant: 1,
      recentSpins: [],
      updatedAt: '',
    }
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    Array.isArray(initialClientState.messages) ? initialClientState.messages : []
  );
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>(() =>
    Array.isArray(initialClientState.chatGroups) ? initialClientState.chatGroups : []
  );
  const [onlineUsers, setOnlineUsers] = useState<OnlinePresenceUser[]>(() =>
    Array.isArray(initialClientState.onlineUsers) ? initialClientState.onlineUsers : []
  );
  const [screenshotProtectionEnabled, setScreenshotProtectionEnabled] =
    useState<boolean>(true);
  const [screenshotBlockedAlert, setScreenshotBlockedAlert] =
    useState<boolean>(false);

  // Step-by-step Interactive Onboarding Tour ("foydalanuvchi saytga kirganda unga maxsus saytdan foydalanish uchun yo'riqnoma ko'rinishi kerak bittalab ko'rsatib berishi kerak")
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isAiSideDrawerOpen, setIsAiSideDrawerOpen] = useState<boolean>(false);

  // Entry gate & Splash Loading state matching k3BbK.jpg
  const [hasEnteredPortal, setHasEnteredPortal] = useState<boolean>(true);
  const [splashLoading, setSplashLoading] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(25);

  // External Links state ("admin ga telegram va raqaml u hammasini linkini joylashham qosh")
  const [externalLinks, setExternalLinks] = useState<{
    kitestGramUrl: string;
    kitestBotUrl: string;
    raqamliUstozUrl: string;
    kodYozishUrl: string;
    aiAssistantUrl: string;
    youtubeUrl: string;
    githubUrl: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('kitest_external_links');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      kitestGramUrl: 'https://t.me/kitestai',
      kitestBotUrl: 'https://t.me/kitest',
      raqamliUstozUrl: 'https://raqamliustoz.uz',
      kodYozishUrl: '',
      aiAssistantUrl: '',
      youtubeUrl: 'https://youtube.com/@kitest_uz',
      githubUrl: 'https://github.com/kitest-platform',
    };
  });

  // Dedicated Viewing User state (KITEST profile view for any participant)
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/external-links')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.externalLinks) {
          setExternalLinks(data.externalLinks);
          try {
            localStorage.setItem('kitest_external_links', JSON.stringify(data.externalLinks));
          } catch {}
        }
      })
      .catch(() => {});

    const handleExternalLinksUpdated = (e: any) => {
      if (e.detail) {
        setExternalLinks(e.detail);
      }
    };
    window.addEventListener('kitest:external_links_updated', handleExternalLinksUpdated);
    return () => window.removeEventListener('kitest:external_links_updated', handleExternalLinksUpdated);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setSplashLoading(false), 250);
          return 100;
        }
        return Math.min(100, prev + Math.floor(Math.random() * 22) + 15);
      });
    }, 110);
    return () => clearInterval(timer);
  }, []);

  // Authenticated regular user (Participant / Creator)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      localStorage.removeItem('kitest_user');
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return null;
  });

  // Separate Admin Panel Passcode State (23291031sila)
  const [adminPasscode, setAdminPasscode] = useState<string>(() => {
    try {
      const savedCode = sessionStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY);
      if (savedCode === ADMIN_PASSCODE_VALUE) return savedCode;
    } catch {}
    return '';
  });

  const isBehruzAdmin = Boolean(
    currentUser &&
      (currentUser.username?.toLowerCase() === 'behruz_admin' ||
        currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        currentUser.role === 'admin')
  );

  const isAdminUnlocked = adminPasscode === ADMIN_PASSCODE_VALUE || isBehruzAdmin;

  // Separate Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegionsModalOpen, setIsRegionsModalOpen] = useState(false);
  const [isCertificatesStoreOpen, setIsCertificatesStoreOpen] = useState(false);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [activeCertificate, setActiveCertificate] =
    useState<CertificateData | null>(null);
  const [isImageShowcaseOpen, setIsImageShowcaseOpen] = useState(false);
  const [showcaseTargetImage, setShowcaseTargetImage] =
    useState<ShowcaseImageItem | null>(null);
  const [showcaseTargetUrl, setShowcaseTargetUrl] = useState<string | undefined>(
    undefined
  );

  // Real-time Incoming Live Invite State (Roblox-style Invite & Ringtone)
  const [incomingInvite, setIncomingInvite] = useState<any | null>(null);

  // Inactivity Presence Prompt State ("har ikkiminutda korilmagan bolsa korish spraydi")
  const [isIdlePromptOpen, setIsIdlePromptOpen] = useState<boolean>(false);
  const lastActiveTimeRef = useRef<number>(Date.now());

  const handleRespondToInvite = async (accepted: boolean) => {
    stopIncomingCallRingtone();
    if (!incomingInvite) return;
    const inv = incomingInvite;
    setIncomingInvite(null);

    try {
      await fetch('/api/wallet/invite-respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteId: inv.id,
          senderId: inv.senderId,
          targetUserId: currentUser?.id,
          accepted,
        }),
      });
    } catch {}

    if (accepted) {
      playKitestSound('victory', soundEnabled);
      if (inv.inviteType === 'duel') {
        navigateTab('duels');
      } else {
        setIsExchangeModalOpen(true);
      }
    } else {
      playKitestSound('click', soundEnabled);
    }
  };

  const handleOpenImageShowcase = useCallback(
    (target?: ShowcaseImageItem | string) => {
      if (typeof target === 'string') {
        setShowcaseTargetUrl(target);
        setShowcaseTargetImage(null);
      } else if (target && typeof target === 'object') {
        setShowcaseTargetImage(target);
        setShowcaseTargetUrl(undefined);
      } else {
        setShowcaseTargetImage(null);
        setShowcaseTargetUrl(undefined);
      }
      setIsImageShowcaseOpen(true);
    },
    []
  );

  const fetchPlatformState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();

      const serverUsers: User[] = Array.isArray(data.users) ? data.users : [];
      const serverTests: TestItem[] = Array.isArray(data.tests) ? data.tests : [];
      const serverSubmissions: Submission[] = Array.isArray(data.submissions)
        ? data.submissions
        : [];
      const serverContests: Contest[] = Array.isArray(data.contests)
        ? data.contests
        : [];
      const serverCourses: CourseItem[] = Array.isArray(data.courses)
        ? data.courses
        : [];
      const serverStudyPlans: StudyPlan[] = Array.isArray(data.studyPlans)
        ? data.studyPlans
        : [];
      const serverAlgorithms: AlgorithmTopic[] = Array.isArray(data.algorithms)
        ? data.algorithms
        : [];
      const serverClassrooms: Classroom[] = Array.isArray(data.classrooms)
        ? data.classrooms
        : [];
      const serverBlogs: BlogPost[] = Array.isArray(data.blogs)
        ? data.blogs
        : [];
      const serverTeamMembers: TeamMember[] = Array.isArray(data.teamMembers)
        ? data.teamMembers
        : [];
      const serverBooks: Book3DItem[] = Array.isArray(data.books)
        ? data.books
        : [];
      const serverStoreCertificates: StoreCertificate[] = Array.isArray(
        data.storeCertificates
      )
        ? data.storeCertificates
        : [];
      const serverPurchasedCertificates: UserPurchasedCertificate[] =
        Array.isArray(data.purchasedCertificates)
          ? data.purchasedCertificates
          : [];
      const serverMessages: ChatMessage[] = Array.isArray(data.messages)
        ? data.messages
        : [];
      const serverChatGroups: ChatGroup[] = Array.isArray(data.chatGroups)
        ? data.chatGroups
        : [];
      const serverOnlineUsers: OnlinePresenceUser[] = Array.isArray(
        data.onlineUsers
      )
        ? data.onlineUsers
        : [];

      setUsers(serverUsers);
      setTests(serverTests);
      setSubmissions(serverSubmissions);
      setContests(serverContests);
      setCourses(serverCourses);
      setStudyPlans(serverStudyPlans);
      setAlgorithms(serverAlgorithms);
      setClassrooms(serverClassrooms);
      setBlogs(serverBlogs);
      setTeamMembers(serverTeamMembers);
      setBooks(serverBooks);
      setStoreCertificates(serverStoreCertificates);
      setPurchasedCertificates(serverPurchasedCertificates);
      if (data.wheelConfig) {
        setWheelConfig(data.wheelConfig);
      }
      if (typeof data.screenshotProtectionEnabled === 'boolean') {
        setScreenshotProtectionEnabled(data.screenshotProtectionEnabled);
      }
      setMessages(serverMessages);
      setChatGroups(serverChatGroups);
      setOnlineUsers(serverOnlineUsers);

      setCurrentUser((prev) => {
        if (!prev) return null;
        const found = serverUsers.find(
          (u) =>
            u.id === prev.id ||
            (prev.email && u.email.toLowerCase() === prev.email.toLowerCase()) ||
            (prev.username &&
              u.username.toLowerCase() === prev.username.toLowerCase())
        );
        if (found) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
          return found;
        } else {
          // Automatically sync existing client session into server db.users so they are added to Foydalanuvchilar
          fetch('/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: prev }),
          })
            .then((r) => r.json())
            .then((syncData) => {
              if (syncData?.user) {
                localStorage.setItem(
                  AUTH_STORAGE_KEY,
                  JSON.stringify(syncData.user)
                );
                setCurrentUser(syncData.user);
              }
              if (Array.isArray(syncData?.users)) {
                setUsers(syncData.users);
              }
            })
            .catch(() => {});
          return prev;
        }
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchPlatformState();
  }, [fetchPlatformState]);

  const handleAuthSuccess = (user: User, allUsers?: User[]) => {
    playKitestSound('success', soundEnabled);
    setCurrentUser(user);
    setHasEnteredPortal(true);
    try {
      if (user.isIncognito) {
        // Incognito mode does not persist credentials to localStorage
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      }
      sessionStorage.setItem('kitest_entered_session_v1', 'true');
    } catch {}
    if (!user.isIncognito) {
      setUsers((prev) => {
        if (Array.isArray(allUsers) && allUsers.length > 0) {
          return allUsers;
        }
        const exists = prev.some(
          (u) =>
            u.id === user.id ||
            u.email.toLowerCase() === user.email.toLowerCase()
        );
        if (exists) {
          return prev.map((u) =>
            u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
              ? user
              : u
          );
        }
        return [...prev, user];
      });
    }
    if (
      user.role === 'user' &&
      user.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()
    ) {
      setAdminPasscode('');
      try {
        sessionStorage.removeItem(ADMIN_PASSCODE_STORAGE_KEY);
      } catch {}
    }
    setCurrentTab('home');
    fetchPlatformState();
    try {
      const seenTour = localStorage.getItem('kitest_onboarding_seen_v2');
      if (!seenTour) {
        setOnboardingStep(0);
        setIsOnboardingOpen(true);
        localStorage.setItem('kitest_onboarding_seen_v2', 'true');
      }
    } catch {}
  };

  const handleUnlockAdmin = (passcode: string) => {
    playKitestSound('victory', soundEnabled);
    setAdminPasscode(passcode);
    setHasEnteredPortal(true);
    try {
      sessionStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, passcode);
      sessionStorage.setItem('kitest_entered_session_v1', 'true');
    } catch {}
    setSelectedTest(null);
    setIsAdminModalOpen(false);
    setIsAuthOpen(false);
    setCurrentTab('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLockAdmin = () => {
    playKitestSound('click', soundEnabled);
    setAdminPasscode('');
    try {
      sessionStorage.removeItem(ADMIN_PASSCODE_STORAGE_KEY);
    } catch {}
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  const handleLogout = () => {
    playKitestSound('click', soundEnabled);
    setCurrentUser(null);
    setAdminPasscode('');
    setHasEnteredPortal(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(ADMIN_PASSCODE_STORAGE_KEY);
      sessionStorage.removeItem('kitest_entered_session_v1');
    } catch {}
    setSelectedTest(null);
    setAuthPortalMode('login');
    setCurrentTab('home');
  };

  const handleSelectTest = (test: TestItem) => {
    playKitestSound('click', soundEnabled);
    setSelectedTest(test);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveUserToLocalStorage = (userObj: User | null) => {
    try {
      if (!userObj) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userObj));
      }
    } catch {}
  };

  // Direct Photo Upload handler from Sidebar
  const handleDirectUnmodifiedPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    if (!file.type.startsWith('image/')) return;
    try {
      const optimizedDataUrl = await readAndOptimizeAvatarFile(file);
      if (!optimizedDataUrl) return;
      const res = await fetch(`/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarUrl: optimizedDataUrl,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        playKitestSound('success', soundEnabled);
        setCurrentUser(data.user);
        saveUserToLocalStorage(data.user);
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        }
        await fetchPlatformState();
      }
    } catch {}
    e.target.value = '';
  };

  const isMainAdmin =
    Boolean(isAdminUnlocked) ||
    Boolean(
      currentUser &&
        (currentUser.email.trim().toLowerCase() === ADMIN_EMAIL ||
          currentUser.role === 'admin' ||
          currentUser.username?.toLowerCase() === 'behruz_admin')
    );

  // Global Screenshot Protection Enforcement ("saytdagi ma'lumotlarni skrinshot qilib bo'lmasin faqat admin ruxsat bergan odamgina qila olsin")
  const canTakeScreenshot =
    !screenshotProtectionEnabled ||
    isMainAdmin ||
    Boolean(currentUser?.screenshotAllowed);

  useEffect(() => {
    if (canTakeScreenshot) return;

    const triggerBlockAlert = () => {
      setScreenshotBlockedAlert(true);
      try {
        navigator.clipboard?.writeText(
          "KITEST: Skrinshot qilish taqiqlangan! Faqat Bosh Admin ruxsat bergan foydalanuvchilar skrinshot qila oladi."
        );
      } catch {}
      setTimeout(() => setScreenshotBlockedAlert(false), 3500);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key.toLowerCase() === 's')) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') ||
        (e.ctrlKey && e.key.toLowerCase() === 'p')
      ) {
        e.preventDefault();
        triggerBlockAlert();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        triggerBlockAlert();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [canTakeScreenshot]);

  const handleToggleGlobalScreenshotProtection = async (enabled: boolean) => {
    try {
      const res = await fetch('/api/admin/security/toggle-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || ADMIN_EMAIL,
          'x-admin-passcode': adminPasscode || '',
        },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setScreenshotProtectionEnabled(enabled);
        await fetchPlatformState();
      }
    } catch {}
  };

  const isCreatorOrAdmin = true;

  // Send real-time presence & current activity heartbeat so Online Users, Tutorial, and Admin Monitor see live activity
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const activityLabel = selectedTest
          ? `Test yechmoqda: #${selectedTest.id} ${selectedTest.title}`
          : currentTab === 'majlis'
          ? '🎥 Video Majlisda'
          : currentTab === 'chat'
          ? '💬 Onlayn Chatda'
          : currentTab === 'create_test'
          ? '✨ AI Savol va Test yaratmoqda'
          : currentTab === 'courses'
          ? '🎬 Video Kurs ko‘rmoqda'
          : currentTab === 'problems' || currentTab === 'tests'
          ? '📚 Testlar arxivida'
          : currentTab === 'admin'
          ? '🛡️ Admin Panelda'
          : 'Asosiy sahifada';

        const res = await fetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            userId: currentUser?.id || 'guest_active',
            name: currentUser?.name || 'Mehmon Foydalanuvchi',
            username: currentUser?.username || 'mehmon',
            role: currentUser?.role || 'user',
            region: currentUser?.region || 'Toshkent',
            rating: currentUser?.rating || 1200,
            totalScore: currentUser?.totalScore || 0,
            avatarUrl: currentUser?.avatarUrl,
            avatarEmoji: currentUser?.avatarEmoji || '🚀',
            currentTab,
            currentActivity: activityLabel,
            deviceLabel: window.innerWidth < 768 ? 'Mobil Qurilma' : 'Kompyuter (Web)',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.onlineUsers)) {
            setOnlineUsers(data.onlineUsers);
          }
        }
      } catch {}
    };

    sendHeartbeat();
    const timer = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(timer);
  }, [currentUser, currentTab, selectedTest]);

  const customContainerStyle = useMemo<React.CSSProperties>(() => {
    const baseStyle: React.CSSProperties = {};
    if (bgConfig.fontFamily === 'mono') {
      baseStyle.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    } else if (bgConfig.fontFamily === 'serif') {
      baseStyle.fontFamily = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    } else if (bgConfig.fontFamily === 'rounded') {
      baseStyle.fontFamily = '"Nunito", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
    }
    if (bgConfig.fontScale && bgConfig.fontScale !== 100) {
      baseStyle.zoom = `${bgConfig.fontScale}%`;
    }

    if (bgConfig.mode === 'solid') {
      return { ...baseStyle, backgroundColor: bgConfig.solidColor, backgroundImage: 'none' };
    }
    if (bgConfig.mode === 'gradient') {
      return {
        ...baseStyle,
        background: `linear-gradient(${bgConfig.gradientAngle || 135}deg, ${bgConfig.gradientStart} 0%, ${bgConfig.gradientEnd} 100%)`,
      };
    }
    if (bgConfig.mode === 'preset') {
      const found = BACKGROUND_PRESETS.find((p) => p.id === bgConfig.presetId);
      if (found && found.id !== 'default-dark' && found.id !== 'clean-light') {
        return { ...baseStyle, background: found.cssBackground };
      }
    }
    return baseStyle;
  }, [bgConfig]);

  const navigateTab = (tab: NavTab) => {
    playKitestSound('click', soundEnabled);
    setSelectedTest(null);
    setCurrentTab(tab);
    if (TAB_TO_HASH[tab]) {
      window.location.hash = TAB_TO_HASH[tab];
    }
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // KITEST Standard Hash-Based URL Routing Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '';
      if (!hash || hash === '#/' || hash === '#/home') {
        if (currentTab !== 'home') setCurrentTab('home');
        return;
      }
      if (
        hash.startsWith('#/user/') ||
        hash.startsWith('#/profile/') ||
        hash.startsWith('#/student/')
      ) {
        const uName = decodeURIComponent(hash.split('/')[2] || '')
          .trim()
          .replace(/^@+/, '')
          .toLowerCase();
        if (uName) {
          const found = users.find(
            (u) =>
              u.username.toLowerCase() === uName ||
              u.id.toLowerCase() === uName ||
              u.username.toLowerCase().includes(uName) ||
              u.name.toLowerCase().includes(uName)
          );
          if (found) {
            setViewingUser(found);
            setIsProfileOpen(true);
            return;
          }
        }
      }
      const matched = HASH_TO_TAB[hash];
      if (matched && matched !== currentTab) {
        setSelectedTest(null);
        setCurrentTab(matched);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [users, currentTab]);

  // Concurrency Guard: Single active session per account ("bitta accountga bir paytning ozida ikkikishi kirib bolmasoin")
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;

    const connectWs = () => {
      try {
        ws = new WebSocket(`${protocol}//${window.location.host}/ws/chat`);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'auth:force_logout') {
              if (currentUser && data.userId === currentUser.id) {
                const currentStoredToken = sessionStorage.getItem('kitest_session_token');
                if (data.newSessionToken && data.newSessionToken !== currentStoredToken) {
                  playKitestSound('warning', soundEnabled);
                  setCurrentUser(null);
                  setHasEnteredPortal(false);
                  try {
                    localStorage.removeItem(AUTH_STORAGE_KEY);
                    sessionStorage.removeItem('kitest_session_token');
                  } catch {}
                  setSecurityAlertMessage(
                    data.reason ||
                      "⚠️ Xavfsizlik ogohlantiruvi: Ushbu hisobga boshqa qurilmadan kirildi. Bir vaqtning o'zida ikkita kishi bitta hisobdan foydalana olmaydi!"
                  );
                  setIsSecurityAlertOpen(true);
                }
              }
            } else if (data.type === 'invite:incoming' && data.invite) {
              const inv = data.invite;
              if (
                currentUser &&
                (inv.targetUserId === currentUser.id ||
                  inv.targetUsername?.toLowerCase() === currentUser.username?.toLowerCase())
              ) {
                setIncomingInvite(inv);
                playIncomingCallRingtone();
              }
            } else if (data.type === 'invite:response') {
              if (currentUser && data.senderId === currentUser.id) {
                if (data.accepted) {
                  playKitestSound('victory', soundEnabled);
                  if (data.inviteType === 'duel') {
                    navigateTab('duels');
                  } else {
                    setIsExchangeModalOpen(true);
                  }
                } else {
                  playKitestSound('warning', soundEnabled);
                }
              }
            }
          } catch {}
        };
        ws.onclose = () => {
          reconnectTimer = setTimeout(connectWs, 3500);
        };
      } catch {}
    };

    connectWs();
    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [currentUser, soundEnabled]);

  // User Presence & 2-Minute Inactivity Prompt ("har ikkiminutda korilmagan bolsa korish spraydi")
  useEffect(() => {
    const markActive = () => {
      lastActiveTimeRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, markActive, { passive: true }));

    const checkInterval = setInterval(() => {
      // 2 minutes = 120,000 milliseconds
      const idleMs = Date.now() - lastActiveTimeRef.current;
      if (idleMs >= 120000 && !isIdlePromptOpen && hasEnteredPortal) {
        setIsIdlePromptOpen(true);
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, markActive));
      clearInterval(checkInterval);
    };
  }, [isIdlePromptOpen, hasEnteredPortal]);

  // Periodic active session validation (every 7 seconds)
  useEffect(() => {
    if (!currentUser || currentUser.isIncognito) return;
    const currentStoredToken = sessionStorage.getItem('kitest_session_token');
    if (!currentStoredToken) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/auth/session-check?userId=${encodeURIComponent(
            currentUser.id
          )}&sessionToken=${encodeURIComponent(currentStoredToken)}`
        );
        if (res.status === 409) {
          const body = await res.json();
          playKitestSound('warning', soundEnabled);
          setCurrentUser(null);
          setHasEnteredPortal(false);
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            sessionStorage.removeItem('kitest_session_token');
          } catch {}
          setSecurityAlertMessage(
            body.reason ||
              "⚠️ Xavfsizlik ogohlantiruvi: Ushbu hisobga boshqa qurilmadan kirildi. Bir vaqtning o'zida ikkita kishi bitta hisobdan foydalana olmaydi!"
          );
          setIsSecurityAlertOpen(true);
        }
      } catch {}
    }, 7000);

    return () => clearInterval(interval);
  }, [currentUser, soundEnabled]);

  const openDedicatedAuthPage = (
    mode: 'login' | 'register' | 'admin' = 'login'
  ) => {
    playKitestSound('click', soundEnabled);
    setSelectedTest(null);
    if (mode === 'admin') {
      setIsAdminModalOpen(true);
      return;
    }
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const goToFullAuthPortal = (
    mode: 'login' | 'register' | 'admin' = 'login'
  ) => {
    playKitestSound('click', soundEnabled);
    setSelectedTest(null);
    setAuthPortalMode(mode);
    setCurrentTab('auth_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={customContainerStyle}
      className={`min-h-screen flex flex-col font-sans relative ${
        theme === 'light'
          ? 'kitest-bg-light text-slate-900'
          : 'kitest-bg-dark text-slate-100'
      }`}
    >
      {/* Hidden input for 100% unmodified user photo upload */}
      <input
        ref={quickPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectUnmodifiedPhotoUpload}
        className="hidden"
      />

      {/* Fixed User-Uploaded Custom Wallpaper Layer (if mode === 'image') */}
      {bgConfig.mode === 'image' && bgConfig.imageUrl && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{
              backgroundImage: `url(${bgConfig.imageUrl})`,
              filter: bgConfig.blurPx > 0 ? `blur(${bgConfig.blurPx}px)` : undefined,
              transform: bgConfig.blurPx > 0 ? 'scale(1.04)' : undefined,
            }}
          />
          <div
            className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
            style={{ opacity: bgConfig.overlayOpacity }}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* STRICT 2-SCREEN SEPARATION:                                           */}
      {/* OYNA 1 (!hasEnteredPortal || (!currentUser && !isAdminUnlocked)):     */}
      {/*         BIRINCHI KIRGANDAGI KIRISH (LOGIN / REGISTER) OYNASI          */}
      {/* OYNA 2 (hasEnteredPortal && (currentUser || isAdminUnlocked)):        */}
      {/*         KIRISHDAN KEYINGI ASOSIY DASHBOARD OYNA                       */}
      {/* 0. SPLASH / LOADING SCREEN (100% Matching k3BbK.jpg) */}
      {splashLoading && (
        <KitestSplashScreen
          progress={splashProgress}
          onFinish={() => setSplashLoading(false)}
        />
      )}

      {(!currentUser && !isAdminUnlocked) || currentTab === 'auth_portal' ? (
        <div className="relative z-10 min-h-screen flex flex-col">
          <KitestSkyLandingView
            currentUser={currentUser}
            isAdminUnlocked={isAdminUnlocked}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            tests={tests}
            users={users}
            onOpenAuth={(mode) => {
              setAuthMode(mode);
              setIsAuthOpen(true);
            }}
            onOpenFaceId={() => setIsFaceScannerOpen(true)}
            onOpenIncognito={() => {
              const incognitoUser: User = {
                id: `incognito_${Date.now()}`,
                name: 'Inkognito Foydalanuvchi',
                username: 'inkognito_rejim',
                email: 'incognito@kitest.uz',
                role: 'user',
                rating: 1200,
                ratingTitle: '🕵️ Inkognito',
                solvedCount: 0,
                totalScore: 0,
                coins: 25,
                stars: 1,
                starColor: 'blue',
                starRankTitle: 'Inkognito',
                scoreMultiplier: 1,
                rank: 0,
                region: 'Toshkent shahri',
                district: 'Yunusobod tumani',
                institution: 'Inkognito Sessiya',
                bio: "Accountsiz inkognito rejim orqali kirilgan.",
                avatarEmoji: '🕵️',
                customBadge: '🕵️ INKOGNITO',
                isIncognito: true,
              };
              handleAuthSuccess(incognitoUser);
            }}
            onSelectTest={handleSelectTest}
            onNavigateTab={(tab) => {
              navigateTab(tab);
            }}
            onOpenAiDrawer={() => setIsAiSideDrawerOpen(true)}
          />
        </div>
      ) : (
        <div className="relative z-10 h-screen overflow-hidden flex flex-row">
          {/* Mobile backdrop when sidebar is open on small screens */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-30 sm:hidden"
            />
          )}

          {/* LEFT SIDEBAR: Always on the left, never stacked above the page */}
          {sidebarOpen && (
            <aside className="fixed sm:static inset-y-0 left-0 w-64 shrink-0 bg-[#070b18] border-r border-indigo-500/20 flex flex-col h-screen overflow-y-auto z-40 select-none shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
              {/* Brand Header matching Image 2: 3D K Logo + KITEST + Ta'lim platformasi */}
              <div className="h-16 px-4 border-b border-indigo-500/20 flex items-center justify-between gap-2 shrink-0 bg-[#090f22]/70">
                <div
                  onClick={() => navigateTab('auth_portal')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  title="Portal (1-rasm) sahifasiga o'tish"
                >
                  <KitestKiteLogo size={36} variant="flying" />
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tight text-white leading-none">
                      KITEST
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 leading-tight mt-0.5">
                      Ta'lim platformasi
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-indigo-500/20 cursor-pointer"
                  title="Menyuni yopish"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto">
                {/* User Profile Card (Matching Image 2) */}
                {currentUser ? (
                  <div className="p-3 rounded-2xl bg-[#0c1329]/90 border border-indigo-500/30 space-y-2.5 shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={currentUser.avatarUrl || KIDTEST_LOGO_DATA_URL}
                          alt={currentUser.name}
                          onClick={() => setIsProfileOpen(true)}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = KIDTEST_LOGO_DATA_URL;
                          }}
                          className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400 shadow-md cursor-pointer"
                        />
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                          👑 Pro
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-white truncate flex items-center gap-1">
                          {currentUser.name}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold mt-0.5">
                          <span className="text-amber-400">⭐ {currentUser.totalScore ?? 996590}</span>
                          <span className="text-amber-300">🪙 {currentUser.coins ?? 10000000}</span>
                        </div>
                        <div className="text-[11px] text-purple-300 font-bold flex items-center gap-1 mt-0.5">
                          <span>🛡️ {currentUser.stars ?? 20} ★</span>
                          <span className="text-slate-400">➔</span>
                        </div>
                      </div>
                    </div>

                    {/* Profilni tahrirlash Button */}
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen(true)}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <span>✏️</span>
                      <span>Profilni tahrirlash</span>
                    </button>
                  </div>
                ) : null}

                {/* + Face ID Bilan Kirish Glowing Button (Matching Image 2) */}
                <button
                  type="button"
                  onClick={() => setIsFaceScannerOpen(true)}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(6,182,212,0.4)] transition-all cursor-pointer hover:scale-102"
                >
                  <ScanFace className="w-4 h-4 text-white" />
                  <span>+ Face ID Bilan Kirish</span>
                </button>

                {/* Guest / Visitor Quick Sign-In Card */}
                {!currentUser && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sm font-bold text-sky-300">
                        KT
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          Mehmon rejimi
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          Testlar va natijalarni saqlash
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => openDedicatedAuthPage('login')}
                        className="py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <LogIn className="w-3 h-3" />
                        <span>Kirish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDedicatedAuthPage('register')}
                        className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1 border border-slate-700 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Ro&apos;yxatdan</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthOpen(true);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ScanFace className="w-3.5 h-3.5" />
                      <span>Face ID orqali kirish</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          let email = '';
                          let name = '';
                          let photoURL = '';
                          let uid = '';

                          try {
                            const verified = await signInWithRealGooglePopup();
                            if (verified) {
                              email = verified.email;
                              name = verified.name;
                              photoURL = verified.photoURL;
                              uid = verified.uid;
                            }
                          } catch {
                            const entered = prompt(
                              "Google Sites yoki xavfsiz iframe muhitida Google popup ochilmadi.\nGoogle emailingizni kiriting:",
                              "jumaqulovbehruz831@gmail.com"
                            );
                            if (entered && entered.includes('@')) {
                              email = entered.trim().toLowerCase();
                              name = email === 'jumaqulovbehruz831@gmail.com' ? 'Behruz Jumaqulov (Bosh Admin)' : email.split('@')[0];
                              uid = `g_${email.replace(/[^a-z0-9]/g, '_')}`;
                              photoURL = `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`;
                            }
                          }

                          if (email) {
                            const res = await fetch('/api/auth/google-login', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                email,
                                name,
                                avatarUrl: photoURL,
                                googleUid: uid,
                              }),
                            });
                            const data = await res.json();
                            if ((res.ok || data.ok || data.success) && data.user) {
                              handleAuthSuccess(data.user, Array.isArray(data.users) ? data.users : undefined);
                            }
                          }
                        } catch {}
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-200 text-[10px] font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="truncate">Google accountga kirish — KITEST</span>
                    </button>
                  </div>
                )}

                {/* ASOSIY Section (Matching Image 2) */}
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    ASOSIY
                  </div>

                  {/* 1. Bosh sahifa */}
                  <button
                    type="button"
                    onClick={() => navigateTab('home')}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'home' && !selectedTest
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400'
                        : 'text-slate-300 hover:bg-[#111936] hover:text-white'
                    }`}
                  >
                    <HomeIcon className="w-4 h-4 text-indigo-300" />
                    <span>Bosh sahifa</span>
                  </button>

                  {/* 2. Masalalar */}
                  <button
                    type="button"
                    onClick={() => navigateTab('problems')}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'problems' && !selectedTest
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'text-slate-300 hover:bg-[#111936] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span>Masalalar</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tests.length}
                    </span>
                  </button>

                  {/* 3. Testlar */}
                  <button
                    type="button"
                    onClick={() => navigateTab('tests_list')}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'tests_list' && !selectedTest
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'text-slate-300 hover:bg-[#111936] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                      <span>Testlar</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tests.length}
                    </span>
                  </button>

                  {/* 4. Kod Poligoni */}
                  <button
                    type="button"
                    onClick={() => navigateTab('code_arena')}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'code_arena' && !selectedTest
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'text-slate-300 hover:bg-[#111936] hover:text-white'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Kod Poligoni</span>
                  </button>

                  {/* 5. 1v1 Duellar */}
                  <button
                    type="button"
                    onClick={() => navigateTab('duels')}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'duels' && !selectedTest
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                        : 'text-slate-300 hover:bg-[#111936] hover:text-white'
                    }`}
                  >
                    <Swords className="w-4 h-4 text-rose-400" />
                    <span>1v1 Duellar</span>
                  </button>
                </div>

                {/* Qo'shimcha Section (Matching Image 2) */}
                <div className="space-y-1 pt-1 border-t border-indigo-500/20">
                  <div className="px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Qo'shimcha
                  </div>

                  {/* 1. Kod Yozish & IDE [PYTHON/C++] */}
                  <button
                    type="button"
                    onClick={() => {
                      if (externalLinks.kodYozishUrl) {
                        window.open(externalLinks.kodYozishUrl, '_blank');
                      } else {
                        navigateTab('code_arena');
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-300 hover:bg-[#111936] hover:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <span>Kod Yozish & IDE</span>
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-500/25 text-blue-300 border border-blue-400/30">
                      PYTHON/C++
                    </span>
                  </button>

                  {/* 2. Do'kon & Bozor [YANGI ➔] */}
                  <button
                    type="button"
                    onClick={() => navigateTab('shop')}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-300 hover:bg-[#111936] hover:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Do'kon & Bozor</span>
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                      YANGI ➔
                    </span>
                  </button>

                  {/* 3. Raqamli Yuzlar */}
                  <button
                    type="button"
                    onClick={() => navigateTab('activity_map')}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-slate-300 hover:bg-[#111936] hover:text-white transition-all cursor-pointer"
                  >
                    <ScanFace className="w-4 h-4 text-purple-400" />
                    <span>Raqamli Yuzlar</span>
                  </button>

                  {/* 4. Olimpiadalar */}
                  <button
                    type="button"
                    onClick={() => navigateTab('contests')}
                    className="w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between text-slate-300 hover:bg-[#111936] hover:text-white transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Olimpiadalar</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {Math.max(1, contests.length)}
                    </span>
                  </button>
                </div>

                {/* Bottom KITEST Pro Gold Banner (Matching Image 2) */}
                <div className="pt-2">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#211709] via-[#1b162f] to-[#121c3b] border border-amber-500/40 shadow-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                        <Trophy className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1">
                          <span>KITEST</span>
                          <span className="text-amber-400">Pro</span>
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Barcha imkoniyatlar bir joyda!
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPremiumModalOpen(true)}
                      className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[11px] shrink-0 cursor-pointer shadow-md"
                    >
                      Faollashtirish ➔
                    </button>
                  </div>
                </div>

                {/* TA'LIM */}
                <div className="space-y-0.5 pt-2 border-t border-slate-800/70">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Ta'lim va 3D Kitoblar
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTab('courses')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'courses' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Youtube className="w-4 h-4 text-rose-400" />
                      <span>Video Kurslar</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {courses.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('books_3d')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'books_3d' && !selectedTest
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>3D Kitoblar</span>
                    </span>
                    <span className="text-[10px] font-mono text-indigo-300">
                      {books.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('study_plans')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'study_plans' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Target className="w-4 h-4 text-sky-400" />
                      <span>O'quv rejalari</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('algorithms')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'algorithms' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      <span>Algoritmlar</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('roadmap')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'roadmap' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Compass className="w-4 h-4 text-purple-400" />
                      <span>Yo'l xaritasi</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('my_classes')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'my_classes' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-rose-400" />
                      <span>Mening sinflarim</span>
                    </span>
                  </button>
                </div>

                {/* HAMJAMIYAT */}
                <div className="space-y-0.5 pt-2 border-t border-slate-800/70">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Hamjamiyat
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTab('all_users')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      (currentTab === 'all_users' || currentTab === 'leaderboard') &&
                      !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Reyting va A'zolar</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {users.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('subscriptions')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'subscriptions' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-rose-400" />
                      <span>Obunalar</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('blogs')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'blogs' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Maqolalar</span>
                    </span>
                  </button>

                  {/* Dedicated KitestAI Pro (Ultra-tezkor neyrotizim) */}
                  <button
                    type="button"
                    onClick={() => navigateTab('gemini_ai')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'gemini_ai' && !selectedTest
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-indigo-300 hover:bg-indigo-500/15'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>🤖 KitestAI Pro</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-[9px] font-black text-indigo-200">
                      PRO AI
                    </span>
                  </button>

                  {/* Dedicated AI Savol va Test Tuzish */}
                  <button
                    type="button"
                    onClick={() => navigateTab('create_test')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'create_test' && !selectedTest
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:bg-purple-500/15'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      <span>✨ KitestAI: Test Tuzuvchi</span>
                    </span>
                  </button>

                  {/* Dedicated KitestGram (xuddi Telegram dek) */}
                  <button
                    type="button"
                    onClick={() => navigateTab('kitestgram')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      (currentTab === 'kitestgram' || currentTab === 'chat') && !selectedTest
                        ? 'bg-[#2AABEE] text-white shadow-lg shadow-sky-500/30'
                        : 'text-sky-300 hover:bg-sky-500/15'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-[#2AABEE] -rotate-12 translate-x-0.5" />
                      <span>✈️ KitestGram (Onlayn)</span>
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('majlis')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
                      currentTab === 'majlis' && !selectedTest
                        ? 'bg-rose-600 text-white'
                        : 'text-rose-300 hover:bg-rose-500/15'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Video className="w-4 h-4 text-rose-400" />
                      <span>🎥 Video Majlis</span>
                    </span>
                  </button>
                </div>

                {/* TIZIM */}
                <div className="space-y-0.5 pt-2 border-t border-slate-800/70">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Tizim va Sozlamalar
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBgCustomizerOpen(true)}
                    className="sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-bold text-sky-300 hover:bg-sky-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-sky-400" />
                    <span>⚙️ Nastroyka (Dizayn)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenImageShowcase()}
                    className="sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>🖼️ Katta Rasmlar (Ultra HD)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCertificatesStoreOpen(true)}
                    className="sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Sertifikatlar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLuckyWheelOpen(true)}
                    className="sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span>Omad barabani</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('our_team')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'our_team' && !selectedTest
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-emerald-400" />
                    <span>Bizning jamoa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/15 flex items-center gap-2.5 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>📖 Interaktiv Tutorial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTab('create_test')}
                    className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                      currentTab === 'create_test' && !selectedTest
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-300 hover:bg-emerald-500/15'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>✨ AI Savol va Test Tuzish</span>
                  </button>

                  {isMainAdmin && (
                    <button
                      type="button"
                      onClick={() => navigateTab('admin')}
                      className={`sidebar-neon-hover w-full py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                        currentTab === 'admin' && !selectedTest
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-300 hover:bg-amber-500/15'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Boshqaruv paneli</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openDedicatedAuthPage('login')}
                    className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold text-sky-300 hover:bg-sky-500/15 flex items-center gap-2.5 mt-1"
                  >
                    <LogIn className="w-4 h-4 text-sky-400" />
                    <span>Kirish / Hisob almashtirish</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2 px-2.5 rounded-lg text-xs font-semibold text-rose-300 hover:bg-rose-500/15 flex items-center gap-2.5 mt-0.5"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            </aside>
          )}

          {/* RIGHT WORKSPACE: Scrollable side-by-side results panel */}
          <div className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
            <Navbar
              currentTab={currentTab}
              setCurrentTab={navigateTab}
              currentUser={currentUser}
              isAdminUnlocked={isAdminUnlocked}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onOpenBgCustomizer={() => setIsBgCustomizerOpen(true)}
              soundEnabled={soundEnabled}
              onToggleSound={handleToggleSound}
              chatMessagesCount={messages.length}
              coursesCount={courses.length}
              contestsCount={Math.max(1, contests.length)}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              onOpenLogin={() => openDedicatedAuthPage('login')}
              onOpenRegister={() => openDedicatedAuthPage('register')}
              onOpenAdminModal={() => openDedicatedAuthPage('admin')}
              onOpenProfile={() => setIsProfileOpen(true)}
              onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
              onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
              onOpenOnboardingGuide={() => {
                setOnboardingStep(0);
                setIsOnboardingOpen(true);
              }}
              globalSearchQuery={globalSearchQuery}
              onGlobalSearchChange={setGlobalSearchQuery}
              tests={tests}
              onSelectTest={handleSelectTest}
              onOpenPremium={() => setIsPremiumModalOpen(true)}
              onOpenCurrencyExchange={() => setIsExchangeModalOpen(true)}
              onRefreshState={fetchPlatformState}
              onLogout={handleLogout}
              onOpenRegions={() => setIsRegionsModalOpen(true)}
              kitestGramUrl={externalLinks.kitestGramUrl}
              raqamliUstozUrl={externalLinks.raqamliUstozUrl}
            />

            {/* Main Right Results Area */}
            <main className="flex-1 p-4 sm:p-6 max-w-[1360px] w-full mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                    {currentTab === 'home' ? (
                      <HomeView
                        tests={tests}
                        users={users}
                        submissions={submissions}
                        contests={contests}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        soundEnabled={soundEnabled}
                        bgConfig={bgConfig}
                        onChangeBgConfig={handleChangeBgConfig}
                        onOpenBgCustomizer={() => setIsBgCustomizerOpen(true)}
                        onSelectTest={handleSelectTest}
                        onNavigate={(tab) => navigateTab(tab)}
                        onOpenAuth={(mode) => openDedicatedAuthPage(mode)}
                        onOpenAdminModal={() => openDedicatedAuthPage('admin')}
                        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
                        onOpenProfile={() => {
                          setViewingUser(currentUser);
                          setIsProfileOpen(true);
                        }}
                        onOpenImageShowcase={handleOpenImageShowcase}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                        onRefreshState={fetchPlatformState}
                        onOpenAiDrawer={() => setIsAiSideDrawerOpen(true)}
                        kitestBotUrl={externalLinks.kitestBotUrl}
                      />
                    ) : currentTab === 'problems' ||
                      currentTab === 'tests_list' ||
                      currentTab === 'tests' ? (
                      <ProblemList
                        mode={
                          currentTab === 'tests_list' || currentTab === 'tests'
                            ? 'tests_list'
                            : 'problems'
                        }
                        tests={tests}
                        submissions={submissions}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        externalSearchQuery={globalSearchQuery}
                        onSelectTest={handleSelectTest}
                        onOpenCreateTest={() => navigateTab('create_test')}
                      />
                    ) : currentTab === 'courses' ? (
                      <CoursesView
                        courses={courses}
                        tests={tests}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onSelectTest={handleSelectTest}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                      />
                    ) : currentTab === 'books_3d' ? (
                      <Books3DView
                        books={books}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        screenshotProtectionEnabled={screenshotProtectionEnabled}
                        onRefreshState={fetchPlatformState}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                      />
                    ) : currentTab === 'study_plans' ? (
                      <StudyPlansView
                        studyPlans={studyPlans}
                        tests={tests}
                        courses={courses}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onSelectTest={handleSelectTest}
                        onNavigateTab={(tab) => navigateTab(tab)}
                        onNavigate={(tab) => navigateTab(tab)}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                      />
                    ) : currentTab === 'algorithms' ? (
                      <AlgorithmsView
                        algorithms={algorithms}
                        tests={tests}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onSelectTest={handleSelectTest}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                      />
                    ) : currentTab === 'roadmap' ? (
                      <RoadmapView
                        currentUser={currentUser}
                        tests={tests}
                        courses={courses}
                        studyPlans={studyPlans}
                        onNavigateTab={(tab) => navigateTab(tab)}
                        onNavigate={(tab) => navigateTab(tab)}
                        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                      />
                    ) : currentTab === 'my_classes' ? (
                      <MyClassesView
                        classrooms={classrooms}
                        users={users}
                        tests={tests}
                        courses={courses}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onSelectTest={handleSelectTest}
                        onNavigateTab={(tab) => navigateTab(tab)}
                        onNavigate={(tab) => navigateTab(tab)}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                      />
                    ) : currentTab === 'blogs' ? (
                      <BlogsView
                        blogs={blogs}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                      />
                    ) : currentTab === 'how_it_works' ? (
                      <HowItWorksView
                        onNavigateTab={(tab) => navigateTab(tab)}
                        onNavigate={(tab) => navigateTab(tab)}
                        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
                      />
                    ) : currentTab === 'our_team' ? (
                      <OurTeamView
                        teamMembers={teamMembers}
                        users={users}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onRefreshState={fetchPlatformState}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                      />
                    ) : currentTab === 'create_test' ? (
                      <TelegramQuizBuilder
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        soundEnabled={soundEnabled}
                        onTestCreated={(newTest) => {
                          fetchPlatformState();
                          setCurrentTab('problems');
                          setSelectedTest(newTest);
                        }}
                        onCancel={() => navigateTab('problems')}
                      />
                    ) : currentTab === 'contests' ? (
                      <ContestView
                        contests={contests}
                        tests={tests}
                        submissions={submissions}
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        onSelectTest={handleSelectTest}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onRefreshState={fetchPlatformState}
                      />
                    ) : currentTab === 'submissions' ? (
                      <SubmissionsView
                        submissions={submissions}
                        currentUser={currentUser}
                        onSelectTestId={(testId) => {
                          const found = tests.find((t) => t.id === testId);
                          if (found) handleSelectTest(found);
                        }}
                        onOpenCertificate={(cert) => setActiveCertificate(cert)}
                      />
                    ) : currentTab === 'leaderboard' ||
                      currentTab === 'all_users' ||
                      currentTab === 'subscriptions' ? (
                      <LeaderboardView
                        key={currentTab === 'subscriptions' ? 'sub-view' : 'users-view'}
                        users={users}
                        submissions={submissions}
                        purchasedCertificates={purchasedCertificates}
                        currentUser={currentUser}
                        soundEnabled={soundEnabled}
                        initialViewMode={
                          currentTab === 'subscriptions' ? 'subscriptions' : 'users'
                        }
                        onOpenCertificate={(cert) => setActiveCertificate(cert)}
                        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                        onOpenMyProfile={() => {
                          setViewingUser(currentUser);
                          setIsProfileOpen(true);
                        }}
                        onOpenUserProfile={(u) => {
                          setViewingUser(u);
                          setIsProfileOpen(true);
                        }}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                        onRefreshState={fetchPlatformState}
                      />
                    ) : currentTab === 'gemini_ai' ? (
                      <KitestAIGeminiAssistant
                        currentUser={currentUser}
                        soundEnabled={soundEnabled}
                        onNavigateToTestMaker={() => navigateTab('create_test')}
                        onNavigateToGram={() => navigateTab('kitestgram')}
                      />
                    ) : currentTab === 'kitestgram' || currentTab === 'chat' ? (
                      <KitestGramView
                        currentUser={currentUser}
                        users={users}
                        soundEnabled={soundEnabled}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onOpenMajlis={() => navigateTab('majlis')}
                      />
                    ) : currentTab === 'majlis' ? (
                      <MajlisView
                        user={
                          currentUser || {
                            id: 'guest_user',
                            name: 'Mehmon Ishtirokchi',
                            username: 'mehmon',
                            email: 'guest@kitest.uz',
                            role: isAdminUnlocked ? 'admin' : 'user',
                            rating: 1200,
                            ratingTitle: 'Boshlovchi',
                            totalScore: 0,
                            solvedCount: 0,
                            rank: 1,
                            joinedAt: new Date().toISOString(),
                          }
                        }
                        onlineUsers={onlineUsers}
                        onNavigate={(tab) => {
                          if (tab === 'quiz-builder') navigateTab('create_test');
                          else if (tab === 'online-chat') navigateTab('chat');
                          else navigateTab(tab as NavTab);
                        }}
                      />
                    ) : currentTab === 'duels' ||
                      currentTab === 'code_arena' ||
                      currentTab === 'activity_map' ? (
                      <KITESTHubViews
                        currentUser={currentUser}
                        users={users}
                        submissions={submissions}
                        tests={tests}
                        initialSection={
                          currentTab === 'code_arena'
                            ? 'code_arena'
                            : currentTab === 'activity_map'
                            ? 'activity'
                            : 'duels'
                        }
                        soundEnabled={soundEnabled}
                        onUpdateUser={(updated: User) => {
                          setCurrentUser(updated);
                          localStorage.setItem(
                            AUTH_STORAGE_KEY,
                            JSON.stringify(updated)
                          );
                        }}
                        onRefreshState={fetchPlatformState}
                        onSelectTest={handleSelectTest}
                      />
                    ) : currentTab === 'admin' ? (
                      <AdminPanel
                        currentUser={currentUser}
                        isAdminUnlocked={isAdminUnlocked}
                        adminPasscode={adminPasscode}
                        users={users}
                        tests={tests}
                        contests={contests}
                        submissions={submissions}
                        storeCertificates={storeCertificates}
                        screenshotProtectionEnabled={screenshotProtectionEnabled}
                        onToggleScreenshotProtection={async () => {
                          await handleToggleGlobalScreenshotProtection(!screenshotProtectionEnabled);
                        }}
                        onRefreshData={fetchPlatformState}
                        onNavigateCreateTest={() => navigateTab('create_test')}
                        onUnlockAdmin={handleUnlockAdmin}
                        onLockAdmin={handleLockAdmin}
                        onOpenCertificate={(cert) => setActiveCertificate(cert)}
                        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
                        onOpenMajlis={() => navigateTab('majlis')}
                      />
                    ) : currentTab === 'gameball' ? (
                      <CodeStudioView
                        currentUser={currentUser}
                        soundEnabled={soundEnabled}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onUpdateScore={(points, coins) => {
                          if (currentUser) {
                            const updated = {
                              ...currentUser,
                              totalScore: (currentUser.totalScore || 0) + points,
                              rating: (currentUser.rating || 0) + points,
                              coins: (currentUser.coins || 0) + coins,
                            };
                            setCurrentUser(updated);
                            try {
                              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
                            } catch {}
                          }
                        }}
                      />
                    ) : currentTab === 'shop' ? (
                      <StoreShopView
                        currentUser={currentUser}
                        soundEnabled={soundEnabled}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
                        }}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
                        onNavigateTab={(tab) => navigateTab(tab)}
                      />
                    ) : currentTab === 'raqamli_ustoz' ? (
                      <RaqamliUstozView
                        currentUser={currentUser}
                        soundEnabled={soundEnabled}
                        onUpdateUser={(updated) => {
                          setCurrentUser(updated);
                          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
                        }}
                        onRequireLogin={() => openDedicatedAuthPage('login')}
                        onNavigateTab={(tab) => navigateTab(tab as NavTab)}
                      />
                    ) : null}
                </motion.div>
              </AnimatePresence>
            </main>

            <footer className="border-t border-slate-800/80 py-5 px-6 bg-slate-950/80 backdrop-blur-sm">
              <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2.5">
                  <KitestEmblem size="sm" showVerifiedSeal={true} />
                  <span>· © {new Date().getFullYear()} Dunyo yoshlar qo'lida</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={OFFICIAL_YOUTUBE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 font-bold flex items-center gap-1.5"
                  >
                    <Youtube className="w-3.5 h-3.5 text-rose-400" />
                    <span>YouTube: @FC_UZB-67b</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>
                    Bosh Admin:{' '}
                    <strong className="text-slate-200 font-mono">{ADMIN_EMAIL}</strong>
                  </span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}


      {/* ========================================================================= */}
      {/* TEST YECHISH OYNASI - USTIDAN OCHILADIGAN MAXSUS OYNA (MODAL OVERLAY)     */}
      {/* 100% Matching: "funksiyalar bosilganda uning pastidan emas ustidan ochilsin" */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto flex flex-col"
          >
            {/* Window Top Bar */}
            <div className="sticky top-0 z-30 bg-white/95 border-b border-sky-100 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div onClick={() => setSelectedTest(null)} className="cursor-pointer">
                  <KitestKiteLogo size={32} showWordmark={true} />
                </div>
                <div className="hidden sm:flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                    {selectedTest.subject}
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate">
                    #{selectedTest.id} · {selectedTest.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTest(null)}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                >
                  <X className="w-4 h-4" />
                  <span>Yopish (Orqaga)</span>
                </button>
              </div>
            </div>

            {/* Test Content */}
            <div className="flex-1 p-3 sm:p-6 max-w-5xl w-full mx-auto">
              <ProblemDetail
                test={selectedTest}
                currentUser={currentUser}
                submissions={submissions}
                soundEnabled={soundEnabled}
                onBack={() => setSelectedTest(null)}
                onRequireLogin={() => openDedicatedAuthPage('login')}
                onOpenCertificate={(cert) => setActiveCertificate(cert)}
                onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
                onSubmissionComplete={(_submission, updatedUser, updatedTest) => {
                  setCurrentUser(updatedUser);
                  localStorage.setItem(
                    AUTH_STORAGE_KEY,
                    JSON.stringify(updatedUser)
                  );
                  setSelectedTest(updatedTest);
                  fetchPlatformState();
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        onOpenAdminModal={() => {
          setIsAuthOpen(false);
          setIsAdminModalOpen(true);
        }}
        onDirectAdminUnlock={handleUnlockAdmin}
      />

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        soundEnabled={soundEnabled}
        onClose={() => setIsAdminModalOpen(false)}
        onUnlocked={handleUnlockAdmin}
      />

      <FaceIdScannerModal
        isOpen={isFaceScannerOpen}
        mode="login"
        soundEnabled={soundEnabled}
        onClose={() => setIsFaceScannerOpen(false)}
        onLoginSuccess={(user, allUsers) => {
          setIsFaceScannerOpen(false);
          handleAuthSuccess(user, allUsers);
        }}
        onAdminUnlocked={(code) => {
          setIsFaceScannerOpen(false);
          handleUnlockAdmin(code || ADMIN_PASSCODE_VALUE);
        }}
      />

      <BackgroundCustomizerModal
        isOpen={isBgCustomizerOpen}
        config={bgConfig}
        soundEnabled={soundEnabled}
        currentUser={currentUser}
        onToggleSound={handleToggleSound}
        onChangeConfig={handleChangeBgConfig}
        onReset={handleResetBgConfig}
        onClose={() => setIsBgCustomizerOpen(false)}
        onOpenFullProfile={() => {
          setIsBgCustomizerOpen(false);
          setIsProfileOpen(true);
        }}
        onUpdateUser={(updated, allUsers) => {
          setCurrentUser(updated);
          saveUserToLocalStorage(updated);
          if (Array.isArray(allUsers)) {
            setUsers(allUsers);
          }
          fetchPlatformState();
        }}
      />

      <UzbekistanRegionsModal
        isOpen={isRegionsModalOpen}
        onClose={() => setIsRegionsModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        user={viewingUser || currentUser}
        submissions={submissions}
        soundEnabled={soundEnabled}
        onClose={() => {
          setIsProfileOpen(false);
          setViewingUser(null);
        }}
        onOpenCertificate={(cert) => setActiveCertificate(cert)}
        onOpenCertificatesStore={() => setIsCertificatesStoreOpen(true)}
        onUpdateUser={(updated, allUsers) => {
          setCurrentUser(updated);
          saveUserToLocalStorage(updated);
          if (Array.isArray(allUsers)) {
            setUsers(allUsers);
          }
          fetchPlatformState();
        }}
        onDeleteAccount={(remainingUsers) => {
          setIsProfileOpen(false);
          setCurrentUser(null);
          setAdminPasscode('');
          setHasEnteredPortal(false);
          saveUserToLocalStorage(null);
          try {
            sessionStorage.removeItem(ADMIN_PASSCODE_STORAGE_KEY);
            sessionStorage.removeItem('kitest_entered_session_v1');
          } catch {}
          if (Array.isArray(remainingUsers)) {
            setUsers(remainingUsers);
          }
          setSelectedTest(null);
          setAuthPortalMode('login');
          setCurrentTab('home');
          fetchPlatformState();
        }}
      />

      <CertificatesStoreModal
        isOpen={isCertificatesStoreOpen}
        currentUser={currentUser}
        isAdminUnlocked={isAdminUnlocked}
        adminPasscode={adminPasscode}
        storeCertificates={storeCertificates}
        submissions={submissions}
        soundEnabled={soundEnabled}
        onClose={() => setIsCertificatesStoreOpen(false)}
        onRefreshState={fetchPlatformState}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }}
        onOpenCertificateModal={(cert) => setActiveCertificate(cert)}
        onRequireLogin={() => {
          setIsCertificatesStoreOpen(false);
          openDedicatedAuthPage('login');
        }}
      />

      <LuckyWheelModal
        isOpen={isLuckyWheelOpen}
        currentUser={currentUser}
        isAdminUnlocked={isAdminUnlocked}
        adminPasscode={adminPasscode}
        users={users}
        wheelConfig={wheelConfig}
        soundEnabled={soundEnabled}
        onClose={() => setIsLuckyWheelOpen(false)}
        onRefreshState={fetchPlatformState}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }}
        onRequireLogin={() => {
          setIsLuckyWheelOpen(false);
          openDedicatedAuthPage('login');
        }}
      />

      <CertificateModal
        isOpen={Boolean(activeCertificate)}
        certificate={activeCertificate}
        soundEnabled={soundEnabled}
        onClose={() => setActiveCertificate(null)}
      />

      <PremiumModal
        isOpen={isPremiumModalOpen}
        currentUser={currentUser}
        soundEnabled={soundEnabled}
        onClose={() => setIsPremiumModalOpen(false)}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }}
        onRequireLogin={() => {
          setIsPremiumModalOpen(false);
          openDedicatedAuthPage('login');
        }}
        onOpenLuckyWheel={() => {
          setIsPremiumModalOpen(false);
          setIsLuckyWheelOpen(true);
        }}
      />

      <GiantImageShowcaseModal
        isOpen={isImageShowcaseOpen}
        initialImage={showcaseTargetImage}
        initialImageUrl={showcaseTargetUrl}
        onClose={() => {
          setIsImageShowcaseOpen(false);
          setShowcaseTargetImage(null);
          setShowcaseTargetUrl(undefined);
        }}
      />

      <CurrencyExchangeModal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        currentUser={currentUser}
        soundEnabled={soundEnabled}
        onlineUsers={onlineUsers}
        allUsers={users}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }}
        onRequireLogin={() => {
          setIsExchangeModalOpen(false);
          openDedicatedAuthPage('login');
        }}
      />

      {/* Screenshot Protection Blocked Warning Overlay */}
      <AnimatePresence>
        {screenshotBlockedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-6 text-center select-none"
          >
            <div className="max-w-md p-6 rounded-3xl bg-slate-900 border-2 border-rose-500/60 space-y-3 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-2xl">
                🛡️
              </div>
              <h3 className="text-lg font-extrabold text-white">
                Skrinshot Qilish Taqiqlangan!
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Platformadagi test savollari va ma'lumotlarni skrinshot qilish himoyalangan. Faqat <strong className="text-amber-300">Bosh Admin</strong> ruxsat bergan foydalanuvchilargina skrinshot qila oladi.
              </p>
              <button
                type="button"
                onClick={() => setScreenshotBlockedAlert(false)}
                className="py-2 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-extrabold text-white"
              >
                Tushunarli
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Step-by-Step Platform Tutorial with Live Online Users */}
      <InteractiveTutorialModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onlineUsers={onlineUsers}
        onOpenSettings={() => setIsBgCustomizerOpen(true)}
        onNavigate={(tab) => {
          if (tab === 'quiz-builder') navigateTab('create_test');
          else if (tab === 'online-chat') navigateTab('chat');
          else if (tab === 'majlis') navigateTab('majlis');
          else navigateTab('home');
        }}
      />

      {/* Floating Animated Score / Coins / Stars Reward Celebration Badge */}
      <FloatingScoreRewardOverlay soundEnabled={soundEnabled} />

      {/* Emotsiyalar va Varraklar (Faqat harakat yoki so'z ustiga kelganda paydo bo'ladi) */}
      <FlyingKitesAndEmotionsOverlay
        soundEnabled={soundEnabled}
        enableAmbientKites={false}
      />

      {/* 3D Floating Animated Robot Mascot with Speech Bubble */}
      <KitestFloatingRobotMascot
        onOpenAi={() => setIsAiSideDrawerOpen(true)}
        soundEnabled={soundEnabled}
      />

      {/* AI Assistant Slide-Over Side Drawer ("chetda oynacha chiqadi") */}
      <KitestAiSideDrawer
        isOpen={isAiSideDrawerOpen}
        onClose={() => setIsAiSideDrawerOpen(false)}
        currentUser={currentUser}
        soundEnabled={soundEnabled}
        onNavigateToFullTab={() => navigateTab('gemini_ai')}
      />

      {/* Single Active Session Concurrency Security Modal */}
      {isSecurityAlertOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0c1224] border-2 border-red-500/40 p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] text-white space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-3xl shadow-inner border border-red-500/30 animate-pulse">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Xavfsizlik Ogohlantiruvi
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {securityAlertMessage}
            </p>
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-[11px] text-red-300 font-mono">
              Xavfsizlik qoidasi: Bir vaqtning o'zida bitta hisobdan faqat bitta qurilma/foydalanuvchi foydalanishi mumkin.
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSecurityAlertOpen(false);
                openDedicatedAuthPage('login');
              }}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg shadow-red-600/40 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Tushundim (Qaytadan Kirish)
            </button>
          </div>
        </div>
      )}

      {/* Real-time Incoming Live Invite Alert Modal (Roblox-style with Ringtone Chime) */}
      {incomingInvite && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0e162d] to-[#070b18] border-2 border-emerald-500/50 p-6 text-center shadow-[0_0_60px_rgba(16,185,129,0.35)] text-white space-y-4">
            <div className="relative w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center text-4xl shadow-lg">
              <span className="animate-bounce">📞</span>
              <span className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/50 animate-ping" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Jonli Chaqiruv (Live Invite)
              </div>
              <h3 className="text-xl font-black text-white">
                {incomingInvite.senderName || 'Foydalanuvchi'}
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                @{incomingInvite.senderUsername}
              </p>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed px-4">
              {incomingInvite.inviteType === 'duel'
                ? "Sizni 1v1 Jonli Algoritmik Duelga chaqirmoqda! Qo'ng'iroq chalinmoqda..."
                : "Sizni real-vaqtda P2P Trade / Savdoga chaqirmoqda! Qo'ng'iroq chalinmoqda..."}
            </p>

            {incomingInvite.note && (
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-200 italic">
                "{incomingInvite.note}"
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleRespondToInvite(false)}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-rose-950/80 hover:border-rose-500/60 border border-slate-700 text-slate-300 hover:text-rose-300 font-black text-xs cursor-pointer transition-all"
              >
                ❌ Rad etish
              </button>
              <button
                type="button"
                onClick={() => handleRespondToInvite(true)}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black text-xs shadow-lg shadow-emerald-600/40 cursor-pointer transition-all animate-pulse"
              >
                ✅ Qabul qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2-Minute Inactivity Presence Prompt ("har ikkiminutda korilmagan bolsa korish spraydi") */}
      {isIdlePromptOpen && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#0a0f1d] border-2 border-indigo-500/40 p-6 text-center shadow-[0_0_50px_rgba(99,102,241,0.3)] text-white space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-3xl animate-pulse">
              👋
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Hali ham shu yerdamisiz?
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Platformada 2 daqiqadan beri faollik kuzatilmadi. Tizimda davom etishni tasdiqlaysizmi?
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                lastActiveTimeRef.current = Date.now();
                setIsIdlePromptOpen(false);
                playKitestSound('click', soundEnabled);
              }}
              className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-indigo-600/40 cursor-pointer transition-all"
            >
              ✅ Ha, davom etish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
