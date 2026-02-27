import { NextRequest, NextResponse } from 'next/server'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
export async function POST(req: NextRequest) {
  const { phoneNumbers } = await req.json()
  if (!phoneNumbers?.length) return NextResponse.json({ error: 'phoneNumbers required' }, { status: 400 })
  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ reference: 'MOCK-PORT-001', status: 'available',
      numbers: phoneNumbers.map((n: string) => ({ number: n, portable: true, donorNetwork: 'BT' })), source: 'mock' })
  }
  try {
    const { checkNumberPortability } = await import('@/lib/zen-orders')
    const result = await checkNumberPortability(phoneNumbers)
    return NextResponse.json({ result, source: "zen" })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('reference')
  if (!ref) return NextResponse.json({ error: 'reference required' }, { status: 400 })
  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ reference: ref, status: 'available', numbers: [], source: 'mock' })
  }
  try {
    const { getNumberPortResult } = await import('@/lib/zen-orders')
    const result = await getNumberPortResult(ref)
    return NextResponse.json({ result, source: "zen" })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
