import { NextRequest, NextResponse } from 'next/server'
const ZEN_CONFIGURED = !!(process.env.ZEN_CLIENT_ID && process.env.ZEN_CLIENT_SECRET)
export async function GET(req: NextRequest) {
  const searchTerm = new URL(req.url).searchParams.get('q') || undefined
  if (!ZEN_CONFIGURED) {
    return NextResponse.json({ services: [
      { zenReference: 'ZW12345', status: 'Active', productType: 'FTTP', customerReference: 'PRO15032019', installationAddress: { addressLine1: '1 Example St', postCode: 'BD1 1AA' }, startDate: '2024-01-15', broadbandType: 'FTTP' },
      { zenReference: 'ZW23456', status: 'Active', productType: 'FTTC', customerReference: 'ACM22042020', installationAddress: { addressLine1: '5 High Street', postCode: 'BD2 1BB' }, startDate: '2024-03-01', broadbandType: 'FTTC' },
      { zenReference: 'ZW34567', status: 'Active', productType: 'SOGEA', customerReference: 'TEC10102023', installationAddress: { addressLine1: '10 Mill Lane', postCode: 'BD3 1CC' }, startDate: '2024-06-20', broadbandType: 'SOGEA' },
    ], source: 'mock' })
  }
  try {
    const { getServices } = await import('@/lib/zen-orders')
    const services = await getServices(searchTerm)
    return NextResponse.json({ services, source: 'zen' })
  } catch (err) { return NextResponse.json({ error: String(err) }, { status: 500 }) }
}
