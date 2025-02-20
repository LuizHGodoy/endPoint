import { type IDBPDatabase, openDB } from "idb";
import type { Collection, GlobalEnvironment, TempRequest } from "./atoms";

const DB_NAME = "endpoint-db";
const DB_VERSION = 4;

interface EndpointDB {
  collections: { key: string; value: Collection };
  tempRequest: { key: string; value: TempRequest };
  currentIds: { key: string; value: string };
  globalEnvironment: { key: string; value: GlobalEnvironment };
}

let dbInstance: IDBPDatabase<EndpointDB> | null = null;

const initDB = async () => {
  if (dbInstance) return dbInstance;

  const db = await openDB<EndpointDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("collections")) {
        db.createObjectStore("collections", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("tempRequest")) {
        db.createObjectStore("tempRequest");
      }
      if (!db.objectStoreNames.contains("currentIds")) {
        db.createObjectStore("currentIds");
      }
      if (!db.objectStoreNames.contains("globalEnvironment")) {
        const store = db.createObjectStore("globalEnvironment");
        await store.put({ variables: [] }, "global");
      }

      if (oldVersion < 2) {
        try {
          const tx = db.transaction("collections", "readwrite");
          const store = tx.objectStore("collections");
          const collections = await store.getAll();

          for (const collection of collections) {
            if (!collection.variables) {
              collection.variables = [];
              await store.put(collection);
            }
          }

          await tx.done;
        } catch (error) {
          console.error("Erro na migração v2:", error);
        }
      }
    },
    blocked() {
      console.warn("Uma versão anterior do banco está bloqueando a atualização");
    },
    blocking() {
      console.warn("Este banco está bloqueando uma versão mais nova");
      if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
      }
    },
    terminated() {
      console.warn("Banco foi terminado em outro contexto");
      dbInstance = null;
    },
  });

  dbInstance = db;
  return db;
};

const ensureStore = async (db: IDBPDatabase<EndpointDB>, storeName: keyof EndpointDB) => {
  if (!db.objectStoreNames.contains(storeName)) {
    dbInstance = null; 
    throw new Error(`Store ${storeName} não encontrada. Tente recarregar a página.`);
  }
  return db;
};

export const dbService = {
  async getAllCollections(): Promise<Collection[]> {
    const db = await initDB();
    return db.getAll("collections");
  },

  async saveCollections(collections: Collection[]): Promise<void> {
    const db = await initDB();
    const tx = db.transaction("collections", "readwrite");
    const store = tx.objectStore("collections");
    
    await Promise.all(collections.map(collection => store.put(collection)));
    await tx.done;
  },

  async getTempRequest(): Promise<TempRequest | null> {
    const db = await initDB();
    return db.get("tempRequest", "current") || null;
  },

  async saveTempRequest(request: TempRequest): Promise<void> {
    const db = await initDB();
    await db.put("tempRequest", request, "current");
  },

  async getCurrentIds(): Promise<{ collectionId: string; endpointId: string }> {
    const db = await initDB();
    const [collectionId, endpointId] = await Promise.all([
      db.get("currentIds", "collectionId"),
      db.get("currentIds", "endpointId"),
    ]);
    return { collectionId: collectionId || "", endpointId: endpointId || "" };
  },

  async saveCurrentIds(collectionId: string, endpointId: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction("currentIds", "readwrite");
    await Promise.all([
      tx.store.put(collectionId, "collectionId"),
      tx.store.put(endpointId, "endpointId"),
    ]);
    await tx.done;
  },

  async clearDB(): Promise<void> {
    const db = await initDB();
    const tx = db.transaction(
      ["collections", "tempRequest", "currentIds", "globalEnvironment"],
      "readwrite"
    );
    await Promise.all([
      tx.objectStore("collections").clear(),
      tx.objectStore("tempRequest").clear(),
      tx.objectStore("currentIds").clear(),
      tx.objectStore("globalEnvironment").clear(),
    ]);
    await tx.done;
  },
};

export async function getGlobalEnvironment(): Promise<GlobalEnvironment> {
  const db = await initDB();
  await ensureStore(db, "globalEnvironment");
  const env = await db.get("globalEnvironment", "global");
  return env || { variables: [] };
}

export async function setGlobalEnvironment(globalEnv: GlobalEnvironment) {
  const db = await initDB();
  await ensureStore(db, "globalEnvironment");
  const tx = db.transaction("globalEnvironment", "readwrite");
  await tx.store.put(globalEnv, "global");
  await tx.done;
}

export async function getCollections(): Promise<Collection[]> {
  const db = await initDB();
  return db.getAll("collections");
}

export async function setCollections(collections: Collection[]) {
  const db = await initDB();
  const tx = db.transaction("collections", "readwrite");
  await Promise.all(collections.map(col => tx.store.put(col)));
  await tx.done;
}

export async function getCurrentCollectionId(): Promise<string> {
  const db = await initDB();
  return db.get("currentIds", "collectionId") || "";
}

export async function getCurrentEndpointId(): Promise<string> {
  const db = await initDB();
  return db.get("currentIds", "endpointId") || "";
}

export async function setCurrentCollectionId(id: string) {
  const db = await initDB();
  await db.put("currentIds", id, "collectionId");
}

export async function setCurrentEndpointId(id: string) {
  const db = await initDB();
  await db.put("currentIds", id, "endpointId");
}

export async function getTempRequest(): Promise<TempRequest | undefined> {
  const db = await initDB();
  return db.get("tempRequest", "current");
}

export async function setTempRequest(request: TempRequest | undefined) {
  const db = await initDB();
  if (request) {
    await db.put("tempRequest", request, "current");
  } else {
    await db.delete("tempRequest", "current");
  }
}
