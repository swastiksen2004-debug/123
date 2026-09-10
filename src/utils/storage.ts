import {
  SchoolClass,
  ALL_CLASSES,
  CLASS_PINS,
  SubjectSlot,
  ClassSubjectsMap,
  Student,
  Note,
  Homework,
  SchoolNotice,
  NotificationItem,
  NoticeTarget,
} from '../types';
import { getTodayDateString } from './date';

const STORAGE_KEYS = {
  SUBJECTS_MAP: 'kbssn_subjects_map_v1',
  STUDENT_SESSION: 'kbssn_student_session_v1',
  NOTES: 'kbssn_notes_v1',
  HOMEWORK: 'kbssn_homework_v1',
  NOTICES: 'kbssn_notices_v1',
  NOTIFICATIONS: 'kbssn_notifications_v1',
  READ_NOTIFICATION_IDS: 'kbssn_read_notification_ids_v1',
  DELETED_NOTIFICATION_IDS: 'kbssn_deleted_notification_ids_v1',
  ADMIN_SESSION: 'kbssn_admin_session_v1',
  SIMULATE_BIRTHDAY: 'kbssn_simulate_birthday_v1',
};

export interface CloudSyncAdapter {
  saveNote?: (note: Note) => void;
  deleteNote?: (id: string) => void;
  saveHomework?: (hw: Homework) => void;
  deleteHomework?: (id: string) => void;
  saveNotice?: (notice: SchoolNotice) => void;
  deleteNotice?: (id: string) => void;
  saveNotification?: (notif: NotificationItem) => void;
  deleteNotification?: (id: string) => void;
  saveSubjectsMap?: (map: ClassSubjectsMap) => void;
}

let cloudAdapter: CloudSyncAdapter | null = null;
export function setCloudSyncAdapter(adapter: CloudSyncAdapter) {
  cloudAdapter = adapter;
}

// Default 10 subject slots for each of the 7 classes
export const DEFAULT_CLASS_SUBJECTS: ClassSubjectsMap = {
  Nursery: [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Number Work' },
    { id: 4, name: 'Drawing & Colouring' },
    { id: 5, name: 'General Knowledge' },
    { id: 6, name: 'Rhymes & Storytelling' },
    { id: 7, name: 'Craft & Activity' },
    { id: 8, name: 'Good Habits' },
    { id: 9, name: 'Physical Play' },
    { id: 10, name: 'Music & Rhythm' },
  ],
  'KG 1': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Environmental Studies' },
    { id: 5, name: 'Drawing' },
    { id: 6, name: 'Rhymes' },
    { id: 7, name: 'General Knowledge' },
    { id: 8, name: 'Handwriting' },
    { id: 9, name: 'Craft Work' },
    { id: 10, name: 'Physical Education' },
  ],
  'KG 2': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Environmental Studies' },
    { id: 5, name: 'Drawing' },
    { id: 6, name: 'General Knowledge' },
    { id: 7, name: 'Computer' },
    { id: 8, name: 'Conversation & Rhymes' },
    { id: 9, name: 'Handwriting' },
    { id: 10, name: 'Physical Education' },
  ],
  'Std 1': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Environmental Studies' },
    { id: 5, name: 'Computer' },
    { id: 6, name: 'Drawing' },
    { id: 7, name: 'General Knowledge' },
    { id: 8, name: 'Moral Science' },
    { id: 9, name: 'Handwriting' },
    { id: 10, name: 'Physical Education' },
  ],
  'Std 2': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Environmental Studies' },
    { id: 5, name: 'Computer' },
    { id: 6, name: 'General Science' },
    { id: 7, name: 'General Knowledge' },
    { id: 8, name: 'Drawing' },
    { id: 9, name: 'Moral Science' },
    { id: 10, name: 'Physical Education' },
  ],
  'Std 3': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Science' },
    { id: 5, name: 'Social Studies' },
    { id: 6, name: 'Computer' },
    { id: 7, name: 'General Knowledge' },
    { id: 8, name: 'Drawing' },
    { id: 9, name: 'Moral Science' },
    { id: 10, name: 'Physical Education' },
  ],
  'Std 4': [
    { id: 1, name: 'Bengali' },
    { id: 2, name: 'English' },
    { id: 3, name: 'Mathematics' },
    { id: 4, name: 'Science' },
    { id: 5, name: 'Social Studies' },
    { id: 6, name: 'Computer' },
    { id: 7, name: 'General Knowledge' },
    { id: 8, name: 'Drawing' },
    { id: 9, name: 'Moral Science' },
    { id: 10, name: 'Physical Education' },
  ],
};

