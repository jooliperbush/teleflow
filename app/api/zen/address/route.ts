import { NextRequest, NextResponse } from 'next/server'

const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)

// Mock addresses for testing without credentials
function mockAddresses(postcode: string) {
  return [
    { goldAddressKey: 'MOCK001', districtCode: 'BD1', premises: '1', thoroughfare: 'Example Street', postTown: 'Bradford', postCode: postcode, displayAddress: `1 Example Street, Bradford, ${postcode}` },
    { goldAddressKey: 'MOCK002', districtCode: 'BD1', premises: '2', thoroughfare: 'Example Street', postTown: 'Bradford', postCode: postcode, displayAddress: `2 Example Street, Bradford, ${postcode}` },
    { goldAddressKey: 'MOCK003', districtCode: 'BD1', premises: '3', thoroughfare: 'Example Street', postTown: 'Bradford', postCode: postcode, displayAddress: `3 Example Street, Bradford, ${postcode}` },
  ]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postcode = searchParams.get('postcode')

  if (!postcode) return NextResponse.json({ error: 'postcode required' }, { status: 400 })

  if (!ZEN_CONFIGURED) {
    await new Promise(r => setTimeout(r, 400))
    return NextResponse.json({ addresses: mockAddresses(postcode), source: 'mock' })
  }

  try {
    const { searchAddresses } = await import('@/lib/zen')
    const addresses = await searchAddresses(postcode)
    return NextResponse.json({ addresses, source: 'zen' })
  } catch (err) {
    console.error('Zen address search error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
