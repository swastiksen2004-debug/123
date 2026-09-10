import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-sm sticky top-0 z-50 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — StudyHub is using cached local data.</span>
    </div>
  );
};
