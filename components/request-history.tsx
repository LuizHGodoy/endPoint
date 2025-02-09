"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export interface HistoryItem {
  id: number;
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  response: {
    status: number;
    data: Record<string, unknown>;
    time: number;
  };
  timestamp: string;
}

interface RequestHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export function RequestHistory({ history, onSelect }: RequestHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="mb-4 p-3 rounded-lg bg-muted hover:bg-accent cursor-pointer"
              onClick={() => onSelect(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(item);
                }
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge>{item.method}</Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.timestamp), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="text-sm truncate">{item.url}</div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
