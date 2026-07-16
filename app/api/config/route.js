import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const envPath = path.join(process.cwd(), '.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join('=').trim();
          env[key] = value;
        }
      });
    } catch (e) {
      console.error('Error reading .env file:', e);
    }
  }
  
  return NextResponse.json({
    ghUsername: env.GITHUB_USERNAME || '',
    ghRepo: env.GITHUB_REPO || '',
    ghToken: env.GITHUB_TOKEN || ''
  });
}
