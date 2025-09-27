// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Debug
  console.log('Middleware - URL demandée:', url.pathname);
  
  // Intercepter les requêtes _next/image
  if (url.pathname.startsWith('/_next/image')) {
    const imageUrl = url.searchParams.get('url');
    console.log('Middleware - Image URL:', imageUrl);
    
    if (imageUrl) {
      // Nettoyer l'URL
      let cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      console.log('Middleware - Clean URL:', cleanUrl);
      
      // Si l'image est déjà dans public, la servir directement
      if (cleanUrl.startsWith('/images/')) {
        const newUrl = new URL(cleanUrl, request.url);
        console.log('Middleware - Réécriture vers:', newUrl.toString());
        return NextResponse.rewrite(newUrl);
      }
    }
  }

  return NextResponse.next();
}

// Important: Inclure _next/image dans les routes à intercepter
export const config = {
  matcher: [
    '/((?!_next/static|_next/data|favicon.ico).*)',
  ],
};