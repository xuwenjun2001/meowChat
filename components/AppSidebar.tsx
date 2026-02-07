import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, MessageSquare, Trash2 } from "lucide-react"; // 图标
import { ScrollArea } from "@/components/ui/scroll-area";

export async function AppSidebar() {
  const session = await auth();

  // 安全检查：没登录就不渲染侧边栏
  if (!session?.user?.id) return null;

  // 1. 直接从数据库查出该用户的所有会话
  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }, // 最新创建的在最前面
  });

  return (
    <div className="flex h-full w-[260px] flex-col bg-gray-900 text-white">
      {/* 顶部：新对话按钮 */}
      <div className="p-4">
        <Link href="/">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-gray-700 bg-gray-800 text-white hover:bg-gray-700 hover:text-white"
          >
            <MessageSquarePlus className="h-4 w-4" />
            新对话
          </Button>
        </Link>
      </div>

      {/* 中间：历史记录列表 (可滚动) */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 p-2">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{chat.title || "无标题对话"}</span>
              </div>
            </Link>
          ))}

          {chats.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              暂无历史记录
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 底部：用户信息区域 */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt="User"
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-600" />
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">
              {session.user.name}
            </span>
            <span className="truncate text-xs text-gray-500">
              {session.user.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
