import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Submission,
  CertificateData,
  UserPurchasedCertificate,
  RankClass,
  RANK_CLASS_LIST,
  RANK_CLASS_META,
  computeRankClass,
  ADMIN_EMAIL,
} from '../types';
import { REGIONS_LIST } from '../constants/uzbekistanLocations';
import { KIDTEST_LOGO_DATA_URL, playKitestSound } from './KitestEmblem';
import {
  Trophy,
  Award,
  CheckCircle2,
  MapPin,
  Search,
  Crown,
  Filter,
  Users,
  X,
  GraduationCap,
  UserPlus,
  UserCheck,
  Bell,
  Building2,
  Zap,
} from 'lucide-react';

interface LeaderboardViewProps {
  users: User[];
  submissions?: Submission[];
  purchasedCertificates?: UserPurchasedCertificate[];
  currentUser: User | null;
  soundEnabled?: boolean;
  initialViewMode?:
    | 'users'
    | 'subscriptions'
    | 'institutions'
    | 'regions'
    | 'certificates';
  onOpenCertificate?: (cert: CertificateData) => void;
  onOpenCertificatesStore?: () => void;
  onOpenMyProfile?: () => void;
  onRequireLogin?: () => void;
  onUpdateUser?: (updated: User) => void;
  onRefreshState?: () => Promise<void>;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  submissions = [],
  purchasedCertificates = [],
  currentUser,
  soundEnabled = true,
  initialViewMode = 'users',
  onOpenCertificate,
  onOpenCertificatesStore,
  onOpenMyProfile,
  onRequireLogin,
  onUpdateUser,
  onRefreshState,
}) => {
  const [activeTab, setActiveTab] = useState<
    'users' | 'subscriptions' | 'institutions' | 'regions' | 'certificates'
  >(initialViewMode);
  const [subFilter, setSubFilter] = useState<'all' | 'following' | 'followers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('Barchasi');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'creator' | 'user'>(
    'all'
  );
  const [inspectedUser, setInspectedUser] = useState<User | null>(null);
  const [subscribingUserId, setSubscribingUserId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string>('');
  const [rankingMetric, setRankingMetric] = useState<'total' | 'coding' | 'tests'>('total');

  useEffect(() => {
    setActiveTab(initialViewMode);
  }, [initialViewMode]);

  const handleToggleSubscribe = async (
    targetUser: User,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (currentUser.id === targetUser.id) return;

    setSubscribingUserId(targetUser.id);
    try {
      const res = await fetch(`/api/users/${targetUser.id}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUser.id }),
      });
      const data = await res.json();
      if (res.ok) {
        playKitestSound('success', soundEnabled);
        if (data.currentUser && onUpdateUser) {
          onUpdateUser(data.currentUser);
        }
        if (data.targetUser && inspectedUser?.id === targetUser.id) {
          setInspectedUser(data.targetUser);
        }
        if (onRefreshState) {
          await onRefreshState();
        }
        if (data.message) {
          setFeedbackToast(data.message);
          setTimeout(() => setFeedbackToast(''), 3000);
        }
      }
    } catch {}
    setSubscribingUserId(null);
  };

  const isSubscribedTo = (targetUser: User): boolean => {
    if (!currentUser) return false;
    return Boolean(
      (targetUser.followersUserIds &&
        targetUser.followersUserIds.includes(currentUser.id)) ||
        (currentUser.followingUserIds &&
          currentUser.followingUserIds.includes(targetUser.id))
    );
  };

  const perfectSubsByUser = useMemo(() => {
    const map: Record<string, Submission[]> = {};
    for (const sub of submissions) {
      const isPerfect =
        sub.percentage === 100 ||
        (sub.totalQuestions > 0 && sub.correctCount === sub.totalQuestions);
      if (isPerfect) {
        if (!map[sub.userId]) map[sub.userId] = [];
        map[sub.userId].push(sub);
      }
    }
    return map;
  }, [submissions]);

  const allPerfectSubmissions = useMemo(
    () =>
      submissions.filter(
        (sub) =>
          sub.percentage === 100 ||
          (sub.totalQuestions > 0 && sub.correctCount === sub.totalQuestions)
      ),
    [submissions]
  );

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (rankingMetric === 'coding') {
          const bCode = b.codingScore || 0;
          const aCode = a.codingScore || 0;
          if (bCode !== aCode) return bCode - aCode;
          return b.totalScore - a.totalScore;
        }
        if (rankingMetric === 'tests') {
          const bTests = b.totalScore - (b.codingScore || 0);
          const aTests = a.totalScore - (a.codingScore || 0);
          if (bTests !== aTests) return bTests - aTests;
          return b.totalScore - a.totalScore;
        }
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return b.rating - a.rating;
      }),
    [users, rankingMetric]
  );

  const filteredUsers = useMemo(() => {
    return sortedUsers.filter((u) => {
      if (activeTab === 'subscriptions' && currentUser) {
        if (subFilter === 'following' && !isSubscribedTo(u)) return false;
        if (
          subFilter === 'followers' &&
          !(currentUser.followersUserIds || []).includes(u.id) &&
          !(u.followingUserIds || []).includes(currentUser.id)
        ) {
          return false;
        }
      }
      if (regionFilter !== 'Barchasi' && u.region !== regionFilter) return false;
      if (roleFilter !== 'all') {
        const isMainAdmin =
          u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || u.role === 'admin';
        if (roleFilter === 'admin' && !isMainAdmin) return false;
        if (roleFilter === 'creator' && u.role !== 'creator') return false;
        if (roleFilter === 'user' && u.role !== 'user') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchUser = u.username.toLowerCase().includes(q);
        const matchRegion = (u.region || '').toLowerCase().includes(q);
        const matchInst = (u.institution || '').toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchRegion && !matchInst) return false;
      }
      return true;
    });
  }, [
    sortedUsers,
    activeTab,
    subFilter,
    currentUser,
    regionFilter,
    roleFilter,
    searchQuery,
  ]);

  // RoboContest-style Institutional Ranking (Muassasalar Reytingi)
  const institutionStats = useMemo(() => {
    const map: Record<
      string,
      {
        institution: string;
        region: string;
        usersCount: number;
        totalScore: number;
        solvedCount: number;
        topUser: User | null;
      }
    > = {};

    for (const u of sortedUsers) {
      const instName =
        u.institution && u.institution.trim()
          ? u.institution.trim()
          : u.school && u.school.trim()
          ? u.school.trim()
          : `${u.region || 'Toshkent shahri'} umumta'lim muassasasi`;

      if (!map[instName]) {
        map[instName] = {
          institution: instName,
          region: u.region || 'Toshkent shahri',
          usersCount: 0,
          totalScore: 0,
          solvedCount: 0,
          topUser: null,
        };
      }
      const entry = map[instName];
      entry.usersCount += 1;
      entry.totalScore += u.totalScore;
      entry.solvedCount += u.solvedCount;
      if (!entry.topUser || u.totalScore > entry.topUser.totalScore) {
        entry.topUser = u;
      }
    }

    return Object.values(map).sort(
      (a, b) => b.totalScore - a.totalScore || b.usersCount - a.usersCount
    );
  }, [sortedUsers]);

  // Regional Aggregation
  const regionalStats = useMemo(() => {
    const map: Record<
      string,
      {
        region: string;
        usersCount: number;
        totalScore: number;
        solvedCount: number;
        certificatesCount: number;
        topUser: User | null;
      }
    > = {};

    for (const reg of REGIONS_LIST) {
      map[reg] = {
        region: reg,
        usersCount: 0,
        totalScore: 0,
        solvedCount: 0,
        certificatesCount: 0,
        topUser: null,
      };
    }

    for (const u of sortedUsers) {
      const reg = u.region && map[u.region] ? u.region : 'Toshkent shahri';
      const entry = map[reg];
      entry.usersCount += 1;
      entry.totalScore += u.totalScore;
      entry.solvedCount += u.solvedCount;
      entry.certificatesCount += (perfectSubsByUser[u.id] || []).length;
      if (!entry.topUser || u.totalScore > entry.topUser.totalScore) {
        entry.topUser = u;
      }
    }

    return Object.values(map).sort(
      (a, b) => b.totalScore - a.totalScore || b.usersCount - a.usersCount
    );
  }, [sortedUsers, perfectSubsByUser]);

  const openCertModal = (sub: Submission, userObj?: User) => {
    if (!onOpenCertificate) return;
    onOpenCertificate({
      serialNumber: `KT-${sub.id.replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase()}`,
      recipientName: sub.userName,
      recipientUsername: sub.username,
      region: userObj?.region,
      district: userObj?.district,
      institution: userObj?.institution,
      testId: sub.testId,
      testTitle: sub.testTitle,
      subject: sub.subject,
      earnedPoints: sub.earnedPoints,
      maxPoints: sub.maxPoints,
      percentage: 100,
      grade: sub.grade || "5 (A'lo)",
      issuedAt: sub.submittedAt,
    });
  };

  const myFollowersCount = currentUser?.followersUserIds?.length || 0;
  const myFollowingCount = currentUser?.followingUserIds?.length || 0;

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <span>{feedbackToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackToast('')}
              className="text-emerald-300 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Top Bar & Horizontal Tabs */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold text-white">
            Foydalanuvchilar va Reyting Jadvali
          </h1>
          <p className="text-xs text-slate-400">
            Jami {users.length} nafar ro'yxatdan o'tgan foydalanuvchi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'users'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Foydalanuvchilar ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Obunalar ({myFollowingCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('institutions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'institutions'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Muassasalar ({institutionStats.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('regions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'regions'
                ? 'bg-violet-600 text-white'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Viloyatlar</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'certificates'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>
              Sertifikatlar ({allPerfectSubmissions.length + purchasedCertificates.length})
            </span>
          </button>

          {onOpenCertificatesStore && (
            <button
              onClick={onOpenCertificatesStore}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Do'kon</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* TAB 1 & 2: USERS & SUBSCRIPTIONS TABLE     */}
      {/* ========================================== */}
      {(activeTab === 'users' || activeTab === 'subscriptions') && (
        <div className="space-y-3">
          {/* Compact Search & Filter Bar right above the table */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism, @username, muassasa yoki hudud bo'yicha qidirish..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeTab === 'subscriptions' && currentUser && (
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {[
                    { id: 'all', label: `Barchasi (${users.length})` },
                    { id: 'following', label: `Obunalarim (${myFollowingCount})` },
                    { id: 'followers', label: `Obunachilarim (${myFollowersCount})` },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSubFilter(f.id as any)}
                      className={`py-1 px-2.5 rounded-md text-[11px] font-semibold transition-colors ${
                        subFilter === f.id
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Barchasi" className="bg-slate-900">
                    Barcha hududlar
                  </option>
                  {REGIONS_LIST.filter((r) => r !== 'Barchasi').map((r, rIdx) => (
                    <option key={`lb_reg_${r}_${rIdx}`} value={r} className="bg-slate-900">
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
                <Filter className="w-3.5 h-3.5 text-sky-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                >
                  <option value="all" className="bg-slate-900">
                    Barcha rollar
                  </option>
                  <option value="admin" className="bg-slate-900">
                    Adminlar
                  </option>
                  <option value="creator" className="bg-slate-900">
                    Mualliflar
                  </option>
                  <option value="user" className="bg-slate-900">
                    Foydalanuvchilar
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KITEST REYTING (EXACT USER ASCII WIREFRAME) & COMPARATIVE DIAGRAM     */}
          {/* ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Card: Exact Wireframe "KITEST REYTING" */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-400/70 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="text-base font-black text-amber-300 font-mono tracking-wider">
                      KITEST REYTING
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    TOP O'QUVCHILAR
                  </span>
                </div>

                <div className="font-mono text-xs bg-slate-950 rounded-xl p-3 border border-amber-500/30 space-y-2 text-slate-300">
                  <div className="text-[11px] text-amber-400/80 border-b border-slate-800 pb-1 flex justify-between">
                    <span>┌─────────────────────────────────┐</span>
                    <span>🏆</span>
                  </div>

                  {sortedUsers.slice(0, 3).map((u, idx) => (
                    <div
                      key={`wireframe_u_${u.id}_${idx}`}
                      onClick={() => setInspectedUser(u)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        idx === 0
                          ? 'bg-amber-500/15 border-amber-400/60 text-white'
                          : idx === 1
                          ? 'bg-slate-800/60 border-slate-600 text-slate-200'
                          : 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm font-black">{idx + 1}.</span>
                          <span className="truncate max-w-[150px]">{u.name}</span>
                        </span>
                        <span className="text-xs font-mono font-black text-amber-400">
                          {rankingMetric === 'coding'
                            ? `${u.codingScore || 0} ball 💻`
                            : rankingMetric === 'tests'
                            ? `${u.totalScore - (u.codingScore || 0)} ball 📚`
                            : `${u.totalScore} ball ⚡`}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1 font-mono">
                        <span>@{u.username}</span>
                        <span>{u.region || 'Toshkent'} · {u.rating || 1500} MMR</span>
                      </div>
                    </div>
                  ))}

                  <div className="text-[11px] text-amber-400/80 border-t border-slate-800 pt-1 flex justify-between">
                    <span>└─────────────────────────────────┘</span>
                    <span>⚡ KITEST</span>
                  </div>
                </div>
              </div>

              {/* Metric Switcher Tabs */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Diagramma va ball saralash:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRankingMetric('total')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rankingMetric === 'total'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    ⚡ Jami Ballar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMetric('coding')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rankingMetric === 'coding'
                        ? 'bg-emerald-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    💻 Kod Yozish
                  </button>
                  <button
                    type="button"
                    onClick={() => setRankingMetric('tests')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      rankingMetric === 'tests'
                        ? 'bg-sky-500 text-slate-950 shadow-md'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    📚 Test Ballari
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Modern Interactive Comparative Diagram (Top 5 Students) */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>📊 Zamonaviy Reyting Diagrammasi</span>
                      <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-500/30">
                        Qiyosiy Ko'rsatkich
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      O'quvchilarning umumiy bali, kod yozish natijalari va test ko'rsatkichlari solishtirmasi
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> 💻 Kod
                    </span>
                    <span className="flex items-center gap-1 text-sky-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" /> 📚 Test
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> ⚡ Jami
                    </span>
                  </div>
                </div>

                {/* Comparative Animated Bars */}
                <div className="space-y-3 pt-1">
                  {sortedUsers.slice(0, 5).map((u, uIdx) => {
                    const maxScore = Math.max(sortedUsers[0]?.totalScore || 100, 1);
                    const totalWidth = Math.min(100, Math.max(14, (u.totalScore / maxScore) * 100));
                    const codingPoints = u.codingScore || 0;
                    const testPoints = Math.max(0, u.totalScore - codingPoints);
                    const codingWidth = u.totalScore > 0 ? (codingPoints / u.totalScore) * totalWidth : 0;
                    const testWidth = totalWidth - codingWidth;

                    return (
                      <div
                        key={`bar_user_${u.id}_${uIdx}`}
                        onClick={() => setInspectedUser(u)}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                                uIdx === 0
                                  ? 'bg-amber-500 text-slate-950'
                                  : uIdx === 1
                                  ? 'bg-slate-400 text-slate-950'
                                  : uIdx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {uIdx + 1}
                            </span>
                            <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                              {u.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                              @{u.username}
                            </span>
                          </div>
                          <div className="font-mono text-xs flex items-center gap-2">
                            <span className="text-emerald-400 font-semibold text-[11px]">
                              💻 {codingPoints}
                            </span>
                            <span className="text-sky-400 font-semibold text-[11px]">
                              📚 {testPoints}
                            </span>
                            <span className="font-extrabold text-amber-400">
                              ⚡ {u.totalScore} ball
                            </span>
                          </div>
                        </div>

                        {/* Progress Stack Bar */}
                        <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 gap-0.5">
                          {codingWidth > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${codingWidth}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-l-full bg-emerald-500 relative"
                              title={`Kod balli: ${codingPoints}`}
                            />
                          )}
                          {testWidth > 0 && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${testWidth}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className={`h-full ${codingWidth > 0 ? 'rounded-r-full' : 'rounded-full'} bg-sky-500`}
                              title={`Test balli: ${testPoints}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Champions Podium (1st, 2nd, 3rd) */}
          {sortedUsers.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border border-slate-800 shadow-xl">
              {/* 2nd Place */}
              {sortedUsers[1] && (
                <div
                  onClick={() => setInspectedUser(sortedUsers[1])}
                  className="order-2 md:order-1 p-4 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900 border border-slate-700 text-center flex flex-col items-center justify-between hover:border-slate-500 transition-all cursor-pointer shadow-lg"
                >
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="relative mb-2">
                    <img
                      src={sortedUsers[1].avatarUrl || KIDTEST_LOGO_DATA_URL}
                      alt={sortedUsers[1].name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-950 border-2 border-slate-400 p-0.5 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-700 text-[10px] font-black text-slate-200">
                      #2
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate max-w-[160px]">{sortedUsers[1].name}</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[160px]">@{sortedUsers[1].username}</p>
                  <div className="mt-2 text-sm font-black text-slate-300 font-mono">
                    ⚡ {sortedUsers[1].totalScore} Ball
                  </div>
                </div>
              )}

              {/* 1st Place (Center Champion) */}
              {sortedUsers[0] && (
                <div
                  onClick={() => setInspectedUser(sortedUsers[0])}
                  className="order-1 md:order-2 p-5 rounded-2xl bg-gradient-to-b from-amber-500/15 via-yellow-950/20 to-slate-900 border-2 border-amber-400/80 text-center flex flex-col items-center justify-between hover:border-amber-300 transition-all cursor-pointer shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 uppercase tracking-widest">
                    MUTLAQ CHEMPION
                  </div>
                  <div className="text-3xl mb-1 animate-bounce">👑</div>
                  <div className="relative mb-2">
                    <img
                      src={sortedUsers[0].avatarUrl || KIDTEST_LOGO_DATA_URL}
                      alt={sortedUsers[0].name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-950 border-2 border-amber-400 p-0.5 shadow-xl shadow-amber-500/30 ring-4 ring-amber-500/20"
                    />
                    <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-[11px] font-black text-slate-950 shadow-md">
                      #1
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white truncate max-w-[190px]">{sortedUsers[0].name}</h4>
                  <p className="text-xs text-amber-300 truncate max-w-[190px]">@{sortedUsers[0].username}</p>
                  <div className="mt-2 text-base font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 fill-amber-400" />
                    <span>{sortedUsers[0].totalScore} Ball</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {sortedUsers[2] && (
                <div
                  onClick={() => setInspectedUser(sortedUsers[2])}
                  className="order-3 p-4 rounded-2xl bg-gradient-to-b from-amber-950/20 to-slate-900 border border-amber-700/50 text-center flex flex-col items-center justify-between hover:border-amber-600 transition-all cursor-pointer shadow-lg"
                >
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="relative mb-2">
                    <img
                      src={sortedUsers[2].avatarUrl || KIDTEST_LOGO_DATA_URL}
                      alt={sortedUsers[2].name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-950 border-2 border-amber-700 p-0.5 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-amber-800 text-[10px] font-black text-amber-200">
                      #3
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white truncate max-w-[160px]">{sortedUsers[2].name}</h4>
                  <p className="text-[11px] text-slate-400 truncate max-w-[160px]">@{sortedUsers[2].username}</p>
                  <div className="mt-2 text-sm font-black text-amber-500 font-mono">
                    ⚡ {sortedUsers[2].totalScore} Ball
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clean RoboContest-Style Users Data Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 w-14">#</th>
                    <th className="py-3 px-4">Foydalanuvchi</th>
                    <th className="py-3 px-4">Daraja (F..SSS)</th>
                    <th className="py-3 px-4">Hudud / Muassasa</th>
                    <th className="py-3 px-4 text-right">Yechilgan</th>
                    <th className="py-3 px-4 text-right">🪙 Tanga / ⭐ Yulduz</th>
                    <th className="py-3 px-4 text-right">⚡ Jami / 💻 Kod</th>
                    <th className="py-3 px-4 text-right">Obuna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-slate-400">
                        Qidiruv bo'yicha foydalanuvchilar topilmadi.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, uIdx) => {
                      const rank = sortedUsers.findIndex((u) => u.id === user.id) + 1;
                      const isCurrentUser = currentUser?.id === user.id;
                      const isMainAdmin =
                        user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
                        user.role === 'admin';
                      const followersCount = user.followersUserIds?.length || 0;
                      const subscribed = isSubscribedTo(user);
                      const rankCls: RankClass =
                        user.rankClass || computeRankClass(user.totalScore);
                      const rankMeta = RANK_CLASS_META[rankCls];

                      return (
                        <tr
                          key={`lb_user_${user.id}_${uIdx}`}
                          onClick={() => setInspectedUser(user)}
                          className={`cursor-pointer transition-colors ${
                            isCurrentUser
                              ? 'bg-sky-950/30 hover:bg-sky-950/45'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-xs text-slate-400">
                            #{rank}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={user.avatarUrl || KIDTEST_LOGO_DATA_URL}
                                alt={user.name}
                                className="w-9 h-9 rounded-lg object-contain bg-slate-950 border border-slate-800 p-0.5 shrink-0"
                              />
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                                  <span>{user.name}</span>
                                  {isMainAdmin && (
                                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                                  )}
                                  {isCurrentUser && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                                      Siz
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  @{user.username} · {user.ratingTitle}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-black ${rankMeta.bgClass} ${rankMeta.colorClass}`}
                            >
                              <span>{rankCls}</span>
                              <span className="text-[10px] font-sans font-semibold opacity-80">
                                · {rankMeta.title}
                              </span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-xs text-slate-200">
                              {user.region || 'Toshkent shahri'}
                            </div>
                            {user.institution && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {user.institution}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 font-semibold">
                            {user.solvedCount} ta
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-xs">
                            <span className="text-yellow-300 font-bold mr-2">
                              🪙 {user.coins ?? 0}
                            </span>
                            <span className="text-sky-300 font-bold">
                              ⭐ {user.stars ?? 0}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-mono text-xs">
                            <div className="font-extrabold text-amber-400">
                              ⚡ {user.totalScore}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-semibold">
                              💻 {user.codingScore || 0}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {isCurrentUser ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onOpenMyProfile) onOpenMyProfile();
                                }}
                                className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200"
                              >
                                Profil
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={subscribingUserId === user.id}
                                onClick={(e) => handleToggleSubscribe(user, e)}
                                className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                                  subscribed
                                    ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                }`}
                              >
                                {subscribed ? (
                                  <>
                                    <UserCheck className="w-3 h-3" />
                                    <span>Obunachi ({followersCount})</span>
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-3 h-3" />
                                    <span>Obuna ({followersCount})</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: MUASSASALAR REYTINGI (ROBOCONTEST)  */}
      {/* ========================================== */}
      {activeTab === 'institutions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Ta'lim muassasasi (Maktab / OTM)</th>
                  <th className="py-3 px-4">Hudud</th>
                  <th className="py-3 px-4">Ishtirokchilar</th>
                  <th className="py-3 px-4">Yetakchi</th>
                  <th className="py-3 px-4 text-right">Yechilgan</th>
                  <th className="py-3 px-4 text-right">Jami ball</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {institutionStats.map((inst, idx) => (
                  <tr
                    key={`lb_inst_${inst.institution || 'na'}_${idx}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-xs text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{inst.institution}</span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-300">{inst.region}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      {inst.usersCount} nafar
                    </td>
                    <td className="py-3 px-4">
                      {inst.topUser ? (
                        <button
                          onClick={() => setInspectedUser(inst.topUser)}
                          className="text-xs font-semibold text-sky-400 hover:underline"
                        >
                          {inst.topUser.name}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 font-semibold">
                      {inst.solvedCount} ta
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-amber-400">
                      {inst.totalScore} ball
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: VILOYATLAR REYTINGI                 */}
      {/* ========================================== */}
      {activeTab === 'regions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-16">#</th>
                  <th className="py-3 px-4">Viloyat / Hudud</th>
                  <th className="py-3 px-4">Foydalanuvchilar</th>
                  <th className="py-3 px-4">Hudud yetakchisi</th>
                  <th className="py-3 px-4 text-right">Sertifikatlar</th>
                  <th className="py-3 px-4 text-right">Yechilgan</th>
                  <th className="py-3 px-4 text-right">Jami ball</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {regionalStats.map((reg, idx) => (
                  <tr
                    key={`lb_reg_${reg.region || 'na'}_${idx}`}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-xs text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{reg.region}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        {reg.usersCount} nafar
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {reg.topUser ? (
                        <button
                          onClick={() => setInspectedUser(reg.topUser)}
                          className="text-xs font-semibold text-sky-400 hover:underline text-left"
                        >
                          {reg.topUser.name} (@{reg.topUser.username})
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-amber-300">
                      {reg.certificatesCount} ta
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 font-semibold">
                      {reg.solvedCount} ta
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-bold text-amber-400">
                      {reg.totalScore} ball
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: 100% CERTIFICATE HOLDERS            */}
      {/* ========================================== */}
      {activeTab === 'certificates' && (
        <div>
          {allPerfectSubmissions.length === 0 ? (
            <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <Award className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">
                Hozircha 100% natijali sertifikatlar yo'q
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Testni 100% xatosiz yechgan foydalanuvchilar shu yerda rasmiy sertifikat bilan ko'rinadi.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPerfectSubmissions.map((sub, sIdx) => {
                const owner = users.find((u) => u.id === sub.userId);
                return (
                  <div
                    key={`lb_perf_sub_${sub.id}_${sIdx}`}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-mono font-bold uppercase">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Sertifikat (100%)
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(sub.submittedAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-bold text-white">
                          {sub.userName}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          @{sub.username}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-sky-400 font-semibold">
                          {sub.subject}
                        </div>
                        <div className="text-xs font-bold text-white">
                          #{sub.testId}. {sub.testTitle}
                        </div>
                        <div className="flex items-center gap-3 pt-0.5 text-[11px] font-mono">
                          <span className="text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            {sub.correctCount}/{sub.totalQuestions}
                          </span>
                          <span className="text-amber-300 font-bold">
                            +{sub.earnedPoints} ball
                          </span>
                        </div>
                      </div>
                    </div>

                    {onOpenCertificate && (
                      <button
                        onClick={() => openCertModal(sub, owner)}
                        className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Sertifikatni Ko'rish</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* USER PROFILE INSPECT & SUBSCRIBE MODAL     */}
      {/* ========================================== */}
      <AnimatePresence>
        {inspectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={inspectedUser.avatarUrl || KIDTEST_LOGO_DATA_URL}
                    alt={inspectedUser.name}
                    className="w-16 h-16 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1 shrink-0"
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">
                        {inspectedUser.name}
                      </h3>
                      {(inspectedUser.email.toLowerCase() ===
                        ADMIN_EMAIL.toLowerCase() ||
                        inspectedUser.role === 'admin') && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold uppercase flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      @{inspectedUser.username} · {inspectedUser.ratingTitle}
                    </div>
                    {inspectedUser.region && (
                      <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{inspectedUser.region}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setInspectedUser(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {inspectedUser.institution && (
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{inspectedUser.institution}</span>
                  </div>
                )}

                {inspectedUser.bio && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    {inspectedUser.bio}
                  </div>
                )}

                {/* 4 RoboContest Stat Cards matching Screenshot 8 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                    <div className="text-[10px] text-slate-400">Musobaqa reytingi</div>
                    <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
                      ~{inspectedUser.rating || 1500}
                    </div>
                    <span className="text-[9px] text-emerald-300 font-bold block mt-0.5">
                      Dasturchi / Pupil
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30">
                    <div className="text-[10px] text-slate-400">Robo Rank</div>
                    <div className="text-base font-black font-mono text-cyan-400 mt-0.5">
                      #{inspectedUser.rank || 4822}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                      O'zbekiston
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/30">
                    <div className="text-[10px] text-slate-400">Yechilgan masalalar</div>
                    <div className="text-base font-black font-mono text-purple-300 mt-0.5">
                      {inspectedUser.solvedCount || 0} / 1477
                    </div>
                    <span className="text-[9px] text-purple-400 font-mono block mt-0.5">
                      Algoritmik
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                    <div className="text-[10px] text-slate-400">Masala ballari</div>
                    <div className="text-base font-black font-mono text-amber-300 mt-0.5">
                      {inspectedUser.totalScore || 0} / 29235
                    </div>
                    <span className="text-[9px] text-amber-400 font-mono block mt-0.5">
                      Jami ochko
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div>
                    {currentUser?.id !== inspectedUser.id && (
                      <button
                        type="button"
                        disabled={subscribingUserId === inspectedUser.id}
                        onClick={() => handleToggleSubscribe(inspectedUser)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isSubscribedTo(inspectedUser)
                            ? 'bg-slate-800 text-emerald-300 border border-emerald-500/40'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {isSubscribedTo(inspectedUser) ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Obuna bo'lingan</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Obuna bo'lish</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser?.id === inspectedUser.id && onOpenMyProfile && (
                      <button
                        onClick={() => {
                          setInspectedUser(null);
                          onOpenMyProfile();
                        }}
                        className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white"
                      >
                        Tahrirlash
                      </button>
                    )}
                    <button
                      onClick={() => setInspectedUser(null)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Yopish
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
