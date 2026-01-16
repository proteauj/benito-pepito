import { NextRequest, NextResponse } from 'next/server';
import { products } from '../../data/products';
import { Product } from '../../../lib/db/types';

let DatabaseService: any = null;
try {
  // Try to import DatabaseService - will fail in environments without database
  DatabaseService = require('../../../lib/db/service').DatabaseService;
} catch (error) {
  // Database not available - use default values
  console.log('Database not available, using default stock values');
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Get stock status from database if available
    let inStock = true; // Default value
    if (DatabaseService) {
      try {
        inStock = await DatabaseService.getProductStock(product.id);
      } catch (error) {
        console.log('Database error, using default stock value:', error);
      }
    }

    return NextResponse.json({
      ...product,
      inStock
    });
  }

  if (category) {
    const filtered = products.filter((p) => p.category === (category as Product['category']));
    // Get stock status for all filtered products
    const productsWithStock = await Promise.all(
      filtered.map(async (product) => {
        let inStock = true; // Default value
        if (DatabaseService) {
          try {
            inStock = await DatabaseService.getProductStock(product.id);
          } catch (error) {
            console.log('Database error for product', product.id, error);
          }
        }
        return {
          ...product,
          inStock
        };
      })
    );
    return NextResponse.json(productsWithStock);
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const productsByCategory = categories.reduce(async (accPromise, cat) => {
    const acc = await accPromise;
    const categoryProducts = products.filter((p) => p.category === cat);
    acc[cat] = await Promise.all(
      categoryProducts.map(async (product) => {
        let inStock = true; // Default value
        if (DatabaseService) {
          try {
            inStock = await DatabaseService.getProductStock(product.id);
          } catch (error) {
            console.log('Database error for product', product.id, error);
          }
        }
        return {
          ...product,
          inStock
        };
      })
    );
    return acc;
  }, Promise.resolve({} as Record<string, Product[]>));

  return NextResponse.json(await productsByCategory);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, inStock } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 });
    }

    // Update products stock status in database if available
    if (DatabaseService) {
      try {
        await DatabaseService.updateMultipleProductStock(productIds, inStock);
      } catch (error) {
        console.error('Database error updating stock:', error);
        return NextResponse.json({ error: 'Failed to update products in database' }, { status: 500 });
      }
    } else {
      console.log('Database not available, stock update skipped');
    }

    console.log(`Updated ${productIds.length} products to inStock: ${inStock}`);

    return NextResponse.json({
      success: true,
      updatedProducts: productIds.length,
      message: `Products marked as ${inStock ? 'available' : 'sold'}`
    });
  } catch (error) {
    console.error('Error updating products:', error);
    return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
  }
}
