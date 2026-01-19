import { NextRequest, NextResponse } from 'next/server';
import { getModels } from '@/lib/models';

// POST /api/business/check-duplicates - Check for duplicate phone or email
export async function POST(request: NextRequest) {
  try {
    console.log('Checking duplicates endpoint called');
    const models = await getModels();
    console.log('Database models initialized');
    
    const body = await request.json();
    const { phone, email } = body || {};
    console.log('Received request body:', { phone, email });
    
    if (!phone && !email) {
      return NextResponse.json({ 
        ok: false, 
        error: "Phone number or email is required" 
      }, { status: 400 });
    }
    
    const duplicates: { phoneExists?: boolean; emailExists?: boolean; hasDuplicates: boolean } = {
      hasDuplicates: false
    };
    
    // Check for duplicate phone
    if (phone) {
      try {
        // Remove all non-digit characters for comparison
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        // Escape special regex characters
        const escapedPhone = cleanPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const phoneExists = await models.businesses.findOne({
          phone: { $regex: new RegExp(escapedPhone, 'i') }
        });
        
        duplicates.phoneExists = !!phoneExists;
        if (phoneExists) {
          duplicates.hasDuplicates = true;
        }
      } catch (phoneErr) {
        console.error("Error checking phone duplicates:", phoneErr);
      }
    }
    
    // Check for duplicate email
    if (email) {
      try {
        // Escape special regex characters in email for exact match
        const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const emailExists = await models.businesses.findOne({
          email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
        });
        
        duplicates.emailExists = !!emailExists;
        if (emailExists) {
          duplicates.hasDuplicates = true;
        }
      } catch (emailErr) {
        console.error("Error checking email duplicates:", emailErr);
      }
    }
    
    console.log('Sending response:', { duplicates, hasDuplicates: duplicates.hasDuplicates });
    return NextResponse.json({
      ok: true,
      duplicates,
      hasDuplicates: duplicates.hasDuplicates
    });
  } catch (err: any) {
    console.error("Error checking duplicates:", err);
    return NextResponse.json({ 
      ok: false, 
      error: err?.message || "Internal server error" 
    }, { status: 500 });
  }
}
