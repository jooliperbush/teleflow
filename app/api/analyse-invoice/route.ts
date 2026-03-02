import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('invoice') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mimeType = file.type || 'application/pdf'

    // Claude supports image types directly; for PDF convert to base64 as document
    const isImage = mimeType.startsWith('image/')
    const isPdf = mimeType === 'application/pdf'

    if (!isImage && !isPdf) {
      return NextResponse.json({ error: 'Please upload a PDF or image file' }, { status: 400 })
    }

    const systemPrompt = `You are an expert telecoms analyst working for ITC Telecoms, a UK business telecoms reseller. 
Your job is to analyse customer invoices and identify savings opportunities.

ITC Telecoms pricing (approximate):
- Broadband (FTTP): from £28/month (50Mbps) to £75/month (1Gbps)
- VoIP lines: from £8/line/month
- Mobile SIMs: from £12/month per user
- Leased lines: from £150/month (bespoke)
- Support: included, no extra charge

Always be realistic and slightly conservative with savings estimates. Never promise savings that aren't credible.`

    const userPrompt = `Analyse this business telecoms invoice. Extract all the information you can and provide:

1. Current provider name
2. List of services detected with their costs
3. Total monthly spend
4. What ITC Telecoms could offer as replacement services
5. Estimated monthly saving (realistic, conservative)
6. Key recommendations (max 3)
7. Any red flags (e.g. auto-renewing contracts, legacy services like ISDN)

Return ONLY a JSON object with this exact structure:
{
  "provider": "provider name or Unknown",
  "totalMonthly": 0.00,
  "currency": "GBP",
  "services": [
    { "name": "service name", "cost": 0.00, "itcEquivalent": "ITC product name", "itcCost": 0.00 }
  ],
  "itcTotalMonthly": 0.00,
  "monthlySaving": 0.00,
  "annualSaving": 0.00,
  "savingPercent": 0,
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "redFlags": ["flag 1"],
  "summary": "2-3 sentence plain English summary of findings"
}`

    let message
    if (isImage) {
      message = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp', data: base64 } },
            { type: 'text', text: userPrompt }
          ]
        }]
      })
    } else {
      // PDF — send as document
      message = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
            { type: 'text', text: userPrompt }
          ]
        }]
      })
    }

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'Could not parse invoice' }, { status: 500 })

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (err: unknown) {
    console.error('Invoice analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
