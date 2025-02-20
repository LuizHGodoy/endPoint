import {
  collectionsAtom,
  currentCollectionIdAtom,
  globalEnvironmentAtom,
} from "@/lib/atoms";
import { useAtom } from "jotai";
import { useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface VariableInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

export function VariableInput({ onValueChange, ...props }: VariableInputProps) {
  const [collections] = useAtom(collectionsAtom);
  const [currentCollectionId] = useAtom(currentCollectionIdAtom);
  const [globalEnv] = useAtom(globalEnvironmentAtom);
  const [open, setOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCollection = collections.find(
    (c) => c.id === currentCollectionId
  );
  const collectionVariables = currentCollection?.variables || [];
  const globalVariables = globalEnv.variables || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const position = e.target.selectionStart || 0;

    setCursorPosition(position);

    // Verifica se acabamos de digitar '{{'
    if (value.slice(position - 2, position) === "{{") {
      setOpen(true);
    }

    if (onValueChange) {
      onValueChange(value);
    }

    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleVariableSelect = (variableName: string) => {
    if (!inputRef.current) return;

    const value = inputRef.current.value;
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);

    const newValue = `${beforeCursor.slice(
      0,
      -2
    )}{{${variableName}}}${afterCursor}`;

    if (onValueChange) {
      onValueChange(newValue);
    }

    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          // Só permite fechar o popover, não abrir
          if (!isOpen) setOpen(false);
        }}
      >
        <PopoverTrigger asChild>
          <div className="w-full">
            <Input
              ref={inputRef}
              {...props}
              onChange={handleInputChange}
              className={`w-full ${props.className || ""}`}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[400px]" align="start">
          <Command>
            <CommandInput placeholder="Buscar variável..." />
            <CommandList>
              <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>
              {globalVariables.length > 0 && (
                <CommandGroup heading="Variáveis Globais">
                  {globalVariables.map((variable) => (
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
              )}
              {collectionVariables.length > 0 && (
                <CommandGroup heading="Variáveis da Coleção">
                  {collectionVariables.map((variable) => (
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
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
