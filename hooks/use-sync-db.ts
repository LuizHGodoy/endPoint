import {
  collectionsAtom,
  currentCollectionIdAtom,
  currentEndpointIdAtom,
  globalEnvironmentAtom,
  tempRequestAtom,
} from "@/lib/atoms";
import {
  getCollections,
  getCurrentCollectionId,
  getCurrentEndpointId,
  getGlobalEnvironment,
  getTempRequest,
  setCollections,
  setCurrentCollectionId,
  setCurrentEndpointId,
  setGlobalEnvironment,
  setTempRequest,
} from "@/lib/db";
import { useAtom } from "jotai";
import { useEffect } from "react";

export function useSyncDB() {
  const [collections, setCollectionsAtom] = useAtom(collectionsAtom);
  const [currentCollectionId, setCurrentCollectionIdAtom] = useAtom(
    currentCollectionIdAtom
  );
  const [currentEndpointId, setCurrentEndpointIdAtom] = useAtom(
    currentEndpointIdAtom
  );
  const [tempRequest, setTempRequestAtom] = useAtom(tempRequestAtom);
  const [globalEnv, setGlobalEnvAtom] = useAtom(globalEnvironmentAtom);

  useEffect(() => {
    let mounted = true;

    const initializeFromDB = async () => {
      try {
        const [
          dbCollections,
          dbCurrentCollectionId,
          dbCurrentEndpointId,
          dbTempRequest,
          dbGlobalEnv,
        ] = await Promise.all([
          getCollections(),
          getCurrentCollectionId(),
          getCurrentEndpointId(),
          getTempRequest(),
          getGlobalEnvironment(),
        ]);

        if (!mounted) return;

        setCollectionsAtom(dbCollections);
        setCurrentCollectionIdAtom(dbCurrentCollectionId);
        setCurrentEndpointIdAtom(dbCurrentEndpointId);
        if (dbTempRequest) {
          setTempRequestAtom(dbTempRequest);
        }
        setGlobalEnvAtom(dbGlobalEnv);
      } catch (error) {
        console.error("Erro ao inicializar do banco:", error);
      }
    };

    initializeFromDB();

    return () => {
      mounted = false;
    };
  }, [
    setCollectionsAtom,
    setCurrentCollectionIdAtom,
    setCurrentEndpointIdAtom,
    setTempRequestAtom,
    setGlobalEnvAtom
  ]);

  useEffect(() => {
    const saveToDB = async () => {
      await Promise.all([
        setCollections(collections),
        setCurrentCollectionId(currentCollectionId),
        setCurrentEndpointId(currentEndpointId),
        setTempRequest(tempRequest),
        setGlobalEnvironment(globalEnv),
      ]);
    };

    saveToDB();
  }, [
    collections,
    currentCollectionId,
    currentEndpointId,
    tempRequest,
    globalEnv,
  ]);
}
