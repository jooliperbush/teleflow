import { NextRequest, NextResponse } from 'next/server'
import type { ZenProduct } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
const MARGIN = 1.25 // 25% ITC markup

// Mock for testing without credentials
function getMockProducts(): ZenProduct[] {
  return [
    { type: 'fttp', name: 'Full Fibre 900', downloadMbps: 900, uploadMbps: 900, monthlyCost: 36.00, setupFee: 0, available: true },
    { type: 'fttc', name: 'FTTC 80/20', downloadMbps: 80, uploadMbps: 20, monthlyCost: 17.60, setupFee: 0, available: true },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  // Support both legacy postcode-only AND address key mode
  const postcode = searchParams.get('postcode')
  const goldAddressKey = searchParams.get('goldAddressKey')
  const districtCode = searchParams.get('districtCode') || ''
  const cli = searchParams.get('cli') || undefined

  if (!goldAddressKey && !postcode) {
    return NextResponse.json({ error: 'goldAddressKey or postcode required' }, { status: 400 })
  }

  if (!ZEN_CONFIGURED || !goldAddressKey) {
    // Fall back to mock if not configured or no address key yet
    await new Promise(r => setTimeout(r, 600))
    const products = getMockProducts()
    // Apply ITC rule: only best broadband
    const broadband = products.filter(p => ['fttp', 'fttc', 'sogea', 'gfast', 'adsl'].includes(p.type))
    const best = broadband.length ? [broadband[0]] : [] // already sorted best-first
    return NextResponse.json({
      products: best.map(p => ({ ...p, monthlyCost: p.monthlyCost ? p.monthlyCost * MARGIN : null })),
      source: 'mock',
      availabilityReference: null,
    })
  }

  try {
    const { checkAvailability } = await import('@/lib/zen')
    const result = await checkAvailability(goldAddressKey, districtCode, cli)

    // ITC rule: only best broadband product (already sorted by speed desc)
    const broadband = result.products.filter(p => p.type !== 'ethernet')
    const best = broadband.length ? [broadband[0]] : []

    const products = best.map(p => ({
      ...p,
      monthlyCost: p.monthlyCost ? p.monthlyCost * MARGIN : null,
      setupFee: p.setupFee ? p.setupFee * MARGIN : 0,
    }))

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
