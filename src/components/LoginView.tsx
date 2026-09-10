import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Hash,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  School,
} from 'lucide-react';
import { SchoolClass, ALL_CLASSES, CLASS_PINS, Student } from '../types';

interface LoginViewProps {
  onLoginComplete: (student: Student) => void;
  onOpenAdmin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginComplete,
  onOpenAdmin,
}) => {
  // Step 1: Class and PIN
  const [selectedClass, setSelectedClass] = useState<SchoolClass>('Std 2');
  const [classPin, setClassPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);

  // Step 2: Student details
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [section, setSection] = useState('A');
  const [birthday, setBirthday] = useState('2017-09-15');
  const [detailsError, setDetailsError] = useState('');

  // Handle Step 1 submission
  const handleVerifyClassPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const expectedPin = CLASS_PINS[selectedClass];
    if (classPin.trim() === expectedPin) {
      setIsPinVerified(true);
      // Pre-fill some defaults if blank
      if (!studentName) {
        setStudentName('Arshi');
        setRollNumber('12');
      }
    } else {
      setPinError('Incorrect class PIN. Please check with your class teacher.');
    }
  };

  // Handle Step 2 submission
  const handleSaveStudentDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setDetailsError('');

    if (!studentName.trim()) {
      setDetailsError('Please enter your full name.');
      return;
    }
    if (!rollNumber.trim()) {
      setDetailsError('Please enter your roll number.');
      return;
    }
    if (!birthday) {
      setDetailsError('Please select your birthday.');
      return;
    }

    const student: Student = {
      name: studentName.trim(),
      class: selectedClass, // strictly locked to verified class
      roll: rollNumber.trim(),
      section: section.trim() || 'A',
      birthday: birthday,
    };

    onLoginComplete(student);
  };

  const handleFillDemoStudent = () => {
    setStudentName('Arshi');
    setRollNumber('12');
    setSection('A');
    setBirthday('2017-09-15');
    setDetailsError('');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-6 px-2">
      <div className="w-full max-w-sm mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-md mx-auto p-0.5 flex items-center justify-center">
            <img
              src="/school-logo.png"
              alt="Kartik Bidyanta Smriti Sishu Niketan Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            KBSSN
          </h1>
          <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            কার্তিক বিদ্যাস্ত স্মৃতি শিশু নিকেতন
          </p>
          <p className="text-[10.5px] font-bold text-blue-700 tracking-wider uppercase">
            KARTIK BIDYANTA SMRITI SISHU NIKETAN
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Official School Portal for Notes, Daily Homework, Notices & Announcements.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          {!isPinVerified ? (
            /* ================= STEP 1: CLASS PIN LOGIN ================= */
            <form onSubmit={handleVerifyClassPin} className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5">
                <h2 className="text-base font-black text-slate-900">
                  Student Class Entry
                </h2>
                <p className="text-xs text-slate-500">
                  Select your class and enter your teacher-assigned Class PIN.
                </p>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
                  {pinError}
                </div>
              )}

              {/* Class Selection Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Class
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value as SchoolClass);
                      setPinError('');
                    }}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Class PIN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Class PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={classPin}
                    onChange={(e) => {
                      setClassPin(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Enter assigned Class PIN"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Obtain this PIN from your class teacher.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow transition"
              >
                <span>ENTER CLASS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ================= STEP 2: STUDENT DETAILS ================= */
            <form onSubmit={handleSaveStudentDetails} className="space-y-4">
              <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    Student Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified for <strong className="text-blue-700">{selectedClass}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPinVerified(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                >
                  Change Class
                </button>
              </div>

              {detailsError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  {detailsError}
                </div>
              )}

              {/* Locked Class Pill */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                <span className="font-bold text-blue-900">Class:</span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                  {selectedClass} (Locked)
                </span>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Arshi"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Roll and Section */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder="12"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Section
                  </label>
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Birthday (DD/MM/YYYY)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Quick fill button */}
              <button
                type="button"
                onClick={handleFillDemoStudent}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Quick Fill (Arshi, Roll #12)</span>
              </button>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs hover:shadow transition"
              >
                <span>CONTINUE TO DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Separator / Admin Portal Access */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400 mb-1.5">School teacher or administrator?</p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Staff & Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
