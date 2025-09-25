import { products } from '@/data/products';
import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../lib/db/service';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    // Get stock status from database
    const inStock = await DatabaseService.getProductStock(product.id);

    return NextResponse.json({
      ...product,
      inStock
    });
  }

  if (category) {
    const filtered = products.filter((p) => p.category === (category as Product['category']));
    // Get stock status for all filtered products
    const productsWithStock = await Promise.all(
      filtered.map(async (product) => ({
        ...product,
        inStock: await DatabaseService.getProductStock(product.id)
      }))
    );
    return NextResponse.json(productsWithStock);
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const productsByCategory = categories.reduce(async (accPromise, cat) => {
    const acc = await accPromise;
    const categoryProducts = products.filter((p) => p.category === cat);
    acc[cat] = await Promise.all(
      categoryProducts.map(async (product) => ({
        ...product,
        inStock: await DatabaseService.getProductStock(product.id)
      }))
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

    // Update products stock status in database
    await DatabaseService.updateMultipleProductStock(productIds, inStock);

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
