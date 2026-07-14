export class IndexedDBManager {
  private db: IDBDatabase | null = null;

  constructor(
    private dbName: string,
    private storeName: string,
    private dbVersion: number = 1
  ) {}

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      let request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = event => {
        let db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = event => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = event => {
        reject(new Error('Failed to open IndexedDB'));
      };
    });
  }

  public async write(id: string, value: string): Promise<void> {
    let db = await this.openDB();
    return new Promise((resolve, reject) => {
      let transaction = db.transaction(this.storeName, 'readwrite');
      let store = transaction.objectStore(this.storeName);
      let request = store.put({ id, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to write data to IndexedDB'));
    });
  }

  public async read(id: string): Promise<string | null> {
    let db = await this.openDB();
    return new Promise((resolve, reject) => {
      let transaction = db.transaction(this.storeName, 'readonly');
      let store = transaction.objectStore(this.storeName);
      let request = store.get(id);

      request.onsuccess = event => {
        let result = (event.target as IDBRequest).result;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(new Error('Failed to read data from IndexedDB'));
    });
  }

  public async delete(id: string): Promise<void> {
    let db = await this.openDB();
    return new Promise((resolve, reject) => {
      let transaction = db.transaction(this.storeName, 'readwrite');
      let store = transaction.objectStore(this.storeName);
      let request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete data from IndexedDB'));
    });
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
