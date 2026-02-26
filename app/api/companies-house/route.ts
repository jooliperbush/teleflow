import { NextRequest, NextResponse } from 'next/server'

const CH_BASE = 'https://api.company-information.service.gov.uk'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const number = searchParams.get('number')

  try {
    if (number) {
      const res = await fetch(`${CH_BASE}/company/${number}`)
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (q) {
      const res = await fetch(`${CH_BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=5`)
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Provide q or number param' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Companies House lookup failed', detail: String(err) }, { status: 500 })
  }
}
