import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function extractJson(text: string) {
  // Strip markdown code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  // Find outermost { }
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON object found')
  let depth = 0, end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) throw new Error('Unclosed JSON object')
  let json = text.slice(start, end + 1)
  // Fix common Claude issues: trailing commas before ] or }
  json = json.replace(/,\s*([\]}])/g, '$1')
  return JSON.parse(json)
}

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

    const systemPrompt = `You are an expert telecoms analyst for ITC Telecoms, a UK business telecoms reseller.
ITC pricing: Broadband FTTP from £28/mo (50Mbps) to £75/mo (1Gbps). VoIP from £8/line/mo. Mobile SIMs from £12/mo. Leased lines from £150/mo. Support included.
Be realistic and conservative with savings estimates.`

    const userPrompt = `Analyse this telecoms invoice. Return ONLY a valid JSON object — no markdown, no extra text, no trailing commas.

{
  "provider": "provider name or Unknown",
  "totalMonthly": 0.00,
  "currency": "GBP",
  "services": [
    { "name": "service name", "cost": 0.00, "itcEquivalent": "ITC product", "itcCost": 0.00 }
  ],
  "itcTotalMonthly": 0.00,
  "monthlySaving": 0.00,
  "annualSaving": 0.00,
  "savingPercent": 0,
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "redFlags": ["flag 1"],
  "summary": "2-3 sentence plain English summary"
}`

    const content: Anthropic.MessageParam['content'] = isImage
      ? [{ type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 } }, { type: 'text', text: userPrompt }]
      : [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }, { type: 'text', text: userPrompt }]

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const analysis = extractJson(text)
    return NextResponse.json(analysis)
  } catch (err: unknown) {
    console.error('Invoice analysis error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed' }, { status: 500 })
  }
}
