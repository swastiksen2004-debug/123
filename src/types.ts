export type SchoolClass =
  | 'Nursery'
  | 'KG 1'
  | 'KG 2'
  | 'Std 1'
  | 'Std 2'
  | 'Std 3'
  | 'Std 4';

export const ALL_CLASSES: SchoolClass[] = [
  'Nursery',
  'KG 1',
  'KG 2',
  'Std 1',
  'Std 2',
  'Std 3',
  'Std 4',
];

export const CLASS_PINS: Record<SchoolClass, string> = {
  'Nursery': 'nursery123',
  'KG 1': 'lkg123',
  'KG 2': 'ukg123',
  'Std 1': 'class1@123',
  'Std 2': 'class2@123',
  'Std 3': 'class3@123',
  'Std 4': 'class4@123',
};

export interface SubjectSlot {
  id: number; // 1 to 10
  name: string; // e.g. "Bengali", "Mathematics", or "" if blank
}

export type ClassSubjectsMap = Record<SchoolClass, SubjectSlot[]>;

export interface Student {
  id?: string;
  name: string;
  class: SchoolClass;
  roll: string;
  section: string;
  birthday: string; // 'YYYY-MM-DD'
}

export interface Note {
  id: string;
  class: SchoolClass;
  subject: string; // Subject name
  title: string;
  content: string;
  date: string; // 'YYYY-MM-DD'
  fileUrl?: string; // Optional PDF/document reference or data URL
  fileName?: string; // Uploaded file name e.g. "Math_Chapter_4_Notes.pdf"
  fileSize?: string; // e.g. "1.2 MB"
  fileType?: string; // e.g. "application/pdf" | "image/jpeg"
}

export type HomeworkPriority = 'Low' | 'Medium' | 'High';

export interface Homework {
  id: string;
  class: SchoolClass;
  subject: string; // Subject name
  title: string;
  description: string;
  instructions?: string;
  assignedDate: string; // 'YYYY-MM-DD'
  dueDate: string; // 'YYYY-MM-DD'
  priority: HomeworkPriority;
  completed: boolean;
  attachment?: string; // Optional reference image URL or base64
}

export type NoticeTarget = 'All Classes' | SchoolClass;

export interface SchoolNotice {
  id: string;
  title: string;
  content: string;
  date: string; // 'YYYY-MM-DD'
  targetClass: NoticeTarget;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string; // 'YYYY-MM-DD'
  type: 'homework' | 'note' | 'announcement';
  targetClass: NoticeTarget;
  isRead: boolean;
}

export type ActiveTab =
  | 'home'
  | 'notes'
  | 'homework'
  | 'notices'
  | 'notifications'
  | 'profile'
  | 'admin';
