module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$2_80d45de3520c6243565887af9b4c58b4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.2_80d45de3520c6243565887af9b4c58b4/node_modules/next/server.js [app-route] (ecmascript)");
;
// 这是一个 helper 函数，用来解析上游的流并转换为我们要的格式
function iteratorToStream(iterator) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    return new ReadableStream({
        async start (controller) {
            for await (const chunk of iterator){
                // chunk 是 Uint8Array，需要解码成字符串
                const text = decoder.decode(chunk);
                const lines = text.split("\n");
                for (const line of lines){
                    if (line.startsWith("data: ") && line !== "data: [DONE]") {
                        try {
                            // 1. 解析 SiliconFlow/OpenAI 的原始数据
                            const jsonStr = line.replace("data: ", "");
                            const json = JSON.parse(jsonStr);
                            // 2. 提取真正的文本内容 (GLM/OpenAI 格式通常在 choices[0].delta.content)
                            const content = json.choices?.[0]?.delta?.content || "";
                            if (content) {
                                // 3. 重新包装成你的前端能看懂的格式: { content: "..." }
                                const payload = JSON.stringify({
                                    content: content
                                });
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
        }
    });
}
async function POST(req) {
    // 1. 获取前端发来的用户消息
    const { message } = await req.json();
    const apiKey = process.env.SILICONFLOW_API_KEY;
    if (!apiKey) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$2_80d45de3520c6243565887af9b4c58b4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "API Key not found"
        }, {
            status: 500
        });
    }
    // 2. 呼叫 SiliconFlow 接口
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        // 关键：开启 stream: true，让 AI 边想边说
        body: JSON.stringify({
            model: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
            messages: [
                {
                    role: "system",
                    content: "你是一个有用的助手"
                },
                {
                    role: "user",
                    content: message
                }
            ],
            stream: true
        })
    });
    if (!response.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$2_80d45de3520c6243565887af9b4c58b4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "API call failed"
        }, {
            status: response.status
        });
    }
    if (!response.body) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$2_80d45de3520c6243565887af9b4c58b4$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "No response body"
        }, {
            status: 500
        });
    }
    // 3. 将上游的流经过转换后，返回给前端
    // 这里的 response.body 是一个原始的 ReadableStream
    const stream = iteratorToStream(response.body);
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e4f28f0._.js.map