"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Utilisé pour récupérer le paramètre `slug`

// Exemple de fonction pour récupérer les données du produit
async function fetchProduct(slug: string) {
  const response = await fetch(`/api/products/${slug}`);
  if (!response.ok) {
    throw new Error("Product not found");
  }
  return response.json();
}

// Exemple de fonction pour récupérer les produits associés
async function fetchRelatedProducts(productId: string) {
  const response = await fetch(`/api/products/${productId}/recommendations`);
  return response.json();
}

export default function ProductPage() {
  const router = useRouter(); // Utilisation de next/navigation
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const slug = "example-slug"; // Remplacez par la logique pour obtenir le slug

  useEffect(() => {
    if (!slug) return;

    async function loadProduct() {
      try {
        const productData = await fetchProduct(slug as string);
        setProduct(productData);
      } catch (error) {
        console.error(error);
        router.push("/404"); // Redirige vers une page 404 si le produit n'existe pas
      }
    }

    loadProduct();
  }, [slug]);

  if (!product) {
    return <div>Loading...</div>;
  }

  const {
    id,
    title,
    description,
    descriptionHtml,
    priceRange,
    compareAtPriceRange,
    images,
    options,
    variants,
    tags,
  } = product;

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
      <p>Price: {priceRange.minVariantPrice.amount} {priceRange.minVariantPrice.currencyCode}</p>
      {compareAtPriceRange && (
        <p>Compare at: {compareAtPriceRange.minVariantPrice.amount}</p>
      )}
      <div>
        <h2>Related Products</h2>
        <ul>
          {relatedProducts.map((relatedProduct) => (
            <li key={relatedProduct.id}>{relatedProduct.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}