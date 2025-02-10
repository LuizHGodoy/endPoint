"use client";

import { AuthEditor, type AuthType } from "@/components/auth-editor";
import { FormDataEditor } from "@/components/form-data-editor";
import { RequestEditor } from "@/components/request-editor";
import type { HistoryItem } from "@/components/request-history";
import { RequestHistory } from "@/components/request-history";
import { ResponseViewer } from "@/components/response-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Send, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const BODY_TYPES = ["no body", "json", "form-data"] as const;
type BodyType = (typeof BODY_TYPES)[number];

interface ResponseData {
  status: number;
  data: Record<string, unknown>;
  time: number;
}

interface RequestHeaders {
  "Content-Type"?: string;
  Authorization?: string;
  "X-API-Key"?: string;
  [key: string]: string | undefined;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [requestBody, setRequestBody] = useState("");
  const [headers, setHeaders] = useState({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bodyType, setBodyType] = useState<BodyType>("json");
  const { theme, setTheme } = useTheme();
  const [authType, setAuthType] = useState<AuthType>("none");
  const [auth, setAuth] = useState("{}");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem("request-history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleRequest = async () => {
    if (!url) {
      toast.error("URL é obrigatória", {
        description: "Por favor, insira uma URL válida para fazer a requisição",
      });
      return;
    }

    setLoading(true);
    const startTime = performance.now();
    const timeoutDuration = 30000;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      const bodyContent = requestBody;

      let finalBody: string | FormData | undefined;
      let contentType: string | undefined;

      if (method !== "GET" && bodyContent && bodyType !== "no body") {
        if (bodyType === "json") {
          finalBody = bodyContent;
          contentType = "application/json";
        } else if (bodyType === "form-data") {
          const formData = new FormData();
          try {
            const data = JSON.parse(bodyContent);
            for (const [key, value] of Object.entries(data)) {
              formData.append(key, value as string);
            }
            finalBody = formData;
          } catch (e) {
            toast.error("Invalid form data", {
              description: "Please enter valid key-value pairs",
            });
            return;
          }
        }
      }

      const baseHeaders: RequestHeaders = {
        ...(contentType && { "Content-Type": contentType }),
        ...headers,
      };

      const requestHeaders: RequestHeaders = {
        ...baseHeaders,
      };

      if (authType !== "none") {
        try {
          const authData = JSON.parse(auth);
          switch (authType) {
            case "basic":
              requestHeaders.Authorization = `Basic ${btoa(
                `${authData.username}:${authData.password}`
              )}`;
              break;
            case "bearer":
              requestHeaders.Authorization = `Bearer ${authData.token}`;
              break;
            case "apiKey":
              requestHeaders["X-API-Key"] = authData.apiKey;
              break;
          }
        } catch (e) {
          // Ignora erro de parse
        }
      }

      const options: RequestInit = {
        method,
        headers: requestHeaders as HeadersInit,
        signal: controller.signal,
        ...(finalBody && { body: finalBody }),
      };

      const res = await fetch(url, options);
      clearTimeout(timeoutId);
      const data = await res.json();
      const endTime = performance.now();

      const responseData = {
        status: res.status,
        data,
        time: Math.round(endTime - startTime),
      };

      setResponse(responseData);

      if (res.ok) {
        toast.success("Requisição concluída", {
          description: `Status ${res.status} - Tempo: ${Math.round(
            endTime - startTime
          )}ms`,
        });
      } else {
        toast.error("Erro na requisição", {
          description: `Status ${res.status} - ${res.statusText}`,
        });
      }

      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        url,
        method,
        body: bodyContent,
        bodyType,
        headers,
        response: responseData,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [newHistoryItem, ...history].slice(0, 50);
      setHistory(updatedHistory);
      localStorage.setItem("request-history", JSON.stringify(updatedHistory));
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.warning("Timeout", {
          description: `A requisição excedeu ${
            timeoutDuration / 1000
          } segundos`,
        });
      } else {
        toast.error("Erro na requisição", {
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
        });
      }

      setResponse({
        status: 500,
        data: {
          message: error instanceof Error ? error.message : "Erro desconhecido",
        },
        time: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">endPoint</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="flex gap-2 mb-4">
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  {HTTP_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleRequest} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>

            <Tabs defaultValue="body" className="mb-4">
              <TabsList>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="auth">Authorization</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              <TabsContent value="body">
                <div className="space-y-4">
                  <Select
                    value={bodyType}
                    onValueChange={(value: BodyType) => setBodyType(value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Body Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {bodyType !== "no body" ? (
                    bodyType === "json" ? (
                      <RequestEditor
                        value={requestBody}
                        onChange={setRequestBody}
                        placeholder="Enter JSON body"
                      />
                    ) : (
                      <FormDataEditor
                        value={requestBody}
                        onChange={setRequestBody}
                      />
                    )
                  ) : (
                    <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
                      Esta requisição não requer body
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="auth">
                <AuthEditor
                  value={auth}
                  onChange={setAuth}
                  authType={authType}
                  onAuthTypeChange={setAuthType}
                />
              </TabsContent>
              <TabsContent value="headers">
                <RequestEditor
                  value={JSON.stringify(headers, null, 2)}
                  onChange={(value) => {
                    try {
                      setHeaders(JSON.parse(value));
                    } catch (e) {
                      toast.error("Invalid JSON", {
                        description: "Please enter a valid JSON object",
                      });
                    }
                  }}
                />
              </TabsContent>
            </Tabs>

            <ResponseViewer response={response} />
          </div>

          <div className="lg:col-span-1">
            <RequestHistory
              history={history}
              onSelect={(item) => {
                setUrl(item.url);
                setMethod(item.method);
                setRequestBody(item.body);
                setHeaders(item.headers);
                setBodyType(item.bodyType);
                setResponse(item.response);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
