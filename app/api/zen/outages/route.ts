export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { zenGet } from '@/lib/zen'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
export async function GET() {
  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ outages: [], planned: [], source: 'mock' })
  }
  try {
    const [outages, planned] = await Promise.all([
      zenGet('/api/major-service-outages', 'indirect-diagnostics'),
      zenGet('/api/planned-engineering-work', 'indirect-diagnostics'),
    ])
    return NextResponse.json({ outages, planned, source: 'zen' })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
