"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage"; // 复用你之前的组件
import ChatInput from "@/components/ChatInput/ChatInput"; // 复用你之前的组件
import { useRouter } from "next/navigation";

interface ChatInterfaceProps {
  id: string; // 会话 ID
  initialMessages?: any[]; // 历史消息
}

export function ChatInterface({
  id,
  initialMessages = [],
}: ChatInterfaceProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Vercel AI SDK 的核心 Hook
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat", // 指向我们刚修好的后端
      id: id,
      initialMessages: initialMessages, // 加载历史记录
      body: { chatId: id }, // 把 ID 传给后端，确保存入正确的数据库记录

      // 当收到第一条回复后
      onFinish: () => {
        // 如果当前还在首页 ("/")，就无感更新 URL 到 "/chat/会话ID"
        // 这样刷新页面也不会丢失对话
        if (window.location.pathname === "/") {
          window.history.replaceState({}, "", `/chat/${id}`);
          router.refresh(); // 刷新一下，让侧边栏出现新标题
        }
      },
    });

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full relative bg-white">
      {/* 1. 消息列表区域 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400 gap-2">
            <h2 className="text-xl font-semibold text-gray-700">MeowChat</h2>
            <p className="text-sm">开始一个新的对话吧...</p>
          </div>
        ) : (
          messages.map((m) => (
            // 这里直接复用你现有的 ChatMessage 组件
            <ChatMessage key={m.id} message={m} />
          ))
        )}
        {/* 这是一个看不见的锚点，用于自动滚动 */}
        <div ref={bottomRef} />
      </div>

      {/* 2. 输入框区域 */}
      <div className="border-t bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