export const INITIAL_NOTES: Note[] = [
  // Std 2 Notes
  {
    id: 'note-std2-1',
    class: 'Std 2',
    subject: 'Mathematics',
    title: 'Multiplication Tables & Word Problems',
    content: `Table of 6, 7 & 8:
6 x 1 = 6, 6 x 2 = 12, 6 x 3 = 18, 6 x 4 = 24, 6 x 5 = 30
7 x 1 = 7, 7 x 2 = 14, 7 x 3 = 21, 7 x 4 = 28, 7 x 5 = 35

Rules of Multiplication:
1. Any number multiplied by 0 equals 0 (e.g. 9 x 0 = 0).
2. Any number multiplied by 1 stays the same (e.g. 15 x 1 = 15).
3. Order property: 4 x 5 = 5 x 4 = 20.`,
    date: '2026-09-08',
    fileName: 'Multiplication_Rules_CheatSheet.pdf',
    fileSize: '245 KB',
    fileType: 'application/pdf',
    fileUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFsgNSAwIFIgXQo+PgplbmRvYmoKNSAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDQgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyA2IDAgUgo+PgplbmRvYmoKNiAwIG9iago8PAovTGVuZ3RoIDY5Cj4+CnN0cmVhbQpCVAovRjEgMjQgVGYKMTAwIDcwMCBUZApLQlNTTiBNdWx0aXBsaWNhdGlvbiBUYWJsZXMgJiBOb3RlcyBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDIxNSAwMDAwMCBuIAowMDAwMDAwMjc0IDAwMDAwIG4gCjAwMDAwMDAzNTMgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0NzIKJStPRkYK',
  },
  {
    id: 'note-std2-2',
    class: 'Std 2',
    subject: 'Bengali',
    title: 'সহজ পাঠ - দ্বিতীয় ভাগ (পাঠ ৩)',
    content: `আজ সোমবার, পাড়ার জঙ্গল সাফ করবার দিন।
দঙ্গলে দঙ্গলে ছেলেরা দল বেঁধে চলেছে।
সঙ্গে আছে কাটারি ও কোদাল।

শব্দার্থ:
• দঙ্গল = দল বা ভিড়
• কাটারি = ছোট দা বা অস্ত্র
• কোদাল = মাটি কাটার হাতিয়ার

প্রশ্নোত্তর:
১. আজ সপ্তাহের কোন দিন?
উত্তরঃ আজ সোমবার।
২. ছেলেরা কী করতে চলেছে?
উত্তরঃ ছেলেরা জঙ্গল সাফ করতে চলেছে।`,
    date: '2026-09-07',
  },
  {
    id: 'note-std2-3',
    class: 'Std 2',
    subject: 'Environmental Studies',
    title: 'Parts of Plants and their Uses',
    content: `Plants have different parts with specific functions:
1. Roots: Absorb water and minerals from soil and anchor the plant.
2. Stem: Carries water and food to all parts.
3. Leaves: Called the "Kitchen of the plant" because they prepare food using sunlight.
4. Flowers: Grow into fruits and help in reproduction.
5. Fruits: Contain seeds that grow into new plants.`,
    date: '2026-09-06',
  },

  // Std 1 Notes
  {
    id: 'note-std1-1',
    class: 'Std 1',
    subject: 'English',
    title: 'Nouns - Naming Words for People, Places & Animals',
    content: `What is a Noun?
A noun is the name of a person, place, animal, or thing.

Examples:
• Person: Teacher, Doctor, Mother, Rahul
• Place: School, Garden, Kolkata, Hospital
• Animal: Tiger, Elephant, Dog, Parrot
• Thing: Pencil, Book, Chair, Bottle`,
    date: '2026-09-08',
  },
  {
    id: 'note-std1-2',
    class: 'Std 1',
    subject: 'Mathematics',
    title: 'Addition of Single & Double Digit Numbers',
    content: `Addition means putting things together.
The symbol for addition is '+' (plus).

Practice:
5 + 3 = 8
7 + 4 = 11
12 + 6 = 18
20 + 10 = 30`,
    date: '2026-09-07',
  },

  // Std 3 Notes
  {
    id: 'note-std3-1',
    class: 'Std 3',
    subject: 'Science',
    title: 'Living and Non-Living Things',
    content: `Living Things:
1. Can breathe air.
2. Need food and water to grow.
3. Can move on their own.
4. Can reproduce (give birth to young ones).
5. Can feel changes around them.

Non-Living Things:
Do not breathe, eat, grow, or move on their own (e.g. rocks, desks, toys).`,
    date: '2026-09-05',
  },

  // Std 4 Notes
  {
    id: 'note-std4-1',
    class: 'Std 4',
    subject: 'Science',
    title: 'States of Matter: Solid, Liquid & Gas',
    content: `Matter is anything that has mass and occupies space.
Three States:
1. Solid: Definite shape and fixed volume (e.g., Ice, Stone).
2. Liquid: Fixed volume but takes the shape of its container (e.g., Water, Milk).
3. Gas: No definite shape or volume, fills any available space (e.g., Oxygen, Steam).`,
    date: '2026-09-04',
  },

  // KG 1 Notes
  {
    id: 'note-kg1-1',
    class: 'KG 1',
    subject: 'English',
    title: 'Phonics Sounds: A to F Words',
    content: `Phonics practice:
A says 'æ' as in Apple, Ant
B says 'b' as in Ball, Bat
C says 'k' as in Cat, Cup
D says 'd' as in Dog, Doll
E says 'e' as in Elephant, Egg
F says 'f' as in Fish, Fan`,
    date: '2026-09-08',
  },

  // Nursery Notes
  {
    id: 'note-nur-1',
    class: 'Nursery',
    subject: 'Rhymes & Storytelling',
    title: 'Twinkle Twinkle Little Star & Bangla Chhora',
    content: `Rhyme 1:
Twinkle, twinkle, little star,
How I wonder what you are!
Up above the world so high,
Like a diamond in the sky.

বাংলা ছড়া:
আতা গাছে তোতা পাখি
ডালিম গাছে মৌ,
এত ডাকি তবু কথা
কও না কেন বউ?`,
    date: '2026-09-06',
  },
];

