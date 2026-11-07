import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RotateCcw,
  Maximize2,
  ExternalLink,
  HelpCircle,
  Code2,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';
import { User } from '../types';
import { playKitestSound } from './KitestEmblem';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

interface KitestAiSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  soundEnabled?: boolean;
  onNavigateToFullTab?: () => void;
}

const DEFAULT_PROMPTS = [
  {
    icon: '📐',
    label: 'Kvadrat tenglama formulasi',
    prompt: 'Kvadrat tenglamani diskriminant orqali yechish formulasi va bosqichma-bosqich misolini tushuntirib ber.',
  },
  {
    icon: '🐍',
    label: 'Python da saralash kodi',
    prompt: 'Python dasturlash tilida QuickSort (tezkor saralash) algoritmini misol tariqasida yozib, har bir qatorini tushuntir.',
  },
  {
    icon: '🏆',
    label: 'Olimpiada testiga maslahat',
    prompt: 'Respublika Fan Olimpiadasida va CHSB imtihonlarida maksimal ball olish uchun qanday tayyorgarlik ko\'rish kerak?',
  },
  {
    icon: '⚡',
    label: 'Test savoli tuzib ber',
    prompt: 'Informatika fanidan "Algoritmlar va ma\'lumotlar tuzilmasi" mavzusida 3 ta qiziqarli test savoli tuzib ber.',
  },
];

export const KitestAiSideDrawer: React.FC<KitestAiSideDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  soundEnabled = true,
  onNavigateToFullTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('kitest_ai_drawer_messages_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg_welcome',
        role: 'model',
        text: `Assalomu alaykum, ${currentUser?.name || "do'stim"}! 👋\n\nMen **KITEST Sun'iy Intellekt (AI) yordamchisiman**. Sizga quyidagi mavzularda yordam bera olaman:\n- 📐 **Matematika & Fizika** masalalarini yechish va formulalar\n- 💻 **Python, C++, JavaScript** kodlarini yozish va xatolarini to'g'rilash\n- 🏆 **CHSB va Olimpiada** testlariga tayyorgarlik\n- 🎯 Yangi testlar va qiziqarli savollarni tushuntirish\n\nIstalgan savolingizni yozing yoki quyidagi tayyor mavzulardan birini tanlang!`,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('kitest_ai_drawer_messages_v1', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    playKitestSound('click', soundEnabled);

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          userName: currentUser?.name || 'O\'quvchi',
          history: historyPayload,
        }),
      });

      const data = await res.json();
      let replyText = data?.answer || data?.reply;

      if (!replyText) {
        // Fallback to /api/ai/chat
        const chatRes = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            userName: currentUser?.name || 'O\'quvchi',
          }),
        });
        const chatData = await chatRes.json();
        replyText = chatData?.reply || "Kechirasiz, javob tayyorlashda xatolik yuz berdi.";
      }

      playKitestSound('success', soundEnabled);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: "Kechirasiz, server bilan bog'lanishda vaqtinchalik xatolik yuz berdi. Iltimos qayta urinib ko'ring.",
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playKitestSound('coin', soundEnabled);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    playKitestSound('click', soundEnabled);
    const initialWelcome: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'model',
      text: `Suhbat tozalandi! ${currentUser?.name || "Do'stim"}, yangi savollaringiz bo'lsa marhamat, so'rashingiz mumkin.`,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialWelcome]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Side Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[460px] md:w-[500px] bg-[#070b14]/98 border-l border-indigo-500/30 flex flex-col shadow-[-12px_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-slate-100"
          >
            {/* Drawer Header */}
            <header className="p-4 border-b border-indigo-500/20 bg-[#0c1326]/90 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                {/* 3D Robot Mascot Icon */}
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-cyan-500/20 shrink-0">
                  <div className="w-full h-full rounded-2xl bg-[#070b14] flex items-center justify-center overflow-hidden">
                    <img
                      src="/assets/aistudio/file_000000003568821099a576100a447aeb_93e3c615.png"
                      alt="AI Robot"
                      className="w-full h-full object-cover scale-110"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#070b14]" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                      <span>KITESTAI Yordamchi</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Gemini 3.8 Flash • Real-vaqt AI Ustoz</span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Suhbatni tozalash"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {onNavigateToFullTab && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToFullTab();
                    }}
                    title="To'liq ekranga ochish"
                    className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  title="Yopish"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Quick Prompt Suggestions */}
            <div className="p-3 border-b border-indigo-500/15 bg-[#090f20]/60 shrink-0">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Tezkor savollar:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(p.prompt)}
                    className="text-[11px] font-semibold py-1 px-2.5 rounded-xl bg-white/5 hover:bg-indigo-600/30 border border-indigo-500/20 hover:border-indigo-400/60 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed relative group ${
                        isUser
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20 rounded-tr-xs'
                          : 'bg-[#0f172e] border border-indigo-500/25 text-slate-200 shadow-md rounded-tl-xs'
                      }`}
                    >
                      {/* Copy Message Action */}
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.text, msg.id)}
                        className="absolute top-2 right-2 p-1 rounded-md bg-black/40 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Nusxa olish"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Content with Code block and bold formatting */}
                      <div className="space-y-2 whitespace-pre-wrap break-words">
                        {msg.text}
                      </div>

                      <div
                        className={`text-[9px] mt-1.5 text-right font-mono ${
                          isUser ? 'text-purple-200' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-700/60 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="py-2.5 px-4 rounded-2xl bg-[#0f172e] border border-indigo-500/25 flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-1 text-[11px] font-medium text-slate-300">
                      KITESTAI o'ylamoqda...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-indigo-500/20 bg-[#090f20]/95 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Savolingizni yozing (Matematika, Kod, Testlar)..."
                    className="w-full py-2.5 px-3.5 rounded-2xl bg-[#0f172e] border border-indigo-500/30 focus:border-cyan-400 text-xs text-white placeholder-slate-400 focus:outline-none resize-none transition-all shadow-inner"
                  />
                  <div className="absolute right-2 bottom-2 text-[10px] text-slate-500 pointer-events-none hidden sm:block">
                    Enter ↵
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-3 rounded-2xl font-black text-white flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/30 scale-100 hover:scale-105'
                      : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  }`}
                  title="Yuborish"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
