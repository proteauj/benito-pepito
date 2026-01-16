'use server';

import { Product } from '../../lib/db/types';

export async function getProducts(): Promise<Product[]> {
  try {
    // Remplacez cette xpartie par votre propre logique de récupération des produits
    // Par exemple, une requête à votre API ou à votre base de données
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
      next: { revalidate: 60 } // Mise en cache de 60 secondes
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
