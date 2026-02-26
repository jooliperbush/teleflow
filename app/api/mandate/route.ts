import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { orderId, accountHolder, sortCode, accountNumber } = await req.json()

  if (!orderId || !accountHolder || !sortCode || !accountNumber) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  // Validate sort code (XX-XX-XX or XXXXXX)
  const sortCodeClean = sortCode.replace(/-/g, '')
  if (!/^\d{6}$/.test(sortCodeClean)) {
    return NextResponse.json({ error: 'Invalid sort code' }, { status: 400 })
  }

  // Validate account number
  if (!/^\d{8}$/.test(accountNumber.replace(/\s/g, ''))) {
    return NextResponse.json({ error: 'Account number must be 8 digits' }, { status: 400 })
  }

  const confirmedAt = new Date().toISOString()
  const last4 = accountNumber.slice(-4)

  // TODO: Replace with real GoCardless mandate creation when token available
  // const gocardless = new GoCardlessClient(process.env.GOCARDLESS_ACCESS_TOKEN, process.env.GOCARDLESS_ENVIRONMENT)
  // const mandate = await gocardless.mandates.create({ ... })

  const mandateRecord = {
    dd_account_holder: accountHolder,
    dd_sort_code: sortCodeClean.replace(/(\d{2})(\d{2})(\d{2})/, '$1-$2-$3'),
    dd_account_number_last4: last4,
    dd_confirmed: true,
    dd_confirmed_at: confirmedAt,
    status: 'active',
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { getServiceClient } = await import('@/lib/supabase')
      const db = getServiceClient()
      await db.from('orders').update({ ...mandateRecord, updated_at: confirmedAt }).eq('id', orderId)
    } catch (err) {
      console.error('Mandate persist error:', err)
    }
  }

  return NextResponse.json({ success: true, confirmedAt, last4 })
}
