import { NextRequest, NextResponse } from 'next/server'

// MOCK ConnectWise sync — real API structure, swap credentials when ready
// Docs: https://developer.connectwise.com/Products/ConnectWise_PSA/REST

interface CWCompany {
  identifier: string
  name: string
  addressLine1?: string
  city?: string
  zip?: string
  country?: { id: number }
}

async function cwRequest(path: string, method: string, body?: object) {
  // TODO: replace with real CW credentials
  const company = process.env.CONNECTWISE_COMPANY
  const pubKey = process.env.CONNECTWISE_PUBLIC_KEY
  const privKey = process.env.CONNECTWISE_PRIVATE_KEY
  const clientId = process.env.CONNECTWISE_CLIENT_ID

  if (!company || !pubKey || !privKey || !clientId) {
    // Mock response
    console.log(`[CW MOCK] ${method} /v4_6_release/apis/3.0${path}`, body)
    return { id: Math.floor(Math.random() * 90000) + 10000 }
  }

  const auth = Buffer.from(`${company}+${pubKey}:${privKey}`).toString('base64')
  const res = await fetch(`https://na.myconnectwise.net/v4_6_release/apis/3.0${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
      clientId: clientId,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  const { orderId, order } = await req.json()

  if (!orderId) {
    return NextResponse.json({ error: 'orderId required' }, { status: 400 })
  }

  try {
    // 1. Create company
    const cwCompany = await cwRequest('/company/companies', 'POST', {
      identifier: order.company_reference || `CUS${Date.now()}`,
      name: order.company_name,
      addressLine1: order.registered_address?.address_line_1,
      city: order.registered_address?.locality,
      zip: order.registered_address?.postal_code,
      country: { id: 1 }, // UK
      status: { id: 1 },
      types: [{ id: 1 }],
    } as CWCompany)

    // 2. Create contact
    const cwContact = await cwRequest('/company/contacts', 'POST', {
      firstName: (order.contact_name || '').split(' ')[0],
      lastName: (order.contact_name || '').split(' ').slice(1).join(' ') || '-',
      company: { id: cwCompany.id },
      communicationItems: [
        { type: { id: 1 }, value: order.contact_email, defaultFlag: true },
        { type: { id: 2 }, value: order.contact_phone },
      ],
    })

    // 3. Create opportunity
    const cwOpportunity = await cwRequest('/sales/opportunities', 'POST', {
      name: `${order.company_name} — ${order.quote_reference}`,
      company: { id: cwCompany.id },
      contact: { id: cwContact.id },
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: { name: 'Won' },
    })

    // 4. Create provision ticket
    const productSummary = (order.selected_products || [])
      .map((p: { name: string; quantity: number; monthlyTotal: number }) =>
        `• ${p.name} x${p.quantity} — £${p.monthlyTotal.toFixed(2)}/mo`)
      .join('\n')

    const cwTicket = await cwRequest('/service/tickets', 'POST', {
      summary: `New Order: ${order.company_name} — ${order.quote_reference}`,
      board: { name: 'Admin Provision' },
      company: { id: cwCompany.id },
      contact: { id: cwContact.id },
      opportunity: { id: cwOpportunity.id },
      initialDescription: `
Customer: ${order.company_name} (${order.company_number})
Contact: ${order.contact_name} — ${order.contact_email} — ${order.contact_phone}
Site Postcode: ${order.site_postcode}
Quote Ref: ${order.quote_reference}
Contract: ${order.quote_term_months} months
Monthly Total: £${order.monthly_total?.toFixed(2)}

Products:
${productSummary}

Direct Debit: ${order.dd_account_holder} — **** **** ${order.dd_account_number_last4}
Signed by: ${order.signed_name} at ${order.signed_at}
${order.requires_callback ? '\n⚠️ CALLBACK REQUIRED — Lease line order, call customer to confirm managed fibre pricing.' : ''}
      `.trim(),
      statusName: 'New',
      priorityName: order.requires_callback ? 'High' : 'Medium',
    })

    // Persist sync result
    const syncedAt = new Date().toISOString()
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders').update({
        cw_synced: true,
        cw_synced_at: syncedAt,
        cw_company_id: String(cwCompany.id),
        cw_ticket_id: String(cwTicket.id),
        updated_at: syncedAt,
      }).eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      cwCompanyId: cwCompany.id,
      cwContactId: cwContact.id,
      cwOpportunityId: cwOpportunity.id,
      cwTicketId: cwTicket.id,
    })
  } catch (err) {
    console.error('ConnectWise sync error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
