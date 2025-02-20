import { collectionsAtom, currentCollectionIdAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { RequestEditor } from "./request-editor";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface VariableEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function VariableEditor({
  value,
  onChange,
  placeholder,
}: VariableEditorProps) {
  const [collections] = useAtom(collectionsAtom);
  const [currentCollectionId] = useAtom(currentCollectionIdAtom);
  const [open, setOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const currentCollection = collections.find(
    (c) => c.id === currentCollectionId
  );
  const variables = currentCollection?.variables || [];

  const handleEditorChange = (newValue: string) => {
    const position =
      editorRef.current?.querySelector("textarea")?.selectionStart || 0;
    setCursorPosition(position);

    // Verifica se acabamos de digitar '{{'
    if (newValue.slice(position - 2, position) === "{{") {
      setOpen(true);
    }

    onChange(newValue);
  };

  const handleVariableSelect = (variableName: string) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);

    const newValue = `${beforeCursor.slice(
      0,
      -2
    )}{{${variableName}}}${afterCursor}`;
    onChange(newValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={editorRef}>
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          // Só permite fechar o popover, não abrir
          if (!isOpen) setOpen(false);
        }}
      >
        <PopoverTrigger asChild>
          <div>
            <RequestEditor
              value={value}
              onChange={handleEditorChange}
              placeholder={placeholder}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[400px]" align="start">
          <Command>
            <CommandInput placeholder="Buscar variável..." />
            <CommandList>
              <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
              <CommandGroup heading="Variáveis disponíveis">
                {variables.map((variable) => (
                  <CommandItem
                    key={variable.id}
                    value={variable.name}
                    onSelect={handleVariableSelect}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{variable.name}</span>
                      {variable.description && (
                        <span className="text-sm text-muted-foreground ml-2">
                          {variable.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
