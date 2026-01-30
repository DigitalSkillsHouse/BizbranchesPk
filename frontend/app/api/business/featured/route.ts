import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3002'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backendUrl = `${BACKEND_URL}/api/business/featured?${searchParams.toString()}`
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Featured businesses API proxy error:', error)
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch featured businesses' },
      { status: 500 }
    )
  }
}