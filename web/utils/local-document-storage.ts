export type LocalStorageLike = Pick<Storage, "getItem" | "setItem">;
export type StorageProvider = () => LocalStorageLike;

export type LoadLocalDocumentResult =
  | { status: "loaded"; value: string }
  | { status: "empty" }
  | { status: "unavailable" };

export type SaveLocalDocumentResult =
  | { status: "saved" }
  | { status: "too-large" }
  | { status: "unavailable" };

function browserStorage(): LocalStorageLike {
  return window.localStorage;
}

/**
 * Read a locally saved document without allowing browser storage failures
 * (privacy settings, quota, or security exceptions) to break editor startup.
 */
export function loadLocalDocument(
  key: string,
  getStorage: StorageProvider = browserStorage,
): LoadLocalDocumentResult {
  try {
    const value = getStorage().getItem(key);
    return value === null ? { status: "empty" } : { status: "loaded", value };
  } catch {
    return { status: "unavailable" };
  }
}

/**
 * Save only bounded serialized content. The limit uses UTF-8 bytes to match
 * the import/validation boundary, not JavaScript's UTF-16 string length.
 * The caller owns serialization and debounce timing; this function owns the
 * storage boundary and error mapping.
 */
export function saveLocalDocument(
  key: string,
  value: string,
  maxBytes: number,
  getStorage: StorageProvider = browserStorage,
): SaveLocalDocumentResult {
  if (new TextEncoder().encode(value).byteLength > maxBytes) return { status: "too-large" };

  try {
    getStorage().setItem(key, value);
    return { status: "saved" };
  } catch {
    return { status: "unavailable" };
  }
}
