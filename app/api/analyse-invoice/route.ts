import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function repairAndParseJson(text: string) {
  // Strip markdown
  text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Extract outermost {}
  const start = text.indexOf('{')
  if (start === -1) throw new Error('No JSON found in response')
  let depth = 0, end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) throw new Error('Unclosed JSON object')
  let json = text.slice(start, end + 1)

  // Fix trailing commas before ] or }
  json = json.replace(/,(\s*[}\]])/g, '$1')

  // Fix unescaped newlines inside strings
  json = json.replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"')

  // Fix unescaped quotes inside string values (simple heuristic)
  // Try parsing, if it fails try more aggressive fixes
  try {
    return JSON.parse(json)
  } catch {
    // Replace smart quotes
    json = json.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    // Remove control characters
    json = json.replace(/[\x00-\x1F\x7F]/g, ' ')
    // Fix trailing commas again after replacements
    json = json.replace(/,(\s*[}\]])/g, '$1')
    return JSON.parse(json)
  }
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

    const systemPrompt = `You are a telecoms analyst for ITC Telecoms UK. Analyse invoices and identify savings.
ITC pricing: Broadband from £28/mo, VoIP from £8/line/mo, Mobile from £12/mo, Leased lines from £150/mo.
CRITICAL: Return ONLY raw JSON. No markdown. No code blocks. No explanation. Just the JSON object.`

    const userPrompt = `Analyse this invoice. Reply with ONLY this JSON structure, nothing else:

{"provider":"string","totalMonthly":0.00,"currency":"GBP","services":[{"name":"string","cost":0.00,"itcEquivalent":"string","itcCost":0.00}],"itcTotalMonthly":0.00,"monthlySaving":0.00,"annualSaving":0.00,"savingPercent":0,"recommendations":["string","string","string"],"redFlags":["string"],"summary":"string"}`

    const content: Anthropic.MessageParam['content'] = isImage
      ? [
          { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 } },
          { type: 'text', text: userPrompt }
        ]
      : [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: userPrompt }
        ]

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content }]
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('Claude raw response:', raw.slice(0, 500))

    try {
      const analysis = repairAndParseJson(raw)
      return NextResponse.json(analysis)
    } catch (parseErr) {
      console.error('JSON parse failed. Raw:', raw)
      return NextResponse.json({ error: `Could not parse analysis result. Please try again.` }, { status: 500 })
    }
  } catch (err: unknown) {
    console.error('Invoice analysis error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analysis failed' }, { status: 500 })
  }
}
