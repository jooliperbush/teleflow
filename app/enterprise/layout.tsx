import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Enterprise Telecoms Solutions UK | Independent Business Communications | ITC',
  description: 'ITC provides enterprise-grade VoIP, connectivity, mobile and PSTN migration for multi-site UK organisations. Independent advice, dedicated account management, and transparent pricing. Get a quote today.',
  keywords: 'enterprise telecoms UK, managed connectivity solutions, multi-site business broadband, PSTN migration enterprise, independent telecoms provider, business VoIP enterprise, corporate mobile fleet management',
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ITC Telecoms',
  url: 'https://itctelecoms.co.uk',
  logo: 'https://itctelecoms.co.uk/itc-logo.svg',
  description: 'Independent enterprise telecoms provider based in Bradford, Yorkshire. Supplying managed connectivity, hosted VoIP, mobile fleet management and PSTN migration to multi-site UK organisations since 2006.',
  foundingDate: '2006',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bradford',
    addressRegion: 'West Yorkshire',
    addressCountry: 'GB',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+441274952123',
    contactType: 'sales',
    availableLanguage: 'English',
    areaServed: 'GB',
  },
  sameAs: ['https://clickitc-demo-production.up.railway.app'],
}

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'ITC Telecoms',
  description: 'Enterprise telecoms provider in Bradford, Yorkshire. Managed connectivity, VoIP, mobile, and PSTN migration for multi-site UK businesses.',
  url: 'https://itctelecoms.co.uk',
  telephone: '+441274952123',
  email: 'connect@clickitc.co.uk',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bradford',
    addressRegion: 'West Yorkshire',
    postalCode: 'BD1',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '53.7950',
    longitude: '-1.7594',
  },
  areaServed: [
    { '@type': 'City', name: 'Bradford' },
    { '@type': 'City', name: 'Leeds' },
    { '@type': 'City', name: 'Sheffield' },
    { '@type': 'AdministrativeArea', name: 'West Yorkshire' },
    { '@type': 'AdministrativeArea', name: 'Yorkshire' },
    { '@type': 'Country', name: 'United Kingdom' },
  ],
  priceRange: '££',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:30',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the PSTN switch-off date?', acceptedAnswer: { '@type': 'Answer', text: 'BT Openreach will permanently switch off the Public Switched Telephone Network (PSTN) and ISDN on 31 January 2027. After this date, any services that rely on these legacy copper-based lines will stop working.' } },
    { '@type': 'Question', name: 'How do I migrate from ISDN?', acceptedAnswer: { '@type': 'Answer', text: 'ISDN migration involves replacing your existing PBX or phone system with a cloud-based VoIP platform. ITC conducts a full estate audit to identify every ISDN line across your sites, maps them to the right replacement solution, and manages the cutover without disrupting live services.' } },
    { '@type': 'Question', name: 'What is a leased line and how does it differ from business broadband?', acceptedAnswer: { '@type': 'Answer', text: 'A leased line is a dedicated, symmetric internet connection with equal upload and download speeds and an SLA guarantee. Business broadband is shared infrastructure where speeds vary depending on contention. Leased lines are uncontended and point-to-point.' } },
    { '@type': 'Question', name: 'How long does leased line installation take?', acceptedAnswer: { '@type': 'Answer', text: 'Typically 30–90 days from order to installation, depending on distance from the nearest exchange and whether new civils work is required. ITC manages the full installation process.' } },
    { '@type': 'Question', name: 'Can enterprise VoIP work across multiple sites?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All sites share the same hosted telephony platform, with centralised management, unified numbering, and features like hunt groups working seamlessly across every location.' } },
    { '@type': 'Question', name: 'Does ITC offer Microsoft Teams Direct Routing?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. ITC provides Teams Direct Routing, connecting your Microsoft Teams environment to the public telephone network — allowing Teams to function as your full business phone system.' } },
  ],
}

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([orgSchema, localBusinessSchema, faqSchema]) }} />
      {children}
    </>
  )
}
