export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postcode = searchParams.get('postcode')
  if (!postcode) return NextResponse.json({ error: 'postcode required' }, { status: 400 })

  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ error: 'Zen not configured' }, { status: 503 })
  }

  try {
    const { searchAddresses } = await import('@/lib/zen')
    const addresses = await searchAddresses(postcode)
    return NextResponse.json({ addresses, source: 'zen' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
