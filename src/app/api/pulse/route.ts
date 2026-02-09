import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let clients: ReadableStreamDefaultController[] = [];
const HISTORY_FILE = "/mnt/ramdisk/pulse_history.json";
const LAST_VISUAL_FILE = "/mnt/ramdisk/last_visual.json";

// Initialize history file
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]));
}

function getHistory() {
  try {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveToHistory(data: any) {
  try {
    if (data.type === "visual") {
      fs.writeFileSync(LAST_VISUAL_FILE, JSON.stringify(data));
    }
    const history = getHistory();
    history.push(data);
    // Keep last 100 entries
    const limitedHistory = history.slice(-100);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(limitedHistory));
  } catch (e) {
    console.error("History save error:", e);
  }
}

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller);
      const encoder = new TextEncoder();
      
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
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
    saveToHistory(data);
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
