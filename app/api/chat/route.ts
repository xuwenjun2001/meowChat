import { NextRequest, NextResponse } from "next/server";
import { from, of } from "rxjs";
import { concatMap, delay, map } from "rxjs/operators";
import { Observable } from "rxjs";

export async function POST(req: Request) {
  const encoder = new TextEncoder();

  const MESSAGES = `卧槽，还真挺有效果的哦。夜阑卧听风吹雨，铁马冰河入梦来。东风夜放花千树，更吹落，星如雨。宝马雕车香满路。凤箫声动，玉壶光转，一夜鱼龙舞。蛾儿雪柳黄金缕，笑语盈盈暗香去。众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。`;

  const chars$ = from(MESSAGES.split(""));

  const stream = new ReadableStream({
    async start(controller) {
      // 订阅 RxJS Observable
      chars$
        .pipe(
          concatMap((char) =>
            new Observable((subscriber) => {
              subscriber.next(char);
              subscriber.complete();
            }).pipe(delay(80)),
          ),
        )
        .subscribe({
          next: (char) => {
            // 发送 SSE 格式数据
            const data = JSON.stringify({ content: char });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          },
          complete: () => {
            // 发送结束标记
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
          error: (err) => {
            console.error("Stream error:", err);
            controller.error(err);
          },
        });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
