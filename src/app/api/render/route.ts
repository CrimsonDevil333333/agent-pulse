import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (!file) return new NextResponse('Missing file', { status: 400 });

  // Only allow serving from /mnt/ramdisk for security
  const safePath = path.join('/mnt/ramdisk', path.basename(file));
  
  if (!fs.existsSync(safePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(safePath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
