import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function repairAndParseJson(text: string) {
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON found')
  let depth = 0, end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) throw new Error('Unclosed JSON')
  let json = text.slice(start, end + 1)
  json = json.replace(/,(\s*[}\]])/g, '$1')
  json = json.replace(/[\x00-\x1F\x7F]/g, ' ')
  json = json.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
  try { return JSON.parse(json) } catch {
    json = json.replace(/,(\s*[}\]])/g, '$1')
    return JSON.parse(json)
  }
}

const ITC_NAMES = ['itc', 'itc telecoms', 'itc (telecoms simplified)', 'clickitc', 'telecoms simplified']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('invoice') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'application/pdf'
    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'
    if (!isImage && !isPdf) return NextResponse.json({ error: 'Please upload a PDF or image file' }, { status: 400 })

    const systemPrompt = `You are a telecoms analyst for ITC Telecoms UK. Analyse invoices conservatively.
ITC pricing: Broadband from £28/mo, VoIP from £8/line/mo, Mobile from £12/mo, Leased lines from £150/mo.

RULES:
- monthlySaving MUST be less than totalMonthly (you cannot save more than you spend)
- savingPercent must be realistic (typically 10-40% — never over 60%)
- If you cannot identify services clearly, estimate conservatively
- If the invoice is from ITC, clickitc, or ITC Telecoms Simplified, set alreadyITC to true
- Return ONLY raw JSON, no markdown, no explanation`

    const userPrompt = `Analyse this telecoms invoice. Reply with ONLY this JSON, nothing else:

{"provider":"string","alreadyITC":false,"totalMonthly":0.00,"currency":"GBP","services":[{"name":"string","cost":0.00,"itcEquivalent":"string","itcCost":0.00}],"itcTotalMonthly":0.00,"monthlySaving":0.00,"annualSaving":0.00,"savingPercent":0,"recommendations":["string"],"redFlags":["string"],"summary":"string"}`

    const content: Anthropic.MessageParam['content'] = isImage
      ? [{ type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg'|'image/png'|'image/gif'|'image/webp', data: base64 } }, { type: 'text', text: userPrompt }]
      : [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }, { type: 'text', text: userPrompt }]

    let message: Awaited<ReturnType<typeof client.messages.create>> | null = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        message = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{ role: 'user', content }]
        })
        break
      } catch (e: unknown) {
        const status = (e as { status?: number }).status
        if (attempt < 3 && (status === 529 || status === 503 || status === 529)) {
          await new Promise(r => setTimeout(r, attempt * 2000))
          continue
        }
        throw e
      }
    }
    if (!message) throw new Error('Analysis failed after retries')

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const analysis = repairAndParseJson(raw)

    // Sanity checks
    const total = Math.abs(analysis.totalMonthly || 0)
    const itcTotal = Math.abs(analysis.itcTotalMonthly || 0)
    const saving = Math.max(0, Math.min(total - itcTotal, total * 0.6)) // cap at 60%
    analysis.monthlySaving = Math.round(saving * 100) / 100
    analysis.annualSaving = Math.round(saving * 12 * 100) / 100
    analysis.savingPercent = total > 0 ? Math.round((saving / total) * 100) : 0

    // Detect ITC's own invoice
    const providerLower = (analysis.provider || '').toLowerCase()
    const isITC = analysis.alreadyITC || ITC_NAMES.some(n => providerLower.includes(n))
    if (isITC) {
      return NextResponse.json({ alreadyITC: true, provider: analysis.provider, totalMonthly: total })
    }

    return NextResponse.json(analysis)
  } catch (err: unknown) {
    console.error('Invoice error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed' }, { status: 500 })
  }
}
