export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const EPC_USER = process.env.EPC_EMAIL || 'shawadash@gmail.com'
const EPC_KEY  = process.env.EPC_API_KEY || '3a3846539159550ee16aa89b8f78f1c5947823d4'
const AUTH     = `Basic ${Buffer.from(`${EPC_USER}:${EPC_KEY}`).toString('base64')}`

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode')?.replace(/\s/g, '')
  const address  = req.nextUrl.searchParams.get('address') || ''
  if (!postcode) return NextResponse.json({ error: 'postcode required' }, { status: 400 })

  try {
    const res = await fetch(
      `https://epc.opendatacommunities.org/api/v1/non-domestic/search?postcode=${encodeURIComponent(postcode)}&size=25`,
      { headers: { Accept: 'application/json', Authorization: AUTH } }
    )

    // EPC returns 401 for unknown postcodes or empty body for no results
    if (!res.ok) return NextResponse.json({ uprn: null, total: 0, uprnMap: {} })

    const text = await res.text()
    if (!text || text.trim() === '') return NextResponse.json({ uprn: null, total: 0, uprnMap: {} })

    let data: { rows?: Array<Record<string,string>> }
    try { data = JSON.parse(text) } catch { return NextResponse.json({ uprn: null, total: 0, uprnMap: {} }) }

    const rows = data.rows || []

    // Build address → uprn map
    const uprnMap: Record<string, string> = {}
    for (const r of rows) {
      if (r.uprn) {
        const key = `${r.address1 || ''} ${r.address2 || ''}`.toLowerCase().trim()
        uprnMap[key] = r.uprn
      }
    }

    // Find best UPRN match for given address
    let uprn: string | null = null
    if (address && rows.length > 0) {
      const addrLower = address.toLowerCase()
      for (const [key, val] of Object.entries(uprnMap)) {
        if (addrLower.includes(key.split(' ')[0]) || key.includes(addrLower.split(',')[0].trim())) {
          uprn = val
          break
        }
      }
      if (!uprn) uprn = rows[0]?.uprn || null
    } else if (rows.length === 1) {
      uprn = rows[0].uprn || null
    }

    return NextResponse.json({ uprn, total: rows.length, uprnMap })
  } catch (err) {
    return NextResponse.json({ uprn: null, total: 0, uprnMap: {}, error: String(err) })
  }
}
