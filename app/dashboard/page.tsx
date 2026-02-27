'use client'
import { useState, useEffect } from 'react'

const NAVY = '#1B2A6B'

interface Service {
  zenReference: string
  status: string
  productType: string
  broadbandType?: string
  customerReference?: string
  installationAddress?: { addressLine1?: string; postCode?: string }
  startDate?: string
}

interface Outage {
  reference?: string
  description?: string
  status?: string
  affectedAreas?: string[]
  startTime?: string
}

interface PlannedWork {
  reference?: string
  description?: string
  plannedStartDate?: string
  plannedEndDate?: string
  affectedAreas?: string[]
}

const STATUS_COLORS: Record<string, string> = {
  Active: '#10B981', Provisioning: '#F59E0B', Ceased: '#6B7280', Failed: '#EF4444',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || '#6B7280'
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: color + '20', color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color: color || NAVY }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [services, setServices] = useState<Service[]>([])
  const [outages, setOutages] = useState<Outage[]>([])
  const [planned, setPlanned] = useState<PlannedWork[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'services' | 'outages' | 'planned'>('services')

  useEffect(() => {
    Promise.all([
      fetch('/api/zen/services').then(r => r.json()),
      fetch('/api/zen/outages').then(r => r.json()),
    ]).then(([s, o]) => {
      setServices(s.services || [])
      setOutages(o.outages || [])
      setPlanned(o.planned || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = services.filter(s =>
    !search || [s.zenReference, s.customerReference, s.installationAddress?.postCode, s.productType]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const activeCount = services.filter(s => s.status === 'Active').length
  const productBreakdown = services.reduce((acc, s) => {
    const t = s.broadbandType || s.productType || 'Other'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg text-white text-sm font-bold" style={{ background: NAVY }}>ITC</div>
            <div>
              <h1 className="font-bold text-gray-900">Service Dashboard</h1>
              <p className="text-xs text-gray-400">Zen Network Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {outages.length > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-medium animate-pulse">
                ⚠ {outages.length} active outage{outages.length > 1 ? 's' : ''}
              </span>
            )}
            <a href="/order" className="text-sm px-4 py-2 rounded-lg text-white font-medium" style={{ background: NAVY }}>
              + New Order
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Services" value={services.length} sub="across all customers" />
          <StatCard label="Active" value={activeCount} color="#10B981" sub={`${services.length ? Math.round(activeCount / services.length * 100) : 0}% uptime`} />
          <StatCard label="Active Outages" value={outages.length} color={outages.length > 0 ? '#EF4444' : '#10B981'} sub={outages.length === 0 ? 'All clear' : 'Affecting services'} />
          <StatCard label="Planned Work" value={planned.length} color="#F59E0B" sub="in next 12 months" />
        </div>

        {/* Product breakdown */}
        {Object.keys(productBreakdown).length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {Object.entries(productBreakdown).map(([type, count]) => (
              <div key={type} className="bg-white border rounded-lg px-4 py-2 text-sm flex items-center gap-2 shadow-sm">
                <span className="font-semibold" style={{ color: NAVY }}>{count}</span>
                <span className="text-gray-500">{type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white border rounded-xl p-1 w-fit shadow-sm">
          {([
            ['services', `Services (${services.length})`],
            ['outages', `Outages (${outages.length})`],
            ['planned', `Planned Work (${planned.length})`],
          ] as [string, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key as typeof tab)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={tab === key ? { background: NAVY, color: 'white' } : { color: '#6B7280' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Services tab */}
        {tab === 'services' && (
          <>
            <div className="mb-4">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by reference, postcode, product..."
                className="w-full max-w-md border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': NAVY } as React.CSSProperties} />
            </div>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: NAVY }} />
                <p className="text-gray-400 text-sm mt-3">Loading services from Zen...</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: NAVY, color: 'white' }}>
                      <th className="px-4 py-3 text-left font-medium">Zen Ref</th>
                      <th className="px-4 py-3 text-left font-medium">Customer Ref</th>
                      <th className="px-4 py-3 text-left font-medium">Address</th>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No services found</td></tr>
                    ) : filtered.map((s, i) => (
                      <tr key={s.zenReference} className={`border-t ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
                        <td className="px-4 py-3 font-mono font-medium text-xs" style={{ color: NAVY }}>{s.zenReference}</td>
                        <td className="px-4 py-3 text-gray-600">{s.customerReference || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {s.installationAddress?.addressLine1 || '—'}
                          {s.installationAddress?.postCode && <span className="ml-1 text-xs text-gray-400">{s.installationAddress.postCode}</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: '#f0f4ff', color: NAVY }}>
                            {s.broadbandType || s.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <a href={`/dashboard/service/${s.zenReference}`}
                              className="text-xs px-2 py-1 rounded border font-medium hover:bg-gray-50" style={{ color: NAVY, borderColor: NAVY }}>
                              View
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Outages tab */}
        {tab === 'outages' && (
          <div className="space-y-3">
            {outages.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium text-gray-700">No active outages</p>
                <p className="text-sm text-gray-400 mt-1">All Zen services are operating normally</p>
              </div>
            ) : outages.map((o, i) => (
              <div key={i} className="bg-white rounded-xl border border-red-200 p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-red-700">⚠ {o.description || 'Service Outage'}</p>
                    <p className="text-xs text-gray-400 mt-1">Ref: {o.reference} · Started: {o.startTime ? new Date(o.startTime).toLocaleString('en-GB') : '—'}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">{o.status || 'Active'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Planned work tab */}
        {tab === 'planned' && (
          <div className="space-y-3">
            {planned.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center shadow-sm">
                <div className="text-4xl mb-3">📅</div>
                <p className="font-medium text-gray-700">No planned engineering work</p>
                <p className="text-sm text-gray-400 mt-1">No maintenance scheduled in the next 12 months</p>
              </div>
            ) : planned.map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
                <p className="font-medium text-amber-800">🔧 {p.description || 'Planned Maintenance'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Ref: {p.reference} ·
                  {p.plannedStartDate && ` Starts: ${new Date(p.plannedStartDate).toLocaleDateString('en-GB')}`}
                  {p.plannedEndDate && ` · Ends: ${new Date(p.plannedEndDate).toLocaleDateString('en-GB')}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
