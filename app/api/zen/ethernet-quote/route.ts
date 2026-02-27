import { NextRequest, NextResponse } from 'next/server'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
const MARGIN = 1.25
const MOCK = [
  { term: 12, bandwidth: 100,  monthlyPrice: 280, setupFee: 500 },
  { term: 24, bandwidth: 100,  monthlyPrice: 240, setupFee: 250 },
  { term: 36, bandwidth: 100,  monthlyPrice: 210, setupFee: 0   },
  { term: 12, bandwidth: 200,  monthlyPrice: 360, setupFee: 500 },
  { term: 24, bandwidth: 200,  monthlyPrice: 310, setupFee: 250 },
  { term: 36, bandwidth: 200,  monthlyPrice: 270, setupFee: 0   },
  { term: 12, bandwidth: 1000, monthlyPrice: 550, setupFee: 500 },
  { term: 24, bandwidth: 1000, monthlyPrice: 480, setupFee: 250 },
  { term: 36, bandwidth: 1000, monthlyPrice: 420, setupFee: 0   },
]
export async function POST(req: NextRequest) {
  const { postCode, term, bandwidth } = await req.json()
  if (!postCode) return NextResponse.json({ error: 'postCode required' }, { status: 400 })
  if (!ZEN_CONFIGURED) {
    const quotes = MOCK
      .filter(q => (!term || q.term === term) && (!bandwidth || q.bandwidth === bandwidth))
      .map(q => ({ ...q, monthlyPrice: +(q.monthlyPrice * MARGIN).toFixed(2), setupFee: +(q.setupFee * MARGIN).toFixed(2), currency: 'GBP' }))
    return NextResponse.json({ quotes, source: 'mock' })
  }
  try {
    const { getEthernetQuotes } = await import('@/lib/zen-orders')
    const raw = await getEthernetQuotes({ postCode, term: term || 36, bandwidth: bandwidth || 200 })
    const quotes = raw.map(q => ({ ...q, monthlyPrice: +(q.monthlyPrice * MARGIN).toFixed(2), setupFee: +(q.setupFee * MARGIN).toFixed(2) }))
    return NextResponse.json({ quotes, source: 'zen' })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
