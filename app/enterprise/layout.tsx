import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enterprise Telecoms Solutions UK | Independent Business Communications | ITC',
  description: 'ITC provides enterprise-grade VoIP, connectivity, mobile and PSTN migration for multi-site UK organisations. Independent advice, dedicated account management, and transparent pricing. Get a quote today.',
  keywords: 'enterprise telecoms UK, managed connectivity solutions, multi-site business broadband, PSTN migration enterprise, independent telecoms provider, business VoIP enterprise, corporate mobile fleet management',
}

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return children
}
