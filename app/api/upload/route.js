import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'chandrayaan');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = path.basename(file.name);
    const filePath = path.join(uploadDir, safeName);

    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        name: safeName,
        size: file.size,
        url: `/chandrayaan/${encodeURIComponent(safeName)}`
      }
    });
  } catch (err) {
    console.error('Next.js API Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
