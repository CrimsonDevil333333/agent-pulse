import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const LAST_VISUAL_FILE = "/mnt/ramdisk/last_visual.json";
  try {
    if (fs.existsSync(LAST_VISUAL_FILE)) {
      const data = fs.readFileSync(LAST_VISUAL_FILE, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json(null);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
