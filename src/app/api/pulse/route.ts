import { NextResponse } from "next/server";

let clients: ReadableStreamDefaultController[] = [];

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller);
      
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        clients = clients.filter(c => c !== controller);
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const payload = JSON.stringify(data);
    
    const encoder = new TextEncoder();
    clients.forEach(controller => {
      try {
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      } catch {
        // Handle dead client
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
  }
}
