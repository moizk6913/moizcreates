import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'spacing-config.json');

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return NextResponse.json({ success: true, config: JSON.parse(data) });
    }
    return NextResponse.json({ success: false, message: 'No config file found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let current = {};
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        current = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      } catch {}
    }
    const merged = { ...current, ...body };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return NextResponse.json({ success: true, config: merged });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
