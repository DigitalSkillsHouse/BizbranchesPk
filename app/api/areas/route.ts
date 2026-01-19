import { NextRequest, NextResponse } from 'next/server';
import { courierGet } from '@/lib/courier';

export async function GET(request: NextRequest) {
  const base = process.env.COURIER_API_BASE_URL;
  const searchParams = request.nextUrl.searchParams;
  const cityId = searchParams.get('cityId');

  if (!cityId) {
    return NextResponse.json({ error: 'cityId is required' }, { status: 400 });
  }

  if (!base) {
    return NextResponse.json({ error: 'Missing COURIER_API_BASE_URL' }, { status: 500 });
  }

  try {
    const response = await courierGet(`/areas?cityId=${encodeURIComponent(cityId)}`);
    const text = await response.text();
    if (!response.ok) {
      console.error('/api/areas upstream error', response.status, text);
      let body: any;
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
      return NextResponse.json({ error: body?.error || 'Failed to fetch areas', details: body }, { status: response.status });
    }
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = [];
    }
    const raw = Array.isArray(data)
      ? data
      : data?.data || data?.items || data?.areas || data?.results || [];
    const list = Array.isArray(raw) ? raw : [];
    const normalized = list.map((it: any) => ({
      id: it?.id ?? it?._id ?? it?.value ?? it?.code ?? String(it?.name ?? ''),
      name: it?.name ?? it?.label ?? it?.title ?? String(it?.id ?? it?._id ?? it?.value ?? it?.code ?? ''),
    }));
    return NextResponse.json(normalized);
  } catch (err) {
    console.error('/api/areas error', err);
    return NextResponse.json({ error: 'Failed to fetch areas' }, { status: 500 });
  }
}
