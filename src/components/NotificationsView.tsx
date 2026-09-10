import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  BookOpen,
  CheckSquare,
  Megaphone,
  Eye,
  EyeOff,
  Filter,
  Trash2,
} from 'lucide-react';
import { Student, NotificationItem } from '../types';
import { formatDate } from '../utils/date';

interface NotificationsViewProps {
  student: Student;
  notifications: NotificationItem[];
  onToggleRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification?: (id: string) => void;
  onClearRead?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  student,
  notifications,
  onToggleRead,
  onMarkAllRead,
  onDeleteNotification,
  onClearRead,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Strictly filter notifications for the student's class OR All Classes
  const studentNotifs = useMemo(() => {
    return notifications.filter(
      (n) => n.targetClass === 'All Classes' || n.targetClass === student.class
    );
  }, [notifications, student.class]);

  const unreadCount = studentNotifs.filter((n) => !n.isRead).length;
  const readCount = studentNotifs.length - unreadCount;

  const filteredNotifs = studentNotifs.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'homework':
        return {
          icon: CheckSquare,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'note':
        return {
          icon: BookOpen,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'announcement':
      default:
        return {
          icon: Megaphone,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Notifications 🔔
          </h1>
          <p className="text-xs font-semibold text-blue-700">
            {student.class} •{' '}
            {unreadCount === 0
              ? 'All alerts cleared'
              : `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 shadow-2xs"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}

          {readCount > 0 && onClearRead && (
            <button
              onClick={onClearRead}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-bold transition border border-slate-200 hover:border-red-200 shadow-2xs"
              title="Remove read alerts so they won't appear again"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/80 rounded-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition ${
            filter === 'all'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All ({studentNotifs.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200/90 text-center space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-slate-400">
            {filter === 'unread'
              ? 'All notifications have been read. They will not disturb you again.'
              : `You will automatically receive alerts whenever new notes, homework, or notices are posted for ${student.class}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNotifs.map((item) => {
            const { icon: Icon, color } = getNotifIcon(item.type);

            return (
              <div
                key={item.id}
                onClick={() => onToggleRead(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 shadow-xs ${
                  item.isRead
                    ? 'bg-white border-slate-200/80 opacity-85 hover:opacity-100'
                    : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50/80'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
                        {item.type}
                      </span>
                      {item.targetClass && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {item.targetClass}
                        </span>
                      )}
                      {item.isRead && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-400">
                          Read
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatDate(item.date)}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-sm mt-1 ${
                      item.isRead
                        ? 'font-semibold text-slate-700'
                        : 'font-black text-slate-900'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRead(item.id);
                      }}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      {item.isRead ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Mark unread</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Mark read</span>
                        </>
                      )}
                    </button>

                    {onDeleteNotification && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(item.id);
                        }}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 transition flex items-center gap-1 p-1 rounded-md hover:bg-red-50"
                        title="Dismiss alert permanently"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Dismiss</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
