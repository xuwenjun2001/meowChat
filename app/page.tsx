"use client";

import * as React from "react";
import ChatInput from "../components/ChatInput/ChatInput";
import ThemeToggle from "../components/ThemeToggle";

type Message = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = React.useState<Message[]>([]);

  async function handleSend() {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    // if (!response.ok) {
    //   throw new Error("API request failed");
    // }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const aiMessageId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { id: aiMessageId, role: "assistant", content: "" }, // 先放一个空壳
    ]);

    if (!reader) {
      throw new Error("No reader available");
    }

    // 读取流式数据
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk
        .split("\n")
        .filter((line) => line.trim().startsWith("data: "));

      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          break;
        }

        try {
          const { content } = JSON.parse(data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + content }
                : msg,
            ),
          );
        } catch (e) {
          console.error("Failed to parse SSE data:", e);
        }
      }
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <button onClick={handleSend}>我在这里</button>
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h1 className="text-xl font-semibold">Sky Chat</h1>
        <ThemeToggle />
      </header>
      <main className="flex flex-col overflow-y-auto flex-1">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              欢迎使用 Sky Chat
            </h2>
            <p className="mt-2 text-muted-foreground">
              开始对话，体验 SSE 流式打字机效果
            </p>
            <p>{messages.map((msg) => msg.content).join(" ")}</p>
          </div>
        </div>
      </main>

      <ChatInput />
    </div>
  );
}
