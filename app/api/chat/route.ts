import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const deepseek = createOpenAI({
  baseURL: "https://api.siliconflow.cn/v1",
  apiKey: process.env.SILICONFLOW_API_KEY,
});

function extractTextFromUIMessage(msg: UIMessage): string {
  return (msg.parts ?? [])
    .filter((p) => p.type === "text")
    .map((p: any) => p.text ?? "")
    .join("");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { messages, chatId }: { messages: UIMessage[]; chatId: string } =
    await req.json();

  const modelMessages = await convertToModelMessages(messages); // 注意要 await :contentReference[oaicite:1]{index=1}

  const result = streamText({
    model: deepseek.chat("deepseek-ai/DeepSeek-R1-0528-Qwen3-8B"),
    messages: modelMessages,

    onFinish: async ({ text }) => {
      const last = messages[messages.length - 1];
      const userText =
        last?.role === "user" ? extractTextFromUIMessage(last) : "";
      const aiContent = text ?? "";

      if (!userText || !aiContent) return;

      await prisma.$transaction(async (tx) => {
        await tx.chat.upsert({
          where: { id: chatId },
          create: {
            id: chatId,
            userId: session.user.id,
            title: userText.slice(0, 20) || "新对话",
          },
          update: {},
        });

        await tx.message.create({
          data: { chatId, role: "user", content: userText },
        });
        await tx.message.create({
          data: { chatId, role: "assistant", content: aiContent },
        });
      });
    },
  });

  return result.toUIMessageStreamResponse(); // 见第 2 点
}
