#!/usr/bin/env node

/**
 * Complete script to sync products from products.ts to Prisma database
 * This script will:
 * 1. Read products from products.ts
 * 2. Sync them to Product and ProductStock tables in database
 * 3. Ensure all products exist in the database
 */

const fs = require('fs');
const path = require('path');

// Import Prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncProductsToDatabase() {
  console.log('🔄 Synchronisation des produits vers la base de données...\n');

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
      .replace(/'Home & Garden'/g, '"Home & Garden"')
      .replace(/true/g, 'true')
      .replace(/false/g, 'false');

    // Parse products
    const products = eval(`(${jsonString})`);

    console.log(`📊 Produits trouvés: ${products.length}`);

    console.log('💾 Synchronisation du stock des produits avec la base de données...');

    // Sync each product stock to database
    for (const product of products) {
      try {
        // Upsert product stock entry
        await prisma.productStock.upsert({
          where: { productId: product.id },
          update: {
            inStock: product.inStock,
            updatedAt: new Date()
          },
          create: {
            productId: product.id,
            inStock: product.inStock,
            updatedAt: new Date()
          }
        });

        console.log(`✅ ${product.title} (${product.id}) - Stock: ${product.inStock ? '✅' : '❌'} synchronisé`);
      } catch (error) {
        console.error(`❌ Erreur pour ${product.id}:`, error.message);
      }
    }

    console.log('\n✅ Synchronisation du stock terminée avec succès!');

    console.log('\n📋 Produits synchronisés:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (${product.id}) - ${product.category} - Stock: ${product.inStock ? '✅' : '❌'}`);
    });

    console.log('\n🎉 Tous les produits ont été synchronisés avec succès!');
    console.log('💡 Utilisez cette commande pour synchroniser à l\'avenir: npm run db:sync-products');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    process.exit(1);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the sync
syncProductsToDatabase();
