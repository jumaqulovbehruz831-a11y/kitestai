import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { User } from '../types';
import { playKitestSound } from './KitestEmblem';
import { triggerScoreReward } from './FloatingScoreRewardOverlay';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Trophy,
  Zap,
  Coins,
  Star,
  Users,
  Copy,
  Check,
  Send,
  PlusCircle,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  RotateCcw,
  Award,
  ChevronRight,
  ArrowRight,
  Radio,
  Share2,
  ExternalLink,
  Clock,
  Crown,
} from 'lucide-react';

interface LiveQuizCard {
  id: string;
  title: string;
  imageEmoji: string;
  imageUrl?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  explanation: string;
}

interface LiveQuizParticipant {
  userId: string;
  userName: string;
  avatarEmoji?: string;
  score: number;
  correctCount: number;
  answeredCardIds: string[];
}

interface LiveQuizRoom {
  roomCode: string;
  title: string;
  subject: string;
  hostId: string;
  hostName: string;
  isStarted: boolean;
  isFinished: boolean;
  createdAt: string;
  cards: LiveQuizCard[];
  participants: LiveQuizParticipant[];
}

interface RaqamliUstozViewProps {
  currentUser: User | null;
  onUpdateUser: (updated: User) => void;
  onRequireLogin: () => void;
  onNavigateTab: (tab: any) => void;
  soundEnabled?: boolean;
}