export const INITIAL_HOMEWORK: Homework[] = [
  // Std 2 Homework
  {
    id: 'hw-std2-1',
    class: 'Std 2',
    subject: 'Mathematics',
    title: 'Practice Multiplication Table 6 to 8',
    description: 'Write tables of 6, 7 and 8 in your math exercise book. Complete exercise 4 on page 32.',
    assignedDate: '2026-09-09',
    dueDate: '2026-09-12',
    priority: 'High',
    completed: false,
  },
  {
    id: 'hw-std2-2',
    class: 'Std 2',
    subject: 'Bengali',
    title: 'সহজ পাঠ ৩য় পাঠ প্রশ্নোত্তর লেখা',
    description: 'খাতায় ১ থেকে ৫ নম্বর প্রশ্ন ও উত্তর সুন্দর হস্তাক্ষরে লিখে আনতে হবে।',
    assignedDate: '2026-09-08',
    dueDate: '2026-09-10',
    priority: 'High',
    completed: false,
  },
  {
    id: 'hw-std2-3',
    class: 'Std 2',
    subject: 'Drawing',
    title: 'Colour the National Flag of India',
    description: 'Draw and colour the tricolour flag neatly on drawing sheet with saffron, white, and green.',
    assignedDate: '2026-09-05',
    dueDate: '2026-09-08', // Overdue
    priority: 'Low',
    completed: false,
  },

  // Std 1 Homework
  {
    id: 'hw-std1-1',
    class: 'Std 1',
    subject: 'English',
    title: 'Circle the Nouns Worksheet',
    description: 'Find and circle 10 naming words from Chapter 2 in your English Reader.',
    assignedDate: '2026-09-09',
    dueDate: '2026-09-11',
    priority: 'Medium',
    completed: false,
  },

  // Std 3 Homework
  {
    id: 'hw-std3-1',
    class: 'Std 3',
    subject: 'Science',
    title: 'Diagram of Living vs Non-Living Things',
    description: 'Paste 4 pictures of living things and 4 pictures of non-living things in your scrapbook.',
    assignedDate: '2026-09-08',
    dueDate: '2026-09-13',
    priority: 'Medium',
    completed: false,
  },

  // Nursery Homework
  {
    id: 'hw-nur-1',
    class: 'Nursery',
    subject: 'Drawing & Colouring',
    title: 'Colour the Big Red Apple',
    description: 'Use red wax crayon to colour inside the apple outline on page 5.',
    assignedDate: '2026-09-09',
    dueDate: '2026-09-11',
    priority: 'Low',
    completed: false,
  },
];

