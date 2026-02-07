// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // 告诉 Auth.js 把数据存到哪里
  providers: [GitHub], // 启用 GitHub 登录
  callbacks: {
    // 修复一个小 Bug：确保 userId 能够传给前端
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
