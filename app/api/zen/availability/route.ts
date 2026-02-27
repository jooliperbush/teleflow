export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import type { ZenProduct } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const uprn = searchParams.get('uprn')
  const cli = searchParams.get('cli') || undefined

  if (!uprn) return NextResponse.json({ error: 'uprn required' }, { status: 400 })
  if (!ZEN_CONFIGURED) return NextResponse.json({ error: 'Zen not configured' }, { status: 503 })

  try {
    const { checkAvailability } = await import('@/lib/zen')
    const result = await checkAvailability(uprn, cli)

    // Zen availability does not return pricing — prices come from a separate
    // quote step once the customer selects a product and term
    const products = result.products.map((p: ZenProduct) => ({
      ...p,
      monthlyCost: null,
      setupFee: 0,
    }))

    return NextResponse.json({
      products,
      availabilityReference: result.availabilityReference,
      remainingChecks: result.remainingChecks,
      source: 'zen',
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
