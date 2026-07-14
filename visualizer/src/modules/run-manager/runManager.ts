import { ID } from '../lib/id';
import { IndexedDBManager } from '../lib/utils';
import { createMemoryWorkerManager, MemoryWorkerManager } from './workers/memory/manager';

let idb = new IndexedDBManager('run', 'run');

let storedRunManager = {
  get: async (id: string) => {
    let content = await idb.read(`${id}__content`);
    if (!content) return null;

    return new File([content], 'content.v0t');
  },

  set: async (id: string, file: File | Blob) => {
    await idb.write(`${id}__content`, await file.text());
  }
};

let currentWorker: { id: string; manager: MemoryWorkerManager } | null = null;
let getWorker = (id: string, file: File | Blob) => {
  if (currentWorker) {
    if (currentWorker.id === id) return currentWorker.manager;
    currentWorker.manager.dispose();
  }

  currentWorker = { id, manager: createMemoryWorkerManager(file) };

  return currentWorker.manager;
};

export interface StoredRun {
  id: string;
  programName: string;
  date: string;
  size: number;
  isDemo: boolean;
}

export class RunManager {
  static async create(file: File | Blob, opts?: { isDemo?: boolean }) {
    let id = ID.run.generateRandom();
    storedRunManager.set(id, file);

    let manager = getWorker(id, file);

    let { programName } = await manager.start();
    await manager.waitUntilOperations();

    let allRuns = JSON.parse((await idb.read('allRuns')) ?? '[]');
    allRuns = [
      {
        id,
        programName,
        date: new Date().toISOString(),
        size: file.size,
        isDemo: !!opts?.isDemo
      } satisfies StoredRun,
      ...allRuns
    ];
    await idb.write('allRuns', JSON.stringify(allRuns));

    return { id, manager };
  }

  static async store(file: File | Blob) {
    let id = ID.run.generateRandom();
    storedRunManager.set(id, file);

    return { id };
  }

  static async getAll() {
    let allRuns = JSON.parse((await idb.read('allRuns')) ?? '[]');

    return allRuns as StoredRun[];
  }

  static async remove(id: string) {
    let allRuns = JSON.parse((await idb.read('allRuns')) ?? '[]');
    allRuns = allRuns.filter((run: StoredRun) => run.id !== id);
    await idb.write('allRuns', JSON.stringify(allRuns));

    await idb.delete(`${id}__content`);
  }

  static async prepare(id: string) {
    let manager = await RunManager.get(id);
    if (!manager) return null;

    await manager.start();
    await manager.waitUntilOperations();

    return manager;
  }

  static async get(runId: string) {
    if (currentWorker?.id == runId) return currentWorker.manager;

    let file = await storedRunManager.get(runId);
    if (!file) return null;

    return getWorker(runId, file);
  }

  static async delete(id: string) {
    let allRuns = JSON.parse((await idb.read('allRuns')) ?? '[]');
    allRuns = allRuns.filter((run: StoredRun) => run.id !== id);
    await idb.write('allRuns', JSON.stringify(allRuns));

    await idb.delete(`${id}__content`);
  }

  static async clear() {
    let allRuns = JSON.parse((await idb.read('allRuns')) ?? '[]');
    for (let run of allRuns) {
      try {
        await idb.delete(`${run.id}__content`);
      } catch (e) {
        console.error(e);
      }
    }

    await idb.delete('allRuns');
  }

  static getActive() {
    return currentWorker?.id ?? null;
  }
}
