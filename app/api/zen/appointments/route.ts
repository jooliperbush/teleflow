import { NextRequest, NextResponse } from 'next/server'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
function mockSlots() {
  const slots = []
  const today = new Date()
  for (let i = 3; i <= 14; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const dateStr = d.toISOString().slice(0, 10)
    slots.push({ date: dateStr, startTime: '08:00', endTime: '13:00', type: 'AM' })
    slots.push({ date: dateStr, startTime: '13:00', endTime: '18:00', type: 'PM' })
  }
  return slots.slice(0, 10)
}
export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('availabilityReference')
  if (!ref) return NextResponse.json({ error: 'availabilityReference required' }, { status: 400 })
  if (!ZEN_CONFIGURED) return NextResponse.json({ slots: mockSlots(), source: 'mock' })
  try {
    const { getAvailableAppointments } = await import('@/lib/zen-orders')
    const slots = await getAvailableAppointments(ref)
    return NextResponse.json({ slots, source: 'zen' })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
