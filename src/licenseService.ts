export const LICENSE_STORAGE_KEY = 'app_license_data';
export const DEVICE_ID_STORAGE_KEY = 'app_device_id';
export const SUPABASE_URL_KEY = 'supabase_custom_url';
export const SUPABASE_KEY_KEY = 'supabase_custom_key';

// Verified Supabase credentials for this project
export const DEFAULT_URL = 'https://bbaclylfyqjkggwatsrq.supabase.co';
export const DEFAULT_KEY = 'sb_publishable_XOEq2YkxufHQADUjfuX9Ig_UzEEqFW_';

// Proactively clear any stale or corrupt custom credentials in localStorage
try {
  localStorage.removeItem(SUPABASE_KEY_KEY);
  localStorage.removeItem(SUPABASE_URL_KEY);
} catch {
  // ignore
}

export const PERSISTENT_LICENSE_KEY = 'app_license_key';
export const VIP_STATUS_STORAGE_KEY = 'app_vip_status';
export const HARDWARE_FP_KEY = 'app_hw_fingerprint';

// In-memory cache for ultra-fast, sync access
let inMemoryDeviceId: string | null = null;
let inMemoryLicense: LicenseData | null = null;

// IndexedDB configuration for persistent backup that survives tab clearing
const IDB_NAME = 'ai_story_vip_db';
const IDB_STORE = 'vip_meta';

function idbSet(key: string, value: string): void {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(value, key);
      } catch {
        // ignore
      }
    };
  } catch {
    // ignore
  }
}

function idbRemove(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) return;
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(key);
      } catch {
        // ignore
      }
    };
  } catch {
    // ignore
  }
}

// 1. Deterministic Stable Hardware Fingerprint Generator
// Produces the EXACT same device ID on the same physical phone/browser even if localStorage/Cookies/tabs are wiped.
function generateHardwareFingerprint(): string {
  try {
    if (typeof window === 'undefined') return 'dev-server-default';

    const nav = window.navigator as any;
    const scr = window.screen as any;

    // Use orientation-independent screen dimensions (min x max) so rotating the phone NEVER changes the ID
    const screenWidth = Math.min(scr?.width || 0, scr?.height || 0);
    const screenHeight = Math.max(scr?.width || 0, scr?.height || 0);

    // Canvas GPU fingerprint: draws unique text & shapes to capture device hardware GPU rasterization
    let canvasFp = '';
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(10, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('AIStudio-Vip-Lock', 2, 15);
        canvasFp = canvas.toDataURL();
      }
    } catch {
      // ignore
    }

    const components = [
      nav?.userAgent || '',
      nav?.platform || '',
      nav?.language || nav?.userLanguage || '',
      `${screenWidth}x${screenHeight}`,
      scr?.colorDepth || '24',
      Intl?.DateTimeFormat ? Intl.DateTimeFormat().resolvedOptions().timeZone : '',
      nav?.maxTouchPoints || '0',
      canvasFp.slice(-40)
    ];

    // Simple fast 64-bit FNV-1a hash implementation
    const str = components.join('###');
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');

    // Format like standard UUID so Supabase text/uuid columns accept seamlessly
    return `dev-${hex1}-${hex2.slice(0, 4)}-${hex2.slice(4, 8)}`;
  } catch {
    return 'dev-browser-stable-default';
  }
}

