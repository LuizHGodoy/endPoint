"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type AuthType = "none" | "basic" | "bearer" | "apiKey";

interface AuthEditorProps {
  value: string;
  onChange: (value: string) => void;
  onAuthTypeChange: (type: AuthType) => void;
  authType: AuthType;
}

export function AuthEditor({
  value,
  onChange,
  authType,
  onAuthTypeChange,
}: AuthEditorProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    try {
      const auth = JSON.parse(value);
      if (auth.username) setUsername(auth.username);
      if (auth.password) setPassword(auth.password);
      if (auth.token) setToken(auth.token);
      if (auth.apiKey) setApiKey(auth.apiKey);
    } catch (e) {
      toast.error("Invalid auth data");
    }
  }, [value]);

  const updateAuth = () => {
    let auth = {};
    switch (authType) {
      case "basic":
        auth = { username, password };
        break;
      case "bearer":
        auth = { token };
        break;
      case "apiKey":
        auth = { apiKey };
        break;
    }
    onChange(JSON.stringify(auth));
  };

  return (
    <div className="space-y-4">
      <Select value={authType} onValueChange={onAuthTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select auth type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Auth</SelectItem>
          <SelectItem value="basic">Basic Auth</SelectItem>
          <SelectItem value="bearer">Bearer Token</SelectItem>
          <SelectItem value="apiKey">API Key</SelectItem>
        </SelectContent>
      </Select>

      {authType === "basic" && (
        <div className="space-y-2">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              updateAuth();
            }}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              updateAuth();
            }}
          />
        </div>
      )}

      {authType === "bearer" && (
        <Input
          placeholder="Bearer Token"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            updateAuth();
          }}
        />
      )}

      {authType === "apiKey" && (
        <Input
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            updateAuth();
          }}
        />
      )}
    </div>
  );
}
