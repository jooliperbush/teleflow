/**
 * Zen Order & Appointment Functions
 * Builds on lib/zen.ts for token management
 */
import { zenGet, zenPost } from './zen'

// ── Ethernet / Lease Line Quotes ──────────────────────────────────────────────

export interface EthernetQuoteRequest {
  postCode: string
  term: number
  bandwidth: number
}

export interface EthernetPrice {
  term: number
  bandwidth: number
  monthlyPrice: number
  setupFee: number
  currency: string
}

export async function getEthernetQuotes(req: EthernetQuoteRequest): Promise<EthernetPrice[]> {
  const data = await zenPost<{ prices?: EthernetPrice[]; quotes?: EthernetPrice[] }>(
    '/api/quotes/ethernet', 'indirect-quote', req
  )
  return data.prices || data.quotes || []
}

// ── Number Port Availability ──────────────────────────────────────────────────

export async function checkNumberPortability(phoneNumbers: string[]): Promise<{ reference: string }> {
  return zenPost('/api/numberPort/availability', 'indirect-availability', { phoneNumbers })
}

export async function getNumberPortResult(reference: string) {
  return zenGet(`/api/numberPort/availability/${reference}`, 'indirect-availability')
}

// ── Appointments ──────────────────────────────────────────────────────────────

export interface AppointmentSlot {
  id?: string
  date: string
  startTime: string
  endTime: string
  type: string
}

export async function getAvailableAppointments(availabilityReference: string): Promise<AppointmentSlot[]> {
  const data = await zenGet<{ slots?: AppointmentSlot[] }>(
    '/api/appointments', 'indirect-availability', { availabilityReference }
  )
  return data.slots || (data as unknown as AppointmentSlot[]) || []
}

// ── Place Order ───────────────────────────────────────────────────────────────

export interface ZenOrderRequest {
  availabilityReference: string
  productCode: string
  term: number
  goldAddressKey: string
  districtCode: string
  contactName: string
  contactEmail: string
  contactPhone: string
  customerReference: string
  appointment?: { date: string; startTime: string; endTime: string; type: string }
  numberPortReference?: string
  numberPortNumbers?: string[]
}

export interface ZenOrderResponse {
  zenReference: string
  orderReference?: string
  status: string
  estimatedCompletionDate?: string
}

export async function placeZenOrder(req: ZenOrderRequest): Promise<ZenOrderResponse> {
  const nameParts = req.contactName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const body: Record<string, unknown> = {
    availabilityReference: req.availabilityReference,
    installationDetails: { goldAddressKey: req.goldAddressKey, districtCode: req.districtCode },
    endUserContact: {
      firstName,
      lastName,
      emailAddress: req.contactEmail,
      telephoneNumber: req.contactPhone,
    },
    options: [{ productCode: req.productCode, term: req.term }],
    customerReference: req.customerReference,
  }

  if (req.appointment) {
    body.appointmentRequest = req.appointment
  }
  if (req.numberPortReference) {
    body.numberPortDetails = {
      portReference: req.numberPortReference,
      phoneNumbers: req.numberPortNumbers || [],
    }
  }

  return zenPost('/api/order', 'indirect-placeorder', body)
}

// ── Services ─────────────────────────────────────────────────────────────────

export interface ZenService {
  zenReference: string
  status: string
  productType: string
  customerReference?: string
  installationAddress?: { addressLine1?: string; postCode?: string }
  startDate?: string
  broadbandType?: string
}

export async function getServices(searchTerm?: string): Promise<ZenService[]> {
  const data = await zenGet<{ services?: ZenService[] }>(
    '/api/services/search', 'indirect-service',
    searchTerm ? { searchTerm } : {}
  )
  return data.services || []
}

export async function getService(zenReference: string): Promise<ZenService> {
  return zenGet(`/api/service/${zenReference}`, 'indirect-service')
}

export async function getOrderStatus(zenReference: string) {
  return zenGet('/api/orders/status', 'indirect-order', { zenReference })
}

export async function getOFCOMRid() {
  return zenGet('/api/networkmanagement/rids/default', 'indirect-order')
}
