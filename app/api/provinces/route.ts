import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Static provinces for Pakistan
    const provinces = [
      { id: "Punjab", name: "Punjab" },
      { id: "Sindh", name: "Sindh" },
      { id: "KPK", name: "Khyber Pakhtunkhwa" },
      { id: "Balochistan", name: "Balochistan" },
      { id: "ICT", name: "Islamabad Capital Territory" },
      { id: "GB", name: "Gilgit Baltistan" },
      { id: "AJK", name: "Azad Jammu & Kashmir" },
    ];
    
    const response = NextResponse.json(provinces);
    // Cache for 1 day, allow week-long stale-while-revalidate
    response.headers.set("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
    return response;
  } catch (error) {
    console.error('Error in provinces route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
