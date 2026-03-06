import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Clear Supabase session cookies
  res.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
  res.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })
  return res
}
