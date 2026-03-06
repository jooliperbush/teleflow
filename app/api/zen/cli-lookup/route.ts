export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getZenToken } from '@/lib/zen'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

const LINE_TYPE_LABELS: Record<string, string> = {
  fttp:   'Full Fibre (FTTP)',
  fttc:   'Fibre to the Cabinet (FTTC)',
  sogea:  'Single Order Fibre (SOGEA)',
  gfast:  'G.fast Ultrafast',
  adsl:   'ADSL Broadband',
}

// RAG values from Zen: Green = available, Amber = partially, Red = not available
function isAvailable(rag: string | null): boolean {
  if (!rag) return false
  return ['green', 'amber'].includes(rag.toLowerCase())
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const raw = searchParams.get('cli')?.replace(/[\s\-().]/g, '') || ''

  if (!raw) return NextResponse.json({ error: 'cli (phone number) required' }, { status: 400 })
  if (!ZEN_CONFIGURED) return NextResponse.json({ error: 'Zen not configured' }, { status: 503 })

  // Normalise: ensure starts with 0 for UK numbers
  const cli = raw.startsWith('44') ? '0' + raw.slice(2) : raw

  try {
    const token = await getZenToken('indirect-availability')

    const res = await fetch('https://gateway.api.indirect.zen.co.uk/self-service/api/availability/check', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({ phoneNumber: cli }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Zen error: ${res.status} ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const ld = data.lineDetails || {}

    // Parse lineDetails to find available technologies
    const available: { type: string; label: string; dl: number | null; ul: number | null; rag: string }[] = []

    // FTTP
    const fttp = ld.fttp
    if (fttp?.rag && isAvailable(fttp.rag)) {
      available.push({ type: 'fttp', label: LINE_TYPE_LABELS.fttp, dl: null, ul: null, rag: fttp.rag })
    }
    // FTTC
    const fttc = ld.fttc
    if (fttc?.rag && isAvailable(fttc.rag)) {
      available.push({
        type: 'fttc', label: LINE_TYPE_LABELS.fttc,
        dl: fttc.rangeADownstreamTopSpeedValue ?? null,
        ul: fttc.rangeAUpstreamTopSpeedValue ?? null,
        rag: fttc.rag,
      })
    }
    // SOGEA
    const sogea = ld.sogea
    if (sogea?.rag && isAvailable(sogea.rag)) {
      available.push({
        type: 'sogea', label: LINE_TYPE_LABELS.sogea,
        dl: sogea.rangeADownstreamTopSpeedValue ?? null,
        ul: sogea.rangeAUpstreamTopSpeedValue ?? null,
        rag: sogea.rag,
      })
    }
    // G.fast
    const gfast = ld.gFast
    if (gfast?.rag && isAvailable(gfast.rag)) {
      available.push({
        type: 'gfast', label: LINE_TYPE_LABELS.gfast,
        dl: gfast.rangeADownstreamTopSpeedValue ?? null,
        ul: gfast.rangeAUpstreamTopSpeedValue ?? null,
        rag: gfast.rag,
      })
    }
    // ADSL
    const adsl = ld.adsl2Plus
    if (adsl?.rag && isAvailable(adsl.rag)) {
      available.push({
        type: 'adsl', label: LINE_TYPE_LABELS.adsl,
        dl: adsl.rangeADownstreamTopSpeedValue ?? null,
        ul: adsl.rangeAUpstreamTopSpeedValue ?? null,
        rag: adsl.rag,
      })
    }

    // Priority order: fttp > sogea > fttc > gfast > adsl
    const priority = ['fttp', 'sogea', 'fttc', 'gfast', 'adsl']
    const best = priority.map(t => available.find(a => a.type === t)).find(Boolean) ?? null

    // Also check provisioningType for current line type
    const provTypes: Record<string, string> = {}
    for (const [k, v] of Object.entries(ld)) {
      const prov = (v as Record<string, string> | null)?.provisioningType
      if (prov && prov !== 'Unknown' && prov !== 'None') {
        provTypes[k] = prov
      }
    }

    if (!best && available.length === 0) {
      return NextResponse.json({
        cli,
        found: false,
        message: 'No line data found for this number. This may be a mobile number, non-geographic number, or a line not in our lookup system.',
        lineDetails: ld,
      })
    }

    return NextResponse.json({
      cli,
      found: true,
      lineType: best?.type ?? 'unknown',
      lineTypeLabel: best?.label ?? 'Unknown',
      availableProducts: available,
      bestAvailable: best ? {
        type: best.type,
        typeLabel: best.label,
        downloadMbps: best.dl,
        uploadMbps: best.ul,
      } : null,
      currentProvisioningTypes: provTypes,
      lineDetails: ld,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
