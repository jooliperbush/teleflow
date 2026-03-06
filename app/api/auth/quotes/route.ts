import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req: NextRequest) {
  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json({ error: 'Account system not yet configured.' }, { status: 503 })
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization') || '' },
        },
      }
    )

    // Read session from cookie
    const cookieHeader = req.headers.get('cookie') || ''
    const token = cookieHeader.match(/sb-access-token=([^;]+)/)?.[1]
    if (!token) return NextResponse.json({ error: 'Not logged in.' }, { status: 401 })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 })

    const { getServiceClient } = await import('@/lib/supabase')
    const admin = getServiceClient()
    const { data: quotes } = await admin
      .from('quotes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ quotes: quotes || [], email: user.email })
  } catch (e) {
    console.error('Quotes fetch error:', e)
    return NextResponse.json({ error: 'Failed to load quotes.' }, { status: 500 })
  }
}
