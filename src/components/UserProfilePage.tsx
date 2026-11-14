import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Submission,
  ADMIN_EMAIL,
  computeRankClass,
  RANK_CLASS_META,
} from '../types';
import { playKitestSound } from './KitestEmblem';
import { readAndOptimizeAvatarFile } from './ProfileModal';
import { REGIONS_LIST, UZBEKISTAN_LOCATIONS } from '../constants/uzbekistanLocations';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Edit3,
  Save,
  X,
  MapPin,
  Building2,
  Trophy,
  Zap,
  Coins,
  Star,
  CheckCircle2,
  Calendar,
  Settings,
  LogOut,
  AlertCircle,
  Upload,
  Lock,
  Loader2,
} from 'lucide-react';

interface UserProfilePageProps {
  profileUser: User;
  currentUser: User | null;
  submissions: Submission[];
  soundEnabled?: boolean;
  onBack: () => void;
  onUpdateUser: (updated: User, allUsers?: User[]) => void;
  onUsernameChanged?: (newUsername: string) => void;
  onLogout?: () => void;
  onOpenFullSettings?: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  profileUser,
  currentUser,
  submissions,
  soundEnabled = true,
  onBack,
  onUpdateUser,
  onUsernameChanged,
  onLogout,
  onOpenFullSettings,
}) => {
  const isOwner = Boolean(
    currentUser &&
      (currentUser.id === profileUser.id ||
        currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase())
  );
  const isSelf = Boolean(currentUser && currentUser.id === profileUser.id);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profileUser.name);
  const [username, setUsername] = useState(profileUser.username);
  const [bio, setBio] = useState(profileUser.bio || '');
  const [region, setRegion] = useState(profileUser.region || 'Toshkent shahri');
  const [district, setDistrict] = useState(profileUser.district || 'Yunusobod tumani');
  const [institution, setInstitution] = useState(profileUser.institution || '');
  const [avatarUrl, setAvatarUrl] = useState(profileUser.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setName(profileUser.name);
    setUsername(profileUser.username);
    setBio(profileUser.bio || '');
    setRegion(profileUser.region || 'Toshkent shahri');
    setDistrict(profileUser.district || 'Yunusobod tumani');
    setInstitution(profileUser.institution || '');
    setAvatarUrl(profileUser.avatarUrl || '');
    setIsEditing(false);
    setErrorMsg('');
    setSuccessMsg('');
  }, [profileUser]);

  const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '_');

  useEffect(() => {
    if (!isEditing) return;
    if (!cleanUsername || cleanUsername === profileUser.username.toLowerCase()) {
      setUsernameStatus({ checking: false, available: true });
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true });
      try {
        const res = await fetch(
          `/api/auth/check-username/${encodeURIComponent(cleanUsername)}?excludeUserId=${encodeURIComponent(profileUser.id)}`
        );
        const data = await res.json();
        setUsernameStatus({
          checking: false,
          available: Boolean(data.available),
          reason: data.reason,
        });
      } catch {
        setUsernameStatus({ checking: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cleanUsername, isEditing, profileUser.id, profileUser.username]);

  const personalUrl = `${window.location.origin}/@${encodeURIComponent(profileUser.username)}`;

  const mySubmissions = useMemo(
    () => submissions.filter((s) => s.userId === profileUser.id),
    [submissions, profileUser.id]
  );

  const rankClass = computeRankClass(profileUser.rating || 0);
  const rankMeta = RANK_CLASS_META[rankClass];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(personalUrl).then(() => {
      setCopied(true);
      playKitestSound('coin', soundEnabled);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser.name} (@${profileUser.username}) — KITEST`,
          text: `${profileUser.name} ning KITEST platformasidagi rasmiy profili`,
          url: personalUrl,
        });
        return;
      } catch {}
    }
    handleCopyLink();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimized = await readAndOptimizeAvatarFile(file);
      if (optimized) {
        setAvatarUrl(optimized);
        playKitestSound('success', soundEnabled);
      }
    } catch {
      setErrorMsg('Rasmni yuklashda xatolik');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Ism familiya bo‘sh bo‘lishi mumkin emas!');
      return;
    }
    if (usernameStatus.available === false) {
      setErrorMsg(usernameStatus.reason || 'Ushbu username band!');
      return;
    }
    if (newPassword && newPassword !== confirmNewPassword) {
      setErrorMsg('Yangi parollar bir-biriga mos kelmadi!');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(profileUser.id)}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          bio: bio.trim(),
          region,
          district,
          institution: institution.trim(),
          avatarUrl,
          ...(newPassword.trim().length >= 4
            ? { newPassword: newPassword.trim(), confirmNewPassword: confirmNewPassword.trim() }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Profilni saqlashda xatolik yuz berdi');
      } else if (data.user) {
        playKitestSound('victory', soundEnabled);
        setSuccessMsg('Profil ma’lumotlari muvaffaqiyatli saqlandi!');
        setIsEditing(false);
        setNewPassword('');
        setConfirmNewPassword('');
        if (isSelf) {
          onUpdateUser(data.user, data.users);
        }
        if (
          data.user.username &&
          data.user.username.toLowerCase() !== profileUser.username.toLowerCase()
        ) {
          onUsernameChanged?.(data.user.username);
        }
      }
    } catch {
      setErrorMsg('Server bilan bog‘lanishda xatolik');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="max-w-5xl mx-auto space-y-6 pb-10"
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 flex items-center gap-2 cursor-pointer kitest-btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 flex items-center gap-1.5 cursor-pointer kitest-btn-press"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Nusxalandi!' : 'Havolani nusxalash'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Ulashish</span>
          </button>

          {isOwner && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Profilni tahrirlash</span>
            </button>
          )}

          {isSelf && onOpenFullSettings && (
            <button
              type="button"
              onClick={onOpenFullSettings}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Sozlamalar</span>
            </button>
          )}

          {isSelf && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 overflow-hidden shadow-xl">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-indigo-700 via-purple-700 to-cyan-700 relative">
          <div className="absolute bottom-3 right-4 text-xs font-mono text-white/80 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
            /@{profileUser.username}
          </div>
        </div>

        <div className="px-6 pb-6 -mt-12 sm:-mt-14 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#090e1c] border-4 border-white dark:border-[#0d1428] shadow-xl overflow-hidden flex items-center justify-center text-3xl font-black text-white shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profileUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profileUser.avatarEmoji || profileUser.name.charAt(0).toUpperCase()}</span>
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:bg-black/75 transition-colors">
                  <Upload className="w-4 h-4 mb-1" />
                  <span>Rasm</span>
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {profileUser.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${rankMeta.bgClass} ${rankMeta.colorClass}`}>
                  {rankClass} · {rankMeta.title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-bold text-indigo-500 dark:text-indigo-400">
                  @{profileUser.username}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profileUser.region || 'O‘zbekiston'}
                </span>
                {profileUser.institution && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {profileUser.institution}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center gap-2 max-w-full overflow-hidden">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[230px]">
              {personalUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shrink-0"
              title="Nusxalash"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Bio */}
        {!isEditing && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/70">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {profileUser.bio?.trim()
                ? profileUser.bio
                : 'Foydalanuvchi hali o‘zi haqida qisqacha ma’lumot yozmagan.'}
            </p>
          </div>
        )}
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-500 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Edit Profile Form (Only for Owner/Admin) */}
      {isEditing && isOwner && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl bg-white dark:bg-[#0d1428] border border-indigo-500/40 p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Shaxsiy ma’lumotlarni tahrirlash
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Ism Familiya</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Username (Shaxsiy havola: /@{cleanUsername || 'username'})
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                required
              />
              {usernameStatus.checking && (
                <p className="text-[11px] text-indigo-400">Tekshirilmoqda...</p>
              )}
              {!usernameStatus.checking && usernameStatus.available === false && (
                <p className="text-[11px] text-rose-400 font-bold">{usernameStatus.reason}</p>
              )}
              {!usernameStatus.checking &&
                usernameStatus.available === true &&
                cleanUsername !== profileUser.username.toLowerCase() && (
                  <p className="text-[11px] text-emerald-400 font-bold">@{cleanUsername} bo‘sh!</p>
                )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Hudud</label>
              <select
                value={region}
                onChange={(e) => {
                  const r = e.target.value;
                  setRegion(r);
                  setDistrict((UZBEKISTAN_LOCATIONS[r] || [])[0] || '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                {REGIONS_LIST.filter((r) => r !== 'Barchasi').map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Tuman / Shahar</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              >
                {(UZBEKISTAN_LOCATIONS[region] || []).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Ta’lim muassasasi</label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Maktab, litsey yoki universitet"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Bio (O‘zingiz haqingizda)</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Qiziqishlaringiz, maqsadlaringiz..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Yangi parol (ixtiyoriy)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 4 ta belgi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Parolni tasdiqlash</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Yangi parolni qayta kiriting"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving || usernameStatus.available === false}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer kitest-btn-press"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Saqlash</span>
            </button>
          </div>
        </form>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 p-4 kitest-card-3d">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Reyting</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {(profileUser.rating || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 p-4 kitest-card-3d">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Umumiy Ball</span>
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {(profileUser.totalScore || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 p-4 kitest-card-3d">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tangalar</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {(profileUser.coins || 0).toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 p-4 kitest-card-3d">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Yulduzlar</span>
            <Star className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {profileUser.stars || 0} ★
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-3xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>So‘nggi faollik va natijalar ({mySubmissions.length})</span>
          </h3>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Hali topshirilgan test natijalari mavjud emas.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {mySubmissions.slice(0, 8).map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{sub.testTitle}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    {sub.subject} · {new Date(sub.submittedAt).toLocaleDateString('uz-UZ')}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-extrabold text-emerald-500">
                    {sub.score} / {sub.total} ({sub.percentage}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
