import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { playKitestSound } from './KitestEmblem';
import { triggerScoreReward } from './FloatingScoreRewardOverlay';
import {
  X,
  Zap,
  Coins,
  Star,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Users,
  PlusCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface CurrencyExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
  onRequireLogin: () => void;
  soundEnabled?: boolean;
}

export type CurrencyType = 'points' | 'coins' | 'stars';

export interface TradeOffer {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  offeringType: CurrencyType;
  offeringAmount: number;
  requestingType: CurrencyType;
  requestingAmount: number;
  note?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export const CurrencyExchangeModal: React.FC<CurrencyExchangeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onRequireLogin,
  soundEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'trade' | 'transfer'>('auto');
  
  // Instant Auto Exchange State
  const [fromCurrency, setFromCurrency] = useState<CurrencyType>('points');
  const [toCurrency, setToCurrency] = useState<CurrencyType>('coins');
  const [amount, setAmount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // P2P Trade State
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [isCreatingTrade, setIsCreatingTrade] = useState(false);
  const [tradeOfferType, setTradeOfferType] = useState<CurrencyType>('coins');
  const [tradeOfferAmt, setTradeOfferAmt] = useState<number>(50);
  const [tradeRequestType, setTradeRequestType] = useState<CurrencyType>('stars');
  const [tradeRequestAmt, setTradeRequestAmt] = useState<number>(1);
  const [tradeNote, setTradeNote] = useState('');

  // Direct Transfer State
  const [transferTargetUsername, setTransferTargetUsername] = useState('');
  const [transferCurrencyType, setTransferCurrencyType] = useState<CurrencyType>('coins');
  const [transferAmount, setTransferAmount] = useState<number>(20);

  const fetchTradeOffers = async () => {
    try {
      const res = await fetch('/api/wallet/trade-list');
      const data = await res.json();
      if (data && Array.isArray(data.trades)) {
        setTradeOffers(data.trades);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchTradeOffers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const userPoints = Math.max(0, currentUser?.totalScore || 0);
  const userCoins = Math.max(0, currentUser?.coins || 0);
  const userStars = Math.max(0, currentUser?.stars || 0);

  const calculateTargetAmount = (val: number, from: CurrencyType, to: CurrencyType): number => {
    if (from === to) return val;
    if (from === 'points' && to === 'coins') return val;
    if (from === 'coins' && to === 'points') return val;
    if (from === 'points' && to === 'stars') return Math.floor(val / 50);
    if (from === 'coins' && to === 'stars') return Math.floor(val / 50);
    if (from === 'stars' && to === 'points') return val * 40;
    if (from === 'stars' && to === 'coins') return val * 40;
    return val;
  };

  const targetGained = calculateTargetAmount(amount, fromCurrency, toCurrency);

  const handleSwapCurrencies = () => {
    playKitestSound('click', soundEnabled);
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleExecuteExchange = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    if (fromCurrency === toCurrency) {
      setErrorMsg("Bir xil valyutalar tanlandi. Boshqa valyutani tanlang!");
      return;
    }

    if (amount <= 0) {
      setErrorMsg("Almashinuv miqdorini 0 dan katta kiriting!");
      return;
    }

    if (fromCurrency === 'points' && userPoints < amount) {
      setErrorMsg(`Ball yetarli emas! Sizda ${userPoints} ball bor.`);
      return;
    }
    if (fromCurrency === 'coins' && userCoins < amount) {
      setErrorMsg(`Coins yetarli emas! Sizda ${userCoins} coin bor.`);
      return;
    }
    if (fromCurrency === 'stars' && userStars < amount) {
      setErrorMsg(`Yulduz yetarli emas! Sizda ${userStars} yulduz bor.`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/wallet/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fromCurrency,
          toCurrency,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Almashishda xatolik yuz berdi");
      }

      playKitestSound('fanfare', soundEnabled);
      try {
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
      } catch {}

      if (data.user) {
        onUpdateUser(data.user);
        triggerScoreReward({
          type: toCurrency,
          amount: targetGained,
          label: toCurrency === 'points' ? 'Ball (Almashuv)' : toCurrency === 'coins' ? 'Tanga (Almashuv)' : 'Yulduz (Almashuv)',
        });
      }

      setSuccessMsg(data.message || "Valyuta muvaffaqiyatli ayirboshlandi!");
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Server bilan bog'lanishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTrade = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    if (tradeOfferType === tradeRequestType) {
      setErrorMsg("Bir xil valyutani almashtirib bo'lmaydi!");
      return;
    }

    if (tradeOfferAmt <= 0 || tradeRequestAmt <= 0) {
      setErrorMsg("Miqdorlarni to'g'ri kiriting!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/wallet/trade-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          offeringType: tradeOfferType,
          offeringAmount: tradeOfferAmt,
          requestingType: tradeRequestType,
          requestingAmount: tradeRequestAmt,
          note: tradeNote,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Trade yaratishda xatolik");
      }

      playKitestSound('success', soundEnabled);
      if (data.user) onUpdateUser(data.user);
      setSuccessMsg("Trade taklifingiz muvaffaqiyatli joylashtirildi!");
      setIsCreatingTrade(false);
      fetchTradeOffers();
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTrade = async (tradeId: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/wallet/trade-accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeId,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Trade qabul qilishda xatolik");
      }

      playKitestSound('fanfare', soundEnabled);
      try {
        confetti({ particleCount: 70, spread: 70 });
      } catch {}

      if (data.user) onUpdateUser(data.user);
      setSuccessMsg(data.message || "Trade muvaffaqiyatli bajarildi!");
      fetchTradeOffers();
    } catch (err: any) {
      setErrorMsg(err.message || "Xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!transferTargetUsername.trim()) {
      setErrorMsg("Qabul qiluvchi @username ni kiriting!");
      return;
    }

    if (transferAmount <= 0) {
      setErrorMsg("O'tkazma miqdorini to'g'ri kiriting!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          targetUsername: transferTargetUsername.trim(),
          currencyType: transferCurrencyType,
          amount: transferAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "O'tkazmada xatolik");
      }

      playKitestSound('success', soundEnabled);
      if (data.user) onUpdateUser(data.user);
      setSuccessMsg(data.message || "O'tkazma muvaffaqiyatli amalga oshirildi!");
      setTransferTargetUsername('');
    } catch (err: any) {
      setErrorMsg(err.message || "O'tkazmada xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrencyLabel = (t: CurrencyType) => {
    if (t === 'points') return 'Ball ⚡';
    if (t === 'coins') return 'Tanga 🪙';
    return 'Yulduz ⭐';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl rounded-3xl bg-[#0c1224] border border-indigo-500/30 p-6 sm:p-7 shadow-2xl text-white font-sans space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>Valyuta Almashish & P2P Trade</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">100% Real</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Ball, Coins va Yulduzlarni almashtiring yoki foydalanuvchilar bilan savdo qiling
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Live User Balances */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#070b18] border border-indigo-500/20">
            <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-sky-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>Ball</span>
              </div>
              <div className="text-base font-black text-white mt-0.5">{userPoints}</div>
            </div>

            <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>Coins</span>
              </div>
              <div className="text-base font-black text-amber-300 mt-0.5">{userCoins}</div>
            </div>

            <div className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center justify-center gap-1 text-[11px] text-purple-400 font-bold">
                <Star className="w-3.5 h-3.5" />
                <span>Yulduz ⭐</span>
              </div>
              <div className="text-base font-black text-purple-300 mt-0.5">{userStars}★</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#070b18] border border-indigo-500/20 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('auto');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'auto'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⇄ Tezkor Almashish
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('trade');
                setErrorMsg(null);
                setSuccessMsg(null);
                fetchTradeOffers();
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'trade'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🤝 P2P Bozor & Trade
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('transfer');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'transfer'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎁 O'tkazma
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: INSTANT AUTO EXCHANGE */}
          {activeTab === 'auto' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Qaysi valyutadan ayirboshlaysiz?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['points', 'coins', 'stars'] as CurrencyType[]).map((c) => (
                    <button
                      key={`from_${c}`}
                      type="button"
                      onClick={() => {
                        playKitestSound('click', soundEnabled);
                        setFromCurrency(c);
                        if (c === toCurrency) {
                          setToCurrency(c === 'points' ? 'coins' : 'points');
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        fromCurrency === c
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-400 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {c === 'points' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                      {c === 'coins' && <Coins className="w-3.5 h-3.5 text-amber-400" />}
                      {c === 'stars' && <Star className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{c === 'points' ? 'Ball' : c === 'coins' ? 'Coins' : 'Yulduz'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={handleSwapCurrencies}
                  className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Qaysi valyutaga o'tkazasiz?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['points', 'coins', 'stars'] as CurrencyType[]).map((c) => (
                    <button
                      key={`to_${c}`}
                      type="button"
                      onClick={() => {
                        playKitestSound('click', soundEnabled);
                        setToCurrency(c);
                        if (c === fromCurrency) {
                          setFromCurrency(c === 'points' ? 'coins' : 'points');
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        toCurrency === c
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {c === 'points' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                      {c === 'coins' && <Coins className="w-3.5 h-3.5 text-amber-400" />}
                      {c === 'stars' && <Star className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{c === 'points' ? 'Ball' : c === 'coins' ? 'Coins' : 'Yulduz'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Almashinuv miqdori:</span>
                  <span className="font-mono">
                    Maksimal: {fromCurrency === 'points' ? userPoints : fromCurrency === 'coins' ? userCoins : userStars}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 0))}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#070b18] border border-indigo-500/30 focus:border-cyan-400 text-sm font-mono font-bold text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {[10, 25, 50, 100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className="py-1 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const maxVal = fromCurrency === 'points' ? userPoints : fromCurrency === 'coins' ? userCoins : userStars;
                      setAmount(Math.max(1, maxVal));
                    }}
                    className="py-1 px-3 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[11px] font-bold ml-auto transition-colors cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-emerald-950/40 border border-indigo-500/30 text-xs flex items-center justify-between font-mono">
                <span className="text-slate-400">Qabul qilinadigan qiymat:</span>
                <span className="text-emerald-400 font-black text-sm">
                  +{targetGained} {getCurrencyLabel(toCurrency)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleExecuteExchange}
                disabled={isLoading || amount <= 0}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? 'Almashtirilmoqda...' : 'Real-Vaqtda Almashtirish'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: P2P TRADE MARKETPLACE */}
          {activeTab === 'trade' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Faol Trade Takliflari ({tradeOffers.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreatingTrade(!isCreatingTrade)}
                  className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{isCreatingTrade ? 'Yopish' : '+ Yangi Taklif'}</span>
                </button>
              </div>

              {/* Create Trade Offer Box */}
              {isCreatingTrade && (
                <div className="p-4 rounded-2xl bg-[#070b18] border border-purple-500/40 space-y-3">
                  <div className="text-xs font-black text-purple-300">Yangi Trade Taklifi Yaratish</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400">Siz berasiz:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          value={tradeOfferAmt}
                          onChange={(e) => setTradeOfferAmt(Number(e.target.value) || 1)}
                          className="w-20 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 font-mono font-bold text-white text-xs"
                        />
                        <select
                          value={tradeOfferType}
                          onChange={(e) => setTradeOfferType(e.target.value as CurrencyType)}
                          className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold"
                        >
                          <option value="coins">Coins 🪙</option>
                          <option value="points">Ball ⚡</option>
                          <option value="stars">Yulduz ⭐</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Siz so'raysiz:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          value={tradeRequestAmt}
                          onChange={(e) => setTradeRequestAmt(Number(e.target.value) || 1)}
                          className="w-20 py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 font-mono font-bold text-white text-xs"
                        />
                        <select
                          value={tradeRequestType}
                          onChange={(e) => setTradeRequestType(e.target.value as CurrencyType)}
                          className="py-1.5 px-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold"
                        >
                          <option value="stars">Yulduz ⭐</option>
                          <option value="coins">Coins 🪙</option>
                          <option value="points">Ball ⚡</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Qisqa izoh (masalan: Tezkor almashtiramiz!)"
                    value={tradeNote}
                    onChange={(e) => setTradeNote(e.target.value)}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleCreateTrade}
                    disabled={isLoading}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Joylashtirilmoqda...' : 'Trade Taklifini Chiqarish'}
                  </button>
                </div>
              )}

              {/* List of active trades */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {tradeOffers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-2xl bg-[#070b18] border border-indigo-500/20 hover:border-purple-400/40 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center font-black text-xs text-white shrink-0">
                        {t.creatorName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white flex items-center gap-1.5 truncate">
                          <span>{t.creatorName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">@{t.creatorUsername}</span>
                        </div>
                        <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-amber-400">+{t.offeringAmount} {getCurrencyLabel(t.offeringType)}</span>
                          <span className="text-slate-500">↔️</span>
                          <span className="font-bold text-purple-400">+{t.requestingAmount} {getCurrencyLabel(t.requestingType)}</span>
                        </div>
                        {t.note && (
                          <p className="text-[10px] text-slate-400 truncate italic mt-0.5">{t.note}</p>
                        )}
                      </div>
                    </div>

                    {t.creatorId === currentUser?.id ? (
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] text-slate-400 font-bold shrink-0">
                        O'zingizniki
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcceptTrade(t.id)}
                        disabled={isLoading}
                        className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shrink-0 cursor-pointer disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                      >
                        Qabul Qilish
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT USER TRANSFER */}
          {activeTab === 'transfer' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Qabul qiluvchi Foydalanuvchi:
                </label>
                <input
                  type="text"
                  placeholder="@username (masalan: behruz_admin)"
                  value={transferTargetUsername}
                  onChange={(e) => setTransferTargetUsername(e.target.value)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070b18] border border-indigo-500/30 focus:border-cyan-400 text-sm font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  O'tkaziladigan valyuta:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['coins', 'points', 'stars'] as CurrencyType[]).map((c) => (
                    <button
                      key={`trans_${c}`}
                      type="button"
                      onClick={() => setTransferCurrencyType(c)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        transferCurrencyType === c
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                      }`}
                    >
                      {c === 'coins' && <Coins className="w-3.5 h-3.5 text-amber-400" />}
                      {c === 'points' && <Zap className="w-3.5 h-3.5 text-sky-400" />}
                      {c === 'stars' && <Star className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{c === 'coins' ? 'Coins' : c === 'points' ? 'Ball' : 'Yulduz'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Miqdor:</span>
                  <span className="font-mono">
                    Maksimal: {transferCurrencyType === 'coins' ? userCoins : transferCurrencyType === 'points' ? userPoints : userStars}
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#070b18] border border-indigo-500/30 focus:border-cyan-400 text-sm font-mono font-bold text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTransfer}
                disabled={isLoading || transferAmount <= 0}
                className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? 'O\'tkazilmoqda...' : 'Foydalanuvchiga O\'tkazish'}</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
