import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { orderId, signedName, order } = await req.json()

  if (!orderId || !signedName) {
    return NextResponse.json({ error: 'orderId and signedName required' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const userAgent = req.headers.get('user-agent') || 'unknown'
  const signedAt = new Date().toISOString()

  const signatureRecord = {
    signed_at: signedAt,
    signed_name: signedName,
    signed_ip: ip,
    signed_user_agent: userAgent,
    status: 'signed',
  }

  // Persist to Supabase if available
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders')
        .update({ ...signatureRecord, updated_at: signedAt })
        .eq('id', orderId)
    } catch (err) {
      console.error('Sign persist error:', err)
    }
  }

  // Send signed PDF email (non-blocking — don't fail the sign request if email fails)
  if (order && process.env.RESEND_API_KEY) {
    const enrichedOrder = {
      ...order,
      signed_name: signedName,
      signed_at: signedAt,
      signed_ip: ip,
    }
    // Fire and forget
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    fetch(`${baseUrl}/api/quote/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, order: enrichedOrder, signed: true }),
    }).catch(err => console.error('Signed email error:', err))
  }

  return NextResponse.json({ success: true, signedAt, signedName, ip })
}
