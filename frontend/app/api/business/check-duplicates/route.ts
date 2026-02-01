import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3002'

/** POST /api/business/check-duplicates – proxy to backend for duplicate validation */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const res = await fetch(`${BACKEND_URL}/api/business/check-duplicates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({ ok: false, error: 'Invalid response' }))
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    const err = error as Error
    console.error('Check-duplicates proxy error:', err?.message || err)
    return NextResponse.json(
      { ok: false, error: 'Server unreachable', hasDuplicates: false },
      { status: 500 }
    )
  }
}
