import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import {
  connectGoogleWorkspacePopup,
  getWorkspaceAccessToken,
  getFirebaseIdToken,
  initWorkspaceAuth,
} from '../firebase';
import { playKitestSound } from './KitestEmblem';
import {
  HardDrive,
  Mail,
  StickyNote,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Pin,
  PinOff,
  Edit3,
  Save,
  X,
  CloudUpload,
  ShieldAlert,
  Inbox,
  FileText,
  Folder,
  Loader2,
} from 'lucide-react';

interface GoogleWorkspaceHubViewProps {
  currentUser: User | null;
  soundEnabled?: boolean;
  onRequireLogin: () => void;
}

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  labelIds?: string[];
}

interface SqlNoteItem {
  id: number;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  driveFileId?: string;
  updatedAt?: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
}

const NOTE_COLOR_CLASSES: Record<string, string> = {
  slate: 'bg-[#0f172a]/90 border-indigo-500/25',
  indigo: 'bg-indigo-950/60 border-indigo-400/40',
  emerald: 'bg-emerald-950/50 border-emerald-400/40',
  amber: 'bg-amber-950/50 border-amber-400/40',
  rose: 'bg-rose-950/50 border-rose-400/40',
};

export const GoogleWorkspaceHubView: React.FC<GoogleWorkspaceHubViewProps> = ({
  currentUser,
  soundEnabled = true,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'drive' | 'gmail'>('notes');
  const [accessToken, setAccessToken] = useState<string | null>(() => getWorkspaceAccessToken());
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);
  const [workspaceEmail, setWorkspaceEmail] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Notes (Keep-style backed by Cloud SQL + Drive Sync)
  const [notes, setNotes] = useState<SqlNoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState('indigo');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [savingNote, setSavingNote] = useState(false);

  // Google Drive
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [driveSearch, setDriveSearch] = useState('');
  const [driveLoading, setDriveLoading] = useState(false);
  const [newDriveFileName, setNewDriveFileName] = useState('');
  const [newDriveFileContent, setNewDriveFileContent] = useState('');
  const [showCreateDriveModal, setShowCreateDriveModal] = useState(false);

  // Gmail
  const [gmailMessages, setGmailMessages] = useState<GmailMessageItem[]>([]);
  const [gmailSearch, setGmailSearch] = useState('');
  const [gmailLoading, setGmailLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessageItem | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Status & Mandatory Confirmation Dialog
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  useEffect(() => {
    const unsub = initWorkspaceAuth(
      async (fbUser, token) => {
        setAccessToken(token);
        setWorkspaceEmail(fbUser.email);
        const idTok = await fbUser.getIdToken().catch(() => null);
        if (idTok) setFirebaseIdToken(idTok);
      },
      () => {
        setAccessToken(getWorkspaceAccessToken());
      }
    );
    getFirebaseIdToken().then((t) => {
      if (t) setFirebaseIdToken(t);
    });
    return () => unsub();
  }, []);

  const handleConnectGoogleWorkspace = async () => {
    setIsConnecting(true);
    setStatusBanner(null);
    playKitestSound('click', soundEnabled);
    try {
      const { user, accessToken: token, idToken } = await connectGoogleWorkspacePopup();
      setAccessToken(token);
      setFirebaseIdToken(idToken);
      setWorkspaceEmail(user.email);
      playKitestSound('victory', soundEnabled);
      showToast('success', `${user.email} Google Workspace bilan muvaffaqiyatli ulandi!`);
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (!msg.includes('popup-closed-by-user')) {
        showToast('error', msg || 'Google Workspace ulanishida xatolik yuz berdi');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Load Cloud SQL Notes
  const fetchSqlNotes = useCallback(async () => {
    const idToken = firebaseIdToken || (await getFirebaseIdToken());
    if (!idToken) return;
    setNotesLoading(true);
    try {
      const res = await fetch('/api/workspace/notes', {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.notes)) {
        setNotes(data.notes);
      } else if (!res.ok) {
        showToast('error', data.error || 'Eslatmalarni yuklashda xatolik');
      }
    } catch {
      showToast('error', 'Server bilan bog‘lanishda xatolik');
    } finally {
      setNotesLoading(false);
    }
  }, [firebaseIdToken]);

  // Load Google Drive files
  const fetchDriveFiles = useCallback(async () => {
    if (!accessToken) return;
    setDriveLoading(true);
    try {
      const q = driveSearch.trim()
        ? `trashed = false and name contains '${driveSearch.trim().replace(/'/g, "\\'")}'`
        : 'trashed = false';
      const res = await fetch(`/api/workspace/drive/files?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.files)) {
        setDriveFiles(data.files);
      } else {
        showToast('error', data.error || 'Google Drive fayllarini olishda xatolik');
      }
    } catch {
      showToast('error', 'Google Drive bilan aloqa uzildi');
    } finally {
      setDriveLoading(false);
    }
  }, [accessToken, driveSearch]);

  // Load Gmail messages
  const fetchGmailMessages = useCallback(async () => {
    if (!accessToken) return;
    setGmailLoading(true);
    try {
      const q = gmailSearch.trim() ? `?q=${encodeURIComponent(gmailSearch.trim())}` : '';
      const res = await fetch(`/api/workspace/gmail/messages${q}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setGmailMessages(data.messages);
      } else {
        showToast('error', data.error || 'Gmail xabarlarini olishda xatolik');
      }
    } catch {
      showToast('error', 'Gmail bilan aloqa uzildi');
    } finally {
      setGmailLoading(false);
    }
  }, [accessToken, gmailSearch]);

  useEffect(() => {
    if (firebaseIdToken && activeSubTab === 'notes') {
      fetchSqlNotes();
    }
  }, [firebaseIdToken, activeSubTab, fetchSqlNotes]);

  useEffect(() => {
    if (accessToken && activeSubTab === 'drive') {
      fetchDriveFiles();
    }
  }, [accessToken, activeSubTab, fetchDriveFiles]);

  useEffect(() => {
    if (accessToken && activeSubTab === 'gmail') {
      fetchGmailMessages();
    }
  }, [accessToken, activeSubTab, fetchGmailMessages]);

  // Create or Update Note in Cloud SQL
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToken = firebaseIdToken || (await getFirebaseIdToken());
    if (!idToken) {
      showToast('error', 'Avval Google hisobingizni ulang!');
      return;
    }
    if (!noteTitle.trim() && !noteContent.trim()) {
      showToast('error', 'Sarlavha yoki eslatma matnini kiriting');
      return;
    }
    setSavingNote(true);
    try {
      if (editingNoteId) {
        const res = await fetch(`/api/workspace/notes/${editingNoteId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            title: noteTitle.trim(),
            content: noteContent.trim(),
            color: noteColor,
          }),
        });
        const data = await res.json();
        if (res.ok && data.note) {
          setNotes((prev) => prev.map((n) => (n.id === editingNoteId ? data.note : n)));
          setEditingNoteId(null);
          setNoteTitle('');
          setNoteContent('');
          playKitestSound('success', soundEnabled);
          showToast('success', 'Eslatma Cloud SQL bazasida yangilandi');
        } else {
          showToast('error', data.error || 'Yangilashda xatolik');
        }
      } else {
        const res = await fetch('/api/workspace/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            title: noteTitle.trim() || 'KITEST Eslatma',
            content: noteContent.trim(),
            color: noteColor,
          }),
        });
        const data = await res.json();
        if (res.ok && data.note) {
          setNotes((prev) => [data.note, ...prev]);
          setNoteTitle('');
          setNoteContent('');
          playKitestSound('success', soundEnabled);
          showToast('success', 'Eslatma Cloud SQL bazasiga saqlandi');
        } else {
          showToast('error', data.error || 'Saqlashda xatolik');
        }
      }
    } catch {
      showToast('error', 'Server bilan aloqa xatoligi');
    } finally {
      setSavingNote(false);
    }
  };

  const handleTogglePinNote = async (note: SqlNoteItem) => {
    const idToken = firebaseIdToken || (await getFirebaseIdToken());
    if (!idToken) return;
    try {
      const res = await fetch(`/api/workspace/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isPinned: !note.isPinned }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        fetchSqlNotes();
      }
    } catch {}
  };

  const requestDeleteNote = (note: SqlNoteItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eslatmani o‘chirishni tasdiqlaysizmi?',
      description: `"${note.title}" eslatmasi Cloud SQL bazasidan butunlay o‘chiriladi.`,
      confirmLabel: 'Ha, o‘chirish',
      danger: true,
      onConfirm: async () => {
        const idToken = firebaseIdToken || (await getFirebaseIdToken());
        if (!idToken) return;
        const res = await fetch(`/api/workspace/notes/${note.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          setNotes((prev) => prev.filter((n) => n.id !== note.id));
          playKitestSound('click', soundEnabled);
          showToast('success', 'Eslatma o‘chirildi');
        } else {
          showToast('error', 'Eslatmani o‘chirishda xatolik');
        }
      },
    });
  };

  const handleBackupNoteToDrive = async (note: SqlNoteItem) => {
    if (!accessToken) {
      showToast('error', 'Avval Google Drive ulanishini tasdiqlang');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Eslatmani Google Drive-ga yuklash',
      description: `"${note.title}.txt" fayli Google Drive hisobingizga saqlanadi.`,
      confirmLabel: 'Drive-ga saqlash',
      danger: false,
      onConfirm: async () => {
        const res = await fetch('/api/workspace/drive/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: `${note.title.replace(/[^\w\s-]/g, '_') || 'KITEST_Note'}.txt`,
            content: `${note.title}\n\n${note.content}`,
          }),
        });
        const data = await res.json();
        if (res.ok && data.file) {
          playKitestSound('success', soundEnabled);
          showToast('success', `"${data.file.name}" Google Drive-ga saqlandi!`);
        } else {
          showToast('error', data.error || 'Drive-ga yuklashda xatolik');
        }
      },
    });
  };

  const requestCreateDriveFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriveFileName.trim()) {
      showToast('error', 'Fayl nomini kiriting');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Google Drive-da yangi fayl yaratish',
      description: `Google Drive hisobingizda "${newDriveFileName.trim()}" nomli yangi fayl yaratiladi.`,
      confirmLabel: 'Yaratish',
      danger: false,
      onConfirm: async () => {
        const res = await fetch('/api/workspace/drive/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: newDriveFileName.trim(),
            content: newDriveFileContent,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setShowCreateDriveModal(false);
          setNewDriveFileName('');
          setNewDriveFileContent('');
          playKitestSound('success', soundEnabled);
          showToast('success', 'Fayl Google Drive-da yaratildi!');
          fetchDriveFiles();
        } else {
          showToast('error', data.error || 'Fayl yaratishda xatolik');
        }
      },
    });
  };

  const requestDeleteDriveFile = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Google Drive faylini o‘chirish',
      description: `Siz haqiqatan ham "${file.name}" faylini Google Drive-dan o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.`,
      confirmLabel: 'Ha, o‘chirish',
      danger: true,
      onConfirm: async () => {
        const res = await fetch(`/api/workspace/drive/files/${encodeURIComponent(file.id)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
          playKitestSound('click', soundEnabled);
          showToast('success', `"${file.name}" Drive-dan o‘chirildi`);
        } else {
          const data = await res.json().catch(() => ({}));
          showToast('error', data.error || 'Faylni o‘chirishda xatolik');
        }
      },
    });
  };

  const requestSendGmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      showToast('error', 'Qabul qiluvchi, mavzu va xabar matnini to‘liq kiriting');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Gmail orqali xabar yuborishni tasdiqlang',
      description: `"${composeTo.trim()}" manziliga "${composeSubject.trim()}" mavzusi bilan haqiqiy email yuboriladi.`,
      confirmLabel: 'Ha, yuborish',
      danger: false,
      onConfirm: async () => {
        const res = await fetch('/api/workspace/gmail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            to: composeTo.trim(),
            subject: composeSubject.trim(),
            body: composeBody.trim(),
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setShowComposeModal(false);
          setComposeTo('');
          setComposeSubject('');
          setComposeBody('');
          playKitestSound('victory', soundEnabled);
          showToast('success', 'Email Gmail orqali muvaffaqiyatli yuborildi!');
          fetchGmailMessages();
        } else {
          showToast('error', data.error || 'Email yuborishda xatolik');
        }
      },
    });
  };

  const requestTrashEmail = (msg: GmailMessageItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Emailni Savatchaga (Trash) o‘tkazish',
      description: `"${msg.subject}" xabari Gmail savatchasiga o‘tkaziladi.`,
      confirmLabel: 'Savatchaga o‘tkazish',
      danger: true,
      onConfirm: async () => {
        const res = await fetch(`/api/workspace/gmail/messages/${encodeURIComponent(msg.id)}/trash`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.ok) {
          setGmailMessages((prev) => prev.filter((m) => m.id !== msg.id));
          if (selectedEmail?.id === msg.id) setSelectedEmail(null);
          playKitestSound('click', soundEnabled);
          showToast('success', 'Xabar savatchaga o‘tkazildi');
        } else {
          showToast('error', 'Xabarni o‘chirishda xatolik');
        }
      },
    });
  };

  const executeConfirmDialog = async () => {
    if (!confirmDialog) return;
    setConfirmBusy(true);
    try {
      await confirmDialog.onConfirm();
    } finally {
      setConfirmBusy(false);
      setConfirmDialog(null);
    }
  };

  const needsGoogleAuth = !firebaseIdToken || !accessToken;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-[#170e38] via-[#111936] to-[#0c1a38] border border-indigo-500/30 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Google Workspace & Cloud Eslatmalar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Google Drive fayllari, Gmail xabarlari va Cloud SQL (Keep uslubidagi) o‘quv eslatmalari yagona markazda.
          </p>
          {workspaceEmail && (
            <p className="text-xs text-emerald-400 font-mono">
              Ulangan hisob: {workspaceEmail}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {needsGoogleAuth ? (
            <div className="w-full sm:w-auto min-w-[230px]">
              <button
                type="button"
                disabled={isConnecting}
                onClick={handleConnectGoogleWorkspace}
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
                    {isConnecting ? 'Ulanmoqda...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogleWorkspace}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white flex items-center gap-2 cursor-pointer kitest-btn-press"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
              <span>Hisobni yangilash</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <AnimatePresence>
        {statusBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 ${
              statusBanner.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusBanner.text}</span>
            </div>
            <button type="button" onClick={() => setStatusBanner(null)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/20 w-fit">
        <button
          type="button"
          onClick={() => setActiveSubTab('notes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/10'
          }`}
        >
          <StickyNote className="w-4 h-4" />
          <span>Keep Eslatmalar (Cloud SQL)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('drive')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'drive'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/10'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gmail')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'gmail'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-white/10'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail</span>
        </button>
      </div>

      {/* TAB 1: KEEP-STYLE NOTES IN CLOUD SQL */}
      {activeSubTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Note Editor */}
          <form
            onSubmit={handleSaveNote}
            className="lg:col-span-4 rounded-3xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 p-5 space-y-4 shadow-lg h-fit"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editingNoteId ? 'Eslatmani tahrirlash' : 'Yangi Eslatma (Cloud SQL)'}
              </h2>
              {editingNoteId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Bekor qilish
                </button>
              )}
            </div>

            {!firebaseIdToken ? (
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Eslatmalarni Cloud SQL PostgreSQL bazasiga saqlash va Google Drive-ga sinxronlash uchun Google hisobingiz bilan kiring.
                </p>
                <button
                  type="button"
                  onClick={handleConnectGoogleWorkspace}
                  className="gsi-material-button"
                >
                  <div className="gsi-material-button-content-wrapper">
                    <span>Google bilan ulanish</span>
                  </div>
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Eslatma sarlavhasi..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
                <textarea
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Dars konspekti, g‘oya yoki vazifa matnini yozing..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {['slate', 'indigo', 'emerald', 'amber', 'rose'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNoteColor(c)}
                        className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform ${
                          noteColor === c ? 'scale-110 border-white' : 'border-transparent opacity-70'
                        } ${
                          c === 'slate'
                            ? 'bg-slate-700'
                            : c === 'indigo'
                            ? 'bg-indigo-600'
                            : c === 'emerald'
                            ? 'bg-emerald-600'
                            : c === 'amber'
                            ? 'bg-amber-600'
                            : 'bg-rose-600'
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
                  >
                    {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingNoteId ? 'Yangilash' : 'Saqlash'}</span>
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Notes List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Saqlangan Eslatmalar ({notes.length})
              </h3>
              {firebaseIdToken && (
                <button
                  type="button"
                  onClick={fetchSqlNotes}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${notesLoading ? 'animate-spin' : ''}`} />
                  <span>Yangilash</span>
                </button>
              )}
            </div>

            {notesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                <StickyNote className="w-8 h-8 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Hozircha eslatmalar yo‘q
                </p>
                <p className="text-xs text-slate-500">
                  Chap tarafdagi forma orqali birinchi eslatmangizni yarating — u Cloud SQL bazasida saqlanadi.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-2xl border p-4 space-y-3 text-white kitest-card-3d ${
                      NOTE_COLOR_CLASSES[n.color] || NOTE_COLOR_CLASSES.slate
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-white line-clamp-1">{n.title}</h4>
                      <button
                        type="button"
                        onClick={() => handleTogglePinNote(n)}
                        className="p-1 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
                        title={n.isPinned ? 'Qadoqdan olish' : 'Yuqoriga qadash'}
                      >
                        {n.isPinned ? <Pin className="w-3.5 h-3.5 text-amber-400" /> : <PinOff className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                      {n.content}
                    </p>
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(n.id);
                            setNoteTitle(n.title);
                            setNoteContent(n.content);
                            setNoteColor(n.color || 'slate');
                          }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBackupNoteToDrive(n)}
                          className="p-1.5 rounded-lg hover:bg-sky-500/20 text-sky-300 cursor-pointer"
                          title="Google Drive-ga saqlash"
                        >
                          <CloudUpload className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => requestDeleteNote(n)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE DRIVE */}
      {activeSubTab === 'drive' && (
        <div className="rounded-3xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 p-5 sm:p-6 space-y-5 shadow-lg">
          {!accessToken ? (
            <div className="py-10 text-center max-w-md mx-auto space-y-4">
              <HardDrive className="w-12 h-12 mx-auto text-sky-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Google Drive-ni ulang
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google Drive fayllaringizni ko‘rish, qidirish va KITEST eslatmalaringizni Drive-ga saqlash uchun Google ruxsatini bering.
              </p>
              <button
                type="button"
                onClick={handleConnectGoogleWorkspace}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-content-wrapper">
                  <span>Sign in with Google (Drive)</span>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={driveSearch}
                    onChange={(e) => setDriveSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchDriveFiles()}
                    placeholder="Google Drive fayllaridan qidirish..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchDriveFiles}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${driveLoading ? 'animate-spin' : ''}`} />
                    <span>Yangilash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateDriveModal(true)}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yangi Fayl</span>
                  </button>
                </div>
              </div>

              {driveLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              ) : driveFiles.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Folder className="w-10 h-10 mx-auto text-slate-400" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Fayllar topilmadi</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {driveFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
                          {file.mimeType.includes('folder') ? (
                            <Folder className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {file.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString('uz-UZ')
                              : 'Drive fayli'}
                            {file.size ? ` · ${(Number(file.size) / 1024).toFixed(1)} KB` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl hover:bg-sky-500/15 text-sky-500 cursor-pointer"
                            title="Google Drive-da ochish"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => requestDeleteDriveFile(file)}
                          className="p-2 rounded-xl hover:bg-rose-500/15 text-rose-500 cursor-pointer"
                          title="Faylni o‘chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 3: GMAIL */}
      {activeSubTab === 'gmail' && (
        <div className="rounded-3xl bg-white dark:bg-[#0d1428] border border-slate-200 dark:border-indigo-500/25 p-5 sm:p-6 space-y-5 shadow-lg">
          {!accessToken ? (
            <div className="py-10 text-center max-w-md mx-auto space-y-4">
              <Mail className="w-12 h-12 mx-auto text-rose-400" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Gmail hisobingizni ulang
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelgan xabarlarni o‘qish va xat yuborish uchun Google ruxsatini tasdiqlang.
              </p>
              <button
                type="button"
                onClick={handleConnectGoogleWorkspace}
                className="gsi-material-button"
              >
                <div className="gsi-material-button-content-wrapper">
                  <span>Sign in with Google (Gmail)</span>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={gmailSearch}
                    onChange={(e) => setGmailSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchGmailMessages()}
                    placeholder="Gmail xabarlaridan qidirish..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchGmailMessages}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gmailLoading ? 'animate-spin' : ''}`} />
                    <span>Yangilash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowComposeModal(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer kitest-btn-press"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Xat yozish</span>
                  </button>
                </div>
              </div>

              {gmailLoading ? (
                <div className="space-y-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              ) : gmailMessages.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Inbox className="w-10 h-10 mx-auto text-slate-400" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Xabarlar topilmadi</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-6 divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto">
                    {gmailMessages.map((msg) => (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedEmail(msg)}
                        className={`p-3.5 cursor-pointer transition-colors ${
                          selectedEmail?.id === msg.id
                            ? 'bg-indigo-600/15'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {msg.from}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              requestTrashEmail(msg);
                            }}
                            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                            title="Savatchaga o‘tkazish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-indigo-500 dark:text-indigo-300 truncate mt-0.5">
                          {msg.subject}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {msg.snippet}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900/60">
                    {selectedEmail ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                            {selectedEmail.subject}
                          </h4>
                          <button
                            type="button"
                            onClick={() => requestTrashEmail(selectedEmail)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>O‘chirish</span>
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3 space-y-0.5">
                          <div>Kimdan: <strong className="text-slate-800 dark:text-slate-200">{selectedEmail.from}</strong></div>
                          <div>Sana: <span className="font-mono">{selectedEmail.date}</span></div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {selectedEmail.snippet}
                        </p>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-500 py-16">
                        O‘qish uchun chap tomondan xabarni tanlang
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Drive File Modal */}
      {showCreateDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={requestCreateDriveFile}
            className="w-full max-w-md rounded-3xl bg-[#0d1428] border border-sky-500/30 p-6 space-y-4 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">Google Drive-da yangi fayl</h3>
              <button type="button" onClick={() => setShowCreateDriveModal(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={newDriveFileName}
              onChange={(e) => setNewDriveFileName(e.target.value)}
              placeholder="Fayl nomi (masalan: Matematika_Konspekt.txt)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500"
            />
            <textarea
              rows={5}
              value={newDriveFileContent}
              onChange={(e) => setNewDriveFileContent(e.target.value)}
              placeholder="Fayl matni..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowCreateDriveModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold cursor-pointer">
                Bekor qilish
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold cursor-pointer">
                Davom etish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compose Gmail Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={requestSendGmail}
            className="w-full max-w-lg rounded-3xl bg-[#0d1428] border border-rose-500/30 p-6 space-y-4 text-white shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">Gmail orqali xat yuborish</h3>
              <button type="button" onClick={() => setShowComposeModal(false)} className="p-1 hover:bg-white/10 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="email"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              placeholder="Kimga (Email manzil)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Mavzu"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <textarea
              rows={5}
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Xabar matni..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowComposeModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold cursor-pointer">
                Bekor qilish
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" />
                <span>Yuborish</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mandatory User Confirmation Dialog for Destructive / Mutating Operations */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#0d1428] border border-amber-500/40 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${confirmDialog.danger ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold">{confirmDialog.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={executeConfirmDialog}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                  confirmDialog.danger
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {confirmBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
