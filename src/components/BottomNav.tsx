import React from 'react';
import { Home, BookOpen, CheckSquare, Megaphone, Bell, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  unreadCount,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'notes' as ActiveTab, label: 'Notes', icon: BookOpen },
    { id: 'homework' as ActiveTab, label: 'Homework', icon: CheckSquare },
    { id: 'notices' as ActiveTab, label: 'Notices', icon: Megaphone },
    {
      id: 'notifications' as ActiveTab,
      label: 'Alerts',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe shadow-lg">
      <div className="max-w-md mx-auto px-1 flex items-center justify-between h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-500 hover:text-slate-700 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-blue-700 stroke-[2.5]' : 'stroke-2'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 transition-colors ${
                  isActive ? 'text-blue-700 font-extrabold' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-blue-700" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
