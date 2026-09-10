import React, { useState } from 'react';
import {
  User,
  Calendar,
  LogOut,
  Hash,
  School,
  Download,
  ShieldAlert,
  Cake,
  CheckCircle2,
  Edit2,
  X,
  Check,
  Award,
} from 'lucide-react';
import { Student, Note, Homework, ActiveTab } from '../types';
import { formatDate, checkBirthday } from '../utils/date';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ProfileViewProps {
  student: Student;
  notes: Note[];
  homework: Homework[];
  onUpdateStudent: (updated: Student) => void;
  onLogout: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  simulateToday: boolean;
  onToggleSimulateToday: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  student,
  notes,
  homework,
  onUpdateStudent,
  onLogout,
  setActiveTab,
}) => {
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: student.name,
    roll: student.roll,
    section: student.section,
    birthday: student.birthday,
  });

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const bdayInfo = checkBirthday(student.birthday);
  const completedHw = homework.filter((h) => h.completed).length;
  const completionRate =
    homework.length > 0 ? Math.round((completedHw / homework.length) * 100) : 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.roll.trim()) return;
    onUpdateStudent({
      ...student,
      name: editForm.name.trim(),
      roll: editForm.roll.trim(),
      section: editForm.section.trim(),
      birthday: editForm.birthday,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 pb-10">
      {/* Student Profile Identity Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-blue-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md border-4 border-white ring-2 ring-blue-100">
          {student.name.slice(0, 2).toUpperCase()}
        </div>

        <h2 className="text-xl font-black text-slate-900 mt-3">
          {student.name}
        </h2>
        <p className="text-xs text-slate-500 font-semibold tracking-wide">
          Student ID: <span className="text-blue-700 font-mono font-bold">{student.id}</span>
        </p>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black border border-blue-200">
            {student.class} - Section {student.section}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
            Roll #{student.roll}
          </span>
        </div>

        {/* Academic Overview stats */}
        <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-slate-100">
          <div className="text-center">
            <span className="text-lg font-black text-slate-900">{notes.length}</span>
            <p className="text-[11px] text-slate-400 font-medium">Notes</p>
          </div>
          <div className="text-center border-x border-slate-100">
            <span className="text-lg font-black text-blue-700">{completionRate}%</span>
            <p className="text-[11px] text-slate-400 font-medium">Homework Done</p>
          </div>
          <div className="text-center">
            <span className="text-lg font-black text-slate-900">{homework.length}</span>
            <p className="text-[11px] text-slate-400 font-medium">Tasks</p>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Student Information
          </h3>
          <button
            onClick={() => {
              setEditForm({
                name: student.name,
                roll: student.roll,
                section: student.section,
                birthday: student.birthday,
              });
              setIsEditing(true);
            }}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Info</span>
          </button>
        </div>

        <div className="space-y-2.5 divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Full Name
            </span>
            <span className="font-bold text-slate-900">{student.name}</span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-500 flex items-center gap-2">
              <School className="w-4 h-4 text-slate-400" />
              Enrolled Class
            </span>
            <span className="font-bold text-blue-700">
              {student.class} (Locked)
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Hash className="w-4 h-4 text-slate-400" />
              Section & Roll #
            </span>
            <span className="font-bold text-slate-900">
              Sec {student.section}, Roll #{student.roll}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Birthday
            </span>
            <span className="font-bold text-slate-900">
              {formatDate(student.birthday)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2.5">
            <span className="text-slate-500 flex items-center gap-2">
              <Cake className="w-4 h-4 text-amber-500" />
              Next Birthday
            </span>
            <div className="text-right">
              <span className="font-bold text-slate-900 block">
                {bdayInfo.nextBirthdayFormatted}
              </span>
              <span className="text-[10px] text-blue-700 font-bold">
                {bdayInfo.isToday ? 'Today! 🎉' : `${bdayInfo.daysRemaining} days away`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">Edit Student Info</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Enrolled Class (Locked by PIN)
                </label>
                <input
                  type="text"
                  disabled
                  value={student.class}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Class cannot be changed. Log out to switch class.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.roll}
                    onChange={(e) => setEditForm({ ...editForm, roll: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Birthday</label>
                <input
                  type="date"
                  required
                  value={editForm.birthday}
                  onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Info & Admin Portal Shortcut */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          School & PWA Settings
        </h3>

        {/* PWA Install Button */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 font-semibold text-xs"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Install KBSSN App to Phone</span>
            </div>
            <span className="text-[10px] bg-blue-700 text-white px-2 py-0.5 rounded-md font-bold">
              Install
            </span>
          </button>
        )}

        {isInstalled && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            <span>App installed in Standalone Mode</span>
          </div>
        )}

        {/* School Name Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xs p-0.5 shrink-0 flex items-center justify-center">
            <img
              src="/school-logo.png"
              alt="KBSSN Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900">KBSSN School App</span>
              <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                Est. 1999
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium truncate">
              কার্তিক বিদ্যাস্ত স্মৃতি শিশু নিকেতন • শান্তিপুর, নদীয়া
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Classes Nursery to Std 4
            </p>
          </div>
        </div>

        {/* Admin Portal shortcut */}
        <button
          onClick={() => setActiveTab('admin')}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 transition border border-amber-200 font-bold text-xs"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Teacher & Admin Portal</span>
          </div>
          <span className="text-[10px] text-amber-700">Manage Classes & Content →</span>
        </button>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        {confirmLogout ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-4 text-center space-y-3">
            <p className="text-xs font-bold text-red-800">
              Are you sure you want to exit {student.class} area?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition"
              >
                Yes, Exit Class
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Class / Change Student</span>
          </button>
        )}
      </div>
    </div>
  );
};
