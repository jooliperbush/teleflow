import { NextRequest, NextResponse } from 'next/server'

// Supabase is optional — if no env vars, orders persist in client only
let supabaseAvailable = false
try {
  supabaseAvailable = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
} catch {}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId, ...fields } = body

  if (!supabaseAvailable) {
    // No Supabase configured — return mock success
    return NextResponse.json({ id: orderId || crypto.randomUUID(), ...fields, persisted: false })
  }

  try {
    const { getServiceClient } = await import('@/lib/supabase')
    const db = getServiceClient()

    if (orderId) {
      const { data, error } = await db
        .from('orders')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ ...data, persisted: true })
    } else {
      const { data, error } = await db
        .from('orders')
        .insert(fields)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ ...data, persisted: true })
    }
  } catch (err) {
    console.error('Order persist error:', err)
    return NextResponse.json({ id: orderId || crypto.randomUUID(), persisted: false, error: String(err) })
  }
}
