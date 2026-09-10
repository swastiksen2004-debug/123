import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  CheckSquare,
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Lock,
  User,
  ArrowLeft,
  LogOut,
  X,
  Check,
  AlertTriangle,
  Layers,
  Key,
  Calendar,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Upload,
  Database,
  RefreshCw,
  Cloud,
  FileText,
  Download,
  FileUp,
  Paperclip,
  Eye,
} from 'lucide-react';
import {
  SchoolClass,
  ALL_CLASSES,
  CLASS_PINS,
  SubjectSlot,
  ClassSubjectsMap,
  Note,
  Homework,
  SchoolNotice,
  HomeworkPriority,
  NoticeTarget,
} from '../types';
import { StorageService } from '../utils/storage';
import { formatDate, getTodayDateString } from '../utils/date';
import { FirebaseSync, CloudSyncStatus } from '../utils/firebaseSync';
import { downloadAppZip } from '../utils/exportZip';

interface AdminPortalProps {
  notes: Note[];
  homework: Homework[];
  notices: SchoolNotice[];
  subjectsMap: ClassSubjectsMap;
  onRefreshData: () => void;
  onExitAdmin: () => void;
  cloudStatus?: CloudSyncStatus;
}

type AdminSubTab = 'subjects' | 'notes' | 'homework' | 'notices' | 'pins';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  notes,
  homework,
  notices,
  subjectsMap,
  onRefreshData,
  onExitAdmin,
  cloudStatus,
}) => {
  const [isAdminAuth, setIsAdminAuth] = useState(StorageService.isAdminLoggedIn());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadAppZip();
    } catch (err) {
      console.error('Failed to download ZIP:', err);
      alert('Failed to generate ZIP. Please check console.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Currently selected class in Admin portal
  const [selectedAdminClass, setSelectedAdminClass] = useState<SchoolClass>('Std 2');
  const [adminTab, setAdminTab] = useState<AdminSubTab>('subjects');

  // Search query inside admin tables
  const [adminSearch, setAdminSearch] = useState('');

  // Subject Slot Edit Modal
  const [slotEditModal, setSlotEditModal] = useState<{
    isOpen: boolean;
    class: SchoolClass;
    slotId: number;
    name: string;
  }>({
    isOpen: false,
    class: 'Std 2',
    slotId: 1,
    name: '',
  });

  // Note Modal
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    note: Note;
  }>({
    isOpen: false,
    isEdit: false,
    note: {
      id: '',
      class: 'Std 2',
      subject: 'Mathematics',
      title: '',
      content: '',
      date: getTodayDateString(),
    },
  });

  // Homework Modal
  const [homeworkModal, setHomeworkModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    item: Homework;
  }>({
    isOpen: false,
    isEdit: false,
    item: {
      id: '',
      class: 'Std 2',
      subject: 'Mathematics',
      title: '',
      description: '',
      instructions: '',
      assignedDate: getTodayDateString(),
      dueDate: getTodayDateString(),
      priority: 'Medium',
      completed: false,
      attachment: '',
    },
  });

  // Notice Modal
  const [noticeModal, setNoticeModal] = useState<{
    isOpen: boolean;
    isEdit: boolean;
    notice: SchoolNotice;
  }>({
    isOpen: false,
    isEdit: false,
    notice: {
      id: '',
      title: '',
      content: '',
      date: getTodayDateString(),
      targetClass: 'All Classes',
    },
  });

  // 1. Auth Handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (username.trim() === 'admin' && password === 'KBSSNT') {
      StorageService.setAdminLoggedIn(true);
      setIsAdminAuth(true);
    } else {
      setLoginError('Invalid credentials. Please enter valid admin credentials.');
    }
  };

  const handleAdminLogout = () => {
    StorageService.setAdminLoggedIn(false);
    setIsAdminAuth(false);
  };

  // 2. Subject Slot Handlers
  const handleOpenEditSlot = (slot: SubjectSlot) => {
    setSlotEditModal({
      isOpen: true,
      class: selectedAdminClass,
      slotId: slot.id,
      name: slot.name,
    });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSubjectSlot(
      slotEditModal.class,
      slotEditModal.slotId,
      slotEditModal.name
    );
    onRefreshData();
    setSlotEditModal({ ...slotEditModal, isOpen: false });
  };

  // 3. Note Handlers
  const handleOpenAddNote = () => {
    const slots = subjectsMap[selectedAdminClass] || [];
    const firstNamed = slots.find((s) => s.name.trim())?.name || 'Mathematics';
    setNoteModal({
      isOpen: true,
      isEdit: false,
      note: {
        id: `note-${Date.now()}`,
        class: selectedAdminClass,
        subject: firstNamed,
        title: '',
        content: '',
        date: getTodayDateString(),
      },
    });
  };

  const handleOpenEditNote = (note: Note) => {
    setNoteModal({
      isOpen: true,
      isEdit: true,
      note: { ...note },
    });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModal.note.title.trim() || !noteModal.note.content.trim()) return;
    StorageService.upsertNote(noteModal.note, noteModal.isEdit);
    onRefreshData();
    setNoteModal({ ...noteModal, isOpen: false });
  };

  const handleDeleteNote = (id: string, title: string) => {
    if (confirm(`Delete note "${title}"?`)) {
      StorageService.deleteNote(id);
      onRefreshData();
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const handleNoteFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize = formatFileSize(file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setNoteModal((prev) => ({
            ...prev,
            note: {
              ...prev.note,
              title: prev.note.title.trim() ? prev.note.title : autoTitle,
              content: prev.note.content.trim()
                ? prev.note.content
                : `Attached study material: ${file.name}. Tap to download or view the document.`,
              fileUrl: reader.result as string,
              fileName: file.name,
              fileSize: formattedSize,
              fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
            },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectNoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formattedSize = formatFileSize(file.size);
      const slots = subjectsMap[selectedAdminClass] || [];
      const firstNamed = slots.find((s) => s.name.trim())?.name || 'General';
      const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNoteModal({
            isOpen: true,
            isEdit: false,
            note: {
              id: `note-${Date.now()}`,
              class: selectedAdminClass,
              subject: firstNamed,
              title: autoTitle,
              content: `Attached study material: ${file.name}. Tap to download or view the document.`,
              date: getTodayDateString(),
              fileUrl: reader.result as string,
              fileName: file.name,
              fileSize: formattedSize,
              fileType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
            },
          });
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // 4. Homework Handlers
  const handleOpenAddHomework = () => {
    const slots = subjectsMap[selectedAdminClass] || [];
    const firstNamed = slots.find((s) => s.name.trim())?.name || 'Mathematics';
    setHomeworkModal({
      isOpen: true,
      isEdit: false,
      item: {
        id: `hw-${Date.now()}`,
        class: selectedAdminClass,
        subject: firstNamed,
        title: '',
        description: '',
        instructions: '',
        assignedDate: getTodayDateString(),
        dueDate: getTodayDateString(),
        priority: 'Medium',
        completed: false,
        attachment: '',
      },
    });
  };

  const handleOpenEditHomework = (item: Homework) => {
    setHomeworkModal({
      isOpen: true,
      isEdit: true,
      item: { ...item },
    });
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeworkModal.item.title.trim()) return;
    StorageService.upsertHomework(homeworkModal.item, homeworkModal.isEdit);
    onRefreshData();
    setHomeworkModal({ ...homeworkModal, isOpen: false });
  };

  const handleDeleteHomework = (id: string, title: string) => {
    if (confirm(`Delete homework "${title}"?`)) {
      StorageService.deleteHomework(id);
      onRefreshData();
    }
  };

  // Handle local image file upload -> convert to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setHomeworkModal((prev) => ({
            ...prev,
            item: { ...prev.item, attachment: reader.result as string },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 5. Notice Handlers
  const handleOpenAddNotice = () => {
    setNoticeModal({
      isOpen: true,
      isEdit: false,
      notice: {
        id: `notice-${Date.now()}`,
        title: '',
        content: '',
        date: getTodayDateString(),
        targetClass: selectedAdminClass,
      },
    });
  };

  const handleOpenEditNotice = (notice: SchoolNotice) => {
    setNoticeModal({
      isOpen: true,
      isEdit: true,
      notice: { ...notice },
    });
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeModal.notice.title.trim() || !noticeModal.notice.content.trim()) return;
    StorageService.upsertNotice(noticeModal.notice, noticeModal.isEdit);
    onRefreshData();
    setNoticeModal({ ...noticeModal, isOpen: false });
  };

  const handleDeleteNotice = (id: string, title: string) => {
    if (confirm(`Delete notice "${title}"?`)) {
      StorageService.deleteNotice(id);
      onRefreshData();
    }
  };

  // Current class subject slots
  const currentClassSlots = subjectsMap[selectedAdminClass] || [];

  // Filtered Notes for Admin table
  const classNotes = useMemo(() => {
    return notes.filter((n) => n.class === selectedAdminClass);
  }, [notes, selectedAdminClass]);

  // Filtered Homework for Admin table
  const classHomework = useMemo(() => {
    return homework.filter((h) => h.class === selectedAdminClass);
  }, [homework, selectedAdminClass]);

  // Filtered Notices for Admin table
  const classNotices = useMemo(() => {
    return notices.filter(
      (n) => n.targetClass === 'All Classes' || n.targetClass === selectedAdminClass
    );
  }, [notices, selectedAdminClass]);

  // 1. IF NOT LOGGED IN AS ADMIN: Show Password Screen
  if (!isAdminAuth) {
    return (
      <div className="py-6 space-y-5 max-w-sm mx-auto">
        <button
          onClick={onExitAdmin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Portal</span>
        </button>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Staff & Admin Portal
              </h2>
              <p className="text-xs text-slate-500">
                KBSSN Teacher & Management Access
              </p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>ACCESS ADMIN DASHBOARD</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. ADMIN DASHBOARD
  return (
    <div className="space-y-4 pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-700 p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/school-logo.png"
              alt="KBSSN Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="font-black text-sm leading-tight text-white">
              KBSSN Management
            </h2>
            <span className="text-[10px] text-amber-400 font-semibold">
              KARTIK BIDYANTA SMRITI SISHU NIKETAN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition border border-emerald-600 flex items-center gap-1 shadow-xs disabled:opacity-50"
            title="Download full project & data ZIP archive"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDownloadingZip ? 'Zipping...' : 'Download ZIP'}</span>
            <span className="sm:hidden">ZIP</span>
          </button>
          <button
            onClick={onExitAdmin}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Student View
          </button>
          <button
            onClick={handleAdminLogout}
            className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl transition border border-red-800"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Firebase Cloud Database Status Card */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-4 shadow-sm space-y-2 border border-blue-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Firebase Firestore Database</h3>
              <div className="flex items-center gap-1.5 text-[10.5px]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cloudStatus?.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={
                    cloudStatus?.isConnected ? 'text-emerald-300 font-semibold' : 'text-amber-300'
                  }
                >
                  {cloudStatus?.isConnected ? 'Cloud Connected & Live' : 'Connecting to Cloud...'}
                </span>
                {cloudStatus?.lastSyncTime && (
                  <span className="text-slate-400 text-[10px]">
                    • Last synced {cloudStatus.lastSyncTime}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              setIsSyncingCloud(true);
              await FirebaseSync.syncAllLocalToCloud();
              onRefreshData();
              setTimeout(() => setIsSyncingCloud(false), 800);
            }}
            disabled={isSyncingCloud}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            title="Upload and sync current data to Firebase Firestore"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud'}</span>
          </button>
        </div>
        <div className="text-[10px] text-blue-200/80 font-mono bg-blue-950/70 rounded-xl px-3 py-1.5 border border-blue-800/40 flex items-center justify-between">
          <span>DB: ai-studio-kbssn</span>
          <span className="text-emerald-300 font-sans font-bold">Realtime Sync Active</span>
        </div>
      </div>

      {/* Class Selector Carousel: exactly 7 classes */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Active Class:
          </span>
          <span className="text-xs font-black text-blue-700">
            {selectedAdminClass}
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
          {ALL_CLASSES.map((cls) => {
            const isSelected = selectedAdminClass === cls;
            return (
              <button
                key={cls}
                onClick={() => setSelectedAdminClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition shadow-2xs ${
                  isSelected
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs: Subjects, Notes, Homework, Notices, Class PINs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/90 rounded-2xl">
        <button
          onClick={() => setAdminTab('subjects')}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center ${
            adminTab === 'subjects'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Subjects</span>
        </button>

        <button
          onClick={() => setAdminTab('notes')}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center ${
            adminTab === 'notes'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Notes</span>
        </button>

        <button
          onClick={() => setAdminTab('homework')}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center ${
            adminTab === 'homework'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Homework</span>
        </button>

        <button
          onClick={() => setAdminTab('notices')}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center ${
            adminTab === 'notices'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Notices</span>
        </button>

        <button
          onClick={() => setAdminTab('pins')}
          className={`py-2 px-1 rounded-xl text-[11px] font-black transition flex flex-col items-center justify-center ${
            adminTab === 'pins'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Class PINs</span>
        </button>
      </div>

      {/* ===================== TAB 1: SUBJECT SLOTS ===================== */}
      {adminTab === 'subjects' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {selectedAdminClass} Subject Slots (10 Total)
              </h3>
              <p className="text-[11px] text-slate-500">
                Rename or clear slots. Changes apply ONLY to {selectedAdminClass}.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {currentClassSlots.map((slot) => {
              const isNamed = slot.name.trim().length > 0;
              return (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs shrink-0">
                      #{slot.id}
                    </span>
                    <div className="min-w-0">
                      <h4
                        className={`font-bold text-xs sm:text-sm truncate ${
                          isNamed ? 'text-slate-900' : 'text-slate-400 italic'
                        }`}
                      >
                        {isNamed ? slot.name : 'Unassigned Slot (Blank)'}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        {isNamed ? 'Active Curriculum Subject' : 'Tap Edit to assign subject name'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEditSlot(slot)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== TAB 2: NOTES ===================== */}
      {adminTab === 'notes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {selectedAdminClass} Notes ({classNotes.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Lesson notes for {selectedAdminClass} students
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <label
                className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 shadow-2xs"
                title="Directly upload PDF, document or image notes"
              >
                <FileUp className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Note File</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,image/*"
                  onChange={handleDirectNoteUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleOpenAddNote}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>
          </div>

          {classNotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No notes created yet for {selectedAdminClass}.</p>
              <p className="text-[11px] text-slate-500">
                Click <strong>"Upload Note File"</strong> to upload a PDF or study document, or <strong>"Add Note"</strong> to type.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {classNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {note.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(note.date)}
                      </span>
                      {note.fileUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>File Attached</span>
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{note.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {note.content}
                    </p>

                    {note.fileUrl && (
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <a
                          href={note.fileUrl}
                          download={note.fileName || `${note.title}.pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-[11px] font-semibold transition"
                          title="Download attached note file"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="truncate max-w-[200px]">
                            {note.fileName || 'Attached Note Document'}
                          </span>
                          {note.fileSize && (
                            <span className="text-slate-400 text-[10px]">
                              ({note.fileSize})
                            </span>
                          )}
                          <Download className="w-3 h-3 text-slate-400 ml-0.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditNote(note)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id, note.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: HOMEWORK ===================== */}
      {adminTab === 'homework' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                {selectedAdminClass} Homework ({classHomework.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Tasks & assignments for {selectedAdminClass}
              </p>
            </div>
            <button
              onClick={handleOpenAddHomework}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Homework</span>
            </button>
          </div>

          {classHomework.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
              No homework created yet for {selectedAdminClass}. Tap "Add Homework".
            </div>
          ) : (
            <div className="space-y-2">
              {classHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {hw.subject}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {hw.priority}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Due: {formatDate(hw.dueDate)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{hw.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {hw.instructions || hw.description}
                    </p>
                    {hw.attachment && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-700 font-semibold">
                        <ImageIcon className="w-3 h-3" />
                        <span>Attachment attached</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditHomework(hw)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Homework"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteHomework(hw.id, hw.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Homework"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: NOTICES ===================== */}
      {adminTab === 'notices' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                School Notices ({notices.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Notices for All Classes or specific classes
              </p>
            </div>
            <button
              onClick={handleOpenAddNotice}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Notice</span>
            </button>
          </div>

          <div className="space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        notice.targetClass === 'All Classes'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {notice.targetClass}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(notice.date)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                    {notice.content}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEditNotice(notice)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                    title="Edit Notice"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(notice.id, notice.title)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Notice"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== TAB 5: CLASS PIN REFERENCE ===================== */}
      {adminTab === 'pins' && (
        <div className="space-y-3">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-black text-slate-900 text-sm">
              Official Class Access PIN Reference
            </h3>
            <p className="text-[11px] text-slate-500">
              Give these pre-assigned Class PINs to respective class teachers and students.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {ALL_CLASSES.map((cls) => (
              <div key={cls} className="p-3.5 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">{cls}</h4>
                  <span className="text-[10px] text-slate-400">
                    Pre-assigned Teacher PIN
                  </span>
                </div>
                <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-xs text-blue-800 select-all">
                  {CLASS_PINS[cls]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== EDIT SUBJECT SLOT MODAL ===================== */}
      {slotEditModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Edit Subject Slot #{slotEditModal.slotId}
                </h3>
                <p className="text-xs text-slate-500">
                  Class: <strong className="text-blue-700">{slotEditModal.class}</strong>
                </p>
              </div>
              <button
                onClick={() => setSlotEditModal({ ...slotEditModal, isOpen: false })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={slotEditModal.name}
                  onChange={(e) =>
                    setSlotEditModal({ ...slotEditModal, name: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g. Mathematics, Bengali, Computer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank if this slot is unassigned.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setSlotEditModal({ ...slotEditModal, name: '' })
                  }
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear Name
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSlotEditModal({ ...slotEditModal, isOpen: false })
                    }
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold"
                  >
                    Save Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== NOTE MODAL ===================== */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {noteModal.isEdit ? 'Edit Note' : 'Add Note'}
              </h3>
              <button
                onClick={() => setNoteModal({ ...noteModal, isOpen: false })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              {/* Class selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Class</label>
                <select
                  value={noteModal.note.class}
                  onChange={(e) =>
                    setNoteModal({
                      ...noteModal,
                      note: { ...noteModal.note, class: e.target.value as SchoolClass },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject selector from class's slots */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <select
                  value={noteModal.note.subject}
                  onChange={(e) =>
                    setNoteModal({
                      ...noteModal,
                      note: { ...noteModal.note, subject: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {(subjectsMap[noteModal.note.class] || [])
                    .filter((s) => s.name.trim())
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noteModal.note.title}
                  onChange={(e) =>
                    setNoteModal({
                      ...noteModal,
                      note: { ...noteModal.note, title: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  placeholder="e.g. Chapter 4 Multiplication"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={noteModal.note.date}
                  onChange={(e) =>
                    setNoteModal({
                      ...noteModal,
                      note: { ...noteModal.note, date: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lesson Content / Description</label>
                <textarea
                  rows={4}
                  required
                  value={noteModal.note.content}
                  onChange={(e) =>
                    setNoteModal({
                      ...noteModal,
                      note: { ...noteModal.note, content: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-xs"
                  placeholder="Notes, points, formulas or summary..."
                />
              </div>

              {/* Note Document / PDF / Image File Upload */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="font-bold text-slate-700 flex items-center justify-between text-xs">
                  <span>Upload Note Document (PDF / Image / File)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>

                {noteModal.note.fileUrl ? (
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[170px]">
                          {noteModal.note.fileName || 'Uploaded Note Document'}
                        </p>
                        <p className="text-[10px] text-blue-700 font-semibold">
                          {noteModal.note.fileSize || 'Attached'} • Ready for students
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setNoteModal((prev) => ({
                            ...prev,
                            note: {
                              ...prev.note,
                              fileUrl: undefined,
                              fileName: undefined,
                              fileSize: undefined,
                              fileType: undefined,
                            },
                          }))
                        }
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Remove attached file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-blue-50/30 transition group">
                    <label className="cursor-pointer block space-y-1.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto group-hover:scale-105 transition">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-blue-700 hover:underline">
                          Choose a Note File
                        </span>
                        <span className="text-slate-500 text-xs"> or drag & drop</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        PDF, Word (.docx), Images (.jpg, .png), Text notes
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,image/*"
                        onChange={handleNoteFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModal({ ...noteModal, isOpen: false })}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== HOMEWORK MODAL ===================== */}
      {homeworkModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {homeworkModal.isEdit ? 'Edit Homework' : 'Add Homework'}
              </h3>
              <button
                onClick={() => setHomeworkModal({ ...homeworkModal, isOpen: false })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHomework} className="space-y-3 text-xs">
              {/* Class selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Class</label>
                <select
                  value={homeworkModal.item.class}
                  onChange={(e) =>
                    setHomeworkModal({
                      ...homeworkModal,
                      item: { ...homeworkModal.item, class: e.target.value as SchoolClass },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {ALL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject selector */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <select
                  value={homeworkModal.item.subject}
                  onChange={(e) =>
                    setHomeworkModal({
                      ...homeworkModal,
                      item: { ...homeworkModal.item, subject: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {(subjectsMap[homeworkModal.item.class] || [])
                    .filter((s) => s.name.trim())
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={homeworkModal.item.title}
                  onChange={(e) =>
                    setHomeworkModal({
                      ...homeworkModal,
                      item: { ...homeworkModal.item, title: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Exercise 4 Word Problems"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teacher Instructions / Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={homeworkModal.item.instructions || homeworkModal.item.description}
                  onChange={(e) =>
                    setHomeworkModal({
                      ...homeworkModal,
                      item: {
                        ...homeworkModal.item,
                        instructions: e.target.value,
                        description: e.target.value,
                      },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                  placeholder="Write clear instructions for students..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={homeworkModal.item.dueDate}
                    onChange={(e) =>
                      setHomeworkModal({
                        ...homeworkModal,
                        item: { ...homeworkModal.item, dueDate: e.target.value },
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={homeworkModal.item.priority}
                    onChange={(e) =>
                      setHomeworkModal({
                        ...homeworkModal,
                        item: {
                          ...homeworkModal.item,
                          priority: e.target.value as HomeworkPriority,
                        },
                      })
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Photo / Attachment Option */}
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 block">
                  Reference Photo / Attachment (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-200">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={homeworkModal.item.attachment || ''}
                    onChange={(e) =>
                      setHomeworkModal({
                        ...homeworkModal,
                        item: { ...homeworkModal.item, attachment: e.target.value },
                      })
                    }
                    placeholder="Or paste image URL"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                {homeworkModal.item.attachment && (
                  <div className="mt-1 flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <img
                      src={homeworkModal.item.attachment}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[11px] text-slate-500 truncate flex-1">
                      Image attached
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setHomeworkModal({
                          ...homeworkModal,
                          item: { ...homeworkModal.item, attachment: '' },
                        })
                      }
                      className="text-red-500 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHomeworkModal({ ...homeworkModal, isOpen: false })}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== NOTICE MODAL ===================== */}
      {noticeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {noticeModal.isEdit ? 'Edit School Notice' : 'Post School Notice'}
              </h3>
              <button
                onClick={() => setNoticeModal({ ...noticeModal, isOpen: false })}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Target Audience / Class
                </label>
                <select
                  value={noticeModal.notice.targetClass}
                  onChange={(e) =>
                    setNoticeModal({
                      ...noticeModal,
                      notice: {
                        ...noticeModal.notice,
                        targetClass: e.target.value as NoticeTarget,
                      },
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-xs text-slate-900"
                >
                  <option value="All Classes">All Classes (Entire School)</option>
                  {ALL_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c} Only
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={noticeModal.notice.title}
                  onChange={(e) =>
                    setNoticeModal({
                      ...noticeModal,
                      notice: { ...noticeModal.notice, title: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  placeholder="e.g. Annual Sports Day 2026"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={noticeModal.notice.date}
                  onChange={(e) =>
                    setNoticeModal({
                      ...noticeModal,
                      notice: { ...noticeModal.notice, date: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notice Body</label>
                <textarea
                  rows={5}
                  required
                  value={noticeModal.notice.content}
                  onChange={(e) =>
                    setNoticeModal({
                      ...noticeModal,
                      notice: { ...noticeModal.notice, content: e.target.value },
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                  placeholder="Official notice circular text..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoticeModal({ ...noticeModal, isOpen: false })}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
