import { NextRequest, NextResponse } from 'next/server'
import type { ZenProduct } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
const MARGIN = 1.25

// ITC standard pricing for products where Zen doesn't return a price
const ITC_PRICING: Record<string, { monthly: number; setup: number }> = {
  fttp: { monthly: 36.00,  setup: 0 },
  fttc: { monthly: 22.00,  setup: 0 },
  sogea: { monthly: 24.00, setup: 0 },
  gfast: { monthly: 32.00, setup: 0 },
  adsl:  { monthly: 16.00, setup: 0 },
}

function getMockProducts(): ZenProduct[] {
  return [
    { type: 'fttp', name: 'FTTP 900/900', downloadMbps: 900, uploadMbps: 900, monthlyCost: 36.00, setupFee: 0, available: true },
    { type: 'fttc', name: 'FTTC 80/20',  downloadMbps: 80,  uploadMbps: 20,  monthlyCost: 22.00, setupFee: 0, available: true },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const uprn = searchParams.get('uprn')
  const postcode = searchParams.get('postcode') // legacy fallback
  const cli = searchParams.get('cli') || undefined

  if (!uprn && !postcode) {
    return NextResponse.json({ error: 'uprn required' }, { status: 400 })
  }

  if (!ZEN_CONFIGURED || !uprn) {
    await new Promise(r => setTimeout(r, 600))
    const products = getMockProducts()
    return NextResponse.json({
      products: products.map(p => ({ ...p, monthlyCost: p.monthlyCost ? +(p.monthlyCost * MARGIN).toFixed(2) : null })),
      source: 'mock', availabilityReference: null,
    })
  }

  try {
    const { checkAvailability } = await import('@/lib/zen')
    const result = await checkAvailability(uprn, cli)

    // ITC rule: only best broadband (sorted desc, take first)
    const best = result.products.length ? [result.products[0]] : []

    const products = best.map(p => {
      const basePricing = ITC_PRICING[p.type] || { monthly: 30, setup: 0 }
      const monthly = p.monthlyCost ? +(p.monthlyCost * MARGIN).toFixed(2) : +(basePricing.monthly * MARGIN).toFixed(2)
      return { ...p, monthlyCost: monthly, setupFee: p.setupFee ? +(p.setupFee * MARGIN).toFixed(2) : basePricing.setup }
    })

    return NextResponse.json({
      products,
      availabilityReference: result.availabilityReference,
      remainingChecks: result.remainingChecks,
      source: 'zen',
    })
  } catch (err) {
    console.error('Zen availability error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
