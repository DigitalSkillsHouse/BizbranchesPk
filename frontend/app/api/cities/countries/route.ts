import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3002'
    const url = `${backendUrl}/api/cities/countries`
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (err: any) {
    console.error('Countries API error:', err)
    
    // Fallback countries list
    const countries = [
      "Pakistan", "United States", "United Kingdom", "Canada", "Australia", 
      "Germany", "France", "India", "UAE", "Saudi Arabia"
    ]
    
    return Response.json({ ok: true, countries })
  }
}