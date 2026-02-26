import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { orderId, order } = await req.json()

  if (!orderId || !order) {
    return NextResponse.json({ error: 'orderId and order required' }, { status: 400 })
  }

  const productRows = (order.selected_products || [])
    .map((p: { name: string; quantity: number; unitMonthly: number; monthlyTotal: number }) =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${p.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">£${p.unitMonthly.toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">£${p.monthlyTotal.toFixed(2)}</td>
      </tr>`)
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1B2A6B;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:white;margin:0;font-size:22px">ITC Telecoms</h1>
    <p style="color:#a0b4e8;margin:4px 0 0">Your Quote — ${order.quote_reference}</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p>Dear ${order.contact_name || 'Customer'},</p>
    <p>Thank you for your interest. Please find your quote below.</p>
    <table width="100%" style="border-collapse:collapse;margin:16px 0">
      <thead>
        <tr style="background:#f5f7fb">
          <th style="padding:8px;text-align:left">Product</th>
          <th style="padding:8px;text-align:center">Qty</th>
          <th style="padding:8px;text-align:right">Unit/mo</th>
          <th style="padding:8px;text-align:right">Total/mo</th>
        </tr>
      </thead>
      <tbody>${productRows}</tbody>
    </table>
    <div style="text-align:right;margin-top:16px">
      <strong style="font-size:18px">Monthly Total: £${order.monthly_total?.toFixed(2)}</strong><br>
      <span style="color:#666">Annual: £${order.annual_total?.toFixed(2)} | Contract: ${order.quote_term_months} months</span>
    </div>
    <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
    <p style="color:#888;font-size:12px">Quote valid for 30 days. ${order.company_name} — Ref: ${order.quote_reference}</p>
  </div>
</body>
</html>`

  const resendKey = process.env.RESEND_API_KEY
  const toEmail = order.contact_email

  if (!resendKey) {
    console.log('[QUOTE EMAIL] No Resend key configured. Would send to:', toEmail)
    console.log('[QUOTE EMAIL] Subject: Your ITC Telecoms Quote —', order.quote_reference)
    return NextResponse.json({ success: true, sent: false, reason: 'No RESEND_API_KEY configured' })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)
    const { data, error } = await resend.emails.send({
      from: 'ITC Telecoms <onboarding@resend.dev>',
      to: [toEmail],
      subject: `Your ITC Telecoms Quote — ${order.quote_reference}`,
      html,
    })

    if (error) throw error

    // Update quote_sent_at in Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders').update({ quote_sent_at: new Date().toISOString() }).eq('id', orderId)
    }

    return NextResponse.json({ success: true, sent: true, emailId: data?.id })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
