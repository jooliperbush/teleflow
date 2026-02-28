export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const CH_API_KEY = process.env.COMPANIES_HOUSE_API_KEY

export async function GET(req: NextRequest) {
  const number = req.nextUrl.searchParams.get('number')?.toUpperCase()
  if (!number) return NextResponse.json({ error: 'number required' }, { status: 400 })
  if (!CH_API_KEY) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  const res = await fetch(`https://api.company-information.service.gov.uk/company/${number}`, {
    headers: { Authorization: `Basic ${Buffer.from(CH_API_KEY + ':').toString('base64')}` },
  })

  if (!res.ok) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const d = await res.json()

  return NextResponse.json({
    title: d.company_name,
    company_number: d.company_number,
    company_status: d.company_status,
    date_of_creation: d.date_of_creation,
    registered_office_address: d.registered_office_address,
  })
}
