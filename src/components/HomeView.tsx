import React from 'react';
import {
  BookOpen,
  CheckSquare,
  Megaphone,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { Student, Note, Homework, SchoolNotice, NotificationItem, ActiveTab } from '../types';
import { getTimeGreeting, formatDate, getTodayDateString, isOverdue } from '../utils/date';
import { BirthdayCard } from './BirthdayCard';

interface HomeViewProps {
  student: Student;
  notes: Note[];
  homework: Homework[];
  notices: SchoolNotice[];
  notifications: NotificationItem[];
  setActiveTab: (tab: ActiveTab) => void;
  onToggleHomework: (id: string) => void;
  onSelectNote: (note: Note) => void;
  simulateToday?: boolean;
  onToggleSimulateToday?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  student,
  notes,
  homework,
  notices,
  notifications,
  setActiveTab,
  onToggleHomework,
  onSelectNote,
}) => {
  const greeting = getTimeGreeting();
  const todayStr = getTodayDateString();

  // Filter notes strictly for student's class
  const classNotes = notes.filter((n) => n.class === student.class);

  // Filter homework strictly for student's class
  const classHomework = homework.filter((h) => h.class === student.class);
  const pendingCount = classHomework.filter((h) => !h.completed).length;

  // Filter notices for student's class or All Classes
  const classNotices = notices.filter(
    (n) => n.targetClass === 'All Classes' || n.targetClass === student.class
  );

  // Filter notifications for student's class or All Classes
  const classNotifications = notifications.filter(
    (n) => n.targetClass === 'All Classes' || n.targetClass === student.class
  );
  const unreadNotifCount = classNotifications.filter((n) => !n.isRead).length;

  // Today's Homework (due today or assigned today)
  const todaysHomework = classHomework.filter(
    (h) => h.dueDate === todayStr || h.assignedDate === todayStr
  );

  // Latest Notices (sorted by date desc, top 3)
  const latestNotices = [...classNotices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  // Recent Notes (sorted by date desc, top 3)
  const recentNotes = [...classNotes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-5 pb-6">
      {/* KBSSN Student Header Card */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
          <img
            src="/school-logo.png"
            alt="KBSSN Watermark"
            referrerPolicy="no-referrer"
            className="w-24 h-24 rounded-full object-cover border border-white/40 shadow-inner"
          />
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white shadow-xs p-0.5 shrink-0 border border-white/50 flex items-center justify-center">
              <img
                src="/school-logo.png"
                alt="KBSSN Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-white/15 backdrop-blur-md text-blue-100">
              KBSSN
            </span>
            <span className="text-[10px] font-bold text-blue-200 uppercase tracking-tight truncate">
              KARTIK BIDYANTA SMRITI SISHU NIKETAN
            </span>
          </div>

          <h1 className="text-xl font-black mt-1.5 tracking-tight text-white">
            Welcome, {student.name}
          </h1>

          {/* Class, Roll, Section Details */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              Class: {student.class}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              Roll: {student.roll}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black">
              Section: {student.section}
            </span>
          </div>
        </div>
      </div>

      {/* Birthday Celebration or Countdown Card */}
      <BirthdayCard student={student} />

      {/* 4 Action Cards: NOTES, HOMEWORK, NOTICES, NOTIFICATIONS */}
      <div className="grid grid-cols-2 gap-3">
        {/* 1. 📚 NOTES */}
        <button
          onClick={() => setActiveTab('notes')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              📚
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
          </div>
          <h3 className="font-black text-slate-900 mt-2.5 text-xs tracking-wider uppercase">
            NOTES
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {classNotes.length} lesson notes
          </p>
        </button>

        {/* 2. 📝 HOMEWORK */}
        <button
          onClick={() => setActiveTab('homework')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              📝
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
          </div>
          <h3 className="font-black text-slate-900 mt-2.5 text-xs tracking-wider uppercase">
            HOMEWORK
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {pendingCount} pending task{pendingCount !== 1 ? 's' : ''}
          </p>
        </button>

        {/* 3. 📢 NOTICES */}
        <button
          onClick={() => setActiveTab('notices')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-400 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              📢
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
          </div>
          <h3 className="font-black text-slate-900 mt-2.5 text-xs tracking-wider uppercase">
            NOTICES
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {classNotices.length} announcements
          </p>
        </button>

        {/* 4. 🔔 NOTIFICATIONS */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-400 transition text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              🔔
            </div>
            {unreadNotifCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <h3 className="font-black text-slate-900 mt-2.5 text-xs tracking-wider uppercase">
            NOTIFICATIONS
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {unreadNotifCount} unread alert{unreadNotifCount !== 1 ? 's' : ''}
          </p>
        </button>
      </div>

      {/* TODAY'S HOMEWORK Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-700" />
            <h2 className="font-black text-slate-900 text-sm tracking-wide uppercase">
              TODAY'S HOMEWORK
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('homework')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            <span>View all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todaysHomework.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 text-center text-slate-500 text-xs">
            No homework assigned for today in {student.class}. Check all tasks in the Homework tab.
          </div>
        ) : (
          <div className="space-y-2">
            {todaysHomework.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex items-start gap-3 transition hover:border-blue-300"
              >
                <button
                  onClick={() => onToggleHomework(item.id)}
                  className="mt-0.5 text-blue-700 hover:text-blue-800 shrink-0 transition"
                  title={item.completed ? 'Mark as pending' : 'Mark as completed'}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.subject}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      Due Today
                    </span>
                  </div>
                  <h4
                    className={`font-bold text-slate-900 text-sm mt-1 truncate ${
                      item.completed ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LATEST NOTICES Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-700" />
            <h2 className="font-black text-slate-900 text-sm tracking-wide uppercase">
              LATEST NOTICES
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('notices')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            <span>All notices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestNotices.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 text-center text-slate-500 text-xs">
            No notices posted yet for {student.class}.
          </div>
        ) : (
          <div className="space-y-2">
            {latestNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setActiveTab('notices')}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      notice.targetClass === 'All Classes'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {notice.targetClass}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(notice.date)}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{notice.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {notice.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT NOTES Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <h2 className="font-black text-slate-900 text-sm tracking-wide uppercase">
              RECENT NOTES
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('notes')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5"
          >
            <span>All notes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNotes.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 text-center text-slate-500 text-xs">
            No notes available for {student.class} yet.
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="w-full bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-300 text-left transition flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {note.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(note.date)}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1 truncate group-hover:text-blue-700 transition">
                    {note.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {note.content.split('\n')[0]}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
