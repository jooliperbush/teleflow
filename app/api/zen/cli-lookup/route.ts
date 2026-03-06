export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

const LINE_TYPE_LABELS: Record<string, string> = {
  fttp:   'Full Fibre (FTTP)',
  fttc:   'Fibre to the Cabinet (FTTC)',
  sogea:  'Single Order FTTC (SOGEA)',
  gfast:  'G.fast',
  adsl:   'ADSL',
  pstn:   'PSTN Copper',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const cli = searchParams.get('cli')?.replace(/\s/g, '')

  if (!cli) return NextResponse.json({ error: 'cli (phone number) required' }, { status: 400 })
  if (!ZEN_CONFIGURED) return NextResponse.json({ error: 'Zen not configured' }, { status: 503 })

  try {
    const { checkAvailability } = await import('@/lib/zen')
    const result = await checkAvailability(undefined, cli, undefined)

    const types = [...new Set(result.products.map(p => p.type))]
    const currentType = types[0] || 'unknown'
    const label = LINE_TYPE_LABELS[currentType] || currentType.toUpperCase()

    // Best available product (sorted by speed descending)
    const best = result.products[0] || null

    return NextResponse.json({
      cli,
      lineType: currentType,
      lineTypeLabel: label,
      availableProducts: result.products.map(p => ({
        type: p.type,
        typeLabel: LINE_TYPE_LABELS[p.type] || p.type,
        name: p.name,
        downloadMbps: p.downloadMbps,
        uploadMbps: p.uploadMbps,
      })),
      bestAvailable: best ? {
        type: best.type,
        typeLabel: LINE_TYPE_LABELS[best.type] || best.type,
        name: best.name,
        downloadMbps: best.downloadMbps,
        uploadMbps: best.uploadMbps,
      } : null,
      availabilityReference: result.availabilityReference,
      lineDetails: result.lineDetails ?? null,
      remainingChecks: result.remainingChecks,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
