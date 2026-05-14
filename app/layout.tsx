import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EthnicFit AI — Virtual Try-On for Indian Ethnic Wear',
  description: 'Design and virtually try on custom Indian kurtas, sherwanis, and ethnic wear using AI.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
