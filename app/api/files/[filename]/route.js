import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function DELETE(request, { params }) {
  try {
    const filename = path.basename(params.filename);
    const filePath = path.join(process.cwd(), 'public', 'chandrayaan', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
