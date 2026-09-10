import React, { useState, useEffect } from 'react';
import {
  Student,
  Note,
  Homework,
  SchoolNotice,
  NotificationItem,
  ClassSubjectsMap,
  ActiveTab,
} from './types';
import { StorageService } from './utils/storage';
import { FirebaseSync, CloudSyncStatus } from './utils/firebaseSync';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OfflineBanner } from './components/OfflineBanner';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { NotesView } from './components/NotesView';
import { HomeworkView } from './components/HomeworkView';
import { NoticesView } from './components/NoticesView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  // Initialize state from StorageService (auto-seeds defaults in localStorage if empty)
  const [subjectsMap, setSubjectsMap] = useState<ClassSubjectsMap>(() =>
    StorageService.getSubjectsMap()
  );
  const [notes, setNotes] = useState<Note[]>(() => StorageService.getNotes());
  const [homework, setHomework] = useState<Homework[]>(() => StorageService.getHomework());
  const [notices, setNotices] = useState<SchoolNotice[]>(() =>
    StorageService.getNotices()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    StorageService.getNotifications()
  );

  // Current logged in student session
  const [currentStudent, setCurrentStudent] = useState<Student | null>(() =>
    StorageService.getStudentSession()
  );

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Birthday simulation state
  const [simulateToday, setSimulateToday] = useState<boolean>(() => {
    // Default to false so user is never stuck in demo mode
    return false;
  });

  // Admin auth state
  const [isAdmin, setIsAdmin] = useState<boolean>(() =>
    StorageService.isAdminLoggedIn()
  );

  // Cloud database sync status
  const [cloudStatus, setCloudStatus] = useState<CloudSyncStatus>(() =>
    FirebaseSync.getStatus()
  );

  useEffect(() => {
    // Initialize Firebase cloud sync & real-time snapshot subscriptions
    FirebaseSync.initialize();

    const unsubData = FirebaseSync.registerDataChangeListener(() => {
      refreshData();
    });

    const unsubStatus = FirebaseSync.onStatusChange((status) => {
      setCloudStatus(status);
    });

    return () => {
      unsubData();
      unsubStatus();
    };
  }, []);

  const refreshData = () => {
    const updatedMap = StorageService.getSubjectsMap();
    const updatedNotes = StorageService.getNotes();
    const updatedHomework = StorageService.getHomework();
    const updatedNotices = StorageService.getNotices();
    const updatedNotifs = StorageService.getNotifications();
    const studentSession = StorageService.getStudentSession();

    setSubjectsMap(updatedMap);
    setNotes(updatedNotes);
    setHomework(updatedHomework);
    setNotices(updatedNotices);
    setNotifications(updatedNotifs);
    setCurrentStudent(studentSession);
    setIsAdmin(StorageService.isAdminLoggedIn());
  };

  // Student Login Handler (called after verifying class PIN & entering student details)
  const handleLoginComplete = (student: Student) => {
    StorageService.saveStudentSession(student);
    setCurrentStudent(student);
    setActiveTab('home');
  };

  // Student Logout Handler
  const handleLogout = () => {
    StorageService.saveStudentSession(null);
    setCurrentStudent(null);
    setActiveTab('home');
  };

  // Student Profile Update
  const handleUpdateStudent = (updated: Student) => {
    StorageService.saveStudentSession(updated);
    setCurrentStudent(updated);
  };

  // Homework completion toggle
  const handleToggleHomework = (id: string) => {
    const updated = StorageService.toggleHomeworkCompletion(id);
    setHomework(updated);
  };

  // Notification read toggle
  const handleToggleNotificationRead = (id: string) => {
    const updated = StorageService.toggleNotificationRead(id);
    setNotifications(updated);
  };

  // Mark all notifications read for student's class
  const handleMarkAllNotificationsRead = () => {
    const updated = StorageService.markAllNotificationsRead(currentStudent?.class);
    setNotifications(updated);
  };

  // Delete / dismiss single notification permanently
  const handleDeleteNotification = (id: string) => {
    const updated = StorageService.deleteNotification(id);
    setNotifications(updated);
  };

  // Clear all read notifications so old alerts do not show again
  const handleClearReadNotifications = () => {
    const updated = StorageService.clearReadNotifications(currentStudent?.class);
    setNotifications(updated);
  };

  // Toggle simulate birthday celebration
  const handleToggleSimulateToday = () => {
    const newVal = !simulateToday;
    setSimulateToday(newVal);
    StorageService.setSimulateBirthdayToday(newVal);
  };

  // Calculate unread notification count strictly for this student
  const unreadNotifCount = currentStudent
    ? notifications.filter(
        (n) =>
          (n.targetClass === 'All Classes' || n.targetClass === currentStudent.class) &&
          !n.isRead
      ).length
    : 0;

  // Current class subject slots (10 slots)
  const currentClassSlots = currentStudent ? subjectsMap[currentStudent.class] || [] : [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-100">
      {/* Offline Status Bar */}
      <OfflineBanner />

      {/* Main Mobile App Frame */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/60">
        {/* Top Navbar */}
        <Navbar
          currentStudent={currentStudent}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'notes') setSelectedNote(null);
          }}
          isAdmin={isAdmin}
          cloudStatus={cloudStatus}
        />

        {/* Dynamic Views Content */}
        <main
          className={`flex-1 px-4 pt-4 ${
            currentStudent && activeTab !== 'admin' ? 'pb-24' : 'pb-8'
          }`}
        >
          {activeTab === 'admin' ? (
            /* Staff & Admin Portal View */
            <AdminPortal
              notes={notes}
              homework={homework}
              notices={notices}
              subjectsMap={subjectsMap}
              onRefreshData={refreshData}
              onExitAdmin={() => setActiveTab('home')}
              cloudStatus={cloudStatus}
            />
          ) : !currentStudent ? (
            /* Class PIN & Student Login View */
            <LoginView
              onLoginComplete={handleLoginComplete}
              onOpenAdmin={() => setActiveTab('admin')}
            />
          ) : (
            /* Logged-in Student Views */
            <>
              {activeTab === 'home' && (
                <HomeView
                  student={currentStudent}
                  notes={notes}
                  homework={homework}
                  notices={notices}
                  notifications={notifications}
                  setActiveTab={setActiveTab}
                  onToggleHomework={handleToggleHomework}
                  onSelectNote={(note) => {
                    setSelectedNote(note);
                    setActiveTab('notes');
                  }}
                  simulateToday={simulateToday}
                  onToggleSimulateToday={handleToggleSimulateToday}
                />
              )}

              {activeTab === 'notes' && (
                <NotesView
                  student={currentStudent}
                  notes={notes}
                  homework={homework}
                  subjectSlots={currentClassSlots}
                  selectedNote={selectedNote}
                  onSelectNote={setSelectedNote}
                  onOpenUploadNote={() => setActiveTab('admin')}
                />
              )}

              {activeTab === 'homework' && (
                <HomeworkView
                  student={currentStudent}
                  homework={homework}
                  subjectSlots={currentClassSlots}
                  onToggleHomework={handleToggleHomework}
                />
              )}

              {activeTab === 'notices' && (
                <NoticesView
                  student={currentStudent}
                  notices={notices}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsView
                  student={currentStudent}
                  notifications={notifications}
                  onToggleRead={handleToggleNotificationRead}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onDeleteNotification={handleDeleteNotification}
                  onClearRead={handleClearReadNotifications}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  student={currentStudent}
                  notes={notes}
                  homework={homework}
                  onUpdateStudent={handleUpdateStudent}
                  onLogout={handleLogout}
                  setActiveTab={setActiveTab}
                  simulateToday={simulateToday}
                  onToggleSimulateToday={handleToggleSimulateToday}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation Dock (visible when logged in as student) */}
        {currentStudent && activeTab !== 'admin' && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'notes') setSelectedNote(null);
            }}
            unreadCount={unreadNotifCount}
          />
        )}
      </div>
    </div>
  );
}
