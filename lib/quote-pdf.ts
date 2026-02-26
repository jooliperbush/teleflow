import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'

const NAVY = '#1B2A6B'
const LIGHT = '#F0F4FF'
const GREY = '#6B7280'
const BORDER = '#E5E7EB'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
  },
  brandName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
  },
  brandTagline: {
    fontSize: 8,
    color: GREY,
    marginTop: 2,
  },
  quoteLabel: {
    fontSize: 8,
    color: GREY,
    textAlign: 'right',
  },
  quoteRef: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'right',
    marginTop: 2,
  },
  // Two-column info section
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 4,
    padding: 10,
  },
  infoBoxTitle: {
    fontSize: 7,
    color: GREY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
  },
  infoLine: {
    fontSize: 8.5,
    marginBottom: 3,
    color: '#111827',
  },
  infoLineLabel: {
    color: GREY,
  },
  // Table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: NAVY,
    borderRadius: 3,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginBottom: 0,
  },
  tableHeaderText: {
    color: 'white',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 8.5,
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: 'center' },
  colUnit: { flex: 1.5, textAlign: 'right' },
  colTotal: { flex: 1.5, textAlign: 'right' },
  // Totals
  totalsBox: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 8,
    color: GREY,
    width: 100,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 8.5,
    width: 70,
    textAlign: 'right',
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    width: 100,
    textAlign: 'right',
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    width: 70,
    textAlign: 'right',
  },
  // Terms summary
  termsBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },
  termsTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
    color: '#374151',
  },
  termsText: {
    fontSize: 7.5,
    color: GREY,
    lineHeight: 1.5,
  },
  // Signature block
  signatureBlock: {
    marginTop: 24,
    borderTopWidth: 2,
    borderTopColor: NAVY,
    paddingTop: 14,
  },
  signatureTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 10,
  },
  signatureGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  signatureField: {
    flex: 1,
    backgroundColor: LIGHT,
    borderRadius: 4,
    padding: 8,
  },
  signatureFieldLabel: {
    fontSize: 7,
    color: GREY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  signatureFieldValue: {
    fontSize: 9,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  signatureLegal: {
    marginTop: 10,
    fontSize: 7,
    color: GREY,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: GREY,
  },
  // Validity badge
  validityBadge: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  validityPill: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  validityText: {
    fontSize: 7.5,
    color: '#92400E',
    fontFamily: 'Helvetica-Bold',
  },
})

export interface QuotePDFData {
  quoteReference: string
  quoteDate: string
  quoteTerm: number
  companyName: string
  companyNumber: string
  companyReference: string
  registeredAddress?: {
    address_line_1?: string
    locality?: string
    postal_code?: string
  }
  contactName: string
  contactEmail: string
  contactPhone: string
  sitePostcode: string
  selectedProducts: Array<{
    name: string
    quantity: number
    unitMonthly: number
    monthlyTotal: number
    requiresCallback?: boolean
  }>
  monthlyTotal: number
  annualTotal: number
  // Signature (optional — only for signed copy)
  signedName?: string
  signedAt?: string
  signedIp?: string
}

