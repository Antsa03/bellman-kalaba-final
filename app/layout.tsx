import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bellman Kalaba',
  description: 'Created by us',
  generator: 'Peace and love',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
