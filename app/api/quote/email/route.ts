import { NextRequest, NextResponse } from 'next/server'
import { generateQuotePDF, type QuotePDFData } from '@/lib/quote-pdf'

export async function POST(req: NextRequest) {
  const { orderId, order, signed = false } = await req.json()

  if (!orderId || !order) {
    return NextResponse.json({ error: 'orderId and order required' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY
  const isSigned = signed && order.signed_name && order.signed_at

  // Build PDF data
  const pdfData: QuotePDFData = {
    quoteReference: order.quote_reference || order.quoteReference,
    quoteDate: new Date().toISOString(),
    quoteTerm: order.quote_term_months || order.quoteTerm || 24,
    companyName: order.company_name || order.companyName,
    companyNumber: order.company_number || order.companyNumber,
    companyReference: order.company_reference || order.companyReference,
    registeredAddress: order.registered_address || order.registeredAddress,
    contactName: order.contact_name || order.contactName,
    contactEmail: order.contact_email || order.contactEmail,
    contactPhone: order.contact_phone || order.contactPhone,
    sitePostcode: order.site_postcode || order.sitePostcode,
    selectedProducts: order.selected_products || order.selectedProducts || [],
    monthlyTotal: order.monthly_total || order.monthlyTotal || 0,
    annualTotal: order.annual_total || order.annualTotal || 0,
    // Signature fields (only for signed copy)
    signedName: isSigned ? (order.signed_name || order.signedName) : undefined,
    signedAt: isSigned ? (order.signed_at || order.signedAt) : undefined,
    signedIp: isSigned ? (order.signed_ip || order.signedIp) : undefined,
  }

  // Generate PDF
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generateQuotePDF(pdfData)
  } catch (err) {
    console.error('PDF generation error:', err)
  }

  const quoteRef = pdfData.quoteReference
  const toEmail = pdfData.contactEmail
  const subject = isSigned
    ? `Your Signed Agreement — ${quoteRef}`
    : `Your ITC Telecoms Quote — ${quoteRef}`

  const htmlBody = isSigned
    ? `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1B2A6B;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">ITC Telecoms</h1>
    <p style="color:#a0b4e8;margin:4px 0 0;font-size:13px">Signed Agreement — ${quoteRef}</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p>Dear ${pdfData.contactName},</p>
    <p>Thank you for signing your service agreement with ITC Telecoms. Please find your signed copy attached.</p>
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:16px;margin:16px 0">
      <strong>✓ Agreement confirmed</strong><br>
      <span style="font-size:13px;color:#555">
        Signed by: ${pdfData.signedName}<br>
        Date: ${new Date(pdfData.signedAt!).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}<br>
        Monthly amount: £${pdfData.monthlyTotal.toFixed(2)}<br>
        Contract term: ${pdfData.quoteTerm} months
      </span>
    </div>
    <p style="font-size:13px;color:#555">Your account manager will be in touch within 24 hours to confirm next steps. If you have any questions, please call us on <strong>01274 000000</strong>.</p>
    <p style="font-size:11px;color:#999;margin-top:24px;border-top:1px solid #eee;padding-top:12px">
      This signature was captured electronically in accordance with the Electronic Communications Act 2000.
      ITC Telecoms Ltd · Simplifying Telecoms
    </p>
  </div>
</div>`
    : `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <div style="background:#1B2A6B;padding:24px;border-radius:8px 8px 0 0">
    <h1 style="color:white;margin:0;font-size:20px">ITC Telecoms</h1>
    <p style="color:#a0b4e8;margin:4px 0 0;font-size:13px">Quote — ${quoteRef}</p>
  </div>
  <div style="border:1px solid #e0e0e0;border-top:none;padding:24px;border-radius:0 0 8px 8px">
    <p>Dear ${pdfData.contactName},</p>
    <p>Thank you for your interest in ITC Telecoms. Please find your quote attached as a PDF.</p>
    <div style="background:#f5f7fb;border-radius:6px;padding:16px;margin:16px 0;text-align:center">
      <strong style="font-size:22px;color:#1B2A6B">£${pdfData.monthlyTotal.toFixed(2)}/month</strong><br>
      <span style="font-size:13px;color:#555">${pdfData.quoteTerm} month contract · Ref: ${quoteRef}</span>
    </div>
    <p style="font-size:13px;color:#555">This quote is valid for 30 days. To proceed, please sign the agreement in the portal or call us on <strong>01274 000000</strong>.</p>
  </div>
</div>`

  if (!resendKey) {
    console.log('[EMAIL] No Resend key. Would send to:', toEmail, '| Subject:', subject)
    return NextResponse.json({ success: true, sent: false, reason: 'No RESEND_API_KEY' })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const attachments = pdfBuffer
      ? [{
          filename: isSigned
            ? `ITC-Telecoms-Signed-Agreement-${quoteRef}.pdf`
            : `ITC-Telecoms-Quote-${quoteRef}.pdf`,
          content: pdfBuffer.toString('base64'),
        }]
      : []

    const { data, error } = await resend.emails.send({
      from: 'ITC Telecoms <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      html: htmlBody,
      attachments,
    })

    if (error) throw error

    // Update Supabase if available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders')
        .update({ quote_sent_at: new Date().toISOString() })
        .eq('id', orderId)
    }

    return NextResponse.json({ success: true, sent: true, emailId: data?.id, hasPdf: !!pdfBuffer })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
