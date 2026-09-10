import JSZip from 'jszip';
import { StorageService } from './storage';

// Gather source files via Vite's raw glob
const projectSourceFiles = import.meta.glob<string>(
  ['/src/**/*.{ts,tsx,css,json}', '/index.html', '/package.json', '/tsconfig.json', '/vite.config.ts', '/metadata.json'],
  { query: '?raw', import: 'default', eager: true }
);

/**
 * Creates and triggers a download of a complete ZIP archive containing
 * the entire application source code, configurations, school data, notes with attachments, and docs.
 */
export async function downloadAppZip(): Promise<void> {
  const zip = new JSZip();

  // 1. App documentation
  zip.file(
    'README.md',
    `# Kartik Bidyanta Smriti Sishu Niketan (KBSSN)
## Student & Staff Learning Portal

This archive contains the **full source code** and **complete live database backup** for the KBSSN School Portal.

### Features
- 10 Subject Slots across all classes (Nursery, KG 1, KG 2, Std 1, Std 2, Std 3, Std 4)
- Notes section with direct file upload (PDF, Documents, Images) & download support
- Daily Homework assignments with attachments & priority tags
- School Notices & Circulars
- Student Birthday celebration & Confetti
- Class PIN Security & Staff Admin Portal
- Firebase Cloud Sync & Offline PWA caching

### Running locally
\`\`\`bash
npm install
npm run dev
\`\`\`
Visit http://localhost:3000 in your browser.
`
  );

  // 2. Export complete active school data backup (Notes, Homework, Notices, Subjects)
  const currentData = {
    exportDate: new Date().toISOString(),
    school: 'Kartik Bidyanta Smriti Sishu Niketan (KBSSN)',
    classes: ['Nursery', 'KG 1', 'KG 2', 'Std 1', 'Std 2', 'Std 3', 'Std 4'],
    subjectsMap: StorageService.getSubjectsMap(),
    notes: StorageService.getNotes(),
    homework: StorageService.getHomework(),
    notices: StorageService.getNotices(),
    notifications: StorageService.getNotifications(),
  };

  zip.file('school-data-backup.json', JSON.stringify(currentData, null, 2));

  // 3. Export readable text notes
  const notesFolder = zip.folder('exported-notes');
  if (notesFolder) {
    currentData.notes.forEach((note) => {
      const safeTitle = note.title.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${note.class}_${note.subject}_${safeTitle}.txt`;
      const fileContent = `Title: ${note.title}\nClass: ${note.class}\nSubject: ${note.subject}\nDate: ${note.date}\nAttachment: ${note.fileName || 'None'}\n\n--- Content ---\n${note.content}\n`;
      notesFolder.file(filename, fileContent);
    });
  }

  // 4. Package all application source code files into project-src/
  const srcFolder = zip.folder('project-src');
  if (srcFolder) {
    for (const [filepath, content] of Object.entries(projectSourceFiles)) {
      // Remove leading slash if present
      const cleanPath = filepath.replace(/^\//, '');
      srcFolder.file(cleanPath, content);
    }
  }

  // 5. Generate the ZIP blob and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KBSSN_Full_Source_Code_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
