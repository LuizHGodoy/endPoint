"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FormDataItem {
  id: string;
  key: string;
  value: string;
}

interface FormDataEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function FormDataEditor({ value, onChange }: FormDataEditorProps) {
  const [items, setItems] = useState<FormDataItem[]>([
    { id: Date.now().toString(), key: "", value: "" },
  ]);

  useEffect(() => {
    try {
      const parsedValue = JSON.parse(value);
      const newItems = Object.entries(parsedValue).map(([key, value]) => ({
        id: Date.now().toString() + Math.random(),
        key,
        value: String(value),
      }));
      if (newItems.length > 0) {
        setItems(newItems);
      }
    } catch (e) {
      toast.error("Invalid form data");
    }
  }, [value]);

  const updateItems = (newItems: FormDataItem[]) => {
    setItems(newItems);
    const obj = newItems.reduce((acc, item) => {
      if (item.key) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);
    onChange(JSON.stringify(obj, null, 2));
  };

  const addItem = () => {
    updateItems([...items, { id: Date.now().toString(), key: "", value: "" }]);
  };

  const removeItem = (index: number) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof FormDataItem,
    value: string
  ) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateItems(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex gap-2">
          <Input
            placeholder="Key"
            value={item.key}
            onChange={(e) =>
              updateItem(items.indexOf(item), "key", e.target.value)
            }
          />
          <Input
            placeholder="Value"
            value={item.value}
            onChange={(e) =>
              updateItem(items.indexOf(item), "value", e.target.value)
            }
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(items.indexOf(item))}
            disabled={items.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addItem} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}
