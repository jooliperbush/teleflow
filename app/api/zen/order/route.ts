export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { orderId, zenOrderData } = body
  if (!orderId || !zenOrderData) return NextResponse.json({ error: 'orderId and zenOrderData required' }, { status: 400 })
  if (!ZEN_CONFIGURED) {
    const mockRef = 'ZW' + Math.floor(Math.random() * 90000 + 10000)
    console.log('[ZEN ORDER MOCK]', zenOrderData)
    return NextResponse.json({ zenReference: mockRef, status: 'submitted', source: 'mock',
      estimatedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10) })
  }
  try {
    const { placeZenOrder } = await import('@/lib/zen-orders')
    const result = await placeZenOrder(zenOrderData)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders').update({
        cw_synced: true, cw_synced_at: new Date().toISOString(),
        cw_ticket_id: result.zenReference, status: 'active',
      }).eq('id', orderId)
    }
    return NextResponse.json({ ...result, source: 'zen' })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
