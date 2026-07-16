import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const uploadDir = path.join(process.cwd(), 'public', 'chandrayaan');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    const files = fs.readdirSync(uploadDir);
    const fileList = files.map(file => {
      const filePath = path.join(uploadDir, file);
      let stats;
      try {
        stats = fs.statSync(filePath);
      } catch (e) {
        return null;
      }

      if (stats.isDirectory()) return null;

      return {
        name: file,
        size: stats.size,
        mtime: stats.mtime,
        url: `/chandrayaan/${encodeURIComponent(file)}`
      };
    }).filter(Boolean);

    return NextResponse.json(fileList);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to read directory' }, { status: 500 });
  }
}
