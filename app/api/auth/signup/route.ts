import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: NextRequest) {
  const { email, name, password, quoteRef, quoteSnapshot } = await req.json()

  if (!email || !password || !quoteRef) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json({ error: 'Account system not yet configured. Please contact ITC to save your quote.' }, { status: 503 })
  }

  try {
    const { getServiceClient } = await import('@/lib/supabase')
    const supabase = getServiceClient()

    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    })

    if (authError) {
      // If user already exists, just save the quote under their account
      if (!authError.message.includes('already')) {
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }
    }

    const userId = authData?.user?.id

    // Save quote
    await supabase.from('quotes').insert({
      user_id: userId,
      email,
      quote_ref: quoteRef,
      snapshot: quoteSnapshot,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Signup error:', e)
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 })
  }
}
