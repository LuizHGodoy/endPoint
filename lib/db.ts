import { openDB } from "idb";
import type { Collection, GlobalEnvironment, TempRequest } from "./atoms";

const DB_NAME = "endpoint-db";
const DB_VERSION = 3;

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains("collections")) {
          db.createObjectStore("collections", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("tempRequest")) {
          db.createObjectStore("tempRequest");
        }
        if (!db.objectStoreNames.contains("currentIds")) {
          db.createObjectStore("currentIds");
        }
      }

      if (oldVersion < 2) {
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
      }

      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains("globalEnvironment")) {
          const store = db.createObjectStore("globalEnvironment");
          await store.put({ variables: [] }, "global");
        }
      }
    },
  });
};

export const dbService = {
  async getAllCollections(): Promise<Collection[]> {
    try {
      const db = await initDB();
      const collections = await db.getAll("collections");
      return collections;
    } catch (error) {
      console.error("Erro ao buscar collections:", error);
      return [];
    }
  },

  async saveCollections(collections: Collection[]): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction("collections", "readwrite");
      await tx.store.clear();
      for (const collection of collections) {
        await tx.store.add(collection);
      }
      await tx.done;
    } catch (error) {
      console.error("Erro ao salvar collections:", error);
      throw error;
    }
  },

  async getTempRequest(): Promise<TempRequest | null> {
    try {
      const db = await initDB();
      return db.get("tempRequest", "current");
    } catch (error) {
      console.error("Erro ao buscar tempRequest:", error);
      return null;
    }
  },

  async saveTempRequest(request: TempRequest): Promise<void> {
    try {
      const db = await initDB();
      await db.put("tempRequest", request, "current");
    } catch (error) {
      console.error("Erro ao salvar tempRequest:", error);
      throw error;
    }
  },

  async getCurrentIds(): Promise<{ collectionId: string; endpointId: string }> {
    try {
      const db = await initDB();
      const ids = await db.get("currentIds", "current");
      return ids || { collectionId: "default", endpointId: "default-get" };
    } catch (error) {
      console.error("Erro ao buscar currentIds:", error);
      return { collectionId: "default", endpointId: "default-get" };
    }
  },

  async saveCurrentIds(
    collectionId: string,
    endpointId: string
  ): Promise<void> {
    try {
      const db = await initDB();
      await db.put("currentIds", { collectionId, endpointId }, "current");
    } catch (error) {
      console.error("Erro ao salvar currentIds:", error);
      throw error;
    }
  },

  async clearDB(): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction(
        ["collections", "tempRequest", "currentIds"],
        "readwrite"
      );
      await Promise.all([
        tx.objectStore("collections").clear(),
        tx.objectStore("tempRequest").clear(),
        tx.objectStore("currentIds").clear(),
      ]);
      await tx.done;
    } catch (error) {
      console.error("Erro ao limpar banco de dados:", error);
      throw error;
    }
  },
};

export const getGlobalEnvironment = async (): Promise<GlobalEnvironment> => {
  const db = await initDB();
  const globalEnv = await db.get("globalEnvironment", "global");
  return globalEnv || { variables: [] };
};

export const setGlobalEnvironment = async (globalEnv: GlobalEnvironment) => {
  const db = await initDB();
  await db.put("globalEnvironment", globalEnv, "global");
};

export const getCollections = async (): Promise<Collection[]> => {
  const db = await initDB();
  const collections = await db.getAll("collections");
  return collections;
};

export const setCollections = async (collections: Collection[]) => {
  const db = await initDB();
  const tx = db.transaction("collections", "readwrite");
  await Promise.all(collections.map((c) => tx.store.put(c)));
  await tx.done;
};

export const getCurrentCollectionId = async (): Promise<string> => {
  const db = await initDB();
  return (await db.get("currentIds", "collectionId")) || "default";
};

export const getCurrentEndpointId = async (): Promise<string> => {
  const db = await initDB();
  return (await db.get("currentIds", "endpointId")) || "default-get";
};

export const setCurrentCollectionId = async (id: string) => {
  const db = await initDB();
  await db.put("currentIds", id, "collectionId");
};

export const setCurrentEndpointId = async (id: string) => {
  const db = await initDB();
  await db.put("currentIds", id, "endpointId");
};

export const getTempRequest = async (): Promise<TempRequest | undefined> => {
  const db = await initDB();
  return await db.get("tempRequest", "current");
};

export const setTempRequest = async (request: TempRequest | undefined) => {
  const db = await initDB();
  await db.put("tempRequest", request, "current");
};
