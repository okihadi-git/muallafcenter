export type QuranBookmark = { surah: number; ayah: number; surahName: string; savedAt: number };
export type LastRead = { surah: number; ayah: number; surahName: string; savedAt: number };

const BOOKMARK_KEY = "hijrahapp-quran-bookmarks-v1";
const LAST_READ_KEY = "hijrahapp-quran-lastread-v1";

function valid(item: unknown): item is QuranBookmark {
  const v = item as QuranBookmark;
  return !!v && typeof v.surah === "number" && typeof v.ayah === "number" && typeof v.surahName === "string" && typeof v.savedAt === "number";
}

export function loadBookmarks(): QuranBookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(valid) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(list: QuranBookmark[]) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  } catch {
    // Penyimpanan penuh atau diblokir: abaikan, aplikasi tetap jalan.
  }
}

export function loadLastRead(): LastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return valid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLastRead(value: LastRead | null) {
  try {
    if (value) localStorage.setItem(LAST_READ_KEY, JSON.stringify(value));
    else localStorage.removeItem(LAST_READ_KEY);
  } catch {
    // diabaikan
  }
}
