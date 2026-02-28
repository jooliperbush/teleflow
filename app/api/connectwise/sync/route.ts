export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

const CW_SITE    = process.env.CONNECTWISE_SITE    || 'eu.myconnectwise.net'
const CW_COMPANY = process.env.CONNECTWISE_COMPANY_ID || 'itc'
const CW_PUB     = process.env.CONNECTWISE_PUBLIC_KEY
const CW_PRIV    = process.env.CONNECTWISE_PRIVATE_KEY
const CW_CLIENT  = process.env.CONNECTWISE_CLIENT_ID

const CW_CONFIGURED = !!(CW_PUB && CW_PRIV && CW_CLIENT)
const BASE = `https://${CW_SITE}/v4_6_release/apis/3.0`

function cwHeaders() {
  const token = Buffer.from(`${CW_COMPANY}+${CW_PUB}:${CW_PRIV}`).toString('base64')
  return {
    'Authorization': `Basic ${token}`,
    'clientId': CW_CLIENT!,
    'Content-Type': 'application/json',
  }
}

async function cw(method: string, path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: cwHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`CW ${method} ${path} → ${res.status}: ${err}`)
  }
  return res.status === 204 ? null : res.json()
}

export async function POST(req: NextRequest) {
  const order = await req.json()

  if (!CW_CONFIGURED) {
    return NextResponse.json({ success: false, reason: 'ConnectWise not configured' })
  }

  try {
    // 1. Find or create company
    const existingCompanies = await cw('GET', `/company/companies?conditions=name="${encodeURIComponent(order.companyName)}"&pageSize=1`)
    let companyId: number

    if (existingCompanies?.length > 0) {
      companyId = existingCompanies[0].id
    } else {
      const company = await cw('POST', '/company/companies', {
        name: order.companyName,
        identifier: (order.companyReference || order.companyNumber || order.companyName || 'UNKNOWN').replace(/[^a-zA-Z0-9]/g,'').slice(0, 8).toUpperCase(),
        status: { name: 'Active' },
        types: [{ id: 1, name: 'Client' }],
        site: { name: 'Main' },
        addressLine1: order.registeredAddress?.address_line_1 || '',
        city: order.registeredAddress?.locality || '',
        zip: order.sitePostcode || '',
        country: { name: 'United Kingdom' },
      })
      companyId = company.id
    }

    // 2. Create contact (always create — CW email search unreliable via conditions)
    let contactId: number
    try {
      const [firstName, ...rest] = (order.contactName || 'Contact').split(' ')
      const contact = await cw('POST', '/company/contacts', {
        firstName,
        lastName: rest.join(' ') || '-',
        company: { id: companyId },
        communicationItems: [
          { type: { name: 'Email' }, value: order.contactEmail, defaultFlag: true },
          ...(order.contactPhone ? [{ type: { name: 'Direct' }, value: order.contactPhone }] : []),
        ],
      })
      contactId = contact.id
    } catch {
      // Fallback: use first contact under this company
      const contacts = await cw('GET', `/company/contacts?conditions=company/id=${companyId}&pageSize=1`)
      contactId = contacts?.[0]?.id || companyId
    }

    // 3. Create opportunity
    const productSummary = (order.selectedProducts || [])
      .map((p: { name: string; quantity: number }) => `${p.name} ×${p.quantity}`)
      .join(', ')

    const opportunity = await cw('POST', '/sales/opportunities', {
      name: `${order.companyName} — TeleFlow Onboarding`,
      stage: { id: 5 },
      status: { id: 9 },
      company: { id: companyId },
      contact: { id: contactId },
      primarySalesRep: { id: 154 },
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', 'T').split('.')[0] + 'Z',
    })

    // 4. Create provisioning service ticket
    const ticket = await cw('POST', '/service/tickets', {
      summary: `Provision: ${order.companyName} — ${productSummary}`,
      company: { id: companyId },
      contact: { id: contactId },
      status: { name: 'New' },
      priority: { name: 'Priority 2 - High' },
      serviceLocation: { name: 'Remote' },
      initialDescription: `New customer onboarding via TeleFlow.\n\nRef: ${order.quoteReference}\nSite postcode: ${order.sitePostcode}\nProducts: ${productSummary}\nTerm: ${order.quoteTerm} months\nMonthly: £${order.monthlyTotal?.toFixed(2)}\nSigned by: ${order.signedName}\nDD: ${order.ddAccountHolder} ****${order.ddAccountNumberLast4}${order.appointment ? `\nInstallation: ${order.appointment.date} ${order.appointment.type}` : ''}`,
    })

    return NextResponse.json({
      success: true,
      companyId,
      contactId,
      opportunityId: opportunity?.id,
      ticketId: ticket?.id,
    })
  } catch (err) {
    console.error('ConnectWise sync error:', err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
