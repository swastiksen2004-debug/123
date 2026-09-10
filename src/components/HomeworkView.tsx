import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Calendar,
  AlertTriangle,
  Clock,
  Check,
  Image as ImageIcon,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react';
import { Student, Homework, SubjectSlot } from '../types';
import { formatDate, getTodayDateString, isOverdue } from '../utils/date';

type HomeworkCategory = 'All' | 'Pending' | 'Completed' | 'Overdue';

interface HomeworkViewProps {
  student: Student;
  homework: Homework[];
  subjectSlots: SubjectSlot[];
  onToggleHomework: (id: string) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  student,
  homework,
  subjectSlots,
  onToggleHomework,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HomeworkCategory>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const todayStr = getTodayDateString();

  // Filter homework strictly for the current student's class
  const classHomework = useMemo(
    () => homework.filter((h) => h.class === student.class),
    [homework, student.class]
  );

  // Category counts
  const pendingCount = classHomework.filter((h) => !h.completed).length;
  const completedCount = classHomework.filter((h) => h.completed).length;
  const overdueCount = classHomework.filter(
    (h) => isOverdue(h.dueDate, h.completed)
  ).length;

  const filteredHomework = useMemo(() => {
    return classHomework.filter((item) => {
      // Category check
      if (selectedCategory === 'Pending' && item.completed) return false;
      if (selectedCategory === 'Completed' && !item.completed) return false;
      if (selectedCategory === 'Overdue' && !isOverdue(item.dueDate, item.completed))
        return false;

      // Subject check
      if (selectedSubject !== 'All' && item.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [classHomework, selectedCategory, selectedSubject, todayStr]);

  const categories: { id: HomeworkCategory; label: string; count: number }[] = [
    { id: 'All', label: 'All', count: classHomework.length },
    { id: 'Pending', label: 'Pending', count: pendingCount },
    { id: 'Completed', label: 'Done', count: completedCount },
    { id: 'Overdue', label: 'Overdue', count: overdueCount },
  ];

  // Active named subject filters for this class
  const namedSubjects = subjectSlots.filter((s) => s.name.trim().length > 0);

  return (
    <div className="space-y-4 pb-6">
      {/* Title & Progress Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Homework 📝
          </h1>
          <p className="text-xs font-semibold text-blue-700">
            {student.class} • {completedCount} of {classHomework.length} tasks finished
          </p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
          {classHomework.length > 0
            ? Math.round((completedCount / classHomework.length) * 100)
            : 0}
          % Done
        </span>
      </div>

      {/* Category Tabs: All, Pending, Completed, Overdue */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/80 rounded-2xl">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-full font-bold ${
                  cat.id === 'Overdue' && cat.count > 0
                    ? 'bg-red-100 text-red-700'
                    : isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-300 text-slate-700'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 py-1">
        <button
          onClick={() => setSelectedSubject('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
            selectedSubject === 'All'
              ? 'bg-blue-700 text-white'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Subjects
        </button>
        {namedSubjects.map((slot) => {
          const hasItems = classHomework.some(
            (h) => h.subject.toLowerCase() === slot.name.toLowerCase()
          );
          if (!hasItems) return null;
          const isSelected = selectedSubject.toLowerCase() === slot.name.toLowerCase();
          return (
            <button
              key={slot.id}
              onClick={() => setSelectedSubject(slot.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
                isSelected
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {slot.name}
            </button>
          );
        })}
      </div>

      {/* Homework Cards List */}
      {filteredHomework.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center space-y-2">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            No {selectedCategory !== 'All' ? selectedCategory.toLowerCase() : ''} homework
          </h3>
          <p className="text-xs text-slate-400">
            {selectedCategory === 'Completed'
              ? 'Mark tasks as completed by tapping their checkbox circle.'
              : selectedCategory === 'Overdue'
              ? 'No overdue homework for this class.'
              : 'All caught up with class homework!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHomework.map((item) => {
            const overdue = isOverdue(item.dueDate, item.completed);
            const isDueToday = item.dueDate === todayStr && !item.completed;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition shadow-xs ${
                  item.completed
                    ? 'border-slate-200 bg-slate-50/50'
                    : overdue
                    ? 'border-red-200 bg-red-50/20'
                    : isDueToday
                    ? 'border-amber-300'
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Toggle Checkbox */}
                  <button
                    onClick={() => onToggleHomework(item.id)}
                    className="mt-0.5 text-blue-700 hover:text-blue-800 transition shrink-0"
                    title={item.completed ? 'Mark as pending' : 'Mark as completed'}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-blue-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {item.subject}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.priority === 'High'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : item.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>

                      {/* Status Badges */}
                      {item.completed ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Done</span>
                        </span>
                      ) : overdue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Overdue</span>
                        </span>
                      ) : isDueToday ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          Due Today
                        </span>
                      ) : null}
                    </div>

                    <h3
                      className={`font-bold text-slate-900 text-sm mt-1.5 ${
                        item.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {item.title}
                    </h3>

                    {/* Teacher Instructions */}
                    <div className="mt-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">
                        Instructions:
                      </p>
                      <p
                        className={`text-xs mt-0.5 leading-relaxed whitespace-pre-line ${
                          item.completed ? 'text-slate-400' : 'text-slate-700'
                        }`}
                      >
                        {item.instructions || item.description}
                      </p>
                    </div>

                    {/* Attachment preview button if present */}
                    {item.attachment && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewAttachment({
                              url: item.attachment!,
                              title: item.title,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200/80"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                          <span>View Reference Attachment</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    )}

                    {/* Dates Bar */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Assigned: {formatDate(item.assignedDate)}</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 font-bold ${
                          overdue
                            ? 'text-red-600'
                            : isDueToday
                            ? 'text-amber-700'
                            : 'text-slate-700'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Due: {formatDate(item.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image / Reference Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm truncate">
                {previewAttachment.title} - Attachment
              </h4>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 max-h-80 flex items-center justify-center">
              <img
                src={previewAttachment.url}
                alt="Homework attachment"
                className="w-full h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => setPreviewAttachment(null)}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
