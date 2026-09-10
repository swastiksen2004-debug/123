export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const [y, m, d] = dateString.split('-').map(Number);
    if (!y || !m || !d) return dateString;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export interface BirthdayInfo {
  isToday: boolean;
  nextBirthdayFormatted: string;
  daysRemaining: number;
  turningAge: number;
}

export function checkBirthday(birthdayStr: string, simulatedDateStr?: string): BirthdayInfo {
  const baseDate = simulatedDateStr ? new Date(simulatedDateStr) : new Date();
  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth(); // 0-indexed
  const currentDay = baseDate.getDate();

  if (!birthdayStr) {
    return {
      isToday: false,
      nextBirthdayFormatted: 'N/A',
      daysRemaining: 0,
      turningAge: 0,
    };
  }

  const [bYear, bMonth, bDay] = birthdayStr.split('-').map(Number);
  const birthMonth = bMonth - 1;

  const isToday = currentMonth === birthMonth && currentDay === bDay;

  // Calculate next birthday date
  let nextBdayYear = currentYear;
  const thisYearBday = new Date(currentYear, birthMonth, bDay);
  const todayOnly = new Date(currentYear, currentMonth, currentDay);

  if (thisYearBday < todayOnly) {
    nextBdayYear = currentYear + 1;
  }

  const nextBday = new Date(nextBdayYear, birthMonth, bDay);
  const diffTime = nextBday.getTime() - todayOnly.getTime();
  const daysRemaining = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const turningAge = nextBdayYear - bYear;

  const nextBirthdayFormatted = nextBday.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    isToday,
    nextBirthdayFormatted,
    daysRemaining,
    turningAge,
  };
}

export function isOverdue(dueDateStr: string, completed: boolean): boolean {
  if (completed || !dueDateStr) return false;
  const todayStr = getTodayDateString();
  return dueDateStr < todayStr;
}
