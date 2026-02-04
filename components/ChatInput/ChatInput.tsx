"use client";

import { Button } from "./button";
import { Input } from "./input";
import { Send } from "lucide-react";
import * as React from "react";

export default function ChatInput() {
  const [input, setInput] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setInput("");
  }

  return (
    <div className="border-t border-border bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <form className="flex gap-2" onSubmit={handleSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入消息..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">发送</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
