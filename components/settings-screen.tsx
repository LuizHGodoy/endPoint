import { useAtom } from "jotai";
import { X } from "lucide-react";
import { globalEnvironmentAtom } from "@/lib/atoms";
import { Button } from "./ui/button";
import { GlobalEnvironmentEditor } from "./global-environment-editor";

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [globalEnv] = useAtom(globalEnvironmentAtom);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Configurações</h1>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-2xl mx-auto">
          <section className="space-y-4">
            <h2 className="text-lg font-medium">Variáveis Globais ({globalEnv.variables.length})</h2>
            <GlobalEnvironmentEditor />
          </section>
        </div>
      </div>
    </div>
  );
}
