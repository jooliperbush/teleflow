/**
 * Zen Internet Indirect Self-Service API
 * OAuth2 Client Credentials + API wrapper
 * Base: https://gateway.api.indirect.zen.co.uk/self-service
 * Token: https://id.zen.co.uk/connect/token
 */

const TOKEN_URL = 'https://id.zen.co.uk/connect/token'
const API_BASE = 'https://gateway.api.indirect.zen.co.uk/self-service'

// ── Token cache (module-level, persists across requests in same process) ──────
let cachedToken: { value: string; expiresAt: number } | null = null

export async function getZenToken(scope: string): Promise<string> {
  const clientId = process.env.ZEN_CLIENT_ID
  const clientSecret = process.env.ZEN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('ZEN_CLIENT_ID and ZEN_CLIENT_SECRET not configured')
  }

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(scope)}`,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zen token request failed: ${res.status} ${err}`)
  }

  const data = await res.json()
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.value
}

export async function zenGet<T>(path: string, scope: string, params?: Record<string, string>): Promise<T> {
  const token = await getZenToken(scope)
  const url = new URL(`${API_BASE}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zen API GET ${path} failed: ${res.status} ${err}`)
  }

  return res.json()
}

export async function zenPost<T>(path: string, scope: string, body: object): Promise<T> {
  const token = await getZenToken(scope)

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zen API POST ${path} failed: ${res.status} ${err}`)
  }

  return res.json()
}

// ── Address Search ────────────────────────────────────────────────────────────

export interface ZenAddress {
  goldAddressKey: string  // addressReferenceNumber
  districtCode: string
  uprn?: string           // used for availability check
  subPremises?: string
  premises: string
  thoroughfare?: string
  locality?: string
  postTown: string
  county?: string
  postCode: string
  displayAddress: string
}

export async function searchAddresses(postcode: string): Promise<ZenAddress[]> {
  // Zen returns a flat array, not { addresses: [] }
  const data = await zenGet<RawZenItem[]>(
    '/api/address/search',
    'indirect-availability',
    { postCode: postcode.replace(/\s/g, '').toUpperCase() }
  )

  const items = Array.isArray(data) ? data : (data as unknown as { addresses?: RawZenItem[] }).addresses || []
  return items.map(normaliseAddress).filter(a => a.goldAddressKey)
}

interface RawZenItem {
  address?: {
    organisationName?: string
    subPremises?: string
    premisesName?: string
    thoroughfareNumber?: string
    thoroughfareName?: string
    locality?: string
    postTown?: string
    postCode?: string
  }
  addressReference?: {
    addressReferenceNumber?: string
    districtCode?: string
    qualifier?: string
  }
}

function normaliseAddress(a: RawZenItem): ZenAddress {
  const addr = a.address || {}
  const ref = a.addressReference || {}
  const parts = [
    addr.organisationName,
    addr.subPremises,
    addr.premisesName,
    addr.thoroughfareNumber ? `${addr.thoroughfareNumber} ${addr.thoroughfareName || ''}`.trim() : addr.thoroughfareName,
    addr.locality,
    addr.postTown,
    addr.postCode,
  ].filter(Boolean)
  return {
    goldAddressKey: ref.addressReferenceNumber || '',
    districtCode: ref.districtCode || '',
    uprn: (a as Record<string, Record<string, string>>).addressReference?.uprn || undefined,
    subPremises: addr.subPremises,
    premises: addr.premisesName || '',
    thoroughfare: addr.thoroughfareName,
    locality: addr.locality,
    postTown: addr.postTown || '',
    postCode: addr.postCode || '',
    displayAddress: parts.join(', '),
  }
}

// ── Availability Check ────────────────────────────────────────────────────────

export interface ZenProduct {
  type: 'fttp' | 'fttc' | 'sogea' | 'gfast' | 'adsl' | 'ethernet'
  name: string
  downloadMbps: number
  uploadMbps: number
  monthlyCost: number | null
  setupFee: number | null
  available: boolean
  availabilityRef?: string
}

export interface ZenAvailabilityResult {
  availabilityReference: string
  products: ZenProduct[]
  remainingChecks?: number
  lineDetails?: Record<string, unknown>
}


// ─── Brand name mapping ───────────────────────────────────────────────────────
// Map Zen/supplier product names to ITC's customer-facing brand names
function brandProductName(rawName: string, dl: number, ul: number, type: string): string {
  const n = rawName.toLowerCase()

  // CityFibre → Velocity Fibre
  if (n.includes('cityfibre') || n.includes('city fibre') || type === 'fttp') {
    if (dl >= 2000) return `Velocity Fibre 2000`
    if (dl >= 1000) return `Velocity Fibre 1000`
    if (dl >= 900)  return `Velocity Fibre 900`
    if (dl >= 500)  return `Velocity Fibre 500`
    if (dl >= 330)  return `Velocity Fibre 330`
    if (dl >= 200)  return `Velocity Fibre 200`
    if (dl >= 150)  return `Velocity Fibre 150`
    if (dl >= 100)  return `Velocity Fibre 100`
    if (dl >= 50)   return `Velocity Fibre 50`
    return `Velocity Fibre ${dl}`
  }

  // FTTC/VDSL
  if (type === 'fttc' || type === 'sogea' || type === 'gfast') {
    const label = type === 'gfast' ? 'G.fast' : type === 'sogea' ? 'SOGEA' : 'FTTC'
    return `${label} ${dl}/${ul}`
  }

  // ADSL
  if (type === 'adsl') return `ADSL ${dl}/${ul}`

  // Replace CityFibre anywhere in string
  return rawName.replace(/cityfibre/gi, 'Velocity Fibre').replace(/city fibre/gi, 'Velocity Fibre')
}

export async function checkAvailability(
  uprn?: string,
  cli?: string,
  goldAddressKey?: string
): Promise<ZenAvailabilityResult> {
  const body: Record<string, string> = {}
  if (uprn) body.uprn = uprn
  if (goldAddressKey) body.goldAddressKey = goldAddressKey
  if (cli) body.cli = cli

  const data = await zenPost<RawAvailabilityResponse>(
    '/api/availability/check',
    'indirect-availability',
    body
  )

  return parseAvailabilityResponse(data)
}

interface RawAvailabilityResponse {
  availabilityReference?: string
  broadbandGroups?: RawBroadbandGroup[]
  lineDetails?: Record<string, unknown>
  remainingAvailabilityChecks?: { checksRemaining?: number }
  // Alternate flat structure
  fttp?: RawProductDetail
  fttc?: RawProductDetail
  sogea?: RawProductDetail
  gfast?: RawProductDetail
  adsl2Plus?: RawProductDetail
}

interface RawBroadbandGroup {
  accessLine?: Record<string, unknown>
  fttp?: RawProductDetail
  fttc?: RawProductDetail
  sogea?: RawProductDetail
  gfast?: RawProductDetail
  adsl2Plus?: RawProductDetail
  adsl2PlusAnnexM?: RawProductDetail
}

interface RawProductDetail {
  available?: boolean
  downloadSpeed?: number
  uploadSpeed?: number
  maxDownloadSpeed?: number
  maxUploadSpeed?: number
  products?: RawProductOption[]
  productOptions?: RawProductOption[]
}

interface RawProductOption {
  productCode?: string
  name?: string
  downloadSpeed?: number
  uploadSpeed?: number
  monthlyPrice?: number
  monthlyCost?: number
  oneOffPrice?: number
  setupCost?: number
  available?: boolean
}

function extractProducts(
  type: ZenProduct['type'],
  detail: RawProductDetail | undefined,
  availRef: string
): ZenProduct[] {
  if (!detail?.available) return []

  const options = detail.products || detail.productOptions || []
  if (options.length > 0) {
    return options
      .filter(o => o.available !== false)
      .map(o => ({
        type,
        name: o.name || `${type.toUpperCase()} ${o.downloadSpeed || detail.maxDownloadSpeed || 0}/${o.uploadSpeed || detail.maxUploadSpeed || 0}`,
        downloadMbps: o.downloadSpeed || detail.maxDownloadSpeed || 0,
        uploadMbps: o.uploadSpeed || detail.maxUploadSpeed || 0,
        monthlyCost: o.monthlyPrice || o.monthlyCost || null,
        setupFee: o.oneOffPrice || o.setupCost || 0,
        available: true,
        availabilityRef: availRef,
      }))
  }

  // No product options — use top-level speeds
  return [{
    type,
    name: `${type.toUpperCase()} ${detail.maxDownloadSpeed || detail.downloadSpeed || 0}/${detail.maxUploadSpeed || detail.uploadSpeed || 0}`,
    downloadMbps: detail.maxDownloadSpeed || detail.downloadSpeed || 0,
    uploadMbps: detail.maxUploadSpeed || detail.uploadSpeed || 0,
    monthlyCost: null,
    setupFee: 0,
    available: true,
    availabilityRef: availRef,
  }]
}

// Parse speed from product name — handles multiple formats:
// "FTTP 1000/115", "CityFibre Residential 2500", "CityFibre Residential 1200 Symmetric"
function speedFromName(name: string): { dl: number; ul: number } {
  // Format: "X/Y Mbps" or "X/Y"
  const slashMatch = name.match(/(\d+)\/(\d+)/)
  if (slashMatch) return { dl: parseInt(slashMatch[1]), ul: parseInt(slashMatch[2]) }
  // Format: single number e.g. "2500" or "1200 Symmetric" (symmetric = dl=ul)
  const nums = name.match(/\d+/g)?.map(Number) || []
  const big = nums.filter(n => n >= 100) // ignore small numbers like "160" from model names
  if (big.length === 0) return { dl: 0, ul: 0 }
  const largest = Math.max(...big)
  // Symmetric if name contains "symmetric" or "1000"+ and no slash
  const isSymmetric = /symmetric/i.test(name)
  return { dl: largest, ul: isSymmetric ? largest : Math.round(largest * 0.115) }
}

function parseAvailabilityResponse(data: RawAvailabilityResponse): ZenAvailabilityResult {
  const availRef = data.availabilityReference || ''
  const allProducts: ZenProduct[] = []

  // Real Zen structure: broadbandGroups[].{broadbandType, products[].{productCode, productName}}
  const groups = (data as unknown as {
    broadbandGroups?: Array<{
      broadbandType?: string
      products?: Array<{ productCode?: string; productName?: string }>
    }>
  }).broadbandGroups

  if (groups?.length) {
    for (const group of groups) {
      const type = (group.broadbandType || '').toLowerCase() as ZenProduct['type']
      const prods = group.products || []
      for (const p of prods) {
        const code = p.productCode || ''
        const name = p.productName || code
        const speeds = speedFromName(name)
        const dl = speeds.dl
        const ul = speeds.ul
        allProducts.push({
          type: type || 'fttp',
          name: brandProductName(name, dl, ul, type || 'fttp'),
          downloadMbps: dl,
          uploadMbps: ul,
          monthlyCost: null, // pricing via separate endpoint
          setupFee: 0,
          available: true,
          availabilityRef: availRef,
        })
      }
    }
  } else {
    // Fallback to old flat structure
    const groups2 = data.broadbandGroups?.length ? data.broadbandGroups : [data as RawBroadbandGroup]
    for (const group of groups2) {
      allProducts.push(...extractProducts('fttp', group.fttp, availRef))
      allProducts.push(...extractProducts('fttc', group.fttc, availRef))
      allProducts.push(...extractProducts('sogea', group.sogea, availRef))
      allProducts.push(...extractProducts('gfast', group.gfast, availRef))
      allProducts.push(...extractProducts('adsl', group.adsl2Plus || group.adsl2PlusAnnexM, availRef))
    }
  }

  // Sort by download speed descending — best first
  allProducts.sort((a, b) => b.downloadMbps - a.downloadMbps)

  return {
    availabilityReference: availRef,
    products: allProducts,
    remainingChecks: data.remainingAvailabilityChecks?.checksRemaining,
    lineDetails: data.lineDetails,
  }
}
