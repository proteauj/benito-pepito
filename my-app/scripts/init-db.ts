#!/usr/bin/env node

/**
 * Script d'initialisation de la base de données Vercel Postgres
 * Usage: npm run db:init
 */

import { runMigrations } from '../lib/db/migrate';
import { initializeProductStock } from '../lib/db/init';

async function main() {
  console.log('🚀 Initialisation de la base de données Vercel Postgres...\n');

  try {
    // Vérifier les variables d'environnement
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL is not defined. Please check your .env.local file.');
    }

    console.log('✅ Variables d\'environnement vérifiées\n');

    // Exécuter les migrations
    console.log('📊 Exécution des migrations...');
    await runMigrations();
    console.log('✅ Migrations terminées\n');

    // Initialiser le stock des produits
    console.log('📦 Initialisation du stock des produits...');
    await initializeProductStock();
    console.log('✅ Stock initialisé\n');

    console.log('🎉 Base de données initialisée avec succès !');
    console.log('📋 Résumé :');
    console.log('   • Tables créées : orders, product_stock, migrations');
    console.log('   • Stock des produits initialisé');
    console.log('   • Prêt pour la production\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation :', error);
    process.exit(1);
  }
}

main();
