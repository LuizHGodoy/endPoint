import {
  type Collection,
  type RequestEndpoint,
  collectionsAtom,
  currentCollectionIdAtom,
  currentEndpointIdAtom,
} from "@/lib/atoms";
import { useAtom } from "jotai";
import { Folder, MoreVertical, Pencil, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CollectionsSidebarProps {
  isCollapsed: boolean;
}

export default function CollectionsSidebar({
  isCollapsed,
}: CollectionsSidebarProps) {
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [currentCollectionId, setCurrentCollectionId] = useAtom(
    currentCollectionIdAtom
  );
  const [currentEndpointId, setCurrentEndpointId] = useAtom(
    currentEndpointIdAtom
  );
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isEditingEndpoint, setIsEditingEndpoint] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<
    string | null
  >(null);
  const [editingName, setEditingName] = useState<{
    id: string;
    type: "collection" | "endpoint";
    name: string;
  } | null>(null);
  const [newEndpoint, setNewEndpoint] = useState<Partial<RequestEndpoint>>({
    method: "GET",
    name: "",
    path: "",
    bodyType: "no body",
    authType: "none",
  });

  const toggleCollection = (id: string) => {
    setCollections(
      collections.map((col) =>
        col.id === id ? { ...col, isOpen: !col.isOpen } : col
      )
    );
  };

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        endpoints: [],
        isOpen: true,
      };
      setCollections([...collections, newCollection]);
      setNewCollectionName("");
      setIsCreatingCollection(false);
    }
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter((col) => col.id !== id));
  };

  const addEndpoint = () => {
    if (!selectedCollectionId || !newEndpoint.path || !newEndpoint.name) return;

    const endpoint: RequestEndpoint = {
      id: Date.now().toString(),
      name: newEndpoint.name,
      method: newEndpoint.method || "GET",
      path: newEndpoint.path,
      body: newEndpoint.body || "",
      headers: newEndpoint.headers || {},
      bodyType: newEndpoint.bodyType || "no body",
      authType: newEndpoint.authType || "none",
      history: [],
    };

    setCollections(
      collections.map((col) =>
        col.id === selectedCollectionId
          ? {
              ...col,
              endpoints: [...col.endpoints, endpoint],
            }
          : col
      )
    );
    setIsEditingEndpoint(false);
    setNewEndpoint({
      method: "GET",
      name: "",
      path: "",
      bodyType: "no body",
      authType: "none",
    });
    setSelectedCollectionId(null);
  };

  const deleteEndpoint = (collectionId: string, endpointId: string) => {
    setCollections(
      collections.map((col) =>
        col.id === collectionId
          ? {
              ...col,
              endpoints: col.endpoints.filter((ep) => ep.id !== endpointId),
            }
          : col
      )
    );
  };

  const handleEndpointClick = (
    collectionId: string,
    endpoint: RequestEndpoint
  ) => {
    setCurrentCollectionId(collectionId);
    setCurrentEndpointId(endpoint.id);
  };

  const handleRename = (
    id: string,
    type: "collection" | "endpoint",
    currentName: string
  ) => {
    setEditingName({ id, type, name: currentName });
  };

  const handleSaveRename = () => {
    if (!editingName) return;

    if (editingName.type === "collection") {
      setCollections(
        collections.map((col) =>
          col.id === editingName.id ? { ...col, name: editingName.name } : col
        )
      );
    } else {
      setCollections(
        collections.map((col) => ({
          ...col,
          endpoints: col.endpoints.map((ep) =>
            ep.id === editingName.id ? { ...ep, name: editingName.name } : ep
          ),
        }))
      );
    }

    setEditingName(null);
  };

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="h-full bg-gray-900 text-gray-300 p-2 flex flex-col overflow-hidden relative">
          <div className="overflow-y-auto flex-1 space-y-4">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="relative group"
                style={{ zIndex: 50 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`w-full h-8 flex items-center justify-center ${
                        currentCollectionId === collection.id
                          ? "bg-gray-800"
                          : ""
                      }`}
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <Folder className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    sideOffset={10}
                    className="bg-gray-800 text-gray-100 z-[100]"
                  >
                    <p>{collection.name}</p>
                  </TooltipContent>
                </Tooltip>

                {collection.isOpen && (
                  <div className="pl-2 mt-1 space-y-1">
                    {collection.endpoints.map((endpoint) => (
                      <Tooltip key={endpoint.id}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`w-full h-6 flex items-center justify-center ${
                              currentEndpointId === endpoint.id
                                ? "bg-gray-800"
                                : ""
                            }`}
                            onClick={() =>
                              handleEndpointClick(collection.id, endpoint)
                            }
                          >
                            <span
                              className={`text-xs font-mono
                                ${endpoint.method === "GET" && "text-green-500"}
                                ${
                                  endpoint.method === "POST" &&
                                  "text-yellow-500"
                                }
                                ${endpoint.method === "PUT" && "text-blue-500"}
                                ${
                                  endpoint.method === "DELETE" && "text-red-500"
                                }
                              `}
                            >
                              {endpoint.method[0]}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={10}
                          className="bg-gray-800 text-gray-100 z-[100]"
                        >
                          <p className="font-mono">
                            {endpoint.method} {endpoint.name}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="h-full bg-gray-900 text-gray-300 p-2 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-semibold">Coleções</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreatingCollection(true)}
            className="hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isCreatingCollection && (
          <div className="mb-4 flex gap-2 shrink-0">
            <Input
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Nome da coleção"
              className="bg-gray-800 border-gray-700"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateCollection();
                if (e.key === "Escape") setIsCreatingCollection(false);
              }}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateCollection}
              className="hover:bg-gray-800"
            >
              ✓
            </Button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          {collections.map((collection) => (
            <div key={collection.id} className="mb-2">
              <div className="flex items-center justify-between hover:bg-gray-800 p-2 rounded group">
                {editingName?.id === collection.id ? (
                  <div className="flex items-center flex-1 gap-2">
                    <Input
                      value={editingName.name}
                      onChange={(e) =>
                        setEditingName({ ...editingName, name: e.target.value })
                      }
                      className="bg-gray-800 border-gray-700"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename();
                        if (e.key === "Escape") setEditingName(null);
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveRename}
                      className="hover:bg-gray-800"
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => toggleCollection(collection.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleCollection(collection.id);
                    }}
                  >
                    <span className="mr-2">
                      {collection.isOpen ? "▼" : "▶"}
                    </span>
                    <Folder className="h-4 w-4 mr-2" />
                    {collection.name}
                  </div>
                )}
                <div className="opacity-0 group-hover:opacity-100 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCollectionId(collection.id);
                      setIsEditingEndpoint(true);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          handleRename(
                            collection.id,
                            "collection",
                            collection.name
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteCollection(collection.id)}
                        className="text-red-500"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {collection.isOpen && (
                <div className="ml-6 space-y-1">
                  {collection.endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group cursor-pointer"
                      onClick={() =>
                        handleEndpointClick(collection.id, endpoint)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleEndpointClick(collection.id, endpoint);
                      }}
                    >
                      {editingName?.id === endpoint.id ? (
                        <div className="flex items-center flex-1 gap-2">
                          <Input
                            value={editingName.name}
                            onChange={(e) =>
                              setEditingName({
                                ...editingName,
                                name: e.target.value,
                              })
                            }
                            className="bg-gray-800 border-gray-700"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename();
                              if (e.key === "Escape") setEditingName(null);
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveRename}
                            className="hover:bg-gray-800"
                          >
                            ✓
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span
                            className={`
                              mr-2 text-sm
                              ${endpoint.method === "GET" && "text-green-500"}
                              ${endpoint.method === "POST" && "text-yellow-500"}
                              ${endpoint.method === "PUT" && "text-blue-500"}
                              ${endpoint.method === "DELETE" && "text-red-500"}
                            `}
                          >
                            {endpoint.method}
                          </span>
                          {endpoint.name}
                        </div>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(
                                  endpoint.id,
                                  "endpoint",
                                  endpoint.name
                                );
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Renomear
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEndpoint(collection.id, endpoint.id);
                              }}
                              className="text-red-500"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isEditingEndpoint} onOpenChange={setIsEditingEndpoint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Nome da request"
              value={newEndpoint.name}
              onChange={(e) =>
                setNewEndpoint({ ...newEndpoint, name: e.target.value })
              }
              className="flex-1"
            />
            <div className="flex gap-2">
              <Select
                value={newEndpoint.method}
                onValueChange={(value) =>
                  setNewEndpoint({ ...newEndpoint, method: value as "GET" })
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="URL do endpoint"
                value={newEndpoint.path}
                onChange={(e) =>
                  setNewEndpoint({ ...newEndpoint, path: e.target.value })
                }
                className="flex-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingEndpoint(false);
                  setSelectedCollectionId(null);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={addEndpoint}>Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
