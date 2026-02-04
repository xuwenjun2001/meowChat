"use client";

import * as React from "react";
import ChatInput from "../components/ChatInput/ChatInput";
import ThemeToggle from "../components/ThemeToggle";
import { ChatMessage } from "../components/ChatMessage";
import { Cat } from "lucide-react";

type Message = {
  id: string | number;
  role: "user" | "assistant";
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend(userContent: string) {
    if (isLoading) return; // 防止重复发送
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
    };
    setMessages((prev) => [
      ...prev,
      userMessage, // 先放一个空壳
    ]);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userContent }),
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
          setIsLoading(false);
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
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Cat className="h-6 w-6 text-primary" />{" "}
          {/* text-primary 会让猫头跟随主题色 */}
          <h1 className="text-xl font-semibold">Meow Chat</h1>
        </div>
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                欢迎使用 Sky Chat
              </h2>
              <p className="mt-2 text-muted-foreground">
                开始对话，体验 SSE 流式打字机效果
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
