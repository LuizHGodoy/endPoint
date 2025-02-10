import { openDB } from "idb";
import type { Collection, TempRequest } from "./atoms";

const DB_NAME = "endpoint-db";
const DB_VERSION = 1;

const initDB = async () => {
	return openDB(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains("collections")) {
				db.createObjectStore("collections", { keyPath: "id" });
			}
			if (!db.objectStoreNames.contains("tempRequest")) {
				db.createObjectStore("tempRequest");
			}
			if (!db.objectStoreNames.contains("currentIds")) {
				db.createObjectStore("currentIds");
			}
		},
	});
};

export const dbService = {
	async getAllCollections(): Promise<Collection[]> {
		const db = await initDB();
		const collections = await db.getAll("collections");
		return collections;
	},

	async saveCollections(collections: Collection[]): Promise<void> {
		const db = await initDB();
		const tx = db.transaction("collections", "readwrite");
		await tx.store.clear();
		for (const collection of collections) {
			await tx.store.add(collection);
		}
		await tx.done;
	},

	async getTempRequest(): Promise<TempRequest | null> {
		const db = await initDB();
		return db.get("tempRequest", "current");
	},

	async saveTempRequest(request: TempRequest): Promise<void> {
		const db = await initDB();
		await db.put("tempRequest", request, "current");
	},

	async getCurrentIds(): Promise<{ collectionId: string; endpointId: string }> {
		const db = await initDB();
		const ids = await db.get("currentIds", "current");
		return ids || { collectionId: "default", endpointId: "default-get" };
	},

	async saveCurrentIds(
		collectionId: string,
		endpointId: string,
	): Promise<void> {
		const db = await initDB();
		await db.put("currentIds", { collectionId, endpointId }, "current");
	},

	async clearDB(): Promise<void> {
		const db = await initDB();
		const tx = db.transaction(
			["collections", "tempRequest", "currentIds"],
			"readwrite",
		);
		await Promise.all([
			tx.objectStore("collections").clear(),
			tx.objectStore("tempRequest").clear(),
			tx.objectStore("currentIds").clear(),
		]);
		await tx.done;
	},
};
