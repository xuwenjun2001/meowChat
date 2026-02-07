import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/AppSidebar"; // 引入刚才写的侧边栏
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeowChat",
  description: "My AI Chat App",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden">
          {/* 左侧：侧边栏 
            只有登录后才显示 (session 存在)
            hidden md:flex: 在手机上隐藏(hidden)，在中等屏幕以上显示(flex)
          */}
          {session && (
            <aside className="hidden md:flex border-r border-gray-200 bg-gray-50">
              <AppSidebar />
            </aside>
          )}

          {/* 右侧：主内容区域 */}
          <main className="flex-1 overflow-auto bg-white">{children}</main>
        </div>
      </body>
    </html>
  );
}
