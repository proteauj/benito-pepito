#!/usr/bin/env node

/**
 * Simple script to sync product stock from products.ts to database
 * This script extracts only the product IDs and inStock values
 */

const fs = require('fs');
const path = require('path');

// Import Prisma client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncProductStock() {
  console.log('🔄 Synchronisation du stock des produits...\n');

  try {
    // Read products.ts file
    const productsTsPath = path.join(__dirname, 'app/data/products.ts');
    const productsTsContent = fs.readFileSync(productsTsPath, 'utf8');

    // Extract product objects using regex - find all objects with id and inStock
    const productMatches = productsTsContent.match(/{\s*id:\s*'[^']+',[\s\S]*?inStock:\s*(true|false),/g);

    if (!productMatches || productMatches.length === 0) {
      console.error('❌ Impossible de trouver les produits dans products.ts');
      process.exit(1);
    }

    console.log(`📊 Produits trouvés: ${productMatches.length}`);

    console.log('💾 Synchronisation du stock avec la base de données...');

    // Process each product
    for (const productMatch of productMatches) {
      try {
        // Extract id and inStock values using regex
        const idMatch = productMatch.match(/id:\s*'([^']+)'/);
        const inStockMatch = productMatch.match(/inStock:\s*(true|false)/);

        if (idMatch && inStockMatch) {
          const productId = idMatch[1];
          const inStock = inStockMatch[1] === 'true';

          // Upsert product stock entry
          await prisma.productStock.upsert({
            where: { productId },
            update: {
              inStock,
              updatedAt: new Date()
            },
            create: {
              productId,
              inStock,
              updatedAt: new Date()
            }
          });

          console.log(`✅ Produit ${productId} - Stock: ${inStock ? '✅' : '❌'} synchronisé`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors du traitement d'un produit:`, error.message);
      }
    }

    console.log('\n✅ Synchronisation du stock terminée avec succès!');

    console.log('\n🎉 Tous les produits ont été synchronisés avec succès!');
    console.log('💡 Utilisez cette commande pour synchroniser à l\'avenir: node sync-product-stock.js');

  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error.message);
    process.exit(1);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the sync
syncProductStock();
