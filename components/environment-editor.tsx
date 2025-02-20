import {
  type EnvironmentVariable,
  collectionsAtom,
  currentCollectionIdAtom,
} from "@/lib/atoms";
import { useAtom } from "jotai";
import { Copy, Eye, EyeOff, Plus, Save, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

export function EnvironmentEditor() {
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [currentCollectionId] = useAtom(currentCollectionIdAtom);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});

  const currentCollection = collections.find(
    (c) => c.id === currentCollectionId
  );

  const addVariable = () => {
    if (!currentCollection) return;

    const newVariable: EnvironmentVariable = {
      id: Date.now().toString(),
      name: "",
      value: "",
    };

    const updatedCollections = collections.map((c) =>
      c.id === currentCollectionId
        ? {
            ...c,
            variables: [...(c.variables || []), newVariable],
          }
        : c
    );

    setCollections(updatedCollections);
    setEditMode((prev) => ({ ...prev, [newVariable.id]: true }));
  };

  const updateVariable = (
    variableId: string,
    field: keyof EnvironmentVariable,
    value: string
  ) => {
    if (!currentCollection) return;

    const updatedCollections = collections.map((c) =>
      c.id === currentCollectionId
        ? {
            ...c,
            variables: (c.variables || []).map((v) =>
              v.id === variableId ? { ...v, [field]: value } : v
            ),
          }
        : c
    );

    setCollections(updatedCollections);
  };

  const deleteVariable = (variableId: string) => {
    if (!currentCollection) return;

    const updatedCollections = collections.map((c) =>
      c.id === currentCollectionId
        ? {
            ...c,
            variables: (c.variables || []).filter((v) => v.id !== variableId),
          }
        : c
    );

    setCollections(updatedCollections);
  };

  const toggleShowValue = (variableId: string) => {
    setShowValues((prev) => ({ ...prev, [variableId]: !prev[variableId] }));
  };

  const toggleEditMode = (variableId: string) => {
    setEditMode((prev) => ({ ...prev, [variableId]: !prev[variableId] }));
  };

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Valor copiado para a área de transferência");
  };

  if (!currentCollection) return null;

  const variables = currentCollection.variables || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Variáveis de Ambiente</h3>
        <Button onClick={addVariable} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Variável
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {variables.map((variable) => (
            <div key={variable.id} className="space-y-2 p-4 rounded-lg border">
              {editMode[variable.id] ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Nome da Variável"
                        value={variable.name}
                        onChange={(e) =>
                          updateVariable(variable.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteVariable(variable.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Valor"
                    type={showValues[variable.id] ? "text" : "password"}
                    value={variable.value}
                    onChange={(e) =>
                      updateVariable(variable.id, "value", e.target.value)
                    }
                  />

                  <Textarea
                    placeholder="Descrição (opcional)"
                    value={variable.description || ""}
                    onChange={(e) =>
                      updateVariable(variable.id, "description", e.target.value)
                    }
                    className="h-20"
                  />

                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleShowValue(variable.id)}
                    >
                      {showValues[variable.id] ? (
                        <EyeOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      {showValues[variable.id] ? "Ocultar" : "Mostrar"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => toggleEditMode(variable.id)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{variable.name}</h4>
                      {variable.description && (
                        <p className="text-sm text-muted-foreground">
                          {variable.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyValue(`{{${variable.name}}}`)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleEditMode(variable.id)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type={showValues[variable.id] ? "text" : "password"}
                      value={variable.value}
                      readOnly
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleShowValue(variable.id)}
                    >
                      {showValues[variable.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
