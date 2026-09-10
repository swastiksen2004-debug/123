import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Search,
  Calendar,
  X,
  Copy,
  Check,
  Building,
  Tag,
  Share2,
} from 'lucide-react';
import { Student, SchoolNotice } from '../types';
import { formatDate } from '../utils/date';

interface NoticesViewProps {
  student: Student;
  notices: SchoolNotice[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({ student, notices }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Student sees notices targeted for 'All Classes' OR specifically for their class
  const studentNotices = useMemo(() => {
    return notices.filter(
      (n) => n.targetClass === 'All Classes' || n.targetClass === student.class
    );
  }, [notices, student.class]);

  const filteredNotices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return studentNotices;
    return studentNotices.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.targetClass.toLowerCase().includes(q)
    );
  }, [studentNotices, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            School Notices 📢
          </h1>
          <p className="text-xs font-semibold text-blue-700">
            Official announcements for {student.class} & All Classes
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          {studentNotices.length} Notice{studentNotices.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search notices */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notices by keyword..."
          className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center space-y-2">
          <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">No notices found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? `No announcements matching "${searchQuery}".`
              : 'There are currently no circulars or notices for your class.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-2.5"
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                    notice.targetClass === 'All Classes'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {notice.targetClass}
                </span>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(notice.date)}</span>
                </div>
              </div>

              {/* Notice Title */}
              <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                {notice.title}
              </h3>

              {/* Notice Content */}
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line select-text">
                {notice.content}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Building className="w-3 h-3" />
                  <span>KBSSN Administration</span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      notice.id,
                      `[KBSSN Notice - ${notice.targetClass}]\n${notice.title}\nDate: ${notice.date}\n\n${notice.content}`
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition"
                >
                  {copiedId === notice.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
