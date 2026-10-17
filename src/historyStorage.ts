export interface Scene {
  sceneNumber: number;
  timeRange: string;
  sceneTitleKhmer: string;
  sceneStoryKhmer: string;
  aiVideoPrompt: string;
  cameraMotion: string;
  continuityNotes: string;
}

export interface StoryResult {
  storyTitle: string;
  style: string;
  charactersSummary: string;
  totalScenes: number;
  scenes: Scene[];
}

export interface HistoryStory {
  id: string;
  createdAt: number;
  timestamp?: number;
  dateFormatted: string;
  title?: string;
  storyTitle: string;
  description: string;
  characters: string;
  visualStyle: string;
  totalScenes: number;
  totalDurationSeconds: number;
  durationPerPromptSeconds: number;
  shots?: number;
  duration?: string;
  prompts?: string[];
  result: StoryResult;
  sceneImages?: Record<number, string>;
}

export const PRIMARY_STORAGE_KEY = 'story_generator_history';
export const LEGACY_STORAGE_KEY = 'story_creator_history';
const STORAGE_KEY = PRIMARY_STORAGE_KEY;
const LATEST_RESULT_KEY = 'story_latest_result';
const IDB_NAME = 'ai_story_history_vault_v2';
const IDB_STORE = 'history_items';
const IDB_META_STORE = 'history_meta';

// In-memory cache
let inMemoryHistory: HistoryStory[] | null = null;

/**
 * Open or upgrade IndexedDB database
 */
function openHistoryDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    try {
      const request = window.indexedDB.open(IDB_NAME, 2);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(IDB_META_STORE)) {
          db.createObjectStore(IDB_META_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Save history to IndexedDB
 */
async function saveToIndexedDB(items: HistoryStory[]): Promise<void> {
  try {
    const db = await openHistoryDB();
    if (!db) return;

    const tx = db.transaction([IDB_STORE, IDB_META_STORE], 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const metaStore = tx.objectStore(IDB_META_STORE);

    // Save full items list snapshot in meta store for instant array retrieval
    metaStore.put(items, 'all_stories');

    // Also store individual items in the object store
    for (const item of items) {
      store.put(item);
    }
  } catch {
    // ignore
  }
}

/**
 * Read history from IndexedDB
 */
async function readFromIndexedDB(): Promise<HistoryStory[]> {
  try {
    const db = await openHistoryDB();
    if (!db) return [];

    return new Promise((resolve) => {
      try {
        const tx = db.transaction([IDB_STORE, IDB_META_STORE], 'readonly');
        const metaStore = tx.objectStore(IDB_META_STORE);
        const req = metaStore.get('all_stories');

        req.onsuccess = () => {
          if (Array.isArray(req.result) && req.result.length > 0) {
            resolve(req.result);
          } else {
            // Fallback: read all records from IDB_STORE
            const store = tx.objectStore(IDB_STORE);
            const allReq = store.getAll();
            allReq.onsuccess = () => {
              if (Array.isArray(allReq.result)) {
                // Sort descending by createdAt
                const sorted = allReq.result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                resolve(sorted);
              } else {
                resolve([]);
              }
            };
            allReq.onerror = () => resolve([]);
          }
        };
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  } catch {
    return [];
  }
}

/**
 * Delete a specific record from IndexedDB
 */
async function deleteFromIndexedDB(id: string, updatedList: HistoryStory[]): Promise<void> {
  try {
    const db = await openHistoryDB();
    if (!db) return;
    const tx = db.transaction([IDB_STORE, IDB_META_STORE], 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.objectStore(IDB_META_STORE).put(updatedList, 'all_stories');
  } catch {
    // ignore
  }
}

/**
 * Clear all records from IndexedDB
 */
async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openHistoryDB();
    if (!db) return;
    const tx = db.transaction([IDB_STORE, IDB_META_STORE], 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    tx.objectStore(IDB_META_STORE).delete('all_stories');
  } catch {
    // ignore
  }
}

/**
 * Synchronous initial read (localStorage + sessionStorage) for instant UI mount
 */
export function getInitialHistory(): HistoryStory[] {
  if (inMemoryHistory && inMemoryHistory.length > 0) {
    return inMemoryHistory;
  }

  try {
    if (typeof window === 'undefined') return [];

    // 1. Try primary localStorage (story_generator_history)
    let saved = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (!saved) {
      // Fallback to legacy key
      saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryHistory = parsed;
        return parsed;
      }
    }

    // 2. Try sessionStorage fallback
    let sessionSaved = sessionStorage.getItem(PRIMARY_STORAGE_KEY);
    if (!sessionSaved) {
      sessionSaved = sessionStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (sessionSaved) {
      const parsed = JSON.parse(sessionSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryHistory = parsed;
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Asynchronously load history from persistent IndexedDB and reconcile with localStorage.
 * Guarantees that even if localStorage was wiped when closing or clearing tabs,
 * history is fully recovered and preserved!
 */
export async function loadPersistentHistory(): Promise<HistoryStory[]> {
  const localItems = getInitialHistory();

  try {
    const idbItems = await readFromIndexedDB();

    if (idbItems && idbItems.length > 0) {
      // Merge items based on unique ID to avoid duplicates and retain all records
      const itemMap = new Map<string, HistoryStory>();
      for (const item of idbItems) {
        if (item && item.id) itemMap.set(item.id, item);
      }
      for (const item of localItems) {
        if (item && item.id) itemMap.set(item.id, item);
      }

      const merged = Array.from(itemMap.values()).sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      inMemoryHistory = merged;

      // Sync back to localStorage & sessionStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch {
        // ignore
      }

      // Re-save merged set to IndexedDB
      saveToIndexedDB(merged);

      return merged;
    }
  } catch {
    // ignore
  }

  return localItems;
}

/**
 * Save a new history item across all storage tiers (IndexedDB + localStorage + sessionStorage)
 */
export async function persistNewHistoryItem(newItem: HistoryStory, prevItems: HistoryStory[]): Promise<HistoryStory[]> {
  const filtered = prevItems.filter((h) => h.id !== newItem.id && h.storyTitle !== newItem.storyTitle);
  const updated = [newItem, ...filtered].slice(0, 50);

  inMemoryHistory = updated;

  // 1. localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // If quota exceeded, trim oldest items
    try {
      const smaller = updated.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(smaller));
    } catch {
      // ignore
    }
  }

  // 2. sessionStorage
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  // 3. Persistent IndexedDB (survives tab clears and app closures)
  await saveToIndexedDB(updated);

  return updated;
}

/**
 * Remove an item from history across all storage tiers
 */
export async function removeHistoryItem(id: string, currentItems: HistoryStory[]): Promise<HistoryStory[]> {
  const updated = currentItems.filter((h) => h.id !== id);
  inMemoryHistory = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  await deleteFromIndexedDB(id, updated);
  return updated;
}

/**
 * Clear all history across all storage tiers
 */
export async function clearAllHistory(): Promise<void> {
  inMemoryHistory = [];

  try {
    localStorage.removeItem(PRIMARY_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    sessionStorage.removeItem(PRIMARY_STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // ignore
  }

  await clearIndexedDB();
}

/**
 * Save latest active story result and draft so reopening the app immediately shows the story
 */
export function saveLatestActiveStory(result: StoryResult | null): void {
  try {
    if (!result) {
      localStorage.removeItem(LATEST_RESULT_KEY);
      return;
    }
    localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(result));
  } catch {
    // ignore
  }
}

/**
 * Retrieve latest active story result
 */
export function getLatestActiveStory(): StoryResult | null {
  try {
    const raw = localStorage.getItem(LATEST_RESULT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}