export const RaqamliUstozView: React.FC<RaqamliUstozViewProps> = ({
  currentUser,
  onUpdateUser,
  onRequireLogin,
  soundEnabled = true,
}) => {
  const [activeMode, setActiveMode] = useState<'student' | 'teacher' | 'single'>('student');
  const [rooms, setRooms] = useState<LiveQuizRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<LiveQuizRoom | null>(null);
  const [inputRoomCode, setInputRoomCode] = useState<string>('');
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Active quiz gameplay state (matching user's drawn diagram)
  const [activeCard, setActiveCard] = useState<LiveQuizCard | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [earnedScore, setEarnedScore] = useState<number>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Host creation state
  const [newTitle, setNewTitle] = useState<string>('Respublika Matematika & CHSB Quiz');
  const [newSubject, setNewSubject] = useState<string>('Matematika');
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);

  // Digital Mentor Google Sites external URL
  const [digitalMentorUrl, setDigitalMentorUrl] = useState<string>('https://sites.google.com/view/kitest-dasturlash');

  // Interactive "KITEST TEST" Simulator State (Exact User ASCII Wireframe)
  const [simQuestionIdx, setSimQuestionIdx] = useState<number>(0);
  const [simSelectedOpt, setSimSelectedOpt] = useState<number | null>(null);
  const [simTimer, setSimTimer] = useState<number>(45);
  const [simScore, setSimScore] = useState<number>(100);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  const simQuestions = [
    {
      question: "Python dasturlash tilida ro'yxat uzunligini aniqlash uchun qaysi funksiyadan foydalaniladi?",
      options: ["len()", "count()", "size()", "length()"],
      correct: 0,
      points: 100,
    },
    {
      question: "Algoritmning asosiy xossalaridan biri qaysi hisoblanadi?",
      options: ["Cheklilik (Diskretlik)", "Noaniqlik", "Ixtiyoriylik", "Faqat sonlar bilan ishlash"],
      correct: 0,
      points: 100,
    },
    {
      question: "C++ tilida konsolga ma'lumot chiqarish uchun qaysi oqim operatoridan foydalaniladi?",
      options: ["std::cin >>", "std::cout <<", "print()", "console.log()"],
      correct: 1,
      points: 100,
    },
    {
      question: "KITEST platformasida o'quvchining jami bali qanday hisoblanadi?",
      options: [
        "Faqat test natijalaridan",
        "Test + Dasturlash (Kod) + Olimpiada ballari yig'indisi",
        "Faqat tangalar sonidan",
        "Faqat yulduzchalar sonidan",
      ],
      correct: 1,
      points: 100,
    },
  ];

  // Countdown timer for simulator (45 seconds)
  useEffect(() => {
    const t = setInterval(() => {
      setSimTimer((prev) => (prev > 0 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch digital mentor config from API
  useEffect(() => {
    fetch('/api/digital-mentor/config')
      .then((r) => r.json())
      .then((d) => {
        if (d?.config?.externalUrl) setDigitalMentorUrl(d.config.externalUrl);
      })
      .catch(() => {});
  }, []);

  const handleNextSimQuestion = () => {
    if (simSelectedOpt === null) {
      setSimFeedback("Iltimos, avval birorta javob variantini tanlang!");
      setTimeout(() => setSimFeedback(null), 2500);
      return;
    }

    const currentQ = simQuestions[simQuestionIdx];
    const isCorrect = simSelectedOpt === currentQ.correct;

    if (isCorrect) {
      playKitestSound('success', soundEnabled);
      triggerScoreReward({
        type: 'points',
        amount: currentQ.points,
        label: "KITEST TEST Ball",
      });
      if (currentUser) {
        onUpdateUser({
          ...currentUser,
          totalScore: (currentUser.totalScore || 0) + currentQ.points,
          rating: (currentUser.rating || 0) + currentQ.points,
        });
      }
      setSimScore((s) => s + currentQ.points);
      setSimFeedback("✅ To'g'ri javob! +100 Ball qo'shildi!");
    } else {
      playKitestSound('click', soundEnabled);
      setSimFeedback("❌ Noto'g'ri javob. Keyingi savolga o'tildi.");
    }

    setTimeout(() => {
      setSimFeedback(null);
      setSimSelectedOpt(null);
      setSimTimer(45);
      setSimQuestionIdx((prev) => (prev + 1) % simQuestions.length);
    }, 1200);
  };

  // Poll active rooms every 3s
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/digital-mentor/quiz-rooms');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rooms)) {
          setRooms(data.rooms);
          if (currentRoom) {
            const updated = data.rooms.find((r: LiveQuizRoom) => r.roomCode === currentRoom.roomCode);
            if (updated) setCurrentRoom(updated);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 2500);
    return () => clearInterval(interval);
  }, [currentRoom?.roomCode]);

  // Join room with code
  const handleJoinWithCode = async (codeToJoin?: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    const code = String(codeToJoin || inputRoomCode).trim();
    if (!code) {
      setJoinError("6 xonali xona kodini kiriting!");
      return;
    }

    setIsJoining(true);
    setJoinError(null);
    try {
      const res = await fetch('/api/digital-mentor/quiz-rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: code,
          userId: currentUser.id,
          userName: currentUser.name,
          avatarEmoji: currentUser.avatarEmoji || '🎓',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentRoom(data.room);
        setActiveMode('student');
        playKitestSound('success', soundEnabled);
      } else {
        setJoinError(data.error || "Xonaga ulanib bo'lmadi.");
        playKitestSound('click', soundEnabled);
      }
    } catch (err: any) {
      setJoinError(`Tarmoq xatosi: ${err.message}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Host creates room
  const handleCreateRoom = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    setIsCreatingRoom(true);
    try {
      const res = await fetch('/api/digital-mentor/quiz-rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          subject: newSubject.trim(),
          hostId: currentUser.id,
          hostName: currentUser.name,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentRoom(data.room);
        playKitestSound('victory', soundEnabled);
      } else {
        alert(data.error || "Xona yaratib bo'lmadi.");
      }
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Host starts the game
  const handleStartGame = async () => {
    if (!currentRoom || !currentUser) return;
    try {
      const res = await fetch('/api/digital-mentor/quiz-rooms/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: currentRoom.roomCode,
          hostId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentRoom(data.room);
        playKitestSound('victory', soundEnabled);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } catch {}
  };

  // Student answers a card
  const handleAnswerCard = async (optionIdx: number) => {
    if (!currentRoom || !activeCard || !currentUser || selectedOption !== null) return;
    setSelectedOption(optionIdx);

    try {
      const res = await fetch('/api/digital-mentor/quiz-rooms/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: currentRoom.roomCode,
          userId: currentUser.id,
          cardId: activeCard.id,
          selectedOptionIndex: optionIdx,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnswerResult({
          isCorrect: data.isCorrect,
          explanation: data.explanation,
        });

        if (data.isCorrect) {
          playKitestSound('coin', soundEnabled);
          setCorrectAnswersCount((prev) => prev + 1);
          setEarnedScore((prev) => prev + data.earnedPoints);

          // Trigger floating flying ball animation!
          triggerScoreReward({
            type: 'points',
            amount: data.earnedPoints,
            label: 'Ball (Raqamli Ustoz)',
          });

          onUpdateUser({
            ...currentUser,
            totalScore: (currentUser.totalScore || 0) + data.earnedPoints,
            rating: (currentUser.rating || 0) + data.earnedPoints,
            coins: (currentUser.coins || 0) + 5,
          });
        } else {
          playKitestSound('click', soundEnabled);
        }
      }
    } catch {}
  };

  // Request teacher permission from admin
  const handleRequestHostPermission = async () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    try {
      await fetch('/api/digital-mentor/request-host-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
        }),
      });
      setRequestSent(true);
      playKitestSound('success', soundEnabled);
    } catch {}
  };

  const isTeacherAuthorized =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'creator' ||
    (currentUser?.totalScore || 0) >= 1000;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-orange-950/60 to-slate-900 border border-orange-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black tracking-wide uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            Google Raqamli Ustoz • Quizizz & Discord Uslubidagi Jonli Bellashuv
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-orange-400" />
            <span>Raqamli Ustoz Jonli Quiz & Kod Bellashuvi</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1.5">
            O'qituvchi xona ochadi va maxsus 6 xonali kod beradi. O'quvchilar kod orqali xonaga qo'shiladi va savollar kartochkalarda chiqib, to'g'ri javoblarga ballar beriladi!
          </p>
        </div>

        {/* Quick Join / Room Code & Google Sites Button */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={digitalMentorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>🌐 Google da Yangi Tabda Ochish</span>
          </a>

          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputRoomCode}
              onChange={(e) => setInputRoomCode(e.target.value.replace(/\D/g, ''))}
              placeholder="6 xonali kod (masalan: 749201)"
              className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-center text-sm font-bold tracking-widest focus:border-orange-500 focus:outline-none w-44"
            />
            <button
              type="button"
              onClick={() => handleJoinWithCode()}
              disabled={isJoining}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-orange-500/25 transition-all cursor-pointer whitespace-nowrap"
            >
              {isJoining ? "Ulanmoqda..." : "🚀 Qo'shilish"}
            </button>
          </div>
        </div>
      </div>

      {joinError && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs font-bold text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{joinError}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. PLATFORMA ASOSIY OYNALARI: KITEST TEST VA TIZIM SXEMASI            */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Card 1: Exact ASCII Wireframe "KITEST TEST" Interactive Simulator */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-emerald-500/60 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header: KITEST TEST */}
            <div className="border border-emerald-500/40 rounded-2xl bg-slate-950 p-4 mb-4 text-center">
              <span className="text-[10px] font-mono text-emerald-400 block tracking-widest uppercase">
                ┌──────────────────────────────┐
              </span>
              <h2 className="text-lg font-black text-emerald-300 font-mono tracking-wider py-1">
                KITEST TEST
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 block tracking-widest uppercase">
                ├──────────────────────────────┤
              </span>
            </div>

            {/* Savol Body */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-slate-400 font-bold flex items-center justify-between">
                <span>Savol: #{simQuestionIdx + 1}</span>
                <span className="text-amber-400">⚡ +{simQuestions[simQuestionIdx].points} Ball</span>
              </div>
              <p className="text-white font-bold text-sm leading-relaxed font-sans">
                {simQuestionIdx + 1}. {simQuestions[simQuestionIdx].question}
              </p>

              {/* A, B, C, D Choices */}
              <div className="space-y-2 pt-2">
                {simQuestions[simQuestionIdx].options.map((opt, oIdx) => {
                  const letter = ['A', 'B', 'C', 'D'][oIdx];
                  const isSelected = simSelectedOpt === oIdx;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setSimSelectedOpt(oIdx)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer font-sans ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {simFeedback && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-bold text-emerald-300 text-center font-sans">
                  {simFeedback}
                </div>
              )}

              {/* [KEYINGI SAVOL] Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleNextSimQuestion}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs font-mono tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <span>[KEYINGI SAVOL]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Card Footer: Ball & Vaqt */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono px-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Zap className="w-4 h-4 fill-amber-300" />
              <span>Ball: {simScore}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sky-400">
              <Clock className="w-4 h-4" />
              <span>Vaqt: 00:{simTimer < 10 ? `0${simTimer}` : simTimer}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Platform Architecture Pipeline (KITEST -> USTOZ / O'QUVCHI -> NATIJALAR -> ADMIN) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-indigo-500/50 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-black text-white font-mono">
                  KITEST TIZIM TARKIBI VA STRUKTURASI
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                ARXITEKTURA
              </span>
            </div>

            {/* ASCII & Modern Pipeline Layout */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-indigo-500/30 font-mono text-xs space-y-3">
              {/* KITEST Central Node */}
              <div className="flex justify-center">
                <div className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/30 border-2 border-amber-300">
                  KITEST
                </div>
              </div>

              {/* Connecting Tree Lines */}
              <div className="text-center text-slate-500 font-mono text-xs leading-none select-none">
                <div>|</div>
                <div>┌───────┴───────┐</div>
                <div>|               |</div>
              </div>

              {/* USTOZ vs O'QUVCHI Columns */}
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* USTOZ Branch */}
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2">
                  <div className="font-black text-purple-300 text-xs flex items-center justify-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>USTOZ</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-none">|</div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-purple-500/20 text-[11px] text-purple-200 font-semibold">
                    Test yaratish
                  </div>
                  <div className="text-[11px] text-slate-400 leading-none">|</div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-purple-500/20 text-[11px] text-purple-200 font-semibold">
                    Savollar
                  </div>
                </div>

                {/* O'QUVCHI Branch */}
                <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/40 space-y-2">
                  <div className="font-black text-orange-300 text-xs flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>O'QUVCHI</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-none">|</div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-orange-500/20 text-[11px] text-orange-200 font-semibold">
                    Guruhga kirish
                  </div>
                  <div className="text-[11px] text-slate-400 leading-none">|</div>
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-orange-500/20 text-[11px] text-orange-200 font-semibold">
                    Test ishlash
                  </div>
                </div>
              </div>

              {/* Connecting Tree Lines Converge to NATIJALAR */}
              <div className="text-center text-slate-500 font-mono text-xs leading-none select-none">
                <div>|               |</div>
                <div>└───────┬───────┘</div>
                <div>|</div>
              </div>

              {/* NATIJALAR Node */}
              <div className="flex justify-center">
                <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md border border-emerald-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>NATIJALAR</span>
                </div>
              </div>

              <div className="text-center text-slate-500 font-mono text-xs leading-none select-none">
                <div>|</div>
              </div>

              {/* ADMIN Node */}
              <div className="flex justify-center">
                <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs shadow-md border border-rose-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>ADMIN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono">
            <span>Maqsad: Mukammal ta'lim & raqobat platformasi</span>
            <span className="text-emerald-400 font-bold">🟢 Sinxronlash Faol</span>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveMode('student')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMode === 'student'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-orange-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🎒 O'quvchi Rejimi (Xonaga Ulanish)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('teacher')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeMode === 'teacher'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>👨‍🏫 Ustoz Rejimi (Xona Yaratish)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. STUDENT IN-GAME EXPERIENCE (MATCHING USER HANDWRITTEN DIAGRAM) */}
      {/* ======================================================== */}
      {currentRoom && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          {/* Header Stats Bar matching image 2: "to'g'ri bir soni: ball:" */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jonli Xona:</span>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{currentRoom.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-mono">
                  PIN: {currentRoom.roomCode}
                </span>
              </h2>
            </div>

            {/* Exactly matching image 2 stats: "to'g'ri bir soni: ball:" */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">To'g'ri Javoblar</div>
                <div className="text-base font-black text-emerald-400 font-mono">
                  ✅ {correctAnswersCount} ta
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase">To'plangan Ball</div>
                <div className="text-base font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>+{earnedScore} Ball</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentRoom(null)}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold transition-all cursor-pointer"
              >
                Xonadan Chiqish
              </button>
            </div>
          </div>

          {/* Room status / Lobby */}
          {!currentRoom.isStarted ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-3xl mx-auto animate-bounce">
                ⏳
              </div>
              <h3 className="text-xl font-black text-white">Ustoz o'yinni boshlashini kuting...</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Barcha ishtirokchilar kod orqali qo'shilmoqda. Ustoz "Start" tugmasini bosishi bilanoq savollar kartochkalari ochiladi!
              </p>

              {/* Joined participants list */}
              <div className="pt-4 border-t border-slate-800 max-w-lg mx-auto">
                <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Qo'shilgan ishtirokchilar ({currentRoom.participants.length} kishi):</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {currentRoom.participants.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{p.avatarEmoji || '🎓'}</span>
                      <span>{p.userName}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Host Start Button */}
              {(currentRoom.hostId === currentUser?.id || currentUser?.role === 'admin') && (
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    🚀 O'yinni Boshlash (Start Quiz)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Started Game: Visual Cards Grid matching Image 2 diagram */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <span>Kartochkani Tanlang va Savolga Javob Bering:</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Har bir kartochkada alohida masala va to'g'ri javob uchun ball belgilangan.
                  </p>
                </div>
              </div>

              {/* Cards Grid matching drawing in Document_18_2_0b71b289.jpg */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {currentRoom.cards.map((card, idx) => {
                  const isAnswered = currentRoom.participants
                    .find((p) => p.userId === currentUser?.id)
                    ?.answeredCardIds.includes(card.id);

                  return (
                    <motion.div
                      key={`ru_card_${card.id}_${idx}`}
                      whileHover={{ scale: isAnswered ? 1 : 1.03 }}
                      whileTap={{ scale: isAnswered ? 1 : 0.97 }}
                      onClick={() => {
                        if (!isAnswered) {
                          setActiveCard(card);
                          setSelectedOption(null);
                          setAnswerResult(null);
                          playKitestSound('click', soundEnabled);
                        }
                      }}
                      className={`p-5 rounded-2xl border flex flex-col items-center text-center justify-between min-h-[170px] transition-all cursor-pointer ${
                        isAnswered
                          ? 'bg-slate-950/60 border-slate-800 opacity-60 cursor-not-allowed'
                          : activeCard?.id === card.id
                          ? 'bg-gradient-to-b from-orange-950/80 to-slate-900 border-orange-500 ring-2 ring-orange-400 shadow-xl'
                          : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-lg'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-3xl shadow-inner mb-3">
                        {card.imageEmoji || '🎯'}
                      </div>

                      <div className="w-full">
                        <h4 className="text-xs font-black text-white truncate">{card.title}</h4>
                        <div className="mt-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-400">
                          <Zap className="w-3 h-3" />
                          <span>+{card.points} Ball</span>
                        </div>
                      </div>

                      {isAnswered && (
                        <div className="mt-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Yechildi</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Active Question Modal/Card matching handwritten diagram (A, B, C, D choices) */}
              <AnimatePresence>
                {activeCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-orange-500/50 shadow-2xl space-y-5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{activeCard.imageEmoji}</span>
                        <div>
                          <h4 className="text-base font-black text-white">{activeCard.title}</h4>
                          <span className="text-xs font-bold text-amber-400">Mukofot: +{activeCard.points} Ball</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveCard(null)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                      >
                        Yopish
                      </button>
                    </div>

                    {/* Question text */}
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-white font-bold text-sm sm:text-base leading-relaxed">
                      {activeCard.question}
                    </div>

                    {/* Options Grid (A, B, C, D) as drawn in Image 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCard.options.map((opt, optIdx) => {
                        const letter = ['A', 'B', 'C', 'D'][optIdx];
                        const isChosen = selectedOption === optIdx;
                        const isCorrectOption = optIdx === activeCard.correctOptionIndex;

                        let btnStyle = 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-700';
                        if (answerResult) {
                          if (isCorrectOption) {
                            btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400';
                          } else if (isChosen && !answerResult.isCorrect) {
                            btnStyle = 'bg-rose-950 border-rose-500 text-rose-200 ring-2 ring-rose-400';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={selectedOption !== null}
                            onClick={() => handleAnswerCard(optIdx)}
                            className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${btnStyle} disabled:cursor-default`}
                          >
                            <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-white shrink-0">
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold flex-1">{opt}</span>
                            {answerResult && isCorrectOption && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            )}
                            {answerResult && isChosen && !answerResult.isCorrect && (
                              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Explanation */}
                    {answerResult && (
                      <div className={`p-4 rounded-2xl border text-xs font-bold leading-relaxed ${
                        answerResult.isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                          : 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1 text-sm font-black">
                          {answerResult.isCorrect ? "✅ TO'G'RI JAVOB! (+ Ball qo'shildi)" : "❌ XATO JAVOB (X)"}
                        </div>
                        <p>{answerResult.explanation}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Live Leaderboard Podium as described in diagram: "yakunlaganda o'rinlar ko'rsatiladi" */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Jonli Natijalar va O'rinlar (Leaderboard):</span>
                </h4>
                <div className="space-y-2">
                  {currentRoom.participants
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((p, idx) => (
                      <div
                        key={`ru_p_${p.userId}_${idx}`}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                          idx === 0
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : idx === 1
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm w-6">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
                          </span>
                          <span>{p.avatarEmoji || '🎓'}</span>
                          <span>{p.userName}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400 font-mono">✅ {p.correctCount} ta to'g'ri</span>
                          <span className="text-amber-400 font-black font-mono">+{p.score} Ball</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. TEACHER MODE: CREATE QUIZ ROOM & MANAGE PARTICIPANTS  */}
      {/* ======================================================== */}
      {activeMode === 'teacher' && !currentRoom && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-400" />
                <span>Ustoz Rejimi: Yangi Jonli Quiz Xonasi Ochish</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                O'quvchilaringiz uchun alohida 6 xonali kod bilan xona yarating, savollarni belgilang va jonli bellashuv o'tkazing.
              </p>
            </div>
          </div>

          {!isTeacherAuthorized ? (
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-3">
              <Lock className="w-10 h-10 text-amber-400 mx-auto" />
              <h3 className="text-base font-black text-white">Ustozlik Huquqi Talab Qilinadi</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Raqamli Ustoz jonli xonasini ochish uchun sizda <strong>1000 ball</strong> bo'lishi yoki bosh admin ruxsat berishi kerak.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRequestHostPermission}
                  disabled={requestSent}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {requestSent ? "✅ So'rov Adminga Yuborildi" : "📩 Adminga Ruxsat So'rovi Yuborish"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Bellashuv Nomi</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Masalan: 7-Sinf Matematika CHSB Jonli Bellashuv"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1 block">Fan / Yo'nalish</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Informatika">Informatika & Dasturlash</option>
                    <option value="Fizika">Fizika</option>
                    <option value="Kimyo">Kimyo</option>
                    <option value="Biologiya">Biologiya</option>
                    <option value="Ingliz tili">Ingliz tili</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingRoom ? "Xona Ochilmoqda..." : "🚀 Yangi Quiz Xonasi Yaratish (6-Xonali Kod Olish)"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ACTIVE PUBLIC ROOMS LIST                                 */}
      {/* ======================================================== */}
      {!currentRoom && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Faol Jonli Quiz Xonalari ({rooms.length} ta):</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, idx) => (
              <div
                key={`ru_room_${room.roomCode}_${idx}`}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold text-xs">
                      PIN: {room.roomCode}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      {room.isStarted ? "Bellashuv Ketmoqda" : "Kutilmoqda"}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white">{room.title}</h4>
                  <div className="text-xs text-slate-400 mt-1">Ustoz: {room.hostName}</div>
                  <div className="text-xs text-slate-400">Fan: {room.subject} • {room.cards.length} ta savol</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>{room.participants.length} ishtirokchi</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleJoinWithCode(room.roomCode)}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
                  >
                    Qo'shilish 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
