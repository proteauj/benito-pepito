import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/data/products';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const slug = searchParams.get('slug');

  if (slug) {
    const product = products.find((p) => p.slug === slug);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
  }

  if (category) {
    const filtered = products.filter((p) => p.category === (category as Product['category']));
    return NextResponse.json(filtered);
  }

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const productsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return NextResponse.json(productsByCategory);
}