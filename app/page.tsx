import Link from 'next/link'

const NAVY = '#1B2A6B'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div
          className="inline-block px-5 py-2 rounded-full text-white text-sm font-bold mb-6"
          style={{ background: NAVY }}
        >
          ITC Telecoms
        </div>

        <h1 className="text-3xl font-bold mb-3" style={{ color: NAVY }}>
          TeleFlow
        </h1>
        <p className="text-gray-500 mb-8">
          Customer onboarding portal — company verification, live pricing, e-signature and direct debit in one seamless flow.
        </p>

        <Link
          href="/order"
          className="inline-block px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-sm hover:opacity-90 transition-opacity"
          style={{ background: NAVY }}
        >
          Start New Order →
        </Link>

        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🏢', label: 'Companies House verified' },
            { icon: '⚡', label: 'Live Zen availability' },
            { icon: '✍️', label: 'E-sign & Direct Debit' },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
