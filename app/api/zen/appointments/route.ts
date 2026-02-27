export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('availabilityReference')
  if (!ref) return NextResponse.json({ error: 'availabilityReference required' }, { status: 400 })

  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ slots: [], source: 'unconfigured' })
  }

  try {
    const { getAvailableAppointments } = await import('@/lib/zen-orders')
    const slots = await getAvailableAppointments(ref)
    return NextResponse.json({ slots: slots || [], source: 'zen' })
  } catch (err) {
    return NextResponse.json({ slots: [], source: 'error', error: String(err) })
  }
}
