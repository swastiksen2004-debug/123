import React from 'react';
import { Cake, Calendar, PartyPopper } from 'lucide-react';
import { Student } from '../types';
import { checkBirthday } from '../utils/date';

interface BirthdayCardProps {
  student: Student;
  simulateToday?: boolean;
  onToggleSimulateToday?: () => void;
}

export const BirthdayCard: React.FC<BirthdayCardProps> = ({
  student,
  simulateToday = false,
}) => {
  // If simulateToday is active, simulate student's birthday date as today
  const simulatedDate = simulateToday
    ? `${new Date().getFullYear()}-${student.birthday.slice(5)}`
    : undefined;

  const birthdayInfo = checkBirthday(student.birthday, simulatedDate);

  return (
    <div className="relative overflow-hidden rounded-2xl transition-all duration-300 shadow-sm border">
      {/* Birthday Celebration Screen when it's today */}
      {birthdayInfo.isToday ? (
        <div className="relative p-6 bg-gradient-to-br from-amber-500 via-pink-500 to-purple-600 text-white border-amber-300/40">
          {/* Confetti Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <span className="absolute left-[10%] top-0 text-xl animate-confetti" style={{ animationDelay: '0s' }}>🎊</span>
            <span className="absolute left-[25%] top-0 text-2xl animate-confetti" style={{ animationDelay: '1.2s' }}>✨</span>
            <span className="absolute left-[45%] top-0 text-xl animate-confetti" style={{ animationDelay: '0.4s' }}>🎉</span>
            <span className="absolute left-[65%] top-0 text-2xl animate-confetti" style={{ animationDelay: '2.1s' }}>🎈</span>
            <span className="absolute left-[80%] top-0 text-xl animate-confetti" style={{ animationDelay: '0.8s' }}>⭐</span>
            <span className="absolute left-[90%] top-0 text-xl animate-confetti" style={{ animationDelay: '1.6s' }}>🎉</span>

            {/* Floating Balloons */}
            <span className="absolute left-4 bottom-0 text-3xl animate-balloon" style={{ animationDelay: '0.2s' }}>🎈</span>
            <span className="absolute right-4 bottom-0 text-3xl animate-balloon" style={{ animationDelay: '1.5s' }}>🎈</span>
            <span className="absolute right-16 bottom-0 text-2xl animate-balloon" style={{ animationDelay: '3s' }}>🎈</span>
          </div>

          <div className="relative z-10 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider">
              <PartyPopper className="w-4 h-4" />
              <span>🎉 HAPPY BIRTHDAY! 🎉</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Happy Birthday, {student.name}!
            </h2>

            <p className="text-sm sm:text-base text-white/95 leading-relaxed max-w-sm mx-auto font-medium">
              "Wishing you a wonderful birthday filled with happiness, success and lots of smiles! 🎂🎈"
            </p>

            <div className="pt-2 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/25 backdrop-blur-md text-white text-xs font-semibold">
                <Cake className="w-4 h-4 text-amber-200" />
                <span>Turning {birthdayInfo.turningAge} Today</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Countdown Card when it is NOT today */
        <div className="p-5 bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-sky-50/60 border-blue-100 text-slate-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Upcoming Birthday
                </span>
                <h3 className="font-bold text-slate-900 text-base">
                  {student.name}'s Next Birthday
                </h3>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
              {birthdayInfo.daysRemaining === 0
                ? 'Today'
                : `${birthdayInfo.daysRemaining} days left`}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-700">
                {birthdayInfo.nextBirthdayFormatted}
              </span>
              <span className="text-slate-400">•</span>
              <span>Turning {birthdayInfo.turningAge}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