function formatAddress(addr?: { address_line_1?: string; locality?: string; postal_code?: string }): string {
  if (!addr) return '—'
  return [addr.address_line_1, addr.locality, addr.postal_code].filter(Boolean).join(', ')
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return iso }
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC`
  } catch { return iso }
}

export async function generateQuotePDF(data: QuotePDFData): Promise<Buffer> {
  const isSigned = !!(data.signedName && data.signedAt)
  const validUntil = new Date(data.quoteDate)
  validUntil.setDate(validUntil.getDate() + 30)
  const setupTotal = data.selectedProducts.reduce((sum, p) => sum + (p.unitMonthly > 0 ? 0 : 0), 0)

  const doc = createElement(
    Document,
    { title: `Quote ${data.quoteReference} — ${data.companyName}` },
    createElement(
      Page,
      { size: 'A4', style: styles.page },

      // Header
      createElement(View, { style: styles.header },
        createElement(View, null,
          createElement(Text, { style: styles.brandName }, 'ITC Telecoms'),
          createElement(Text, { style: styles.brandTagline }, 'Simplifying Telecoms')
        ),
        createElement(View, null,
          createElement(Text, { style: styles.quoteLabel }, isSigned ? 'SIGNED AGREEMENT' : 'QUOTE'),
          createElement(Text, { style: styles.quoteRef }, data.quoteReference),
          createElement(Text, { style: styles.quoteLabel }, `Issued: ${formatDate(data.quoteDate)}`),
        )
      ),

      // Validity badge
      !isSigned && createElement(View, { style: styles.validityBadge },
        createElement(View, { style: styles.validityPill },
          createElement(Text, { style: styles.validityText }, `Valid until ${formatDate(validUntil.toISOString())}`)
        )
      ),

      // Info boxes
      createElement(View, { style: styles.infoRow },
        // Customer
        createElement(View, { style: styles.infoBox },
          createElement(Text, { style: styles.infoBoxTitle }, 'Customer'),
          createElement(Text, { style: styles.infoLine }, data.companyName),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Company No: '),
            data.companyNumber
          ),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Ref: '),
            data.companyReference
          ),
          createElement(Text, { style: styles.infoLine }, formatAddress(data.registeredAddress)),
        ),
        // Contact & installation
        createElement(View, { style: styles.infoBox },
          createElement(Text, { style: styles.infoBoxTitle }, 'Contact & Installation'),
          createElement(Text, { style: styles.infoLine }, data.contactName),
          createElement(Text, { style: styles.infoLine }, data.contactEmail),
          createElement(Text, { style: styles.infoLine }, data.contactPhone),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Site: '),
            data.sitePostcode
          ),
        ),
        // Contract
        createElement(View, { style: styles.infoBox },
          createElement(Text, { style: styles.infoBoxTitle }, 'Contract'),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Term: '),
            `${data.quoteTerm} months`
          ),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Monthly: '),
            `£${data.monthlyTotal.toFixed(2)}`
          ),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Annual: '),
            `£${data.annualTotal.toFixed(2)}`
          ),
          createElement(Text, { style: styles.infoLine },
            createElement(Text, { style: styles.infoLineLabel }, 'Total contract: '),
            `£${(data.monthlyTotal * data.quoteTerm).toFixed(2)}`
          ),
        )
      ),

      // Table header
      createElement(View, { style: styles.tableHeader },
        createElement(Text, { style: [styles.tableHeaderText, styles.colProduct] }, 'Service'),
        createElement(Text, { style: [styles.tableHeaderText, styles.colQty] }, 'Qty'),
        createElement(Text, { style: [styles.tableHeaderText, styles.colUnit] }, 'Unit/mo'),
        createElement(Text, { style: [styles.tableHeaderText, styles.colTotal] }, 'Total/mo'),
      ),

      // Table rows
      ...data.selectedProducts.map((p, i) =>
        createElement(View, { key: i, style: [styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}] },
          createElement(View, { style: styles.colProduct },
            createElement(Text, { style: styles.tableCell }, p.name),
            p.requiresCallback && createElement(Text, { style: { fontSize: 7, color: '#D97706' } }, 'Callback required for installation')
          ),
          createElement(Text, { style: [styles.tableCell, styles.colQty] }, String(p.quantity)),
          createElement(Text, { style: [styles.tableCell, styles.colUnit] },
            p.unitMonthly ? `£${p.unitMonthly.toFixed(2)}` : 'POA'
          ),
          createElement(Text, { style: [styles.tableCell, styles.colTotal] },
            p.monthlyTotal ? `£${p.monthlyTotal.toFixed(2)}` : 'POA'
          ),
        )
      ),

      // Totals
      createElement(View, { style: styles.totalsBox },
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, 'Monthly recurring'),
          createElement(Text, { style: styles.totalValue }, `£${data.monthlyTotal.toFixed(2)}`),
        ),
        createElement(View, { style: styles.totalRow },
          createElement(Text, { style: styles.totalLabel }, `Annual (${data.quoteTerm} months)`),
          createElement(Text, { style: styles.totalValue }, `£${data.annualTotal.toFixed(2)}`),
        ),
        createElement(View, { style: [styles.totalRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: BORDER }] },
          createElement(Text, { style: styles.grandTotalLabel }, 'Contract total'),
          createElement(Text, { style: styles.grandTotalValue }, `£${(data.monthlyTotal * data.quoteTerm).toFixed(2)}`),
        ),
      ),

      // Terms
      createElement(View, { style: styles.termsBox },
        createElement(Text, { style: styles.termsTitle }, 'Terms & Conditions Summary'),
        createElement(Text, { style: styles.termsText },
          'This quote is valid for 30 days from the date of issue. Services are provided subject to ITC Telecoms standard terms and conditions. Monthly charges are collected by Direct Debit on the 1st of each month. Minimum contract term applies as stated above. Early termination fees equal to the remaining monthly charges in the contract term apply. All prices are exclusive of VAT. ITC Telecoms Ltd is registered in England & Wales.'
        ),
      ),

      // Signature block (only shown when signed)
      isSigned && createElement(View, { style: styles.signatureBlock },
        createElement(Text, { style: styles.signatureTitle }, 'Electronic Signature'),
        createElement(View, { style: styles.signatureGrid },
          createElement(View, { style: styles.signatureField },
            createElement(Text, { style: styles.signatureFieldLabel }, 'Signed by'),
            createElement(Text, { style: styles.signatureFieldValue }, data.signedName!),
          ),
          createElement(View, { style: styles.signatureField },
            createElement(Text, { style: styles.signatureFieldLabel }, 'Date & Time'),
            createElement(Text, { style: styles.signatureFieldValue }, formatDateTime(data.signedAt!)),
          ),
          createElement(View, { style: styles.signatureField },
            createElement(Text, { style: styles.signatureFieldLabel }, 'IP Address'),
            createElement(Text, { style: styles.signatureFieldValue }, data.signedIp || '—'),
          ),
        ),
        createElement(Text, { style: styles.signatureLegal },
          'This document has been signed electronically in accordance with the Electronic Communications Act 2000. The electronic signature above constitutes a legally binding signature and is equivalent to a handwritten signature. This signed copy serves as a legally enforceable agreement between the signatory and ITC Telecoms Ltd.'
        ),
      ),

      // Footer
      createElement(View, { style: styles.footer },
        createElement(Text, { style: styles.footerText }, 'ITC Telecoms Ltd · Simplifying Telecoms'),
        createElement(Text, { style: styles.footerText }, `Ref: ${data.quoteReference}`),
        createElement(Text, { style: styles.footerText }, isSigned ? '✓ SIGNED COPY' : 'This is not a signed document'),
      )
    )
  )

  // Suppress "renderToBuffer" void return warning — it returns Buffer
  const buffer = await renderToBuffer(doc as Parameters<typeof renderToBuffer>[0])
  return buffer as unknown as Buffer
}
