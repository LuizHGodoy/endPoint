"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface ResponseViewerProps {
  response: {
    status: number;
    data: Record<string, unknown>;
    time: number;
  } | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) return null;

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 400) return "bg-red-500";
    return "bg-yellow-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Response</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor(response.status)}>
            {response.status}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {response.time}ms
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
          <code>{JSON.stringify(response.data, null, 2)}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
