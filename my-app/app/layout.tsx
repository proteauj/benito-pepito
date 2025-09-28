import type { Metadata } from 'next'
import './theme/globals.css'
import { I18nProvider } from './i18n/I18nProvider'
import { CartProvider } from './contexts/CartContext'
import SiteHeader from './components/SiteHeader'
import SiteFooter from './components/SiteFooter'
import MiniCartDrawer from './components/MiniCartDrawer'

export const metadata: Metadata = {
  title: 'Benito Pepito - Art Gallery',
  description: 'Contemporary art gallery featuring sculptures, paintings, and home & garden pieces by Benito Pepito',
  icons: {
    // Favicon standard
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      // Favicon .ico (pour les anciens navigateurs)
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    // Pour Android
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    // Autres icônes
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/favicon/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/favicon/android-chrome-512x512.png',
      },
    ],
  },
  // Configuration du thème pour les navigateurs mobiles
  themeColor: '#D4AF37',
  // Configuration pour les appareils Apple
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Benito Pepito',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <I18nProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <SiteHeader />
              <main className="flex-1">
                {children}
                <MiniCartDrawer />
              </main>
              <SiteFooter />
            </div>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
