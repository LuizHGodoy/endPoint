import {
	collectionsAtom,
	currentCollectionIdAtom,
	currentEndpointIdAtom,
	tempRequestAtom,
} from "@/lib/atoms";
import { dbService } from "@/lib/db";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";

export function useSyncDB() {
	const [collections, setCollections] = useAtom(collectionsAtom);
	const [currentCollectionId, setCurrentCollectionId] = useAtom(
		currentCollectionIdAtom,
	);
	const [currentEndpointId, setCurrentEndpointId] = useAtom(
		currentEndpointIdAtom,
	);
	const [tempRequest, setTempRequest] = useAtom(tempRequestAtom);
	const isInitializedRef = useRef(false);

	useEffect(() => {
		const loadInitialData = async () => {
			try {
				const savedCollections = await dbService.getAllCollections();
				if (savedCollections.length > 0) {
					setCollections(savedCollections);
				}

				const { collectionId, endpointId } = await dbService.getCurrentIds();
				setCurrentCollectionId(collectionId);
				setCurrentEndpointId(endpointId);

				const savedTempRequest = await dbService.getTempRequest();
				if (savedTempRequest) {
					setTempRequest(savedTempRequest);
				}

				isInitializedRef.current = true;
			} catch (error) {
				console.error("Erro ao carregar dados iniciais:", error);
			}
		};

		loadInitialData();
	}, [
		setCollections,
		setCurrentCollectionId,
		setCurrentEndpointId,
		setTempRequest,
	]);

	useEffect(() => {
		if (!isInitializedRef.current) return;

		const saveData = async () => {
			try {
				await dbService.saveCollections(collections);
			} catch (error) {
				console.error("Erro ao salvar coleções:", error);
			}
		};

		saveData();
	}, [collections]);

	useEffect(() => {
		if (!isInitializedRef.current) return;

		const saveData = async () => {
			try {
				await dbService.saveTempRequest(tempRequest);
			} catch (error) {
				console.error("Erro ao salvar request temporária:", error);
			}
		};

		saveData();
	}, [tempRequest]);

	useEffect(() => {
		if (!isInitializedRef.current) return;

		const saveData = async () => {
			try {
				await dbService.saveCurrentIds(currentCollectionId, currentEndpointId);
			} catch (error) {
				console.error("Erro ao salvar IDs atuais:", error);
			}
		};

		saveData();
	}, [currentCollectionId, currentEndpointId]);
}
