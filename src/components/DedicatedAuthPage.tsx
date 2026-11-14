import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User } from '../types';
import { playKitestSound } from './KitestEmblem';
import { KitestKiteLogo } from './KitestKiteLogo';
import { signInWithRealGooglePopup } from '../firebase';
import { REGIONS_LIST, UZBEKISTAN_LOCATIONS } from '../constants/uzbekistanLocations';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  LogIn,
  UserPlus,
  ScanFace,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  MapPin,
  Building2,
} from 'lucide-react';

interface DedicatedAuthPageProps {
  mode: 'login' | 'register';
  soundEnabled?: boolean;
  onSwitchMode: (mode: 'login' | 'register') => void;
  onBackHome: () => void;
  onAuthSuccess: (user: User, allUsers?: User[]) => void;
  onOpenFaceId: () => void;
}

export const DedicatedAuthPage: React.FC<DedicatedAuthPageProps> = ({
  mode,
  soundEnabled = true,
  onSwitchMode,
  onBackHome,
  onAuthSuccess,
  onOpenFaceId,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultRegion = REGIONS_LIST.find((r) => r !== 'Barchasi') || 'Toshkent shahri';
  const [region, setRegion] = useState(defaultRegion);
  const [district, setDistrict] = useState((UZBEKISTAN_LOCATIONS[defaultRegion] || [])[0] || '');
  const [institution, setInstitution] = useState('');

  // Forgot password inline view
  const [showForgot, setShowForgot] = useState(false);
  const [resetLogin, setResetLogin] = useState('');
  const [resetNewPass, setResetNewPass] = useState('');

  const [usernameCheck, setUsernameCheck] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
    setShowForgot(false);
  }, [mode]);

  const cleanUsername = username.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '_');

  useEffect(() => {
    if (mode !== 'register' || !cleanUsername) {
      setUsernameCheck({ checking: false });
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameCheck({ checking: true });
      try {
        const res = await fetch(`/api/auth/check-username/${encodeURIComponent(cleanUsername)}`);
        const data = await res.json();
        setUsernameCheck({
          checking: false,
          available: Boolean(data.available),
          reason: data.reason,
        });
      } catch {
        setUsernameCheck({ checking: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cleanUsername, mode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Username yoki Email manzilingizni kiriting.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Parol kamida 4 ta belgidan iborat bo‘lishi kerak.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: loginIdentifier.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Login yoki parol noto‘g‘ri.');
        playKitestSound('warning', soundEnabled);
      } else if (data.user) {
        if (data.sessionToken) {
          try {
            sessionStorage.setItem('kitest_session_token', data.sessionToken);
          } catch {}
        }
        playKitestSound('victory', soundEnabled);
        setSuccessMsg('Muvaffaqiyatli kirdingiz! Bosh sahifaga yo‘naltirilmoqda...');
        setTimeout(() => {
          onAuthSuccess(data.user, Array.isArray(data.users) ? data.users : undefined);
        }, 350);
      }
    } catch {
      setErrorMsg('Server bilan bog‘lanib bo‘lmadi. Internet aloqasini tekshiring.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Ism familiyangizni to‘liq kiriting.');
      return;
    }
    if (!/^[a-z0-9_]{3,28}$/.test(cleanUsername)) {
      setErrorMsg('Username 3–28 ta belgidan iborat bo‘lishi kerak (faqat a-z, 0-9, _).');
      return;
    }
    if (usernameCheck.available === false) {
      setErrorMsg(usernameCheck.reason || 'Bu username allaqachon band!');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('To‘g‘ri Email manzilini kiriting (masalan: ism@gmail.com).');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Parol kamida 4 ta belgidan iborat bo‘lishi kerak.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Parol va qayta kiritilgan parol bir-biriga mos emas!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          region,
          district,
          institution: institution.trim() || 'KITEST Ishtirokchisi',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.');
        playKitestSound('warning', soundEnabled);
      } else if (data.user) {
        if (data.sessionToken) {
          try {
            sessionStorage.setItem('kitest_session_token', data.sessionToken);
          } catch {}
        }
        playKitestSound('victory', soundEnabled);
        setSuccessMsg(`Tabriklaymiz! @${data.user.username} hisobi yaratildi.`);
        setTimeout(() => {
          onAuthSuccess(data.user, Array.isArray(data.users) ? data.users : undefined);
        }, 400);
      }
    } catch {
      setErrorMsg('Server bilan bog‘lanishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!resetLogin.trim() || resetNewPass.trim().length < 4) {
      setErrorMsg('Username/Email va kamida 4 belgili yangi parolni kiriting.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: resetLogin.trim(),
          newPassword: resetNewPass.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Parolni tiklashda xatolik.');
      } else if (data.user) {
        playKitestSound('success', soundEnabled);
        setSuccessMsg('Parol muvaffaqiyatli yangilandi! Kirilmoqda...');
        setTimeout(() => {
          onAuthSuccess(data.user, Array.isArray(data.users) ? data.users : undefined);
        }, 400);
      }
    } catch {
      setErrorMsg('Server bilan bog‘lanishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    playKitestSound('click', soundEnabled);
    try {
      const verified = await signInWithRealGooglePopup();
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verified.email,
          name: verified.name,
          avatarUrl: verified.photoURL,
          idToken: verified.idToken,
          googleUid: verified.uid,
          region,
          district,
          institution: institution.trim() || 'Google Account Foydalanuvchisi',
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        if (data.sessionToken) {
          try {
            sessionStorage.setItem('kitest_session_token', data.sessionToken);
          } catch {}
        }
        playKitestSound('victory', soundEnabled);
        onAuthSuccess(data.user, Array.isArray(data.users) ? data.users : undefined);
      } else {
        setErrorMsg(data.error || 'Google orqali kirishda xatolik.');
      }
    } catch (err: any) {
      const msg = String(err?.code || err?.message || '');
      if (!msg.includes('popup-closed-by-user')) {
        setErrorMsg('Google oynasi orqali kirishda xatolik. Popup ruxsatini tekshiring.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col relative overflow-hidden">
      {/* Subtle Cosmic Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#1a154d] via-[#0e1536]/60 to-transparent blur-3xl opacity-80" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackHome}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 cursor-pointer kitest-btn-press"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Bosh sahifa</span>
        </button>

        <button
          type="button"
          onClick={onBackHome}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <KitestKiteLogo size={36} showWordmark={false} />
          <div className="text-left">
            <div className="flex items-center gap-0.5 text-lg font-black tracking-wider">
              <span className="text-white">KITEST</span>
              <span className="text-cyan-400">AI</span>
            </div>
          </div>
        </button>
      </header>

      {/* Main Centered Auth Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="w-full max-w-lg rounded-3xl bg-[#0c1327]/95 border border-indigo-500/30 p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-xl space-y-6"
        >
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#070b18] border border-indigo-500/20">
            <button
              type="button"
              onClick={() => onSwitchMode('login')}
              className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Kirish (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => onSwitchMode('register')}
              className={`py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Ro‘yxatdan o‘tish</span>
            </button>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-white">
              {showForgot
                ? 'Parolni tiklash'
                : mode === 'login'
                ? 'Hisobingizga kiring'
                : 'Yangi hisob yarating'}
            </h1>
            <p className="text-xs text-slate-400">
              {showForgot
                ? 'Username yoki Email orqali yangi parol o‘rnating'
                : mode === 'login'
                ? 'KITEST ekotizimidagi barcha imkoniyatlardan foydalaning'
                : 'O‘zingizga noyob @username tanlang va platformaga qo‘shiling'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {showForgot ? (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Username yoki Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resetLogin}
                    onChange={(e) => setResetLogin(e.target.value)}
                    placeholder="@username yoki email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Yangi parol</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    placeholder="Kamida 4 ta belgi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
                >
                  Orqaga
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Parolni yangilash</span>
                </button>
              </div>
            </form>
          ) : mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Username yoki Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="@behruz yoki email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Parol</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    Parolni unutdingizmi?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Parolingizni kiriting"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>{loading ? 'Kirilmoqda...' : 'Kirish'}</span>
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Ism Familiya</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ismingiz"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Username</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="behruz_uz"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  {usernameCheck.checking && (
                    <p className="text-[10px] text-indigo-400">Tekshirilmoqda...</p>
                  )}
                  {!usernameCheck.checking && usernameCheck.available === false && (
                    <p className="text-[10px] text-rose-400 font-bold">{usernameCheck.reason}</p>
                  )}
                  {!usernameCheck.checking && usernameCheck.available === true && cleanUsername && (
                    <p className="text-[10px] text-emerald-400 font-bold">
                      /@{cleanUsername} havolasi bo‘sh!
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Parol</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kamida 4 belgi"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Parolni qayta kiriting</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Tasdiqlash"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Hudud
                  </label>
                  <select
                    value={region}
                    onChange={(e) => {
                      const r = e.target.value;
                      setRegion(r);
                      setDistrict((UZBEKISTAN_LOCATIONS[r] || [])[0] || '');
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {REGIONS_LIST.filter((r) => r !== 'Barchasi').map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> Maktab / OTM
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Ixtiyoriy"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || usernameCheck.available === false}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>{loading ? 'Yaratilmoqda...' : 'Ro‘yxatdan o‘tish'}</span>
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-800" />
            <span className="px-3 text-[11px] font-bold text-slate-500 uppercase">yoki</span>
            <div className="flex-grow border-t border-slate-800" />
          </div>

          {/* Google Sign-In & Face ID */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="gsi-material-button"
            >
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {googleLoading ? 'Google bilan kirilmoqda...' : 'Sign in with Google'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={onOpenFaceId}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
            >
              <ScanFace className="w-4 h-4" />
              <span>Haqiqiy Kamera Face ID bilan kirish</span>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