export const INITIAL_NOTICES: SchoolNotice[] = [
  {
    id: 'notice-1',
    title: 'Annual Sports Day 2026 Notice',
    content: 'Kartik Bidyanta Smriti Sishu Niketan Annual Sports Day will be held next month. Students from Nursery to Std 4 are encouraged to participate in flat race, sack race, and relay competitions.',
    date: '2026-09-09',
    targetClass: 'All Classes',
  },
  {
    id: 'notice-2',
    title: 'Std 2 Drawing Competition on Saturday',
    content: 'All Std 2 students must bring wax crayons and drawing boards this Saturday for the Intra-Class Nature Drawing competition.',
    date: '2026-09-08',
    targetClass: 'Std 2',
  },
  {
    id: 'notice-3',
    title: 'Parent-Teacher Meeting (PTM) Schedule',
    content: 'First term progress review meeting for all parents will be conducted from 10:00 AM to 1:00 PM this coming Saturday.',
    date: '2026-09-07',
    targetClass: 'All Classes',
  },
  {
    id: 'notice-4',
    title: 'Nursery & KG Rhymes Recitation Showcase',
    content: 'Special morning assembly recitation event for Nursery, KG 1, and KG 2 students next Wednesday.',
    date: '2026-09-06',
    targetClass: 'Nursery',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Mathematics Homework',
    message: 'New Mathematics homework has been added for Std 2.',
    date: '2026-09-09',
    type: 'homework',
    targetClass: 'Std 2',
    isRead: false,
  },
  {
    id: 'notif-2',
    title: 'New Bengali Note Added',
    message: 'New Bengali note "সহজ পাঠ - দ্বিতীয় ভাগ" has been added for Std 2.',
    date: '2026-09-08',
    type: 'note',
    targetClass: 'Std 2',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Annual Sports Day Announcement',
    message: 'New school notice has been posted for All Classes.',
    date: '2026-09-09',
    type: 'announcement',
    targetClass: 'All Classes',
    isRead: true,
  },
  {
    id: 'notif-4',
    title: 'English Nouns Lesson Uploaded',
    message: 'New English note has been added for Std 1.',
    date: '2026-09-08',
    type: 'note',
    targetClass: 'Std 1',
    isRead: true,
  },
];

