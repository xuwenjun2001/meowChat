"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { generateId } from "ai"; // SDK 自带的 ID 生成器

export default function NewChatPage() {
  // 每次进入首页，都在服务端预生成一个随机 ID
  // 这样当用户开始打字时，我们就知道这个会话的 ID 了
  const id = generateId();

  return <ChatInterface id={id} initialMessages={[]} />;
}
