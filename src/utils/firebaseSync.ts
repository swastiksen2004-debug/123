import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  getDoc,
} from 'firebase/firestore';
import { db, testConnection } from '../firebase';
import {
  Note,
  Homework,
  SchoolNotice,
  NotificationItem,
  ClassSubjectsMap,
} from '../types';
import {
  DEFAULT_CLASS_SUBJECTS,
  INITIAL_NOTES,
  INITIAL_HOMEWORK,
  INITIAL_NOTICES,
  INITIAL_NOTIFICATIONS,
  StorageService,
  setCloudSyncAdapter,
} from './storage';

export interface CloudSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  errorMessage?: string;
}

type SyncCallback = () => void;

class FirebaseSyncService {
  private statusListeners: ((status: CloudSyncStatus) => void)[] = [];
  private onDataChangeCallbacks: SyncCallback[] = [];
  private isInitialized = false;

  private currentStatus: CloudSyncStatus = {
    isConnected: false,
    isSyncing: true,
    lastSyncTime: null,
  };

  public getStatus(): CloudSyncStatus {
    return { ...this.currentStatus };
  }

  public onStatusChange(listener: (status: CloudSyncStatus) => void): () => void {
    this.statusListeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private updateStatus(patch: Partial<CloudSyncStatus>) {
    this.currentStatus = { ...this.currentStatus, ...patch };
    this.statusListeners.forEach((l) => l(this.getStatus()));
  }

  public registerDataChangeListener(cb: SyncCallback): () => void {
    this.onDataChangeCallbacks.push(cb);
    return () => {
      this.onDataChangeCallbacks = this.onDataChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private triggerDataChange() {
    this.onDataChangeCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[FirebaseSync] Error in data change callback:', err);
      }
    });
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.updateStatus({ isSyncing: true });

    // 1. Check connection
    const connected = await testConnection();
    this.updateStatus({ isConnected: connected });

    try {
      // 2. Check if Firestore has existing data; if not, seed initial data
      await this.seedInitialCloudDataIfEmpty();

      // 3. Attach real-time snapshot listeners
      this.attachListeners();

      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.warn('[FirebaseSync] Error during initialization:', err);
      this.updateStatus({
        isSyncing: false,
        errorMessage: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  }

  /**
   * If Firestore database is fresh/empty, seed with initial KBSSN data
   */
  private async seedInitialCloudDataIfEmpty(): Promise<void> {
    try {
      const notesSnap = await getDocs(collection(db, 'notes'));
      if (notesSnap.empty) {
        console.log('[FirebaseSync] Empty cloud database detected. Seeding initial KBSSN data to Firestore...');
        const batch = writeBatch(db);

        // Seed Notes
        INITIAL_NOTES.forEach((note) => {
          batch.set(doc(db, 'notes', note.id), note);
        });

        // Seed Homework
        INITIAL_HOMEWORK.forEach((hw) => {
          batch.set(doc(db, 'homework', hw.id), hw);
        });

        // Seed Notices
        INITIAL_NOTICES.forEach((notice) => {
          batch.set(doc(db, 'notices', notice.id), notice);
        });

        // Seed Notifications
        INITIAL_NOTIFICATIONS.forEach((notif) => {
          batch.set(doc(db, 'notifications', notif.id), notif);
        });

        // Seed Subject Slots
        batch.set(doc(db, 'settings', 'subjects'), {
          map: DEFAULT_CLASS_SUBJECTS,
          updatedAt: new Date().toISOString(),
        });

        await batch.commit();
        console.log('[FirebaseSync] Initial cloud seed complete!');
      }
    } catch (err) {
      console.warn('[FirebaseSync] Note: Could not auto-seed cloud database (offline or permissions):', err);
    }
  }

  /**
   * Attach real-time Firestore listeners for all collections
   */
  private attachListeners(): void {
    // 1. Notes Listener
    onSnapshot(
      collection(db, 'notes'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudNotes: Note[] = [];
          snapshot.forEach((d) => cloudNotes.push(d.data() as Note));
          // Save to local storage cache
          StorageService.saveNotes(cloudNotes);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncTime: new Date().toLocaleTimeString(),
          });
          this.triggerDataChange();
        }
      },
      (err) => console.warn('[FirebaseSync] Notes listener warning:', err.message)
    );

    // 2. Homework Listener
    onSnapshot(
      collection(db, 'homework'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudHw: Homework[] = [];
          snapshot.forEach((d) => cloudHw.push(d.data() as Homework));
          StorageService.saveHomework(cloudHw);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncTime: new Date().toLocaleTimeString(),
          });
          this.triggerDataChange();
        }
      },
      (err) => console.warn('[FirebaseSync] Homework listener warning:', err.message)
    );

    // 3. Notices Listener
    onSnapshot(
      collection(db, 'notices'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudNotices: SchoolNotice[] = [];
          snapshot.forEach((d) => cloudNotices.push(d.data() as SchoolNotice));
          StorageService.saveNotices(cloudNotices);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncTime: new Date().toLocaleTimeString(),
          });
          this.triggerDataChange();
        }
      },
      (err) => console.warn('[FirebaseSync] Notices listener warning:', err.message)
    );

    // 4. Notifications Listener
    onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudNotifs: NotificationItem[] = [];
          snapshot.forEach((d) => cloudNotifs.push(d.data() as NotificationItem));
          StorageService.saveNotifications(cloudNotifs);
          this.updateStatus({
            isConnected: true,
            isSyncing: false,
            lastSyncTime: new Date().toLocaleTimeString(),
          });
          this.triggerDataChange();
        }
      },
      (err) => console.warn('[FirebaseSync] Notifications listener warning:', err.message)
    );

    // 5. Subject Slots Listener
    onSnapshot(
      doc(db, 'settings', 'subjects'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.map) {
            StorageService.saveSubjectsMap(data.map as ClassSubjectsMap);
            this.updateStatus({
              isConnected: true,
              isSyncing: false,
              lastSyncTime: new Date().toLocaleTimeString(),
            });
            this.triggerDataChange();
          }
        }
      },
      (err) => console.warn('[FirebaseSync] Subjects listener warning:', err.message)
    );
  }

  // Cloud Write Methods
  public async saveNote(note: Note): Promise<void> {
    try {
      await setDoc(doc(db, 'notes', note.id), note);
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to write note to cloud:', err);
    }
  }

  public async deleteNote(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notes', id));
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to delete note from cloud:', err);
    }
  }

  public async saveHomework(item: Homework): Promise<void> {
    try {
      await setDoc(doc(db, 'homework', item.id), item);
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to write homework to cloud:', err);
    }
  }

  public async deleteHomework(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'homework', id));
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to delete homework from cloud:', err);
    }
  }

  public async saveNotice(notice: SchoolNotice): Promise<void> {
    try {
      await setDoc(doc(db, 'notices', notice.id), notice);
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to write notice to cloud:', err);
    }
  }

  public async deleteNotice(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notices', id));
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to delete notice from cloud:', err);
    }
  }

  public async saveNotification(notif: NotificationItem): Promise<void> {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to write notification to cloud:', err);
    }
  }

  public async deleteNotification(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to delete notification from cloud:', err);
    }
  }

  public async saveSubjectsMap(map: ClassSubjectsMap): Promise<void> {
    try {
      await setDoc(doc(db, 'settings', 'subjects'), {
        map,
        updatedAt: new Date().toISOString(),
      });
      this.updateStatus({ lastSyncTime: new Date().toLocaleTimeString() });
    } catch (err) {
      console.warn('[FirebaseSync] Failed to write subjects map to cloud:', err);
    }
  }

  /**
   * Manually force push all local data to Firebase cloud
   */
  public async syncAllLocalToCloud(): Promise<void> {
    this.updateStatus({ isSyncing: true });
    try {
      const batch = writeBatch(db);

      const notes = StorageService.getNotes();
      notes.forEach((n) => batch.set(doc(db, 'notes', n.id), n));

      const hw = StorageService.getHomework();
      hw.forEach((h) => batch.set(doc(db, 'homework', h.id), h));

      const notices = StorageService.getNotices();
      notices.forEach((nt) => batch.set(doc(db, 'notices', nt.id), nt));

      const notifs = StorageService.getNotifications();
      notifs.forEach((nf) => batch.set(doc(db, 'notifications', nf.id), nf));

      const subjects = StorageService.getSubjectsMap();
      batch.set(doc(db, 'settings', 'subjects'), {
        map: subjects,
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      this.updateStatus({
        isConnected: true,
        isSyncing: false,
        lastSyncTime: new Date().toLocaleTimeString(),
      });
      console.log('[FirebaseSync] Full local-to-cloud sync completed successfully!');
    } catch (err) {
      console.error('[FirebaseSync] Error syncing all local to cloud:', err);
      this.updateStatus({
        isSyncing: false,
        errorMessage: err instanceof Error ? err.message : 'Sync failed',
      });
    }
  }
}

export const FirebaseSync = new FirebaseSyncService();

// Hook storage updates to write-through to Firebase Firestore
setCloudSyncAdapter({
  saveNote: (n) => FirebaseSync.saveNote(n),
  deleteNote: (id) => FirebaseSync.deleteNote(id),
  saveHomework: (h) => FirebaseSync.saveHomework(h),
  deleteHomework: (id) => FirebaseSync.deleteHomework(id),
  saveNotice: (n) => FirebaseSync.saveNotice(n),
  deleteNotice: (id) => FirebaseSync.deleteNotice(id),
  saveNotification: (n) => FirebaseSync.saveNotification(n),
  deleteNotification: (id) => FirebaseSync.deleteNotification(id),
  saveSubjectsMap: (m) => FirebaseSync.saveSubjectsMap(m),
});
