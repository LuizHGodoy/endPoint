"use client";

import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

interface RequestEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RequestEditor({
  value,
  onChange,
  placeholder,
}: RequestEditorProps) {
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
      placeholder={placeholder || "Enter request body"}
      className="font-mono h-[200px]"
    />
  );
}
