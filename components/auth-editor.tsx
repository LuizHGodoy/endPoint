"use client";

import type { AuthType } from "@/lib/atoms";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { VariableEditor } from "./variable-editor";

interface AuthEditorProps {
  value: string;
  onChange: (value: string) => void;
  authType: AuthType;
  onAuthTypeChange: (value: AuthType) => void;
}

export function AuthEditor({
  value,
  onChange,
  authType,
  onAuthTypeChange,
}: AuthEditorProps) {
  return (
    <div className="space-y-4">
      <Select value={authType} onValueChange={onAuthTypeChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="bearer">Bearer Token</SelectItem>
          <SelectItem value="basic">Basic Auth</SelectItem>
          <SelectItem value="apiKey">API Key</SelectItem>
        </SelectContent>
      </Select>

      {authType !== "none" && (
        <VariableEditor
          value={value}
          onChange={onChange}
          placeholder={
            authType === "bearer"
              ? "{{TOKEN}}"
              : authType === "basic"
              ? JSON.stringify(
                  { username: "user", password: "{{PASSWORD}}" },
                  null,
                  2
                )
              : JSON.stringify({ key: "{{API_KEY}}" }, null, 2)
          }
        />
      )}
    </div>
  );
}
