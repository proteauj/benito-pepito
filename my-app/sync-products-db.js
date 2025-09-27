#!/usr/bin/env node

/**
 * Script to sync products from products.ts to Prisma database
 * Run this after adding new products to products.ts
 */

const fs = require('fs');
const path = require('path');

async function syncProductsToDatabase() {
  try {
    // Read products.ts file
    const productsTsPath = path.join(__dirname, 'app/data/products.ts');
    const productsTsContent = fs.readFileSync(productsTsPath, 'utf8');

    // Extract products array using regex
    const productsMatch = productsTsContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);

    if (!productsMatch) {
      console.error('❌ Impossible de trouver le tableau products dans products.ts');
      process.exit(1);
    }

    const productsArrayString = productsMatch[1];

    // Convert to JSON (basic conversion)
    let jsonString = productsArrayString
      .replace(/: string/g, '')
      .replace(/: number/g, '')
      .replace(/: boolean/g, '')
      .replace(/originalPrice\?: number/g, '"originalPrice"')
      .replace(/inStock: boolean/g, '"inStock"')
      .replace(/year: number/g, '"year"')
      .replace(/lastUpdated: string/g, '"lastUpdated"')
      .replace(/originalPrice/g, '"originalPrice"')
      .replace(/inStock/g, '"inStock"')
      .replace(/year/g, '"year"')
      .replace(/lastUpdated/g, '"lastUpdated"')
      .replace(/'Sculpture'/g, '"Sculpture"')
      .replace(/'Painting'/g, '"Painting"')
      .replace(/'Home & Garden'/g, '"Home & Garden"');

    // Parse products
    const products = eval(`(${jsonString})`);

    // For now, just log what would be synced
    // TODO: Implement actual database sync when Prisma client is available
    console.log('\n📋 Produits à synchroniser:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (${product.id}) - ${product.category}`);
    });

    console.log('\n✅ Analyse terminée avec succès!');
    console.log('💡 Pour synchroniser avec la base de données:');
    console.log('   1. npm run db:push (pour mettre à jour le schéma)');
    console.log('   2. Modifier ce script pour utiliser Prisma client');
    console.log('   3. Exécuter: node sync-products-db.js');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncProductsToDatabase();
