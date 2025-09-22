import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  
    // Exemple de données statiques
    const products = [
      {
        id: "p1",
        slug: "example-slug",
        title: "Example Product",
        description: "This is an example product.",
        descriptionHtml: "<p>This is an example product.</p>",
        priceRange: {
          minVariantPrice: { amount: "10.00", currencyCode: "USD" },
        },
        compareAtPriceRange: null,
        tags: ["example", "product"],
      },
    ];
  
    const product = products.find((p) => p.slug === slug);
  
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
  
    return NextResponse.json(product);
  }