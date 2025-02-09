"use client";

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

interface ResponseData {
  status: number;
  data: Record<string, unknown>;
  time: number;
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
  const { theme, setTheme } = useTheme();

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

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal: controller.signal,
        ...(method !== "GET" && requestBody && { body: requestBody }),
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

      const newHistoryItem = {
        id: Date.now(),
        url,
        method,
        body: requestBody,
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
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              <TabsContent value="body">
                <RequestEditor value={requestBody} onChange={setRequestBody} />
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
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
