import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/data/products';

// In-memory storage for demo - in production, use a database
let productsData = [...products];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = productsData.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  if (category) {
    const filtered = productsData.filter((p) => p.category === (category as Product['category']));
    return NextResponse.json(filtered);
  }

  const categories = Array.from(new Set(productsData.map((p) => p.category)));
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = productsData.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return NextResponse.json(productsByCategory);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds, inStock } = body;

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'productIds must be an array' }, { status: 400 });
    }

    // Update products stock status
    productsData = productsData.map(product => ({
      ...product,
      inStock: productIds.includes(product.id) ? inStock : product.inStock
    }));

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