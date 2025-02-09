"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

interface RequestEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RequestEditor({ value, onChange }: RequestEditorProps) {
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onChange(e.target.value);
  };

  return (
    <Textarea
      value={content}
      onChange={handleChange}
      placeholder="Enter request body (JSON)"
      className="font-mono h-[200px]"
    />
  );
}