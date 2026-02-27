import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TeleFlow | ITC Telecoms',
  description: 'Customer onboarding portal — telecoms services made simple.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
