import { NextRequest, NextResponse } from 'next/server'

// MOCK — swap for real Zen API when credentials available
// Real: GET ${ZEN_API_BASE_URL}/availability?postcode={postcode}
// Auth: Bearer ${ZEN_API_KEY}

interface Product {
  type: 'broadband' | 'lease_line' | 'voip' | 'mobile'
  name: string
  downloadMbps?: number
  uploadMbps?: number
  monthlyCost: number | null
  setupFee: number | null
  available: boolean
  requiresCallback?: boolean
}

function getMockProducts(postcode: string): Product[] {
  // Simulate different availability by postcode prefix
  const prefix = postcode.replace(/\s+/g, '').toUpperCase().slice(0, 2)
  const hasFibre = !['HS', 'ZE', 'KW'].includes(prefix) // remote Scottish isles

  const allBroadband: Product[] = hasFibre
    ? [
        { type: 'broadband', name: 'Full Fibre 900', downloadMbps: 900, uploadMbps: 900, monthlyCost: 45.00, setupFee: 0, available: true },
        { type: 'broadband', name: 'Full Fibre 150', downloadMbps: 150, uploadMbps: 150, monthlyCost: 28.00, setupFee: 0, available: true },
      ]
    : [
        { type: 'broadband', name: 'FTTC 80/20', downloadMbps: 80, uploadMbps: 20, monthlyCost: 22.00, setupFee: 0, available: true },
      ]

  // Rule: only return BEST broadband (highest downloadMbps)
  const bestBroadband = allBroadband.reduce((best, curr) =>
    (curr.downloadMbps ?? 0) > (best.downloadMbps ?? 0) ? curr : best
  )

  return [
    bestBroadband,
    {
      type: 'lease_line',
      name: 'Managed Fibre 200/1000',
      downloadMbps: 200,
      uploadMbps: 1000,
      monthlyCost: null,
      setupFee: null,
      available: true,
      requiresCallback: true,
    },
    {
      type: 'voip',
      name: 'VoIP Seat',
      monthlyCost: 8.00,
      setupFee: 25.00,
      available: true,
    },
    {
      type: 'mobile',
      name: 'O2 Unlimited SIM',
      monthlyCost: 15.00,
      setupFee: 0,
      available: true,
    },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postcode = searchParams.get('postcode')

  if (!postcode) {
    return NextResponse.json({ error: 'postcode required' }, { status: 400 })
  }

  // TODO: replace with real Zen API call when credentials received
  // const zenKey = process.env.ZEN_API_KEY
  // const zenBase = process.env.ZEN_API_BASE_URL
  // const res = await fetch(`${zenBase}/availability?postcode=${postcode}`, {
  //   headers: { Authorization: `Bearer ${zenKey}` }
  // })
  // const data = await res.json()

  await new Promise(r => setTimeout(r, 600)) // simulate API latency

  return NextResponse.json({
    postcode: postcode.toUpperCase(),
    products: getMockProducts(postcode),
    source: 'mock', // remove when live
  })
}
