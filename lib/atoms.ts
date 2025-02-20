import { atom } from "jotai";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type BodyType = "no body" | "json" | "form-data";
export type AuthType = "none" | "bearer" | "basic" | "apiKey";

export interface ResponseData {
  status: number;
  data: Record<string, unknown>;
  time: number;
}

export interface HistoryItem {
  id: number;
  url: string;
  method: string;
  body: string;
  bodyType: BodyType;
  headers: Record<string, string>;
  response: ResponseData;
  timestamp: string;
}

export interface RequestEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  body?: string;
  headers?: Record<string, string>;
  bodyType: BodyType;
  authType: AuthType;
  auth?: string;
  history: HistoryItem[];
  lastResponse?: ResponseData;
}

export interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  description?: string;
}

export interface GlobalEnvironment {
  variables: EnvironmentVariable[];
}

export interface Collection {
  id: string;
  name: string;
  endpoints: RequestEndpoint[];
  isOpen?: boolean;
  variables: EnvironmentVariable[];
}

const defaultCollection: Collection = {
  id: "default",
  name: "Exemplos",
  endpoints: [
    {
      id: "default-get",
      name: "GET Request de Exemplo",
      method: "GET",
      path: "https://jsonplaceholder.typicode.com/posts/1",
      bodyType: "no body",
      authType: "none",
      history: [],
      headers: {},
    },
  ],
  isOpen: true,
  variables: [],
};

export interface TempRequest {
  url: string;
  method: HttpMethod;
  body?: string;
  headers?: Record<string, string>;
  bodyType: BodyType;
  authType: AuthType;
  auth?: string;
  response?: ResponseData;
  history?: HistoryItem[];
}

const defaultTempRequest: TempRequest = {
  url: "",
  method: "GET",
  bodyType: "no body",
  authType: "none",
  history: [],
  headers: {},
};

export const collectionsAtom = atom<Collection[]>([defaultCollection]);
export const currentCollectionIdAtom = atom<string>("default");
export const currentEndpointIdAtom = atom<string>("default-get");
export const tempRequestAtom = atom<TempRequest>(defaultTempRequest);

export const currentEndpointAtom = atom((get) => {
  const collections = get(collectionsAtom);
  const currentCollectionId = get(currentCollectionIdAtom);
  const currentEndpointId = get(currentEndpointIdAtom);

  if (!currentCollectionId || !currentEndpointId) return null;

  const collection = collections.find(
    (c: Collection) => c.id === currentCollectionId
  );
  if (!collection) return null;

  return (
    collection.endpoints.find(
      (e: RequestEndpoint) => e.id === currentEndpointId
    ) || null
  );
});

export const updateEndpointHistoryAtom = atom(
  null,
  (
    get,
    set,
    update: {
      collectionId: string;
      endpointId: string;
      historyItem: HistoryItem;
    }
  ) => {
    const collections = get(collectionsAtom);
    const newCollections = collections.map((collection) => {
      if (collection.id !== update.collectionId) return collection;

      return {
        ...collection,
        endpoints: collection.endpoints.map((endpoint) => {
          if (endpoint.id !== update.endpointId) return endpoint;

          const newHistory = [
            update.historyItem,
            ...(endpoint.history || []),
          ].slice(0, 50);
          return {
            ...endpoint,
            history: newHistory,
            lastResponse: update.historyItem.response,
          };
        }),
      };
    });

    set(collectionsAtom, newCollections);
  }
);

export const globalEnvironmentAtom = atom<GlobalEnvironment>({
  variables: [],
});
