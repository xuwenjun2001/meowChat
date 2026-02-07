import { NextRequest, NextResponse } from "next/server";
import { from, of } from "rxjs";
import { concatMap, delay, map } from "rxjs/operators";
import { Observable } from "rxjs";

// 这是一个 helper 函数，用来解析上游的流并转换为我们要的格式
function iteratorToStream(iterator: any) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of iterator) {
        // chunk 是 Uint8Array，需要解码成字符串
        const text = decoder.decode(chunk);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              // 1. 解析 SiliconFlow/OpenAI 的原始数据
              const jsonStr = line.replace("data: ", "");
              const json = JSON.parse(jsonStr);

              // 2. 提取真正的文本内容 (GLM/OpenAI 格式通常在 choices[0].delta.content)
              const content = json.choices?.[0]?.delta?.content || "";

              if (content) {
                // 3. 重新包装成你的前端能看懂的格式: { content: "..." }
                const payload = JSON.stringify({ content: content });
                // 4. 发送给前端
                controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              }
            } catch (e) {
              console.error("Error parsing stream:", e);
            }
          }
        }
      }
      // 结束时发送 Done 标记
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}

export async function POST(req: NextRequest) {
  // 1. 获取前端发来的用户消息
  const { message } = await req.json();

  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API Key not found" }, { status: 500 });
  }

  // 2. 呼叫 SiliconFlow 接口
  const response = await fetch(
    "https://api.siliconflow.cn/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      // 关键：开启 stream: true，让 AI 边想边说
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B", // 或者是你喜欢的其他模型
        messages: [
          { role: "system", content: "你是一个有用的助手" },
          { role: "user", content: message }, // 使用真实的用户输入
        ],
        stream: true, // <--- 重点！
      }),
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "API call failed" },
      { status: response.status },
    );
  }

  if (!response.body) {
    return NextResponse.json({ error: "No response body" }, { status: 500 });
  }

  // 3. 将上游的流经过转换后，返回给前端
  // 这里的 response.body 是一个原始的 ReadableStream
  const stream = iteratorToStream(response.body as any);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
