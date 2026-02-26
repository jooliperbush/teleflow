import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { orderId, signedName } = await req.json()

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
      await db.from('orders').update({ ...signatureRecord, updated_at: signedAt }).eq('id', orderId)
    } catch (err) {
      console.error('Sign persist error:', err)
    }
  }

  return NextResponse.json({ success: true, signedAt, signedName, ip })
}