export const StorageService = {
  // 1. Subjects Map (10 slots per class)
  getSubjectsMap(): ClassSubjectsMap {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS_MAP);
    if (!raw) {
      this.saveSubjectsMap(DEFAULT_CLASS_SUBJECTS);
      return DEFAULT_CLASS_SUBJECTS;
    }
    try {
      const parsed = JSON.parse(raw);
      // Ensure all 7 classes have 10 slots
      const merged = { ...DEFAULT_CLASS_SUBJECTS };
      ALL_CLASSES.forEach((cls) => {
        if (Array.isArray(parsed[cls]) && parsed[cls].length === 10) {
          merged[cls] = parsed[cls];
        }
      });
      return merged;
    } catch {
      return DEFAULT_CLASS_SUBJECTS;
    }
  },

  saveSubjectsMap(map: ClassSubjectsMap): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS_MAP, JSON.stringify(map));
  },

  getClassSubjects(schoolClass: SchoolClass): SubjectSlot[] {
    const map = this.getSubjectsMap();
    return map[schoolClass] || DEFAULT_CLASS_SUBJECTS[schoolClass];
  },

  updateSubjectSlot(
    schoolClass: SchoolClass,
    slotId: number,
    newName: string
  ): void {
    const map = this.getSubjectsMap();
    const classSlots = map[schoolClass] ? [...map[schoolClass]] : [...DEFAULT_CLASS_SUBJECTS[schoolClass]];
    const index = classSlots.findIndex((s) => s.id === slotId);
    if (index >= 0) {
      classSlots[index] = { id: slotId, name: newName.trim() };
      map[schoolClass] = classSlots;
      this.saveSubjectsMap(map);
      cloudAdapter?.saveSubjectsMap?.(map);

      // Trigger automatic notification
      this.createAutomaticNotification({
        title: 'Subject Curriculum Updated',
        message: `Subject Slot #${slotId} for ${schoolClass} updated to "${newName.trim()}".`,
        type: 'announcement',
        targetClass: schoolClass,
      });
    }
  },

  // 2. Student Session (Current logged in student)
  getStudentSession(): Student | null {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENT_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveStudentSession(student: Student | null): void {
    if (student) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_SESSION, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_SESSION);
    }
  },

  // 3. Notes
  getNotes(): Note[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      this.saveNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTES;
    }
  },

  saveNotes(notes: Note[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  upsertNote(note: Note, isUpdate = false): void {
    const notes = this.getNotes();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.unshift(note);
    }
    this.saveNotes(notes);
    cloudAdapter?.saveNote?.(note);

    // Automatic notification
    this.createAutomaticNotification({
      title: isUpdate ? 'Study Note Updated' : 'New Note Added',
      message: `New ${note.subject} note "${note.title}" has been ${isUpdate ? 'updated' : 'added'} for ${note.class}.`,
      type: 'note',
      targetClass: note.class,
    });
  },

  deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id);
    this.saveNotes(notes);
    cloudAdapter?.deleteNote?.(id);
  },

  // 4. Homework
  getHomework(): Homework[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    if (!raw) {
      this.saveHomework(INITIAL_HOMEWORK);
      return INITIAL_HOMEWORK;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_HOMEWORK;
    }
  },

  saveHomework(homework: Homework[]): void {
    localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(homework));
  },

  upsertHomework(item: Homework, isUpdate = false): void {
    const list = this.getHomework();
    const index = list.findIndex((h) => h.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    this.saveHomework(list);
    cloudAdapter?.saveHomework?.(item);

    // Automatic notification
    this.createAutomaticNotification({
      title: isUpdate ? 'Homework Updated' : 'New Homework',
      message: `New ${item.subject} homework "${item.title}" has been added for ${item.class}. Due on ${item.dueDate}.`,
      type: 'homework',
      targetClass: item.class,
    });
  },

  toggleHomeworkCompletion(id: string): Homework[] {
    let updatedItem: Homework | undefined;
    const list = this.getHomework().map((h) => {
      if (h.id === id) {
        updatedItem = { ...h, completed: !h.completed };
        return updatedItem;
      }
      return h;
    });
    this.saveHomework(list);
    if (updatedItem) {
      cloudAdapter?.saveHomework?.(updatedItem);
    }
    return list;
  },

  deleteHomework(id: string): void {
    const list = this.getHomework().filter((h) => h.id !== id);
    this.saveHomework(list);
    cloudAdapter?.deleteHomework?.(id);
  },

  // 5. Notices
  getNotices(): SchoolNotice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTICES);
    if (!raw) {
      this.saveNotices(INITIAL_NOTICES);
      return INITIAL_NOTICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTICES;
    }
  },

  saveNotices(notices: SchoolNotice[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
  },

  upsertNotice(notice: SchoolNotice, isUpdate = false): void {
    const list = this.getNotices();
    const index = list.findIndex((n) => n.id === notice.id);
    if (index >= 0) {
      list[index] = notice;
    } else {
      list.unshift(notice);
    }
    this.saveNotices(list);
    cloudAdapter?.saveNotice?.(notice);

    // Automatic notification
    this.createAutomaticNotification({
      title: isUpdate ? 'Notice Updated' : 'New Notice',
      message: `New notice "${notice.title}" has been posted for ${notice.targetClass}.`,
      type: 'announcement',
      targetClass: notice.targetClass,
    });
  },

  deleteNotice(id: string): void {
    const list = this.getNotices().filter((n) => n.id !== id);
    this.saveNotices(list);
    cloudAdapter?.deleteNotice?.(id);
  },

  // 6. Notifications
  getReadNotificationIds(): Set<string> {
    const raw = localStorage.getItem(STORAGE_KEYS.READ_NOTIFICATION_IDS);
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  },

  saveReadNotificationIds(ids: Set<string>): void {
    localStorage.setItem(STORAGE_KEYS.READ_NOTIFICATION_IDS, JSON.stringify(Array.from(ids)));
  },

  getDeletedNotificationIds(): Set<string> {
    const raw = localStorage.getItem(STORAGE_KEYS.DELETED_NOTIFICATION_IDS);
    if (!raw) return new Set();
    try {
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  },

  saveDeletedNotificationIds(ids: Set<string>): void {
    localStorage.setItem(STORAGE_KEYS.DELETED_NOTIFICATION_IDS, JSON.stringify(Array.from(ids)));
  },

  getNotifications(): NotificationItem[] {
    const readIds = this.getReadNotificationIds();
    const deletedIds = this.getDeletedNotificationIds();
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let list: NotificationItem[] = INITIAL_NOTIFICATIONS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_NOTIFICATIONS;
      }
    } else {
      this.saveNotifications(INITIAL_NOTIFICATIONS);
    }

    // Filter out deleted notifications and guarantee read state persists
    return list
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => ({
        ...n,
        isRead: Boolean(n.isRead || readIds.has(n.id)),
      }));
  },

  saveNotifications(notifs: NotificationItem[]): void {
    const readIds = this.getReadNotificationIds();
    const deletedIds = this.getDeletedNotificationIds();

    const reconciled = notifs
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => ({
        ...n,
        isRead: Boolean(n.isRead || readIds.has(n.id)),
      }));

    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(reconciled));
  },

  createAutomaticNotification(params: {
    title: string;
    message: string;
    type: 'homework' | 'note' | 'announcement';
    targetClass: NoticeTarget;
  }): void {
    const notifs = this.getNotifications();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: params.title,
      message: params.message,
      date: getTodayDateString(),
      type: params.type,
      targetClass: params.targetClass,
      isRead: false,
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    cloudAdapter?.saveNotification?.(newNotif);
  },

  toggleNotificationRead(id: string): NotificationItem[] {
    const readIds = this.getReadNotificationIds();
    let updatedItem: NotificationItem | undefined;

    const list = this.getNotifications().map((n) => {
      if (n.id === id) {
        const nextRead = !n.isRead;
        if (nextRead) {
          readIds.add(n.id);
        } else {
          readIds.delete(n.id);
        }
        updatedItem = { ...n, isRead: nextRead };
        return updatedItem;
      }
      return n;
    });

    this.saveReadNotificationIds(readIds);
    this.saveNotifications(list);

    if (updatedItem) {
      cloudAdapter?.saveNotification?.(updatedItem);
    }
    return list;
  },

  markAllNotificationsRead(studentClass?: SchoolClass): NotificationItem[] {
    const readIds = this.getReadNotificationIds();
    const updatedItems: NotificationItem[] = [];

    const list = this.getNotifications().map((n) => {
      if (!studentClass || n.targetClass === 'All Classes' || n.targetClass === studentClass) {
        readIds.add(n.id);
        const updated = { ...n, isRead: true };
        updatedItems.push(updated);
        return updated;
      }
      return n;
    });

    this.saveReadNotificationIds(readIds);
    this.saveNotifications(list);

    updatedItems.forEach((item) => {
      cloudAdapter?.saveNotification?.(item);
    });

    return list;
  },

  deleteNotification(id: string): NotificationItem[] {
    const deletedIds = this.getDeletedNotificationIds();
    deletedIds.add(id);
    this.saveDeletedNotificationIds(deletedIds);

    const list = this.getNotifications().filter((n) => n.id !== id);
    this.saveNotifications(list);
    cloudAdapter?.deleteNotification?.(id);
    return list;
  },

  clearReadNotifications(studentClass?: SchoolClass): NotificationItem[] {
    const deletedIds = this.getDeletedNotificationIds();
    const toDelete: string[] = [];

    const list = this.getNotifications().filter((n) => {
      const match = !studentClass || n.targetClass === 'All Classes' || n.targetClass === studentClass;
      if (match && n.isRead) {
        deletedIds.add(n.id);
        toDelete.push(n.id);
        return false;
      }
      return true;
    });

    this.saveDeletedNotificationIds(deletedIds);
    this.saveNotifications(list);

    toDelete.forEach((id) => {
      cloudAdapter?.deleteNotification?.(id);
    });

    return list;
  },

  // 7. Admin Session
  isAdminLoggedIn(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  },

  setAdminLoggedIn(val: boolean): void {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  },

  // 8. Birthday Simulation toggle
  isSimulatingBirthdayToday(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SIMULATE_BIRTHDAY) === 'true';
  },

  setSimulateBirthdayToday(val: boolean): void {
    if (val) {
      localStorage.setItem(STORAGE_KEYS.SIMULATE_BIRTHDAY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.SIMULATE_BIRTHDAY);
    }
  },

  // 9. Reset Demo Data
  resetAllDemoData(): void {
    this.saveSubjectsMap(DEFAULT_CLASS_SUBJECTS);
    this.saveNotes(INITIAL_NOTES);
    this.saveHomework(INITIAL_HOMEWORK);
    this.saveNotices(INITIAL_NOTICES);
    this.saveNotifications(INITIAL_NOTIFICATIONS);
  },
};
