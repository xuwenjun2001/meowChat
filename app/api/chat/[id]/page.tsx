import { ChatInterface } from "@/components/ChatInterface";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage(props: ChatPageProps) {
  const params = await props.params;
  const session = await auth();

  // 1. 安全检查：没登录不能看
  if (!session?.user?.id) {
    redirect("/");
  }

  // 2. 从数据库查数据
  const chat = await prisma.chat.findUnique({
    where: {
      id: params.id,
      userId: session.user.id, // 🔒 关键：只能查属于自己的对话
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" }, // 按时间正序排列
      },
    },
  });

  // 3. 查不到（可能是乱输的 ID，或者是别人的 ID）
  if (!chat) {
    notFound();
  }

  // 4. 数据格式转换
  // 数据库里的对象 -> UI 组件需要的对象
  const uiMessages = chat.messages.map((m) => ({
    id: m.id,
    content: m.content,
    role: m.role as "user" | "assistant",
  }));

  return <ChatInterface id={chat.id} initialMessages={uiMessages} />;
}
