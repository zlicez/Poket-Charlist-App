const DB_NAME = "pocket-charlist";
const DB_VERSION = 1;
const CHARACTERS_STORE = "characters";
const PENDING_CHANGES_STORE = "pendingChanges";

interface PendingChange {
  id: string;
  method: string;
  url: string;
  body?: unknown;
  timestamp: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHARACTERS_STORE)) {
        db.createObjectStore(CHARACTERS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PENDING_CHANGES_STORE)) {
        db.createObjectStore(PENDING_CHANGES_STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txPromise<T>(tx: IDBTransaction, request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function cacheCharacters(characters: unknown[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readwrite");
  const store = tx.objectStore(CHARACTERS_STORE);
  for (const c of characters) {
    store.put(c);
  }
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function cacheCharacter(character: unknown): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readwrite");
  const store = tx.objectStore(CHARACTERS_STORE);
  store.put(character);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getCachedCharacters(): Promise<unknown[]> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readonly");
  const store = tx.objectStore(CHARACTERS_STORE);
  const result = await txPromise(tx, store.getAll());
  db.close();
  return result;
}

export async function getCachedCharacter(id: string): Promise<unknown | undefined> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readonly");
  const store = tx.objectStore(CHARACTERS_STORE);
  const result = await txPromise(tx, store.get(id));
  db.close();
  return result;
}

export async function clearAllCachedCharacters(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readwrite");
  const store = tx.objectStore(CHARACTERS_STORE);
  store.clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function removeCachedCharacter(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHARACTERS_STORE, "readwrite");
  const store = tx.objectStore(CHARACTERS_STORE);
  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function addPendingChange(change: Omit<PendingChange, "id">): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PENDING_CHANGES_STORE, "readwrite");
  const store = tx.objectStore(PENDING_CHANGES_STORE);
  store.add(change);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await openDB();
  const tx = db.transaction(PENDING_CHANGES_STORE, "readonly");
  const store = tx.objectStore(PENDING_CHANGES_STORE);
  const result = await txPromise(tx, store.getAll());
  db.close();
  return result;
}

export async function clearPendingChanges(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PENDING_CHANGES_STORE, "readwrite");
  const store = tx.objectStore(PENDING_CHANGES_STORE);
  store.clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function removePendingChange(id: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(PENDING_CHANGES_STORE, "readwrite");
  const store = tx.objectStore(PENDING_CHANGES_STORE);
  store.delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function getPendingChangesCount(): Promise<number> {
  const db = await openDB();
  const tx = db.transaction(PENDING_CHANGES_STORE, "readonly");
  const store = tx.objectStore(PENDING_CHANGES_STORE);
  const result = await txPromise(tx, store.count());
  db.close();
  return result;
}