// Multi-storage helpers (localStorage + sessionStorage + Cookies + IndexedDB + window.name backup)
export function setMultiStorage(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;

    // 1. localStorage
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }

    // 2. sessionStorage
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // ignore
    }

    // 3. Persistent Cookie (10 years, SameSite=Lax)
    try {
      const expires = new Date(Date.now() + 3650 * 864e5).toUTCString();
      document.cookie = `${key}=${encodeURIComponent(value)}; max-age=315360000; expires=${expires}; path=/; SameSite=Lax`;
    } catch {
      // ignore
    }

    // 4. IndexedDB async backup
    idbSet(key, value);

    // 5. window.name backup for surviving tab sessions
    try {
      let winObj: Record<string, string> = {};
      try {
        winObj = JSON.parse(window.name || '{}');
      } catch {
        winObj = {};
      }
      winObj[key] = value;
      window.name = JSON.stringify(winObj);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

export function getMultiStorage(key: string): string | null {
  try {
    if (typeof window === 'undefined') return null;

    // 1. Try localStorage
    try {
      const v = localStorage.getItem(key);
      if (v && v.trim()) return v.trim();
    } catch {
      // ignore
    }

    // 2. Try Cookie
    try {
      const match = document.cookie.match(new RegExp('(?:^|; )' + key + '=([^;]*)'));
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (decoded && decoded.trim()) return decoded.trim();
      }
    } catch {
      // ignore
    }

    // 3. Try sessionStorage
    try {
      const sv = sessionStorage.getItem(key);
      if (sv && sv.trim()) return sv.trim();
    } catch {
      // ignore
    }

    // 4. Try window.name backup
    try {
      if (window.name) {
        const winObj = JSON.parse(window.name);
        if (winObj && winObj[key] && typeof winObj[key] === 'string' && winObj[key].trim()) {
          return winObj[key].trim();
        }
      }
    } catch {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}

export function removeMultiStorage(key: string): void {
  try {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }

    try {
      document.cookie = `${key}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    } catch {
      // ignore
    }

    idbRemove(key);

    try {
      if (window.name) {
        const winObj = JSON.parse(window.name || '{}');
        delete winObj[key];
        window.name = JSON.stringify(winObj);
      }
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
}

// Aliases for cookie helpers
export function getPersistentCookie(key: string): string | null {
  return getMultiStorage(key);
}

export function setPersistentCookie(key: string, value: string): void {
  setMultiStorage(key, value);
}

export function deletePersistentCookie(key: string): void {
  removeMultiStorage(key);
}

export interface LicenseData {
  key: string;
  plan_type: string;
  is_active: boolean;
  expires_at?: string | null;
  activated_at?: string;
  device_id?: string | null;
}

export interface ActivationResult {
  success: boolean;
  message: string;
  data?: LicenseData;
  requiresTransferConfirm?: boolean;
}

/**
 * 1. ជួសជុលការបង្កើត Device ID កុំឱ្យប្តូរថ្មីផ្តេសផ្តាស:
 * រក្សាទុកក្នុង 'my_device_id' ហើយមិនបង្កើតថ្មីប្រសិនបើមានស្រាប់។
 */
export function getDeviceId(): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      let id = localStorage.getItem('my_device_id');
      if (!id) {
        // Also check if previously stored under legacy key
        const legacyId = localStorage.getItem('app_device_id') || getMultiStorage('my_device_id');
        if (legacyId && legacyId.trim()) {
          id = legacyId.trim();
        } else {
          id = 'dev-' + Math.random().toString(36).substring(2, 9);
        }
        localStorage.setItem('my_device_id', id);
      }
      inMemoryDeviceId = id;
      return id;
    }
  } catch {
    // ignore
  }
  if (!inMemoryDeviceId) {
    inMemoryDeviceId = 'dev-' + Math.random().toString(36).substring(2, 9);
  }
  return inMemoryDeviceId;
}

export function getOrCreateDeviceId(): string {
  return getDeviceId();
}

// ធានាថា Device ID ត្រូវបានបង្កើត និងរក្សាទុកតាំងពីដំបូង
try {
  getDeviceId();
} catch {
  // ignore
}

/**
 * Get active Supabase configuration (always uses verified project credentials)
 */
export function getSupabaseConfig(): { url: string; key: string } {
  try {
    localStorage.removeItem(SUPABASE_KEY_KEY);
    localStorage.removeItem(SUPABASE_URL_KEY);
  } catch {
    // ignore
  }
  return { url: DEFAULT_URL, key: DEFAULT_KEY };
}

/**
 * Save custom Supabase credentials to localStorage
 */
export function saveSupabaseConfig(url: string, key: string): void {
  try {
    if (url && url.trim()) localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    if (key && key.trim()) localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
  } catch {
    // ignore
  }
}

/**
 * Get current saved license from localStorage or persistent Cookies.
 * Ensures the license is NEVER lost when closing the web app.
 */
export function getSavedLicense(): LicenseData | null {
  try {
    if (inMemoryLicense && inMemoryLicense.key && inMemoryLicense.is_active) {
      return inMemoryLicense;
    }

    // 1. First priority: Check direct localStorage for 'app_vip_status' & 'app_license_key'
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const vipStatus = localStorage.getItem(VIP_STATUS_STORAGE_KEY);
        const savedKey = localStorage.getItem(PERSISTENT_LICENSE_KEY);
        if (vipStatus === 'active' && savedKey && savedKey.trim()) {
          const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
          let parsedMeta: any = {};
          if (raw) {
            try {
              parsedMeta = JSON.parse(raw);
            } catch {
              // ignore
            }
          }
          const activeLicense: LicenseData = {
            key: savedKey.trim(),
            plan_type: parsedMeta.plan_type || 'VIP Member',
            is_active: true,
            expires_at: parsedMeta.expires_at || null,
            activated_at: parsedMeta.activated_at || new Date().toISOString(),
            device_id: parsedMeta.device_id || getOrCreateDeviceId(),
          };
          inMemoryLicense = activeLicense;
          return activeLicense;
        }
      }
    } catch {
      // ignore
    }

    // 2. Check multi-storage (localStorage, Cookie, sessionStorage, window.name)
    const raw = getMultiStorage(LICENSE_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as LicenseData;
        if (parsed && parsed.key && parsed.is_active !== false) {
          inMemoryLicense = parsed;
          return parsed;
        }
      } catch {
        // ignore
      }
    }

    // 3. Fallback to standalone license key if saved in ANY storage tier
    const savedKey = getMultiStorage(PERSISTENT_LICENSE_KEY);
    const vipStatus = getMultiStorage(VIP_STATUS_STORAGE_KEY);
    if (savedKey && savedKey.trim() && vipStatus !== 'inactive') {
      const currentDev = getOrCreateDeviceId();
      const fallbackLicense: LicenseData = {
        key: savedKey.trim(),
        plan_type: 'VIP Member',
        is_active: true,
        expires_at: null,
        activated_at: new Date().toISOString(),
        device_id: currentDev,
      };
      inMemoryLicense = fallbackLicense;
      // Reseed to all storage tiers
      setMultiStorage(LICENSE_STORAGE_KEY, JSON.stringify(fallbackLicense));
      setMultiStorage(VIP_STATUS_STORAGE_KEY, 'active');
      return fallbackLicense;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gating check: returns true if a valid, active and non-expired license exists.
 */
export function isLicenseValid(): boolean {
  try {
    // 1. Direct fast-path check of 'app_vip_status' in localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const vipStatus = localStorage.getItem(VIP_STATUS_STORAGE_KEY);
        const savedKey = localStorage.getItem(PERSISTENT_LICENSE_KEY);
        if (vipStatus === 'active' && savedKey && savedKey.trim()) {
          return true;
        }
        if (vipStatus === 'inactive') {
          return false;
        }
      }
    } catch {
      // ignore
    }

    const license = getSavedLicense();
    if (!license || !license.key || license.is_active === false) {
      return false;
    }
    if (license.expires_at) {
      const expiry = new Date(license.expires_at).getTime();
      if (Date.now() > expiry) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Function checkCurrentLicense() to auto-update/verify status whenever loaded
 */
export function checkCurrentLicense(): LicenseData | null {
  if (isLicenseValid()) {
    return getSavedLicense();
  }
  return null;
}

/**
 * Automatically checks and restores the license upon app startup or page reload.
 * Ensures the user NEVER has to enter the key a second time even after closing the app or clearing tab.
 */
export async function checkAndRestoreLicenseOnStartup(): Promise<LicenseData | null> {
  try {
    const saved = getSavedLicense();
    const key =
      saved?.key ||
      getMultiStorage(PERSISTENT_LICENSE_KEY);

    if (!key || !key.trim()) {
      // Async attempt to read from IndexedDB in case all other storages were wiped
      try {
        if (typeof window !== 'undefined' && window.indexedDB) {
          const idbData = await new Promise<string | null>((resolve) => {
            const req = window.indexedDB.open(IDB_NAME, 1);
            req.onsuccess = () => {
              try {
                const db = req.result;
                if (!db.objectStoreNames.contains(IDB_STORE)) return resolve(null);
                const tx = db.transaction(IDB_STORE, 'readonly');
                const getReq = tx.objectStore(IDB_STORE).get(PERSISTENT_LICENSE_KEY);
                getReq.onsuccess = () => resolve(getReq.result || null);
                getReq.onerror = () => resolve(null);
              } catch {
                resolve(null);
              }
            };
            req.onerror = () => resolve(null);
          });
          if (idbData && idbData.trim()) {
            return checkAndRestoreLicenseWithKey(idbData.trim());
          }
        }
      } catch {
        // ignore
      }
      return null;
    }

    return checkAndRestoreLicenseWithKey(key.trim());
  } catch {
    return getSavedLicense();
  }
}

async function checkAndRestoreLicenseWithKey(key: string): Promise<LicenseData | null> {
  try {
    const saved = getSavedLicense();
    let currentDeviceId = getOrCreateDeviceId();
    const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
    const queryResult = await fetchLicenseFromSupabase(supabaseUrl, supabaseAnonKey, key);

    if (queryResult.ok && queryResult.data && queryResult.data.length > 0) {
      const record = queryResult.data[0];
      const matchedKey = record.license_key || record.key || key;
      const planName = record.plan_type || 'VIP Member';

      // If device_id in Supabase was null, lock it to this device ID
      if (!record.device_id) {
        const patchUrl = `${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(matchedKey)}`;
        fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ device_id: currentDeviceId }),
        }).catch(() => {});
      } else {
        // Supabase already has a device_id registered
        // If this client had previously connected with this license or stored ID matches, sync local ID
        const registeredId = String(record.device_id).trim();
        const storedId = getMultiStorage(DEVICE_ID_STORAGE_KEY);
        if (storedId === registeredId || saved?.device_id === registeredId || saved?.key === matchedKey) {
          currentDeviceId = registeredId;
          inMemoryDeviceId = registeredId;
          setMultiStorage(DEVICE_ID_STORAGE_KEY, registeredId);
        }
      }

      const freshLicense: LicenseData = {
        key: matchedKey,
        plan_type: planName,
        is_active: record.status !== 'inactive' && record.is_active !== false,
        expires_at: record.expires_at || null,
        activated_at: saved?.activated_at || new Date().toISOString(),
        device_id: record.device_id || currentDeviceId,
      };

      inMemoryLicense = freshLicense;
      setMultiStorage(LICENSE_STORAGE_KEY, JSON.stringify(freshLicense));
      setMultiStorage(PERSISTENT_LICENSE_KEY, matchedKey);
      setMultiStorage(DEVICE_ID_STORAGE_KEY, currentDeviceId);

      return freshLicense;
    }

    return saved;
  } catch {
    return getSavedLicense();
  }
}

/**
 * Helper to fetch license record from Supabase table 'licenses'
 */
async function fetchLicenseFromSupabase(
  supabaseUrl: string,
  supabaseAnonKey: string,
  licenseKey: string
): Promise<{ ok: boolean; status: number; data?: any[]; errorText?: string }> {
  const headers = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  };

  // Try query by license_key exact and case-insensitive
  const exactUrl = `${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(licenseKey)}&select=*`;
  let res = await fetch(exactUrl, { method: 'GET', headers });

  if (res.ok) {
    const list = await res.json();
    if (Array.isArray(list) && list.length > 0) {
      return { ok: true, status: res.status, data: list };
    }
  }

  // Try case-insensitive ilike query
  const ilikeUrl = `${supabaseUrl}/rest/v1/licenses?license_key=ilike.${encodeURIComponent(licenseKey)}&select=*`;
  res = await fetch(ilikeUrl, { method: 'GET', headers });

  if (res.ok) {
    const list = await res.json();
    if (Array.isArray(list) && list.length > 0) {
      return { ok: true, status: res.status, data: list };
    }
  }

  // Fallback if column was named 'key'
  const fallbackUrl = `${supabaseUrl}/rest/v1/licenses?key=eq.${encodeURIComponent(licenseKey)}&select=*`;
  const fallbackRes = await fetch(fallbackUrl, { method: 'GET', headers });
  if (fallbackRes.ok) {
    const list = await fallbackRes.json();
    if (Array.isArray(list) && list.length > 0) {
      return { ok: true, status: fallbackRes.status, data: list };
    }
  }

  if (!res.ok) {
    if (res.status === 401 && supabaseAnonKey !== DEFAULT_KEY) {
      return fetchLicenseFromSupabase(DEFAULT_URL, DEFAULT_KEY, licenseKey);
    }
    const errText = await res.text().catch(() => '');
    return { ok: false, status: res.status, errorText: errText };
  }

  return { ok: true, status: 200, data: [] };
}

/**
 * ២. កែសម្រួល Function ពេល Activate License Key:
 * - នៅពេល User វាយ License Key រួចចុច Activate:
 *   const currentDevId = getDeviceId();
 *   
 *   * ទាញយកទិន្នន័យពី Supabase:
 *     - ប្រសិនបើ license.device_id === null ឬស្មើទទេ: 
 *       -> អនុញ្ញាតឱ្យប្រើ និង Update Supabase: device_id = currentDevId
 *     - ប្រសិនបើ license.device_id === currentDevId:
 *       -> អនុញ្ញាតឱ្យប្រើប្រាស់ធម្មតា (ជាម៉ាស៊ីនដដែល)
 *     - ប្រសិនបើ license.device_id !== currentDevId:
 *       -> បង្ហាញ confirm("License Key នេះកំពុងជាប់លើឧបករណ៍ចាស់។ តើអ្នកចង់ដោះសោដើម្បីប្តូរមកប្រើលើទូរស័ព្ទនេះមែនទេ?")
 *       -> បើ User ចុច OK: Update device_id ក្នុង Supabase មកជា currentDevId ភ្លាម រួចអនុញ្ញាតឱ្យប្រើប្រាស់។
 */
export async function activateLicenseKey(
  inputKey: string,
  forceTransfer: boolean = false
): Promise<ActivationResult> {
  const licenseKey = (inputKey || '').trim();

  if (!licenseKey) {
    return {
      success: false,
      message: '⚠️ សូមបញ្ចូលលេខកូដអាជ្ញាប័ណ្ណរបស់អ្នក!',
    };
  }

  // 1. Current Device ID តាម getDeviceId()
  const currentDevId = getDeviceId();
  const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

  // 2. ទាញទិន្នន័យពី Supabase table 'licenses' មកផ្ទៀងផ្ទាត់
  try {
    const queryResult = await fetchLicenseFromSupabase(supabaseUrl, supabaseAnonKey, licenseKey);

    if (!queryResult.ok) {
      return {
        success: false,
        message: `❌ មិនអាចភ្ជាប់ទៅកាន់ Supabase បានទេ (HTTP ${queryResult.status})៖ ${queryResult.errorText || 'សូមពិនិត្យអ៊ីនធឺណិត ឬ API Key'}`,
      };
    }

    const records = queryResult.data || [];
    if (records.length === 0) {
      return {
        success: false,
        message: '❌ លេខកូដអាជ្ញាប័ណ្ណនេះមិនត្រឹមត្រូវ ឬគ្មានក្នុងប្រព័ន្ធ Supabase ទេ!',
      };
    }

    const record = records[0];
    const matchedKey = record.license_key || record.key || licenseKey;

    // ពិនិត្យស្ថានភាព License (active/inactive)
    if (
      record.status === 'inactive' ||
      record.status === 'disabled' ||
      record.status === 'deactivated' ||
      record.is_active === false
    ) {
      return {
        success: false,
        message: '⚠️ អាជ្ញាប័ណ្ណនេះត្រូវបានផ្អាកដំណើរការ (Deactivated)!',
      };
    }

    // ពិនិត្យកាលបរិច្ឆេទផុតកំណត់
    if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
      return {
        success: false,
        message: '⚠️ អាជ្ញាប័ណ្ណនេះបានផុតកំណត់កាលបរិច្ឆេទប្រើប្រាស់ហើយ!',
      };
    }

    // 3. ត្រួតពិនិត្យ Device Lock
    const registeredDeviceId = record.device_id && String(record.device_id).trim() !== ''
      ? String(record.device_id).trim()
      : null;

    // - ប្រសិនបើ license.device_id === null ឬស្មើទទេ:
    //   -> អនុញ្ញាតឱ្យប្រើ និង Update Supabase: device_id = currentDevId
    if (!registeredDeviceId) {
      const patchUrl = `${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(matchedKey)}`;
      let res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ device_id: currentDevId }),
      });

      if (!res.ok) {
        const patchKeyUrl = `${supabaseUrl}/rest/v1/licenses?key=eq.${encodeURIComponent(matchedKey)}`;
        res = await fetch(patchKeyUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ device_id: currentDevId }),
        });
      }

      if (!res.ok) {
        const errDetail = await res.text().catch(() => '');
        return {
          success: false,
          message: `❌ បរាជ័យក្នុងការ Update Device ID ទៅកាន់ Supabase (HTTP ${res.status})៖ ${errDetail || 'សូមព្យាយាមម្តងទៀត'}`,
        };
      }
    }
    // - ប្រសិនបើ license.device_id === currentDevId:
    //   -> អនុញ្ញាតឱ្យប្រើប្រាស់ធម្មតា (ជាម៉ាស៊ីនដដែល)
    else if (registeredDeviceId === currentDevId) {
      // ម៉ាស៊ីនដដែល អនុញ្ញាតឱ្យប្រើប្រាស់ធម្មតា
    }
    // - ប្រសិនបើ license.device_id !== currentDevId:
    //   -> បង្ហាញ confirm("License Key នេះកំពុងជាប់លើឧបករណ៍ចាស់។ តើអ្នកចង់ដោះសោដើម្បីប្តូរមកប្រើលើទូរស័ព្ទនេះមែនទេ?")
    //   -> បើ User ចុច OK: Update device_id ក្នុង Supabase មកជា currentDevId ភ្លាម រួចអនុញ្ញាតឱ្យប្រើប្រាស់។
    else {
      let userConfirmed = Boolean(forceTransfer);

      if (!userConfirmed) {
        try {
          if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
            userConfirmed = window.confirm(
              'License Key នេះកំពុងជាប់លើឧបករណ៍ចាស់។ តើអ្នកចង់ដោះសោដើម្បីប្តូរមកប្រើលើទូរស័ព្ទនេះមែនទេ?'
            );
          }
        } catch {
          userConfirmed = false;
        }
      }

      if (!userConfirmed) {
        return {
          success: false,
          requiresTransferConfirm: true,
          message: 'License Key នេះកំពុងជាប់លើឧបករណ៍ចាស់។ តើអ្នកចង់ដោះសោដើម្បីប្តូរមកប្រើលើទូរស័ព្ទនេះមែនទេ?',
        };
      }

      // User បានចុច OK: Update device_id ក្នុង Supabase មកជា currentDevId ភ្លាម
      const patchUrl = `${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(matchedKey)}`;
      let patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ device_id: currentDevId }),
      });

      if (!patchRes.ok) {
        const patchKeyUrl = `${supabaseUrl}/rest/v1/licenses?key=eq.${encodeURIComponent(matchedKey)}`;
        patchRes = await fetch(patchKeyUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ device_id: currentDevId }),
        });
      }

      if (!patchRes.ok) {
        const errDetail = await patchRes.text().catch(() => '');
        return {
          success: false,
          message: `❌ បរាជ័យក្នុងការដោះសោ និងប្តូរឧបករណ៍ក្នុង Supabase (HTTP ${patchRes.status})៖ ${errDetail || 'សូមព្យាយាមម្តងទៀត'}`,
        };
      }
    }

    // 4. កំណត់ស្ថានភាពជា Active ក្នុង App និងរក្សាទុកក្នុង localStorage
    const planName = record.plan_type || 'VIP Member';
    const licenseData: LicenseData = {
      key: matchedKey,
      plan_type: planName,
      is_active: true,
      expires_at: record.expires_at || null,
      activated_at: new Date().toISOString(),
      device_id: currentDevId,
    };

    inMemoryLicense = licenseData;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(PERSISTENT_LICENSE_KEY, matchedKey);
        localStorage.setItem(VIP_STATUS_STORAGE_KEY, 'active');
        localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
        localStorage.setItem('my_device_id', currentDevId);
      }
    } catch {
      // ignore
    }

    setMultiStorage(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
    setMultiStorage(PERSISTENT_LICENSE_KEY, matchedKey);
    setMultiStorage(VIP_STATUS_STORAGE_KEY, 'active');
    setMultiStorage('my_device_id', currentDevId);

    return {
      success: true,
      message: `🎉 ដំណើរការជោគជ័យ! អ្នកអាចប្រើប្រាស់កញ្ចប់ ${planName} បានពេញលេញ (🔒 ភ្ជាប់ជាមួយឧបករណ៍នេះ)។`,
      data: licenseData,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `❌ បរាជ័យក្នុងការតភ្ជាប់ Supabase API៖ ${err?.message || 'សូមពិនិត្យការតភ្ជាប់អ៊ីនធឺណិត'}`,
    };
  }
}

/**
 * ២. ពេល User ចុចប៊ូតុង "ដកអាជ្ញាប័ណ្ណចេញ" (Deactivate)៖
 * - លុប device_id ក្នុង Supabase ឱ្យទៅជា null វិញ
 * - លុប License ចេញពី Multi-storage ទាំងអស់
 */
export async function deactivateLicenseKey(keyToDeactivate?: string): Promise<{ success: boolean; message: string }> {
  try {
    const saved = getSavedLicense();
    const licenseKey = (keyToDeactivate || saved?.key || '').trim();

    if (licenseKey) {
      const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();
      const headers = {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      };
      const body = JSON.stringify({ device_id: null });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        // 1. Try patch with license_key exact
        const patchUrl = `${supabaseUrl}/rest/v1/licenses?license_key=eq.${encodeURIComponent(licenseKey)}`;
        let res = await fetch(patchUrl, {
          method: 'PATCH',
          headers,
          body,
          signal: controller.signal,
        });

        // 2. Fallback to column 'key' or ilike if not successful
        if (!res.ok) {
          const patchKeyUrl = `${supabaseUrl}/rest/v1/licenses?key=eq.${encodeURIComponent(licenseKey)}`;
          res = await fetch(patchKeyUrl, {
            method: 'PATCH',
            headers,
            body,
            signal: controller.signal,
          });
        }

        if (!res.ok) {
          const errDetail = await res.text().catch(() => '');
          console.warn('Supabase device_id reset error:', errDetail);
        }
      } catch (patchErr) {
        console.warn('Supabase device_id reset fetch error or timeout:', patchErr);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    inMemoryLicense = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(PERSISTENT_LICENSE_KEY);
        localStorage.removeItem(VIP_STATUS_STORAGE_KEY);
        localStorage.removeItem(LICENSE_STORAGE_KEY);
        localStorage.setItem(VIP_STATUS_STORAGE_KEY, 'inactive');
      }
    } catch {
      // ignore
    }
    removeMultiStorage(LICENSE_STORAGE_KEY);
    removeMultiStorage(PERSISTENT_LICENSE_KEY);
    removeMultiStorage(VIP_STATUS_STORAGE_KEY);

    return {
      success: true,
      message: 'ℹ️ បានដកអាជ្ញាប័ណ្ណចេញ និងដោះសោឧបករណ៍ក្នុង Supabase រួចរាល់។',
    };
  } catch (err: any) {
    inMemoryLicense = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(PERSISTENT_LICENSE_KEY);
        localStorage.removeItem(VIP_STATUS_STORAGE_KEY);
        localStorage.removeItem(LICENSE_STORAGE_KEY);
        localStorage.setItem(VIP_STATUS_STORAGE_KEY, 'inactive');
      }
    } catch {
      // ignore
    }
    removeMultiStorage(LICENSE_STORAGE_KEY);
    removeMultiStorage(PERSISTENT_LICENSE_KEY);
    removeMultiStorage(VIP_STATUS_STORAGE_KEY);

    return {
      success: true,
      message: `ℹ️ បានដកអាជ្ញាប័ណ្ណចេញពីម៉ាស៊ីនរួចរាល់ (${err?.message || ''})។`,
    };
  }
}

/**
 * Remove/Deactivate stored license from local storage and cookies
 */
export function removeSavedLicense(): void {
  inMemoryLicense = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(PERSISTENT_LICENSE_KEY);
      localStorage.removeItem(VIP_STATUS_STORAGE_KEY);
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      localStorage.setItem(VIP_STATUS_STORAGE_KEY, 'inactive');
    }
  } catch {
    // ignore
  }
  removeMultiStorage(LICENSE_STORAGE_KEY);
  removeMultiStorage(PERSISTENT_LICENSE_KEY);
  removeMultiStorage(VIP_STATUS_STORAGE_KEY);
}
