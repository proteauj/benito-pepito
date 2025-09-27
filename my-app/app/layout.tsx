import type { Metadata } from 'next'
import '../src/app/globals.css'
import { I18nProvider } from '../src/i18n/I18nProvider'
import { CartProvider } from '../src/contexts/CartContext'
import SiteHeader from '../src/components/SiteHeader'
import SiteFooter from '../src/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Benito Pepito - Art Gallery',
  description: 'Contemporary art gallery featuring sculptures, paintings, and home & garden pieces by Benito Pepito',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <SiteHeader />
              <main className="flex-1">
                {children}
              </main>
              <SiteFooter />
            </div>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
