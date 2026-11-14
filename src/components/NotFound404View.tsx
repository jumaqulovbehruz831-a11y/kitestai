import React from 'react';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search, UserX } from 'lucide-react';

interface NotFound404ViewProps {
  requestedPath: string;
  usernameNotFound?: string;
  onGoHome: () => void;
  onGoBack: () => void;
  onGoUsers: () => void;
}

export const NotFound404View: React.FC<NotFound404ViewProps> = ({
  requestedPath,
  usernameNotFound,
  onGoHome,
  onGoBack,
  onGoUsers,
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#0d1324]/95 border border-slate-200 dark:border-indigo-500/25 p-8 text-center shadow-2xl space-y-6"
      >
        <div className="w-20 h-20 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
          <UserX className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-rose-500">
            404 · Sahifa Topilmadi
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-balance">
            {usernameNotFound
              ? `@${usernameNotFound} foydalanuvchisi topilmadi`
              : 'Kechirasiz, bunday sahifa mavjud emas'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {usernameNotFound ? (
              <>
                Siz izlagan <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-rose-500 font-mono text-xs">/@{usernameNotFound}</code> profili tizimda ro‘yxatdan o‘tmagan yoki username o‘zgartirilgan bo‘lishi mumkin.
              </>
            ) : (
              <>
                Manzil <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500 font-mono text-xs">{requestedPath}</code> noto‘g‘ri kiritilgan yoki o‘chirilgan.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onGoBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer kitest-btn-press"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifaga</span>
          </button>

          <button
            type="button"
            onClick={onGoUsers}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer kitest-btn-press"
          >
            <Search className="w-4 h-4" />
            <span>Foydalanuvchilar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
