import { NextRequest, NextResponse } from 'next/server'

const CH_BASE = 'https://api.company-information.service.gov.uk'

function chHeaders() {
  const key = process.env.COMPANIES_HOUSE_API_KEY || '3e995a11-2516-471a-9f5a-be90939e1078'
  const encoded = Buffer.from(`${key}:`).toString('base64')
  return { Authorization: `Basic ${encoded}` }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const number = searchParams.get('number')

  try {
    if (number) {
      const res = await fetch(`${CH_BASE}/company/${number}`, { headers: chHeaders() })
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (q) {
      const res = await fetch(`${CH_BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=5`, { headers: chHeaders() })
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Provide q or number param' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Companies House lookup failed', detail: String(err) }, { status: 500 })
  }
}
