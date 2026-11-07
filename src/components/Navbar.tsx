import React, { useState, useEffect } from 'react';
import {
  User,
  TestItem,
  ADMIN_EMAIL,
  computeRankClass,
  RANK_CLASS_META,
  STAR_COLOR_META,
  StarColor,
} from '../types';
import { KitestKiteLogo } from './KitestKiteLogo';
import {
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  PanelLeft,
  HelpCircle,
  Search,
  Settings,
  X,
  ChevronDown,
  Bell,
  ShieldCheck,
  RefreshCw,
  Crown,
  Sparkles,
  Send,
  Coins,
  Zap,
  Star,
  Trophy,
  CheckCircle2,
  MessageSquare,
  Radio,
  ShoppingBag,
  GraduationCap,
  ArrowRightLeft,
  Compass,
  BookOpen,
  Home,
  MapPin,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'auth_portal'
  | 'problems'
  | 'tests'
  | 'tests_list'
  | 'duels'
  | 'code_arena'
  | 'activity_map'
  | 'courses'
  | 'books_3d'
  | 'study_plans'
  | 'algorithms'
  | 'roadmap'
  | 'my_classes'
  | 'create_test'
  | 'gemini_ai'
  | 'kitestgram'
  | 'contests'
  | 'submissions'
  | 'leaderboard'
  | 'all_users'
  | 'subscriptions'
  | 'blogs'
  | 'chat'
  | 'majlis'
  | 'gameball'
  | 'how_it_works'
  | 'our_team'
  | 'shop'
  | 'raqamli_ustoz'
  | 'admin';

interface NavbarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  currentUser: User | null;
  isAdminUnlocked?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenBgCustomizer?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  chatMessagesCount?: number;
  coursesCount?: number;
  contestsCount?: number;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenAdminModal: () => void;
  onOpenProfile: () => void;
  onOpenCertificatesStore: () => void;
  onOpenLuckyWheel: () => void;
  onOpenOnboardingGuide?: () => void;
  globalSearchQuery?: string;
  onGlobalSearchChange?: (q: string) => void;
  tests?: TestItem[];
  onSelectTest?: (test: TestItem) => void;
  onOpenPremium?: () => void;
  onOpenCurrencyExchange?: () => void;
  onRefreshState?: () => void;
  onLogout: () => void;
  onOpenRegions?: () => void;
  kitestGramUrl?: string;
  raqamliUstozUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  isAdminUnlocked = false,
  theme,
  onToggleTheme,
  onOpenBgCustomizer,
  soundEnabled = true,
  onToggleSound,
  sidebarOpen = true,
  onToggleSidebar,
  onOpenLogin,
  onOpenRegister,
  onOpenAdminModal,
  onOpenProfile,
  onOpenCertificatesStore,
  onOpenLuckyWheel,
  onOpenOnboardingGuide,
  globalSearchQuery = '',
  onGlobalSearchChange,
  tests = [],
  onSelectTest,
  onOpenPremium,
  onOpenCurrencyExchange,
  onRefreshState,
  onLogout,
  onOpenRegions,
  kitestGramUrl,
  raqamliUstozUrl,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotifs, setReadNotifs] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const isMainAdmin =
    Boolean(isAdminUnlocked) ||
    (Boolean(currentUser) &&
      (currentUser!.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
        currentUser!.role === 'admin' ||
        currentUser!.username?.toLowerCase() === 'behruz_admin'));

  const [realNotifications, setRealNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.notifications)) {
          setRealNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, [currentTab]);

  const activeNotifications = realNotifications.length > 0 ? realNotifications : [
    {
      id: 'notif_1',
      title: '🏆 Test va O\'yin Natijasi',
      text: 'O\'yinlarda 1-o\'rin uchun 3 ta ball, keyingi o\'rinlarga 1 tadan ball berilishi yoqildi!',
      time: 'Hozir',
      tab: 'gameball' as NavTab,
      icon: '🏆',
    },
    {
      id: 'notif_2',
      title: '🧑‍🏫 Google Raqamli Ustoz O\'yini Tayyor',
      text: 'Interaktiv algoritm, veb va AI vazifalarini yechib maxsus darajalarni oching!',
      time: 'Bugun',
      tab: 'raqamli_ustoz' as NavTab,
      icon: '🧑‍🏫',
    },
    {
      id: 'notif_3',
      title: '🛍️ Do\'kon & Bozor Ochildi',
      text: 'Ballaringiz evaziga sertifikatlar, yulduzlar va qurollarni xarid qiling!',
      time: 'Bugun',
      tab: 'shop' as NavTab,
      icon: '🛍️',
    },
  ];

  const unreadCount = activeNotifications.filter(
    (n) => !n.readBy?.includes(currentUser?.id || '') && !readNotifs.includes(n.id)
  ).length;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md px-3 lg:px-6 py-2 flex items-center justify-between gap-3 shadow-xs border-b transition-colors ${
      theme === 'dark'
        ? 'bg-[#090e1c]/95 border-indigo-500/20 text-slate-100'
        : 'bg-white/95 border-slate-200/80 text-slate-900'
    }`}>
      {/* Left side: Search when logged in, or Logo when visitor */}
      {currentUser ? (
        <div className="flex items-center gap-2.5 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={sidebarOpen ? "Panelni yopish" : "Panelni ochish"}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* Search bar matching Image 2 */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => onGlobalSearchChange && onGlobalSearchChange(e.target.value)}
              placeholder="Qidiruv..."
              className="py-1.5 pl-8 pr-4 rounded-full bg-[#0d1428] border border-indigo-500/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 w-36 sm:w-56 transition-all"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
          >
            <KitestKiteLogo size={36} showWordmark={true} />
          </button>
        </div>
      )}

      {/* Center Navigation Pills (Visitor mode from Image 1) */}
      {!currentUser && (
        <nav className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/60 border border-indigo-500/20 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'home'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-black'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Bosh sahifa</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('courses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'courses'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Kurslar</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'roadmap'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>Yo'nalishlar</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('our_team')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'our_team'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>O'qituvchilar</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'leaderboard' || currentTab === 'all_users'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Yutuqlar</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('books_3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'books_3d'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-pink-400" />
            <span>Kitobxonlar uchun</span>
          </button>
        </nav>
      )}

      {/* Right Controls: Exactly matching Image 2 */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* ✈️ KitestGram Button (Image 2) */}
        <button
          type="button"
          onClick={() => {
            window.open(kitestGramUrl || 'https://t.me/kitestai', '_blank');
          }}
          className="py-1 px-3 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30 hover:scale-102"
        >
          <Send className="w-3.5 h-3.5 text-sky-400" />
          <span>KitestGram</span>
        </button>

        {/* 🎓 Raqamli Ustoz Button (Image 2) */}
        <button
          type="button"
          onClick={() => {
            window.open(raqamliUstozUrl || 'https://sites.google.com', '_blank');
          }}
          className="py-1 px-2.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 hover:scale-102"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Raqamli Ustoz</span>
        </button>

        {/* COIN, BALL, YULDUZ & ALMASHISH & DO'KON (Image 2) */}
        {currentUser && (
          <div className="flex items-center gap-1.5">
            {/* 1. COIN: 🪙 10000000 + */}
            <button
              type="button"
              onClick={onOpenLuckyWheel}
              className="py-1 px-2.5 rounded-full bg-[#12182c] hover:bg-[#1a233f] text-amber-300 border border-indigo-500/30 text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <span>🪙</span>
              <span className="font-mono">{currentUser.coins ?? 10000000}</span>
              <span className="text-amber-400 font-bold">+</span>
            </button>

            {/* 2. BALLAR: ⚡ 996590 + */}
            <button
              type="button"
              onClick={() => setCurrentTab('leaderboard')}
              className="py-1 px-2.5 rounded-full bg-[#12182c] hover:bg-[#1a233f] text-sky-300 border border-indigo-500/30 text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Zap className="w-3 h-3 text-sky-400 fill-sky-400 shrink-0" />
              <span className="font-mono">{currentUser.totalScore ?? 996590}</span>
              <span className="text-sky-400 font-bold">+</span>
            </button>

            {/* 3. YULDUZ: ⭐ 20 ★ */}
            <button
              type="button"
              onClick={onOpenCertificatesStore}
              className="py-1 px-2.5 rounded-full bg-[#12182c] hover:bg-[#1a233f] text-purple-300 border border-indigo-500/30 text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Star className="w-3 h-3 text-purple-400 fill-purple-400 shrink-0" />
              <span className="font-mono">{currentUser.stars ?? 20} ★</span>
            </button>

            {/* 4. Almashish: ⇄ Almashish */}
            {onOpenCurrencyExchange && (
              <button
                type="button"
                onClick={onOpenCurrencyExchange}
                className="py-1 px-2.5 rounded-full bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-400/30 text-xs font-black flex items-center gap-1 transition-all shadow-xs cursor-pointer"
              >
                <ArrowRightLeft className="w-3 h-3 text-blue-400" />
                <span className="hidden sm:inline">Almashish</span>
              </button>
            )}

            {/* 5. Do'kon (Green pill button from Image 2) */}
            <button
              type="button"
              onClick={() => setCurrentTab('shop')}
              className="py-1 px-3 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Do'kon</span>
            </button>
          </div>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-slate-700/80 flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title="Mavzu rejimi"
          >
            <Sun className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* Admin Panel button if unlocked */}
        {isMainAdmin && (
          <button
            type="button"
            onClick={() => setCurrentTab('admin')}
            className={`py-1.5 px-3 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              currentTab === 'admin'
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 border border-amber-500/30'
            }`}
            title="Admin Panel"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Real Notification Bell with Popup */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Real Bildirishnomalar"
          >
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center border-2 border-[#090e1c] shadow-xs">
              {unreadCount > 0 ? unreadCount : 2}
            </span>
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#0c1224]/95 border border-indigo-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-black text-white">Platforma Bildirishnomalari</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-400/30">
                    {unreadCount > 0 ? `${unreadCount} ta yangi` : '2 ta yangi'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReadNotifs(activeNotifications.map((n) => n.id));
                    if (currentUser) {
                      activeNotifications.forEach((n) => {
                        fetch(`/api/notifications/${n.id}/read`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: currentUser.id }),
                        }).catch(() => {});
                      });
                    }
                  }}
                  className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Barchasini o'qildi qilish
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeNotifications.map((notif, idx) => {
                  const isRead =
                    notif.readBy?.includes(currentUser?.id || '') ||
                    readNotifs.includes(notif.id);
                  return (
                    <div
                      key={`notif_${notif.id || 'item'}_${idx}`}
                      onClick={() => {
                        setReadNotifs((prev) => [...prev, notif.id]);
                        if (currentUser) {
                          fetch(`/api/notifications/${notif.id}/read`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: currentUser.id }),
                          }).catch(() => {});
                        }
                        if (notif.tab) setCurrentTab(notif.tab as NavTab);
                        if (notif.action) notif.action();
                        setNotificationsOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isRead
                          ? 'bg-[#0f172a]/60 border-slate-800 text-slate-400 opacity-80'
                          : 'bg-[#131c38]/90 border-indigo-500/30 text-white shadow-xs hover:bg-[#1a264a]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg shrink-0">{notif.icon || '📢'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {notif.time || 'Hozir'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{notif.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Direct Log Out Button */}
        {currentUser ? (
          <div className="relative flex items-center gap-1.5 pl-1 border-l border-slate-200">
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title="Profil va sozlamalar"
            >
              <img
                src={currentUser.avatarUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="avGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(%23avGrad)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="%23ffffff">B</text></svg>'}
                alt={currentUser.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><defs><linearGradient id="avGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient></defs><rect width="80" height="80" rx="40" fill="url(%23avGrad)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="900" font-size="34" fill="%23ffffff">B</text></svg>';
                }}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Chiqish (Log out) Button */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Tizimdan chiqish (Log out)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenLogin}
              className="py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Kirish
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
