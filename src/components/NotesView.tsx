import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Calendar,
  X,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
  CheckSquare,
  FileText,
  Clock,
  AlertTriangle,
  Paperclip,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileUp,
} from 'lucide-react';
import { Student, Note, Homework, SubjectSlot } from '../types';
import { formatDate } from '../utils/date';

interface NotesViewProps {
  student: Student;
  notes: Note[];
  homework: Homework[];
  subjectSlots: SubjectSlot[];
  selectedNote: Note | null;
  onSelectNote: (note: Note | null) => void;
  onOpenUploadNote?: () => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  student,
  notes,
  homework,
  subjectSlots,
  selectedNote,
  onSelectNote,
  onOpenUploadNote,
}) => {
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'homework'>('notes');
  const [copied, setCopied] = useState(false);

  // Filter notes strictly for this student's class
  const classNotes = useMemo(
    () => notes.filter((n) => n.class === student.class),
    [notes, student.class]
  );

  // Filter homework strictly for this student's class
  const classHomework = useMemo(
    () => homework.filter((h) => h.class === student.class),
    [homework, student.class]
  );

  // If a subject is selected, filter by that subject
  const subjectNotes = useMemo(() => {
    if (!selectedSubjectName) return [];
    return classNotes.filter(
      (n) => n.subject.toLowerCase() === selectedSubjectName.toLowerCase()
    );
  }, [classNotes, selectedSubjectName]);

  const subjectHomework = useMemo(() => {
    if (!selectedSubjectName) return [];
    return classHomework.filter(
      (h) => h.subject.toLowerCase() === selectedSubjectName.toLowerCase()
    );
  }, [classHomework, selectedSubjectName]);

  // Search filter inside subject or across all
  const filteredNotes = useMemo(() => {
    const list = selectedSubjectName ? subjectNotes : classNotes;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
    );
  }, [selectedSubjectName, subjectNotes, classNotes, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. If NO specific subject is selected, show Subject Overview Directory
  if (!selectedSubjectName) {
    return (
      <div className="space-y-4 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Class Notes 📚
            </h1>
            <p className="text-xs font-semibold text-blue-700">
              {student.class} • 10 Class Subject Slots
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenUploadNote && (
              <button
                onClick={onOpenUploadNote}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold transition shadow-xs"
                title="Upload Notes file (PDF / Image) in Admin Portal"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload Note</span>
              </button>
            )}
            <span className="text-[11px] font-bold px-2 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              {classNotes.length} Lessons
            </span>
          </div>
        </div>

        {/* Search All Notes */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search all ${student.class} notes...`}
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* If user is searching, show direct search results */}
        {searchQuery ? (
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase">
              Search Results ({filteredNotes.length})
            </h3>
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-400">
                No notes found matching "{searchQuery}" in {student.class}.
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-400 cursor-pointer transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {note.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {note.fileUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>PDF / File</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        {formatDate(note.date)}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-1.5">{note.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                  {note.fileUrl && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="truncate max-w-[200px]">{note.fileName || 'Attached Note Document'}</span>
                      {note.fileSize && <span className="text-slate-400 font-normal">({note.fileSize})</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          /* Subject Slots Grid (10 slots for this class) */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Select Subject Slot
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap to enter subject
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {subjectSlots.map((slot) => {
                const isNamed = !!slot.name.trim();
                const displayName = isNamed ? slot.name : `Slot ${slot.id} (Empty)`;
                const noteCount = isNamed
                  ? classNotes.filter(
                      (n) => n.subject.toLowerCase() === slot.name.toLowerCase()
                    ).length
                  : 0;
                const hwCount = isNamed
                  ? classHomework.filter(
                      (h) => h.subject.toLowerCase() === slot.name.toLowerCase()
                    ).length
                  : 0;

                return (
                  <button
                    key={slot.id}
                    onClick={() => {
                      if (isNamed) {
                        setSelectedSubjectName(slot.name);
                        setSearchQuery('');
                      }
                    }}
                    disabled={!isNamed}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between min-h-[96px] ${
                      isNamed
                        ? 'bg-white border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer'
                        : 'bg-slate-100/70 border-dashed border-slate-300 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          #{slot.id}
                        </span>
                        {isNamed && (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        )}
                      </div>
                      <h4
                        className={`font-black text-xs sm:text-sm mt-1 leading-snug line-clamp-2 ${
                          isNamed ? 'text-slate-900' : 'text-slate-400 italic'
                        }`}
                      >
                        {displayName}
                      </h4>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                      {isNamed ? (
                        <>
                          <span>{noteCount} note{noteCount !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{hwCount} hw</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Specific Subject View: Notes → [Class] → [Subject]
  return (
    <div className="space-y-4 pb-6">
      {/* Breadcrumb Navigation Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setSelectedSubjectName(null);
            setSearchQuery('');
          }}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
            <span>Notes</span>
            <span>→</span>
            <span>{student.class}</span>
            <span>→</span>
            <span className="text-blue-700 truncate">{selectedSubjectName}</span>
          </div>
          <h1 className="text-lg font-black text-slate-900 truncate">
            {selectedSubjectName}
          </h1>
        </div>
      </div>

      {/* Sub-tabs: Subject Notes vs Subject Homework */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200 rounded-2xl">
        <button
          onClick={() => setActiveTab('notes')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'notes'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Notes ({subjectNotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('homework')}
          className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'homework'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Homework ({subjectHomework.length})</span>
        </button>
      </div>

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-3">
          {/* Search inside this subject */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedSubjectName} notes...`}
              className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-xs">
                No notes in {selectedSubjectName} for {student.class}
              </h3>
              <p className="text-[11px] text-slate-400">
                Your teacher has not uploaded study material for this subject yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-blue-400 cursor-pointer transition text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {note.subject}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {note.fileUrl && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>File Attached</span>
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatDate(note.date)}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-2 group-hover:text-blue-700 transition">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>

                  {note.fileUrl && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-[11px] font-semibold text-blue-700">
                      <FileText className="w-3 h-3 text-blue-600" />
                      <span className="truncate max-w-[200px]">{note.fileName || 'Attached Note Document'}</span>
                      {note.fileSize && <span className="text-slate-400 font-normal">({note.fileSize})</span>}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-700 font-bold">
                    <span>{note.fileUrl ? 'Open Note & Download File' : 'Read Full Note'}</span>
                    <span>→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HOMEWORK TAB */}
      {activeTab === 'homework' && (
        <div className="space-y-2.5">
          {subjectHomework.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-xs">
                No homework in {selectedSubjectName} for {student.class}
              </h3>
              <p className="text-[11px] text-slate-400">
                No pending or completed tasks for this subject.
              </p>
            </div>
          ) : (
            subjectHomework.map((hw) => (
              <div
                key={hw.id}
                className={`bg-white rounded-2xl p-4 border shadow-xs ${
                  hw.completed ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {hw.priority} Priority
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Due: {formatDate(hw.dueDate)}
                  </span>
                </div>
                <h4
                  className={`font-bold text-sm mt-1.5 ${
                    hw.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {hw.title}
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {hw.description}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Full Note Reader Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="bg-white w-full sm:max-w-lg max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedNote.subject} ({selectedNote.class})
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(selectedNote.date)}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 mt-1.5 leading-snug">
                  {selectedNote.title}
                </h2>
              </div>

              <button
                onClick={() => onSelectNote(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line select-text space-y-4">
              <div>{selectedNote.content}</div>

              {/* Attached Note Document / File Section */}
              {selectedNote.fileUrl && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attached Study Material / Note Document</span>
                  </h4>

                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs truncate">
                          {selectedNote.fileName || `${selectedNote.title}.pdf`}
                        </h5>
                        <p className="text-[11px] text-blue-700 font-semibold">
                          {selectedNote.fileSize || 'Document File'} • Ready to download
                        </p>
                      </div>
                    </div>

                    <a
                      href={selectedNote.fileUrl}
                      download={selectedNote.fileName || `${selectedNote.title}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </a>
                  </div>

                  {/* If image, display image preview */}
                  {(selectedNote.fileType?.startsWith('image/') ||
                    selectedNote.fileUrl.startsWith('data:image/') ||
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(selectedNote.fileName || '')) && (
                    <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={selectedNote.fileUrl}
                        alt={selectedNote.fileName || 'Study note scan'}
                        className="w-full max-h-96 object-contain bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopy(selectedNote.content)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy note</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectNote(null)}
                className="px-4 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
