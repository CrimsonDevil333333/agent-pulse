import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const HISTORY_FILE = "/mnt/ramdisk/pulse_history.json";
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
