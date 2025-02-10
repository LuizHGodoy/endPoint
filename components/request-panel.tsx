import { AuthEditor } from "@/components/auth-editor";
import { FormDataEditor } from "@/components/form-data-editor";
import { RequestEditor } from "@/components/request-editor";
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
import {
  type AuthType,
  type BodyType,
  type Collection,
  type HistoryItem,
  type HttpMethod,
  type RequestEndpoint,
  type ResponseData,
  collectionsAtom,
  currentCollectionIdAtom,
  currentEndpointAtom,
  currentEndpointIdAtom,
  tempRequestAtom,
  updateEndpointHistoryAtom,
} from "@/lib/atoms";
import { useAtom } from "jotai";
import { Moon, Send, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function RequestPanel() {
  const [currentEndpoint] = useAtom(currentEndpointAtom);
  const [currentCollectionId] = useAtom(currentCollectionIdAtom);
  const [currentEndpointId] = useAtom(currentEndpointIdAtom);
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [tempRequest, setTempRequest] = useAtom(tempRequestAtom);
  const [, updateEndpointHistory] = useAtom(updateEndpointHistoryAtom);
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [loading, setLoading] = useState(false);
  const [requestBody, setRequestBody] = useState("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [bodyType, setBodyType] = useState<BodyType>("json");
  const { theme, setTheme } = useTheme();
  const [authType, setAuthType] = useState<AuthType>("none");
  const [auth, setAuth] = useState("{}");
  const [response, setResponse] = useState<ResponseData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentEndpoint?.id) {
      setUrl(currentEndpoint.path);
      setMethod(currentEndpoint.method);
      setRequestBody(currentEndpoint.body || "");
      setHeaders(currentEndpoint.headers || {});
      setBodyType(currentEndpoint.bodyType);
      setAuthType(currentEndpoint.authType);
      setAuth(currentEndpoint.auth || "{}");
      setResponse(currentEndpoint.lastResponse || null);
    } else {
      setUrl(tempRequest.url);
      setMethod(tempRequest.method);
      setRequestBody(tempRequest.body || "");
      setHeaders(tempRequest.headers || {});
      setBodyType(tempRequest.bodyType);
      setAuthType(tempRequest.authType);
      setAuth(tempRequest.auth || "{}");
      setResponse(tempRequest.response || null);
    }
  }, [currentEndpoint, tempRequest]);

  const handleSend = async () => {
    if (!currentCollectionId || !currentEndpointId) {
      setTempRequest({
        url,
        method,
        body: requestBody,
        headers,
        bodyType,
        authType,
        auth,
      });
    } else {
      setCollections((prev: Collection[]) =>
        prev.map((col: Collection) =>
          col.id === currentCollectionId
            ? {
                ...col,
                endpoints: col.endpoints.map((ep: RequestEndpoint) =>
                  ep.id === currentEndpointId
                    ? {
                        ...ep,
                        path: url,
                        method,
                        body: requestBody,
                        headers,
                        bodyType,
                        authType,
                        auth,
                        history: ep.history || [],
                      }
                    : ep
                ),
              }
            : col
        )
      );
    }

    setLoading(true);
    try {
      const startTime = performance.now();

      const finalHeaders: Record<string, string> = { ...headers };

      if (authType === "bearer") {
        try {
          const authData = JSON.parse(auth);
          if (authData.token) {
            finalHeaders.Authorization = `Bearer ${authData.token}`;
          }
        } catch (e) {
          toast.error("Token de autenticação inválido");
          return;
        }
      } else if (authType === "basic") {
        try {
          const authData = JSON.parse(auth);
          if (authData.username && authData.password) {
            const basicAuth = btoa(`${authData.username}:${authData.password}`);
            finalHeaders.Authorization = `Basic ${basicAuth}`;
          }
        } catch (e) {
          toast.error("Credenciais de autenticação inválidas");
          return;
        }
      } else if (authType === "apiKey") {
        try {
          const authData = JSON.parse(auth);
          if (authData.key) {
            finalHeaders["X-API-Key"] = authData.key;
          }
        } catch (e) {
          toast.error("API Key inválida");
          return;
        }
      }

      if (method !== "GET" && bodyType !== "no body") {
        if (bodyType === "json") {
          finalHeaders["Content-Type"] = "application/json";
        }
      }

      let finalBody: string | FormData | undefined;
      if (method !== "GET" && bodyType !== "no body" && requestBody) {
        if (bodyType === "json") {
          try {
            JSON.parse(requestBody);
            finalBody = requestBody;
          } catch (e) {
            toast.error("Body JSON inválido", {
              description: "Por favor, insira um JSON válido",
            });
            setLoading(false);
            return;
          }
        } else if (bodyType === "form-data") {
          try {
            const formData = new FormData();
            const data = JSON.parse(requestBody);
            for (const [key, value] of Object.entries(data)) {
              formData.append(key, value as string);
            }
            finalBody = formData;
          } catch (e) {
            toast.error("Form data inválido", {
              description:
                "Por favor, insira um objeto JSON válido para o form-data",
            });
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch(url, {
        method,
        headers: finalHeaders,
        body: finalBody,
      });

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      const data = await res.json();
      const responseData: ResponseData = {
        status: res.status,
        data,
        time: responseTime,
      };

      const historyItem: HistoryItem = {
        id: Date.now(),
        url,
        method,
        body: requestBody || "",
        bodyType,
        headers: finalHeaders,
        response: responseData,
        timestamp: new Date().toISOString(),
      };

      if (currentCollectionId && currentEndpointId) {
        setCollections((prev: Collection[]) =>
          prev.map((col: Collection) =>
            col.id === currentCollectionId
              ? {
                  ...col,
                  endpoints: col.endpoints.map((ep: RequestEndpoint) =>
                    ep.id === currentEndpointId
                      ? {
                          ...ep,
                          history: [historyItem, ...(ep.history || [])].slice(
                            0,
                            50
                          ),
                          lastResponse: responseData,
                          path: url,
                          method,
                          body: requestBody,
                          headers,
                          bodyType,
                          authType,
                          auth,
                        }
                      : ep
                  ),
                }
              : col
          )
        );
      } else {
        setTempRequest({
          ...tempRequest,
          url,
          method,
          body: requestBody,
          headers,
          bodyType,
          authType,
          auth,
          response: responseData,
          history: [historyItem, ...(tempRequest.history || [])].slice(0, 50),
        });
      }

      setResponse(responseData);
    } catch (error) {
      toast.error("Erro ao fazer requisição", {
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center flex-1 space-x-2">
            <Select
              value={method}
              onValueChange={(value: HttpMethod) => setMethod(value)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="ml-2"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 container py-6 overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-6 h-full">
          <div className="lg:col-span-4 flex flex-col overflow-hidden">
            <Tabs defaultValue="body" className="flex flex-col flex-1">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="auth">Auth</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
              </TabsList>
              <TabsContent value="body" className="flex-1 overflow-auto">
                {method !== "GET" && (
                  <div className="space-y-4">
                    <Select
                      value={bodyType}
                      onValueChange={(value: BodyType) => setBodyType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["no body", "json", "form-data"].map((type) => (
                          <SelectItem key={type} value={type as BodyType}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {bodyType === "json" && (
                      <RequestEditor
                        value={requestBody}
                        onChange={setRequestBody}
                        placeholder="Enter request body"
                      />
                    )}

                    {bodyType === "form-data" && (
                      <FormDataEditor
                        value={requestBody}
                        onChange={setRequestBody}
                      />
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="auth" className="flex-1 overflow-auto">
                <AuthEditor
                  value={auth}
                  onChange={setAuth}
                  authType={authType}
                  onAuthTypeChange={setAuthType}
                />
              </TabsContent>
              <TabsContent value="headers" className="flex-1 overflow-auto">
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

            <div className="mt-6 overflow-auto">
              <ResponseViewer response={response} />
            </div>
          </div>

          <div className="lg:col-span-2 overflow-hidden">
            <div className="h-full overflow-auto">
              <RequestHistory
                history={currentEndpoint?.history || []}
                onSelect={(item) => {
                  setUrl(item.url);
                  setMethod(item.method as HttpMethod);
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
    </div>
  );
}
