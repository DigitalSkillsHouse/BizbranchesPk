import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const admin = db.admin();
    const ping = await admin.ping();

    return NextResponse.json({
      ok: true,
      ping,
      serverInfo: await admin.serverStatus().catch(() => undefined),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err?.message || String(err),
    }, { status: 500 });
  }
}
