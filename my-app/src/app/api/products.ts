export default function handler(req: { query: { slug: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: string; id?: string; slug?: string; title?: string; description?: string; descriptionHtml?: string; priceRange?: { minVariantPrice: { amount: string; currencyCode: string; }; }; compareAtPriceRange?: null; tags?: string[]; }): void; new(): any; }; }; }) {
    const { slug } = req.query;
  
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
      return res.status(404).json({ error: "Product not found" });
    }
  
    res.status(200).json(product);
  }